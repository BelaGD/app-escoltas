import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { color } from '../../theme/theme';

export function Toggle({ on, onTap, size = 'md' }: { on: boolean; onTap: () => void; size?: 'md' | 'lg' }) {
  const width = size === 'lg' ? 52 : 48;
  const height = size === 'lg' ? 28 : 26;
  const dot = size === 'lg' ? 20 : 18;
  const travel = width - dot - 6;
  return (
    <Pressable onPress={onTap} style={[styles.track, { width, height, backgroundColor: on ? color.accent200 : 'transparent' }]}>
      <View
        style={[
          styles.dot,
          { width: dot, height: dot, left: on ? travel + 3 : 3, backgroundColor: on ? color.accent700 : color.neutral400 },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: { borderWidth: 1, borderColor: color.accent600, justifyContent: 'center' },
  dot: { position: 'absolute' },
});
