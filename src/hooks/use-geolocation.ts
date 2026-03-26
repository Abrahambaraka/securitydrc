'use client';

import { useState, useEffect } from 'react';

interface GeolocationState {
  isLoading: boolean;
  coordinates: { lat: number; lng: number } | null;
  error: GeolocationPositionError | Error | null;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    isLoading: true,
    coordinates: null,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        error: new Error('La géolocalisation n\'est pas supportée par votre navigateur.'),
      }));
      return;
    }

    const onSuccess = (position: GeolocationPosition) => {
      setState({
        isLoading: false,
        coordinates: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
        error: null,
      });
    };

    const onError = (error: GeolocationPositionError) => {
      setState({
        isLoading: false,
        coordinates: null,
        error: error,
      });
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

  }, []);

  return state;
};
