import React, { useEffect, useRef, useState } from 'react';

const AddressAutocomplete = ({ 
  value, 
  onChange, 
  onSelect, 
  placeholder = "Enter address",
  className = "",
  isGeocoding = false,
  hasCoordinates = false 
}) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    // Wait for Google Maps API to be available
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.log('AddressAutocomplete: Google Maps Places API not available yet');
      return;
    }

    if (!inputRef.current) return;

    // Create Autocomplete instance
    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: 'nz' }, // Restrict to New Zealand
      fields: ['formatted_address', 'geometry', 'place_id']
    });

    // Add place_changed listener
    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace();
      
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const address = place.formatted_address;
        
        // Call onSelect with the selected place data
        onSelect({ lat, lng, address });
        
        // Update the input value
        if (onChange) {
          const syntheticEvent = {
            target: {
              name: 'address',
              value: address
            }
          };
          onChange(syntheticEvent);
        }
        
        setShowSuggestions(false);
        setSuggestions([]);
      }
    });

    // Add input event listener for manual typing
    const handleInputChange = (e) => {
      if (onChange) {
        onChange(e);
      }
      
      // Show suggestions based on input
      if (e.target.value.length > 2) {
        const service = new window.google.maps.places.AutocompleteService();
        service.getPlacePredictions({
          input: e.target.value,
          componentRestrictions: { country: 'nz' },
          types: ['address']
        }, (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions.slice(0, 5)); // Limit to 5 suggestions
            setShowSuggestions(true);
            setSelectedIndex(-1);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        });
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    inputRef.current.addEventListener('input', handleInputChange);

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
      if (!showSuggestions || suggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            handleSuggestionClick(suggestions[selectedIndex]);
          }
          break;
        case 'Escape':
          setShowSuggestions(false);
          setSuggestions([]);
          setSelectedIndex(-1);
          break;
      }
    };

    inputRef.current.addEventListener('keydown', handleKeyDown);

    // Handle click outside to close suggestions
    const handleClickOutside = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setShowSuggestions(false);
        setSuggestions([]);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      if (inputRef.current) {
        inputRef.current.removeEventListener('input', handleInputChange);
        inputRef.current.removeEventListener('keydown', handleKeyDown);
      }
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onChange, onSelect]);

  const handleSuggestionClick = (suggestion) => {
    const service = new window.google.maps.places.PlacesService(document.createElement('div'));
    service.getDetails({
      placeId: suggestion.place_id,
      fields: ['formatted_address', 'geometry']
    }, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const address = place.formatted_address;
        
        onSelect({ lat, lng, address });
        
        if (onChange) {
          const syntheticEvent = {
            target: {
              name: 'address',
              value: address
            }
          };
          onChange(syntheticEvent);
        }
        
        setShowSuggestions(false);
        setSuggestions([]);
        setSelectedIndex(-1);
      }
    });
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        value={value || ""}
        type="text"
        placeholder={placeholder}
        className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        autoComplete="off"
      />
      
      {/* Loading indicator */}
      {isGeocoding && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Success indicator */}
      {hasCoordinates && !isGeocoding && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <span className="text-green-500 text-sm">✓</span>
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.place_id}
              className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                index === selectedIndex ? 'bg-blue-100' : ''
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="text-sm text-gray-900">{suggestion.description}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete; 