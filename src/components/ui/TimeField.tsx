import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Clock } from 'lucide-react-native';
import { color, font } from '../../theme/theme';
import { hmToLocalDate, localDateToHm } from '../../logic/date';

// A field styled like Field.tsx but backed by Android's native time
// dialog — for the "hora de presentación" fields that were free text.
export function TimeField({
  label, value, onChange, style,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  style?: object;
}) {
  const open = () => {
    DateTimePickerAndroid.open({
      value: hmToLocalDate(value),
      mode: 'time',
      is24Hour: true,
      onValueChange: (_event, selected) => onChange(localDateToHm(selected)),
    });
  };

  return (
    <View style={style}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.input} onPress={open}>
        <Text style={styles.value}>{value || '--:--'}</Text>
        <Clock size={16} strokeWidth={1.5} color={color.accent700} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, marginBottom: 5, color: 'rgba(29,31,32,0.7)', fontFamily: font.body },
  input: {
    minHeight: 40, paddingHorizontal: 10, paddingVertical: 8,
    backgroundColor: color.surface, borderWidth: 1, borderColor: color.divider,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  value: { fontSize: 14, color: color.text, fontFamily: font.body },
});
