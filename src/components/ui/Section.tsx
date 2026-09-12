import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { color, font } from '../../theme/theme';

export function SectionTitle({ children, meta }: { children: React.ReactNode; meta?: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{children}</Text>
      {!!meta && <Text style={styles.meta}>{meta}</Text>}
    </View>
  );
}

export function EmptyHint({ text }: { text: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 9, marginTop: 4 },
  title: { fontFamily: font.heading, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', color: color.text },
  meta: { fontSize: 11, color: color.neutral600, fontFamily: font.body },
  empty: { borderWidth: 1, borderColor: color.neutral400, borderStyle: 'dashed', padding: 20, alignItems: 'center' },
  emptyText: { fontSize: 12.5, color: color.neutral600, textAlign: 'center', fontFamily: font.body },
});
