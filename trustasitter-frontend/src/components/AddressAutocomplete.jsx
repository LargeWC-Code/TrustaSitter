import React, { useState } from 'react';
import { api } from '../services/api';

const AddressAutocomplete = ({ 
  value, 
  onChange, 
  onSelect, 
  placeholder = "Enter address",
  className = "",
  isGeocoding = false,
  hasCoordinates = false 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Handle input change
  const handleInputChange = async (e) => {
    if (onChange) {
      onChange(e);
    }
    
    // Show suggestions based on input using backend proxy
    if (e.target.value.length > 2) {
      try {
        const response = await api.get('/google/places/autocomplete', {
          params: { input: e.target.value }
        });
        
        if (response.data.predictions) {
          setSuggestions(response.data.predictions.slice(0, 5));
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error('Error getting autocomplete suggestions:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = async (suggestion) => {
    try {
      const response = await api.get('/google/places/details', {
        params: { place_id: suggestion.place_id }
      });
      
      if (response.data.result && response.data.result.geometry) {
        const lat = response.data.result.geometry.location.lat;
        const lng = response.data.result.geometry.location.lng;
        const address = response.data.result.formatted_address;
        
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
      }
    } catch (error) {
      console.error('Error getting place details:', error);
    }
  };

  return (
    <div className="relative">
      <input
        value={value || ""}
        onChange={handleInputChange}
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
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.place_id}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
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