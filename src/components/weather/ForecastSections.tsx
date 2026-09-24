import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { dailyForecast, fetchForecast, type Forecast } from '@/services/forecast';
import type { Weather } from '@/services/weather';
import { styles } from '@/styles/weather.styles';
import { cityDate, temperature, weatherSymbol, type TemperatureUnit } from '@/utils/weather-format';

type ForecastState =
  | { status: 'loading' }
  | { status: 'success'; data: Forecast }
  | { status: 'error'; message: string };

export function ForecastSections({ weather, unit }: { weather: Weather; unit: TemperatureUnit }) {
  const [state, setState] = useState<ForecastState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let active = true;

    async function loadForecast() {
      try {
        const data = await fetchForecast(weather, controller.signal);
        if (active) {
          setState({ status: 'success', data });
        }
      } catch (error) {
        if (active) {
          setState({
            status: 'error',
            message: error instanceof Error ? error.message : 'Forecast unavailable.',
          });
        }
      } finally {
        clearTimeout(timeout);
      }
    }

    void loadForecast();
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [weather, attempt]);

  if (state.status === 'loading') {
    return (
      <View style={styles.forecast}>
        <ActivityIndicator color="#FFFFFF" />
        <Text style={styles.stateText}>Loading your forecast…</Text>
      </View>
    );
  }

  if (state.status === 'error') {
    return (
      <View style={styles.forecast}>
        <Text accessibilityRole="alert" style={styles.stateText}>{state.message}</Text>
        <Pressable
          accessibilityRole="button"
          style={styles.smallButton}
          onPress={() => {
            setState({ status: 'loading' });
            setAttempt(value => value + 1);
          }}
        >
          <Text style={styles.link}>Retry forecast</Text>
        </Pressable>
      </View>
    );
  }

  const forecast = state.data;
  const days = dailyForecast(forecast);

  return (
    <>
      <View style={styles.forecast}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>3-Hour Forecast</Text>
          <Text style={styles.caption}>Swipe to explore →</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.forecastRow}>
          {forecast.list.slice(0, 8).map(entry => (
            <View key={entry.dt} style={styles.forecastTile}>
              <Text style={styles.forecastTime}>
                {cityDate(entry.dt, forecast.city.timezone).toLocaleTimeString('en-US', {
                  hour: 'numeric', timeZone: 'UTC',
                })}
              </Text>
              <Text style={styles.forecastIcon} accessibilityLabel={entry.weather[0].description}>
                {weatherSymbol(entry.weather[0].main, entry.weather[0].icon)}
              </Text>
              <Text style={styles.forecastTemp}>{temperature(entry.main.temp, unit)}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.forecast}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>5-Day Outlook</Text>
          <Text style={styles.caption}>High / Low</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.forecastRow}>
          {days.map(day => (
            <View key={day.date} style={styles.forecastTile}>
              <Text style={styles.forecastTime}>
                {cityDate(day.timestamp, forecast.city.timezone).toLocaleDateString('en-US', {
                  weekday: 'short', timeZone: 'UTC',
                })}
              </Text>
              <Text style={styles.forecastIcon} accessibilityLabel={day.condition.description}>
                {weatherSymbol(day.condition.main, day.condition.icon)}
              </Text>
              <Text style={styles.forecastTemp}>{temperature(day.high, unit)}</Text>
              <Text style={styles.forecastLow}>{temperature(day.low, unit)}</Text>
            </View>
          ))}
        </ScrollView>
        <Text style={[styles.caption, styles.forecastNote]}>
          Ranges from available forecast intervals.
        </Text>
      </View>
    </>
  );
}
