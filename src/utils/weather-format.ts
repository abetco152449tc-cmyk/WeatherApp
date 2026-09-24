export type TemperatureUnit = 'C' | 'F';

export function temperature(value: number | undefined, unit: TemperatureUnit) {
  if (value === undefined || !Number.isFinite(value)) {
    return '—';
  }

  const converted = unit === 'F' ? value * 9 / 5 + 32 : value;
  return `${Math.round(converted)}°`;
}

export function weatherSymbol(condition: string, icon?: string) {
  switch (condition.toLowerCase()) {
    case 'clear': return icon?.endsWith('n') ? '🌙' : '☀️';
    case 'clouds': return icon?.startsWith('02') ? '🌤️' : '☁️';
    case 'rain': return '🌧️';
    case 'drizzle': return '🌦️';
    case 'thunderstorm': return '⛈️';
    case 'snow': return '❄️';
    default: return '🌫️';
  }
}

// Shift to the city's offset, then format in UTC to avoid the phone's timezone.
export function cityDate(timestamp: number, offset: number) {
  return new Date((timestamp + offset) * 1000);
}

export function countryName(code: string) {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
}
