import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { color } from '../../theme/theme';

const MARK = 'rgba(29,31,32,0.55)';

function Corner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const vertical = pos === 'tl' || pos === 'tr' ? { top: -6 } : { bottom: -6 };
  const horizontal = pos === 'tl' || pos === 'bl' ? { left: -6 } : { right: -6 };
  return (
    <View pointerEvents="none" style={[styles.corner, vertical, horizontal]}>
      <View style={styles.cornerV} />
      <View style={styles.cornerH} />
    </View>
  );
}

// The "blueprint" wireframe frame from the Industry design system: a
// hairline border with "+" registration marks on each corner.
export function Blueprint({ children, style, borderColor }: { children?: React.ReactNode; style?: ViewStyle | ViewStyle[]; borderColor?: string }) {
  return (
    <View style={[styles.box, { borderColor: borderColor || color.divider }, style]}>
      <Corner pos="tl" />
      <Corner pos="tr" />
      <Corner pos="bl" />
      <Corner pos="br" />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    position: 'relative',
    borderWidth: 1,
  },
  corner: {
    position: 'absolute',
    width: 11,
    height: 11,
  },
  cornerV: { position: 'absolute', left: 5, top: 0, width: 1, height: '100%', backgroundColor: MARK },
  cornerH: { position: 'absolute', top: 5, left: 0, width: '100%', height: 1, backgroundColor: MARK },
});
