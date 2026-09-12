import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { color, font } from '../../theme/theme';

export interface SegOption {
  label: string;
  on: boolean;
  onTap: () => void;
}

export function Segmented({ options, small }: { options: SegOption[]; small?: boolean }) {
  return (
    <View style={styles.row}>
      {options.map((o, i) => (
        <Pressable
          key={o.label + i}
          onPress={o.onTap}
          style={[
            styles.opt,
            i > 0 && styles.divider,
            o.on && styles.optOn,
          ]}
        >
          <Text style={[styles.label, small && styles.labelSmall, o.on && styles.labelOn]} numberOfLines={1}>
            {o.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

// A row of pill-style toggle chips (used for filters/day selectors that
// wrap, unlike the connected Segmented control above).
export function ChipRow({ options }: { options: SegOption[] }) {
  return (
    <View style={styles.chipRow}>
      {options.map((o, i) => (
        <Pressable key={o.label + i} onPress={o.onTap} style={[styles.chip, o.on && styles.optOn]}>
          <Text style={[styles.label, styles.labelSmall, o.on && styles.labelOn]}>{o.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: color.divider,
    alignSelf: 'stretch',
  },
  divider: { borderLeftWidth: 1, borderLeftColor: color.divider },
  opt: { flex: 1, alignItems: 'center', paddingVertical: 8, paddingHorizontal: 10 },
  optOn: { backgroundColor: color.accent },
  label: { fontFamily: font.heading, fontSize: 13, color: color.text },
  labelSmall: { fontSize: 11.5 },
  labelOn: { color: color.bg },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingVertical: 6, paddingHorizontal: 10, borderWidth: 1, borderColor: color.neutral300 },
});
