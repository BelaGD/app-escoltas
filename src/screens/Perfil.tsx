import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { color, font } from '../theme/theme';
import { Avatar } from '../components/ui/Avatar';
import { Toggle } from '../components/ui/Toggle';
import { SectionTitle } from '../components/ui/Section';
import { useApp } from '../logic/useApp';

export function Perfil() {
  const app = useApp();

  return (
    <View>
      <View style={styles.headRow}>
        <Avatar ini="MR" size={56} borderColor={color.accent600} />
        <View style={{ flex: 1 }}>
          <Text style={styles.nombre}>Marta Ríos</Text>
          <Text style={styles.puesto}>Escolta · TIP 41.882 · Delegación Centro</Text>
        </View>
      </View>

      <View style={styles.refuerzoBox}>
        <View style={{ flex: 1 }}>
          <Text style={styles.refuerzoTitle}>Disponible para refuerzos</Text>
          <Text style={styles.refuerzoNota}>{app.refuerzoNota}</Text>
        </View>
        <Toggle on={app.refuerzo} onTap={app.toggleRefuerzo} size="lg" />
      </View>

      <SectionTitle>Mis habilitaciones</SectionTitle>
      <View style={{ gap: 6, marginBottom: 18 }}>
        {app.misCerts.map((c, i) => (
          <View key={i} style={styles.certRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.certNombre}>{c.nombre}</Text>
              <Text style={styles.certNum}>{c.num}</Text>
            </View>
            <Text style={[styles.certVence, { color: c.color }]}>{c.vence}</Text>
          </View>
        ))}
      </View>

      <SectionTitle>Horas del mes</SectionTitle>
      <View style={styles.chart}>
        {app.horasMes.map((h, i) => (
          <View key={i} style={[styles.bar, { height: h.alto as any, backgroundColor: h.color }]} />
        ))}
      </View>
      <View style={styles.chartFooter}>
        <Text style={styles.chartFooterText}>Semana 32</Text>
        <Text style={styles.chartFooterText}>Media 41 h · tope 48 h</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headRow: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 16 },
  nombre: { fontFamily: font.heading, fontSize: 22, lineHeight: 24, textTransform: 'uppercase', color: color.text },
  puesto: { fontSize: 11.5, color: color.neutral600, fontFamily: font.body },
  refuerzoBox: { borderWidth: 1, borderColor: color.neutral300, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  refuerzoTitle: { fontSize: 13, fontWeight: '600', color: color.text, fontFamily: font.bodySemiBold },
  refuerzoNota: { fontSize: 11.5, color: color.neutral600, marginTop: 2, fontFamily: font.body },
  certRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: color.neutral200, paddingVertical: 8, paddingHorizontal: 2 },
  certNombre: { fontSize: 13, fontWeight: '500', color: color.text, fontFamily: font.bodyMedium },
  certNum: { fontSize: 11, color: color.neutral600, fontFamily: font.body },
  certVence: { fontSize: 11.5, textAlign: 'right', fontFamily: font.body },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 5, height: 74, borderBottomWidth: 1, borderBottomColor: color.neutral300, paddingBottom: 2 },
  bar: { flex: 1 },
  chartFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  chartFooterText: { fontSize: 10.5, color: color.neutral600, fontFamily: font.body },
});
