import { useState, useEffect } from 'react';
import { getGoogleMapsApiKey } from '../services/api';

export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        // Check if Google Maps is already loaded
        if (window.google && window.google.maps) {
          setIsLoaded(true);
          setIsLoading(false);
          return;
        }

        // Get API key from backend
        const apiKey = await getGoogleMapsApiKey();
        
        // Create script element
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          setIsLoaded(true);
          setIsLoading(false);
        };
        
        script.onerror = () => {
          setError('Failed to load Google Maps');
          setIsLoading(false);
        };
        
        document.head.appendChild(script);
      } catch (err) {
        setError('Failed to get Google Maps API key');
        setIsLoading(false);
      }
    };

    loadGoogleMaps();
  }, []);

  return { isLoaded, isLoading, error };
}; 