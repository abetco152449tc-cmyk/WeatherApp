import { useEffect, useRef, useState } from 'react';
import { Keyboard, TextInput } from 'react-native';

import { fetchWeather, type Weather } from '@/services/weather';

export type WeatherResult =
  | { status: 'empty' }
  | { status: 'loading'; city: string }
  | { status: 'success'; data: Weather }
  | { status: 'error'; message: string; city: string };

type WeatherRequest = {
  city: string;
  id: number;
};

export function useWeather() {
  const [city, setCity] = useState('');
  const [request, setRequest] = useState<WeatherRequest | null>(null);
  const [result, setResult] = useState<WeatherResult>({ status: 'empty' });
  const [validation, setValidation] = useState('');
  const input = useRef<TextInput>(null);

  // Run a new request on search or retry, and cancel it when it is replaced.
  useEffect(() => {
    if (!request) {
      return;
    }

    const requestedCity = request.city;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let active = true;

    async function loadWeather() {
      try {
        const data = await fetchWeather(requestedCity, controller.signal);

        if (active) {
          setResult({ status: 'success', data });
        }
      } catch (error) {
        if (active) {
          setResult({
            status: 'error',
            city: requestedCity,
            message: error instanceof Error
              ? error.message
              : 'Something went wrong. Please try again.',
          });
        }
      } finally {
        clearTimeout(timeout);
      }
    }

    void loadWeather();

    // Ignore responses from old searches or an unmounted screen.
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [request]);

  function changeCity(value: string) {
    setCity(value);
    setValidation('');
  }

  function search(value = city) {
    const query = value.trim();

    if (!query) {
      setValidation('Please enter a city name.');
      input.current?.focus();
      return;
    }

    Keyboard.dismiss();
    setValidation('');
    setCity(query);
    setResult({ status: 'loading', city: query });
    setRequest(previous => ({
      city: query,
      id: (previous?.id ?? 0) + 1,
    }));
  }

  function reset() {
    setRequest(null);
    setResult({ status: 'empty' });
    setCity('');
    setValidation('');
    input.current?.focus();
  }

  return {
    city,
    result,
    validation,
    input,
    busy: result.status === 'loading',
    search,
    reset,
    changeCity,
  };
}
