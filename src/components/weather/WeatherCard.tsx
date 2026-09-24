import { Text, View, useWindowDimensions } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

import type { Weather } from '@/services/weather';
import { styles } from '@/styles/weather.styles';
import {
  cityDate,
  countryName,
  temperature,
  weatherSymbol,
  type TemperatureUnit,
} from '@/utils/weather-format';

type WeatherCardProps = {
  weather: Weather;
  unit: TemperatureUnit;
};

type MetricProps = {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
};

function Metric({ icon, label, value }: MetricProps) {
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.metric, width < 360 && styles.metricNarrow]}>
      <Ionicons name={icon} size={23} color="#EDFAFF" />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export function WeatherCard({ weather, unit }: WeatherCardProps) {
  const condition = weather.weather[0];
  const observed = weather.dt !== undefined && weather.timezone !== undefined
    ? cityDate(weather.dt, weather.timezone)
    : null;

  return (
    <View style={styles.weatherCard}>
      <View style={styles.locationRow}>
        <View style={styles.location}>
          <Ionicons name="location" size={22} color="#D9F1FF" />
          <View style={styles.flex}>
            <Text style={styles.city}>{weather.name}</Text>
            <Text style={styles.country}>{countryName(weather.sys.country)}</Text>
          </View>
        </View>
        {observed && (
          <Text style={styles.date}>
            {observed.toLocaleDateString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC',
            })}
            {'\n'}
            {observed.toLocaleTimeString('en-US', {
              hour: 'numeric', minute: '2-digit', timeZone: 'UTC',
            })}
          </Text>
        )}
      </View>

      <View style={styles.hero}>
        <View style={styles.flex}>
          <Text style={styles.temperature} adjustsFontSizeToFit numberOfLines={1}>
            {temperature(weather.main.temp, unit)}
          </Text>
          <Text style={styles.condition}>{condition.description}</Text>
        </View>
        <Text style={styles.heroIcon} accessibilityLabel={condition.main}>
          {weatherSymbol(condition.main, condition.icon)}
        </Text>
      </View>

      <Text style={styles.feels}>
        Feels like {temperature(weather.main.feels_like, unit)}
        {'    |    '}H: {temperature(weather.main.temp_max, unit)}
        {'   '}L: {temperature(weather.main.temp_min, unit)}
      </Text>

      <View style={styles.metrics}>
        <Metric icon="water-outline" label="Humidity" value={`${weather.main.humidity}%`} />
        <Metric icon="flag-outline" label="Wind" value={`${Math.round(weather.wind.speed * 3.6)} km/h`} />
        <Metric
          icon="eye-outline"
          label="Visibility"
          value={weather.visibility === undefined ? '—' : `${Math.round(weather.visibility / 100) / 10} km`}
        />
        <Metric
          icon="speedometer-outline"
          label="Pressure"
          value={weather.main.pressure === undefined ? '—' : `${weather.main.pressure} hPa`}
        />
      </View>
    </View>
  );
}
