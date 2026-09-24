import type { RefObject } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { styles } from '@/styles/weather.styles';

type CitySearchProps = {
  city: string;
  validation: string;
  busy: boolean;
  inputRef: RefObject<TextInput | null>;
  onChangeCity: (value: string) => void;
  onSearch: () => void;
};

export function CitySearch({
  city,
  validation,
  busy,
  inputRef,
  onChangeCity,
  onSearch,
}: CitySearchProps) {
  return (
    <View style={styles.searchPanel}>
      <View style={[styles.searchRow, !!validation && styles.invalid]}>
        <Ionicons name="search-outline" size={23} color="#245C85" />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Search city"
          placeholderTextColor="#527996"
          value={city}
          onChangeText={onChangeCity}
          onSubmitEditing={onSearch}
          returnKeyType="search"
          autoCorrect={false}
          maxLength={100}
          accessibilityLabel="City name"
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Search weather"
          accessibilityState={{ disabled: busy }}
          disabled={busy}
          onPress={onSearch}
          style={({ pressed }) => [styles.searchButton, pressed && styles.pressed]}
        >
          {busy
            ? <ActivityIndicator color="#FFFFFF" />
            : <Ionicons name="search-outline" size={25} color="#FFFFFF" />}
        </Pressable>
      </View>
      {!!validation && (
        <Text accessibilityRole="alert" style={styles.validation}>
          {validation}
        </Text>
      )}
    </View>
  );
}
