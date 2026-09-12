import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { color, font } from '../../theme/theme';
import { Avatar } from './Avatar';
import { Tag } from './Tag';
import { TagKind } from '../../logic/useApp';

// A row: avatar + name/note + optional tag or trailing text. Used across
// Hoy, Equipo, Protegidos-hoy, and several bottom-sheet lists.
export function ListRow({
  ini, iniColor, nombre, nota, tag, tagKind, trailing, onTap, borde,
}: {
  ini: string;
  iniColor?: string;
  nombre: string;
  nota: string;
  tag?: string;
  tagKind?: TagKind;
  trailing?: string;
  onTap?: () => void;
  borde?: string;
}) {
  const Wrap = onTap ? Pressable : View;
  return (
    <Wrap style={[styles.row, borde ? { borderColor: borde } : undefined]} onPress={onTap}>
      <Avatar ini={ini} size={32} borderColor={iniColor} />
      <View style={styles.mid}>
        <Text style={styles.nombre} numberOfLines={1}>{nombre}</Text>
        <Text style={styles.nota} numberOfLines={1}>{nota}</Text>
      </View>
      {tag && tagKind && <Tag label={tag} kind={tagKind} />}
      {trailing !== undefined && <Text style={styles.trailing}>{trailing}</Text>}
    </Wrap>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 11,
    borderWidth: 1, borderColor: color.neutral200, paddingVertical: 9, paddingHorizontal: 10,
  },
  mid: { flex: 1, minWidth: 0 },
  nombre: { fontSize: 13.5, fontWeight: '600', color: color.text, fontFamily: font.bodySemiBold },
  nota: { fontSize: 11, color: color.neutral600, marginTop: 1, fontFamily: font.body },
  trailing: { fontSize: 11.5, color: color.neutral700, textAlign: 'right', fontFamily: font.body },
});
