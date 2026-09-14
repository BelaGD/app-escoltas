import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { color, font } from '../../theme/theme';

export function Toast({ text, onDeshacer }: { text: string; onDeshacer?: (() => void) | null }) {
  if (!text) return null;
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={styles.left} pointerEvents="none">
        <Text style={styles.ok}>OK</Text>
        <Text style={styles.text}>{text}</Text>
      </View>
      {!!onDeshacer && (
        <Pressable onPress={onDeshacer} hitSlop={8}>
          <Text style={styles.deshacer}>Deshacer</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 78,
    backgroundColor: color.accent900,
    paddingVertical: 11,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  left: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  ok: { fontFamily: font.heading, letterSpacing: 1.2, fontSize: 10.5, color: color.accent300 },
  text: { flex: 1, fontSize: 12.5, color: color.white, fontFamily: font.body },
  deshacer: { fontFamily: font.heading, fontSize: 12.5, letterSpacing: 0.5, color: color.accent200, textTransform: 'uppercase' },
});
