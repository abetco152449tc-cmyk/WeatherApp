import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import type { WeatherResult as WeatherResultState } from '@/hooks/use-weather';
import { styles } from '@/styles/weather.styles';
import { WeatherCard } from './WeatherCard';
import { ForecastSections } from './ForecastSections';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { TemperatureUnit } from '@/utils/weather-format';

type WeatherResultProps = {
  result: WeatherResultState;
  unit: TemperatureUnit;
  onSearch: (city: string) => void;
  onReset: () => void;
};

export function WeatherResult({ result, onSearch, onReset, unit }: WeatherResultProps) {
  switch (result.status) {
    case 'empty':
      return (
        <View style={styles.placeholder}>
          <Text style={styles.symbol}>☀</Text>
          <Text style={styles.stateTitle}>What’s the weather like?</Text>
          <Text style={styles.stateText}>
            Enter a city above to see its current temperature, conditions, and
            humidity.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => onSearch('Davao,PH')}
            style={styles.smallButton}
          >
            <Text style={styles.link}>TRY DAVAO CITY →</Text>
          </Pressable>
        </View>
      );

    case 'loading':
      return (
        <View style={styles.placeholder}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.stateTitle}>Checking the skies</Text>
          <Text style={styles.stateText}>
            Getting current weather for {result.city}…
          </Text>
        </View>
      );

    case 'error':
      return (
        <View style={[styles.placeholder, styles.errorPanel]}>
          <Text style={styles.stateTitle}>Couldn’t get the weather</Text>
          <Text accessibilityRole="alert" style={styles.stateText}>
            {result.message}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => onSearch(result.city)}
            style={styles.smallButton}
          >
            <Text style={styles.link}>TRY AGAIN</Text>
          </Pressable>
        </View>
      );

    case 'success':
      return (
        <>
          <WeatherCard weather={result.data} unit={unit} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Search Another City"
            onPress={onReset}
            style={({ pressed }) => [styles.another, pressed && styles.pressed]}
          >
            <LinearGradient colors={['#278FF1', '#096CD0']} style={styles.anotherInner}>
              <Ionicons name="search-outline" size={23} color="#FFFFFF" />
              <Text style={styles.link}>Search Another City</Text>
            </LinearGradient>
          </Pressable>
          <ForecastSections weather={result.data} unit={unit} />
        </>
      );
  }
}
