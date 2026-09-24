import type { Weather } from './weather';

export type ForecastEntry = {
  dt: number;
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
  };
  weather: {
    main: string;
    description: string;
    icon?: string;
  }[];
};

export type Forecast = {
  list: ForecastEntry[];
  city: { timezone: number };
};

export async function fetchForecast(weather: Weather, signal: AbortSignal): Promise<Forecast> {
  const key = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY?.trim();
  if (!key) {
    throw new Error('An OpenWeather API key is required.');
  }

  const location = weather.coord
    ? `lat=${weather.coord.lat}&lon=${weather.coord.lon}`
    : `q=${encodeURIComponent(`${weather.name},${weather.sys.country}`)}`;
  const url = `https://api.openweathermap.org/data/2.5/forecast?${location}`
    + `&appid=${encodeURIComponent(key)}&units=metric`;

  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch {
    throw new Error('Forecast unavailable. Check your connection and try again.');
  }

  if (!response.ok) {
    throw new Error('Forecast is temporarily unavailable. Please try again.');
  }

  const data: Forecast = await response.json();
  if (
    !Number.isFinite(data.city?.timezone)
    || !Array.isArray(data.list)
    || data.list.length === 0
    || data.list.some(entry => (
      !Number.isFinite(entry.dt)
      || !Number.isFinite(entry.main?.temp)
      || !Number.isFinite(entry.main?.temp_min)
      || !Number.isFinite(entry.main?.temp_max)
      || !entry.weather?.[0]?.main
    ))
  ) {
    throw new Error('Forecast data is incomplete. Please try again.');
  }

  return data;
}

// Summarize the available three-hour samples by the city's calendar date.
export function dailyForecast(forecast: Forecast) {
  const days = new Map<string, {
    date: string;
    timestamp: number;
    low: number;
    high: number;
    condition: ForecastEntry['weather'][number];
    noonDistance: number;
  }>();

  for (const entry of forecast.list) {
    const local = new Date((entry.dt + forecast.city.timezone) * 1000);
    const date = local.toISOString().slice(0, 10);
    const noonDistance = Math.abs(local.getUTCHours() - 12);
    const existing = days.get(date);

    if (!existing) {
      days.set(date, {
        date,
        timestamp: entry.dt,
        low: entry.main.temp_min,
        high: entry.main.temp_max,
        condition: entry.weather[0],
        noonDistance,
      });
    } else {
      existing.low = Math.min(existing.low, entry.main.temp_min);
      existing.high = Math.max(existing.high, entry.main.temp_max);
      if (noonDistance < existing.noonDistance) {
        existing.condition = entry.weather[0];
        existing.noonDistance = noonDistance;
      }
    }
  }

  return [...days.values()].slice(0, 5);
}
