import { useState, useEffect } from 'react';
import { getGoogleMapsApiKey } from '../services/api';

// Global state to track if Google Maps is being loaded
let isLoadingGlobally = false;
let globalPromise = null;

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

        // If already loading globally, wait for the existing promise
        if (isLoadingGlobally && globalPromise) {
          await globalPromise;
          if (window.google && window.google.maps) {
            setIsLoaded(true);
            setIsLoading(false);
          } else {
            setError('Failed to load Google Maps');
            setIsLoading(false);
          }
          return;
        }

        // Start global loading
        isLoadingGlobally = true;
        
        // Get API key from backend
        const apiKey = await getGoogleMapsApiKey();
        
        // Check if script already exists
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
          // Wait for existing script to load
          await new Promise((resolve, reject) => {
            existingScript.onload = resolve;
            existingScript.onerror = reject;
            // If already loaded, resolve immediately
            if (existingScript.complete) {
              resolve();
            }
          });
        } else {
          // Create script element
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
          script.async = true;
          script.defer = true;
          
          // Create promise for script loading
          globalPromise = new Promise((resolve, reject) => {
            script.onload = () => {
              // Wait a bit for Google Maps to fully initialize
              setTimeout(() => {
                if (window.google && window.google.maps) {
                  resolve();
                } else {
                  reject(new Error('Google Maps failed to initialize'));
                }
              }, 100);
            };
            
            script.onerror = () => {
              reject(new Error('Failed to load Google Maps script'));
            };
          });
          
          document.head.appendChild(script);
          await globalPromise;
        }
        
        // Success
        setIsLoaded(true);
        setIsLoading(false);
        isLoadingGlobally = false;
        globalPromise = null;
        
      } catch (err) {
        console.error('Google Maps loading error:', err);
        setError('Failed to load Google Maps');
        setIsLoading(false);
        isLoadingGlobally = false;
        globalPromise = null;
      }
    };

    loadGoogleMaps();
  }, []);

  return { isLoaded, isLoading, error };
}; 