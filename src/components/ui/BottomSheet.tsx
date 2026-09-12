import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { color, font, shadow } from '../../theme/theme';

export function BottomSheet({
  open, title, subtitle, onClose, children,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, shadow.lg]}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{title}</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={styles.close}>Cerrar</Text>
          </Pressable>
        </View>
        {!!subtitle && <Text style={styles.sub}>{subtitle}</Text>}
        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(29,45,61,0.45)' },
  sheet: {
    backgroundColor: color.bg,
    borderTopWidth: 2,
    borderTopColor: color.accent700,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
    maxHeight: '82%',
  },
  headerRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 },
  title: { fontFamily: font.heading, fontSize: 20, textTransform: 'uppercase', color: color.text },
  close: { fontSize: 12, color: color.neutral600, padding: 4 },
  sub: { fontSize: 12, color: color.neutral600, marginBottom: 14, fontFamily: font.body },
  body: {},
});
