import { Modal, Pressable, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { styles } from '@/styles/weather.styles';
import type { TemperatureUnit } from '@/utils/weather-format';

type WeatherSettingsProps = {
  visible: boolean;
  unit: TemperatureUnit;
  onChangeUnit: (unit: TemperatureUnit) => void;
  onClose: () => void;
};

export function WeatherSettings({ visible, unit, onChangeUnit, onClose }: WeatherSettingsProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard} accessibilityViewIsModal>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Weather settings</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Close settings" onPress={onClose} style={styles.iconButton}>
              <Ionicons name="close" size={26} color="#FFFFFF" />
            </Pressable>
          </View>
          <Text style={styles.caption}>Temperature unit</Text>
          <View style={styles.unitRow}>
            {(['C', 'F'] as const).map(option => (
              <Pressable
                key={option}
                accessibilityRole="radio"
                accessibilityState={{ checked: unit === option }}
                onPress={() => onChangeUnit(option)}
                style={[styles.unitOption, unit === option && styles.unitSelected]}
              >
                <Text style={styles.link}>{option === 'C' ? 'Celsius °C' : 'Fahrenheit °F'}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.caption}>Applies to current weather and forecasts for this session.</Text>
          <Pressable accessibilityRole="button" onPress={onClose} style={styles.smallButton}>
            <Text style={styles.link}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
