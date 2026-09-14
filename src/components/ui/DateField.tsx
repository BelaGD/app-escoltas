import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import { color, font } from '../../theme/theme';
import {
  isoToLocalDate, localDateToIso, formatIsoShort,
  dmyToLocalDate, localDateToDmy, formatDmyShort,
} from '../../logic/date';

const MIN_DATE = new Date(2026, 0, 1);
const MAX_DATE = new Date(2030, 11, 31);

// A field styled like Field.tsx but backed by Android's native date dialog
// instead of free-text entry — taps open a real calendar picker.
// `format` picks which string shape the field reads/writes: "iso"
// (YYYY-MM-DD, used by the dotación date) or "dmy" (DD/MM/YYYY, used by
// vacation and assignment dates that predate the picker).
export function DateField({
  label, value, onChange, style, format = 'iso',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  style?: object;
  format?: 'iso' | 'dmy';
}) {
  const toDate = format === 'dmy' ? dmyToLocalDate : isoToLocalDate;
  const fromDate = format === 'dmy' ? localDateToDmy : localDateToIso;
  const display = format === 'dmy' ? formatDmyShort : formatIsoShort;

  const open = () => {
    DateTimePickerAndroid.open({
      value: toDate(value),
      mode: 'date',
      minimumDate: MIN_DATE,
      maximumDate: MAX_DATE,
      onValueChange: (_event, selected) => onChange(fromDate(selected)),
    });
  };

  return (
    <View style={style}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.input} onPress={open}>
        <Text style={styles.value}>{display(value)}</Text>
        <Calendar size={16} strokeWidth={1.5} color={color.accent700} />
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
  value: { fontSize: 14, color: color.text, fontFamily: font.body, textTransform: 'capitalize' },
});
