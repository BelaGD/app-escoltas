import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { color, font } from '../theme/theme';
import { Blueprint } from '../components/ui/Blueprint';
import { Btn } from '../components/ui/Button';
import { Tag } from '../components/ui/Tag';
import { SectionTitle } from '../components/ui/Section';
import { useApp } from '../logic/useApp';

export function VacacionesEscolta() {
  const app = useApp();

  return (
    <View>
      <View style={styles.saldoRow}>
        {app.saldo.map((m, i) => (
          <Blueprint key={i} style={styles.saldoCol}>
            <Text style={[styles.saldoV, { color: m.color }]}>{m.v}</Text>
            <Text style={styles.saldoK}>{m.k}</Text>
          </Blueprint>
        ))}
      </View>

      <Btn label="Solicitar días" variant="primary" block onPress={app.abrirSolicitud} style={{ marginBottom: 18 }} />

      <SectionTitle>Mis solicitudes</SectionTitle>
      <View style={{ gap: 8 }}>
        {app.misSolicitudes.map((s, i) => (
          <View key={i} style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rango}>{s.rango}</Text>
              <Text style={styles.dias}>{s.dias}</Text>
            </View>
            <Tag label={s.estado} kind={s.tag} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  saldoRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  saldoCol: { flex: 1, padding: 10, alignItems: 'center' },
  saldoV: { fontFamily: font.heading, fontSize: 24 },
  saldoK: { fontSize: 9.5, letterSpacing: 0.6, textTransform: 'uppercase', color: color.neutral600, marginTop: 3, textAlign: 'center', fontFamily: font.body },
  card: { borderWidth: 1, borderColor: color.neutral300, paddingVertical: 11, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  rango: { fontFamily: font.heading, fontSize: 17, color: color.text },
  dias: { fontSize: 11, color: color.neutral600, marginTop: 2, fontFamily: font.body },
});
