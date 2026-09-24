export type Weather = {
  name: string;
  coord?: { lat: number; lon: number };
  dt?: number;
  timezone?: number;
  visibility?: number;
  sys: {
    country: string;
  };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    temp_min?: number;
    temp_max?: number;
    pressure?: number;
  };
  weather: {
    main: string;
    description: string;
    icon?: string;
  }[];
  wind: {
    speed: number;
  };
};

// The city becomes a dynamic, safely encoded query parameter on every search.
export async function fetchWeather(
  city: string,
  signal?: AbortSignal,
): Promise<Weather> {
  const key = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY?.trim();

  if (!key) {
    throw new Error('Add your OpenWeather API key to .env, then restart Expo.');
  }

  const url = 'https://api.openweathermap.org/data/2.5/weather'
    + `?q=${encodeURIComponent(city)}`
    + `&appid=${encodeURIComponent(key)}`
    + '&units=metric';
  let response: Response;

  try {
    response = await fetch(url, { signal });
  } catch {
    if (signal?.aborted) {
      throw new Error('The request took too long. Please try again.');
    }
    throw new Error('Unable to connect. Check your internet connection and try again.');
  }
  if (response.status === 404) {
    throw new Error(`No city found for “${city}”. Check the spelling or add a country code, like Davao,PH.`);
  }
  if (response.status === 401) {
    throw new Error('Your OpenWeather API key is invalid or not active yet. Check your .env configuration.');
  }
  if (response.status === 429) {
    throw new Error('Too many weather requests. Please wait a moment and try again.');
  }
  if (!response.ok) {
    throw new Error('The weather service is unavailable. Please try again shortly.');
  }

  let data: Weather;

  try {
    data = await response.json();
  } catch {
    throw new Error('The weather service returned an unreadable response. Please try again.');
  }

  if (
    !data.name ||
    !Number.isFinite(data.main?.temp) ||
    !Number.isFinite(data.main?.humidity) ||
    !Number.isFinite(data.main?.feels_like) ||
    !Number.isFinite(data.wind?.speed) ||
    !data.weather?.[0]?.description ||
    !data.sys?.country
  ) {
    throw new Error('Weather information is incomplete. Please try again.');
  }

  return data;
}
