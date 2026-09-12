import React from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardTypeOptions } from 'react-native';
import { color, font } from '../../theme/theme';

export function Field({
  label, value, onChangeText, placeholder, secure, keyboardType, style,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secure?: boolean;
  keyboardType?: KeyboardTypeOptions;
  style?: object;
}) {
  return (
    <View style={style}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={color.neutral500}
        secureTextEntry={secure}
        keyboardType={keyboardType}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, marginBottom: 5, color: 'rgba(29,31,32,0.7)', fontFamily: font.body },
  input: {
    minHeight: 40,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: color.text,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.divider,
    fontFamily: font.body,
  },
});
