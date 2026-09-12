import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Bell, Settings } from 'lucide-react-native';
import { color, font } from '../theme/theme';

export function Header({
  kicker, title, metaA, metaB, noLeidas, hayNoLeidas, onNotif, onAjustes,
}: {
  kicker: string;
  title: string;
  metaA: string;
  metaB: string;
  noLeidas: number;
  hayNoLeidas: boolean;
  onNotif: () => void;
  onAjustes: () => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.kicker}>{kicker}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.right}>
        <View style={styles.icons}>
          <Pressable style={styles.iconBtn} onPress={onNotif} hitSlop={6}>
            <Bell size={17} strokeWidth={1.5} color={color.accent700} />
            {hayNoLeidas && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{noLeidas}</Text>
              </View>
            )}
          </Pressable>
          <Pressable style={styles.iconBtn} onPress={onAjustes} hitSlop={6}>
            <Settings size={17} strokeWidth={1.5} color={color.accent700} />
          </Pressable>
        </View>
        <View style={styles.meta}>
          <Text style={styles.metaText}>{metaA}</Text>
          <Text style={styles.metaText}>{metaB}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: color.neutral300,
  },
  left: { flex: 1, paddingRight: 10 },
  kicker: { fontFamily: font.heading, fontSize: 10.5, letterSpacing: 1.6, textTransform: 'uppercase', color: color.accent700 },
  title: { fontFamily: font.heading, fontWeight: '600', fontSize: 25, lineHeight: 27, textTransform: 'uppercase', color: color.text, marginTop: 2 },
  right: { alignItems: 'flex-end', gap: 7 },
  icons: { flexDirection: 'row', gap: 6 },
  iconBtn: {
    width: 32, height: 32, borderWidth: 1, borderColor: color.neutral300,
    alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    position: 'absolute', top: -5, right: -5, minWidth: 15, height: 15,
    backgroundColor: color.accent700, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  badgeText: { fontFamily: font.heading, fontSize: 10, color: color.white },
  meta: { alignItems: 'flex-end' },
  metaText: { fontSize: 11, lineHeight: 15, color: color.neutral600, fontFamily: font.body },
});
