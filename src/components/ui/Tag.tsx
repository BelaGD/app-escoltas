import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { color, font } from '../../theme/theme';
import { TagKind } from '../../logic/useApp';

export function Tag({ label, kind }: { label: string; kind: TagKind }) {
  const bg = kind === 'accent' ? color.accent100 : kind === 'neutral' ? color.neutral100 : 'transparent';
  const fg = kind === 'accent' ? color.accent800 : kind === 'neutral' ? color.neutral800 : color.accent;
  const borderColor = kind === 'outline' ? color.accent : 'transparent';
  return (
    <View style={[styles.tag, { backgroundColor: bg, borderColor }]}>
      <Text style={[styles.text, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderWidth: 1,
  },
  text: {
    fontFamily: font.heading,
    fontSize: 9.5,
    letterSpacing: 0.6,
  },
});
