import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';
import { color, font, shadow } from '../theme/theme';

export function Fab({ onPress, label = 'Servicio' }: { onPress: () => void; label?: string }) {
  return (
    <Pressable style={[styles.fab, shadow.md]} onPress={onPress}>
      <Plus size={17} strokeWidth={1.5} color={color.white} />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute', right: 16, bottom: 16, height: 44, paddingHorizontal: 16,
    borderWidth: 1, borderColor: color.accent900, backgroundColor: color.accent700,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  label: { fontFamily: font.heading, fontSize: 14, letterSpacing: 0.8, textTransform: 'uppercase', color: color.white },
});
