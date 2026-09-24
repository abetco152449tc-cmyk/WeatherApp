import { useRef, useState } from 'react';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CitySearch } from '@/components/weather/CitySearch';
import { WeatherResult } from '@/components/weather/WeatherResult';
import { WeatherSettings } from '@/components/weather/WeatherSettings';
import { useWeather } from '@/hooks/use-weather';
import { styles } from '@/styles/weather.styles';
import type { TemperatureUnit } from '@/utils/weather-format';

export default function WeatherScreen() {
  const { city, result, validation, input, busy, search, reset, changeCity } = useWeather();
  const [unit, setUnit] = useState<TemperatureUnit>('C');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const scroll = useRef<ScrollView>(null);

  function searchAnotherCity() {
    scroll.current?.scrollTo({ y: 0, animated: true });
    reset();
  }

  return (
    <View style={styles.background}>
      <Image
        source={require('../../assets/images/weather-sky.jpg')}
        style={styles.backdrop}
        contentFit="cover"
        accessibilityElementsHidden
      />
      <LinearGradient
        colors={['rgba(16, 113, 197, 0.77)', 'rgba(21, 134, 204, 0.36)', 'rgba(4, 83, 140, 0.65)']}
        style={styles.backdrop}
        pointerEvents="none"
      />
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            ref={scroll}
            contentContainerStyle={styles.page}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={styles.title}>Weather App</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Weather settings"
                  onPress={() => setSettingsOpen(true)}
                  style={styles.iconButton}
                >
                  <Ionicons name="settings-sharp" size={27} color="#D5EDFF" />
                </Pressable>
              </View>

              <CitySearch
                city={city}
                validation={validation}
                busy={busy}
                inputRef={input}
                onChangeCity={changeCity}
                onSearch={() => search()}
              />

              <View accessibilityLiveRegion="polite">
                <WeatherResult result={result} onSearch={search} onReset={searchAnotherCity} unit={unit} />
              </View>

              <Text style={styles.footer}>OpenWeather · Temperatures in °{unit}</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <WeatherSettings
        visible={settingsOpen}
        unit={unit}
        onChangeUnit={setUnit}
        onClose={() => setSettingsOpen(false)}
      />
    </View>
  );
}
