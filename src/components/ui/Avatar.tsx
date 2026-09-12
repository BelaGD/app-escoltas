import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { color, font } from '../../theme/theme';

export function Avatar({ ini, size = 32, borderColor = color.accent500 }: { ini: string; size?: number; borderColor?: string }) {
  return (
    <View style={[styles.box, { width: size, height: size, borderColor }]}>
      <Text style={[styles.text, { fontSize: size * 0.38, color: borderColor }]}>{ini}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontFamily: font.heading },
});
