import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { color, font } from '../theme/theme';

export function BottomNav({ items, active, onTap }: { items: [string, string][]; active: string; onTap: (t: string) => void }) {
  return (
    <View style={styles.row}>
      {items.map(([key, label]) => {
        const on = active === key;
        return (
          <Pressable key={key} onPress={() => onTap(key)} style={styles.item}>
            <View style={[styles.bar, on && styles.barOn]} />
            <Text style={[styles.label, on && styles.labelOn]} numberOfLines={1}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: color.neutral300, backgroundColor: color.neutral100 },
  item: { flex: 1, alignItems: 'center' },
  bar: { height: 3, alignSelf: 'stretch', backgroundColor: 'transparent' },
  barOn: { backgroundColor: color.accent700 },
  label: { fontFamily: font.heading, fontSize: 11.5, letterSpacing: 0.8, textTransform: 'uppercase', color: color.neutral600, paddingVertical: 10 },
  labelOn: { color: color.accent700 },
});
