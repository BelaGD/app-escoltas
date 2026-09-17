import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { color, font } from '../theme/theme';
import { Blueprint } from '../components/ui/Blueprint';
import { Btn } from '../components/ui/Button';
import { Tag } from '../components/ui/Tag';
import { SectionTitle, EmptyHint } from '../components/ui/Section';
import { useApp } from '../logic/useApp';

export function VacacionesCoord() {
  const app = useApp();

  return (
    <View>
      <Blueprint style={styles.cupoBox}>
        <Text style={styles.cupoTitle}>Cupo de vacaciones · {app.cupoMesNombre}</Text>
        <Text style={styles.cupoAyuda}>Escoltas de vacaciones esa semana, sobre un máximo de 3 a la vez</Text>
        <View style={styles.cupoGrid}>
          {app.cupo.map((c, i) => (
            <View key={i} style={styles.cupoCol}>
              <Text style={styles.cupoRango}>{c.rango}</Text>
              <View style={styles.cupoBarTrack}>
                <View style={[styles.cupoBarFill, { height: c.alto as any, backgroundColor: c.color }]} />
              </View>
              <Text style={[styles.cupoTxt, { color: c.color }]}>{c.txt}</Text>
            </View>
          ))}
        </View>
        <View style={styles.cupoLegendRow}>
          <View style={styles.cupoLegendItem}><View style={[styles.cupoLegendSwatch, { backgroundColor: color.neutral300 }]} /><Text style={styles.cupoLegendText}>Nadie de vacaciones</Text></View>
          <View style={styles.cupoLegendItem}><View style={[styles.cupoLegendSwatch, { backgroundColor: color.accent500 }]} /><Text style={styles.cupoLegendText}>Con margen</Text></View>
          <View style={styles.cupoLegendItem}><View style={[styles.cupoLegendSwatch, { backgroundColor: color.warn }]} /><Text style={styles.cupoLegendText}>Cupo lleno</Text></View>
        </View>
      </Blueprint>

      <SectionTitle>Pendientes de aprobar</SectionTitle>
      <View style={{ gap: 10, marginBottom: 20 }}>
        {app.pendientes.map((p, i) => (
          <View key={i} style={styles.pendCard}>
            <View style={styles.pendHead}>
              <Text style={styles.pendNombre}>{p.nombre}</Text>
              <Text style={styles.pendDias}>{p.dias}</Text>
            </View>
            <Text style={styles.pendRango}>{p.rango}</Text>
            {!!p.aviso && <Text style={[styles.pendAviso, { color: p.avisoColor }]}>{p.aviso}</Text>}
            <View style={styles.pendActions}>
              <Btn label="Aprobar" variant="primary" onPress={p.onAprobar} style={{ flex: 1 }} small />
              <Btn label="Rechazar" variant="secondary" onPress={p.onRechazar} style={{ flex: 1 }} small />
            </View>
          </View>
        ))}
      </View>
      {app.sinPendientes && <View style={{ marginBottom: 20 }}><EmptyHint text="Nada pendiente. Todo resuelto." /></View>}

      <SectionTitle>Resueltas</SectionTitle>
      <View>
        {app.resueltas.map((r, i) => (
          <View key={i} style={styles.resRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.resNombre}>{r.nombre}</Text>
              <Text style={styles.resRango}>{r.rango}</Text>
            </View>
            <Tag label={r.estado} kind={r.tag} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cupoBox: { padding: 12, marginBottom: 18 },
  cupoTitle: { fontFamily: font.heading, fontSize: 11, letterSpacing: 1.8, textTransform: 'uppercase', color: color.neutral600, marginBottom: 2 },
  cupoAyuda: { fontSize: 10.5, color: color.neutral600, fontFamily: font.body, marginBottom: 10 },
  cupoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cupoCol: { width: '15%', flexGrow: 1, alignItems: 'center' },
  cupoRango: { fontSize: 10, color: color.neutral600, fontFamily: font.body },
  cupoBarTrack: { height: 34, borderWidth: 1, borderColor: color.neutral300, marginTop: 4, width: '100%', justifyContent: 'flex-end' },
  cupoBarFill: { width: '100%' },
  cupoTxt: { fontSize: 10, marginTop: 3, fontFamily: font.body },
  cupoLegendRow: { flexDirection: 'row', gap: 14, marginTop: 12, flexWrap: 'wrap' },
  cupoLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  cupoLegendSwatch: { width: 11, height: 11, borderWidth: 1, borderColor: color.neutral300 },
  cupoLegendText: { fontSize: 10.5, color: color.neutral600, fontFamily: font.body },
  pendCard: { borderWidth: 1, borderColor: color.neutral300, padding: 12 },
  pendHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  pendNombre: { fontSize: 14, fontWeight: '600', color: color.text, fontFamily: font.bodySemiBold },
  pendDias: { fontSize: 11, color: color.neutral600, fontFamily: font.body },
  pendRango: { fontFamily: font.heading, fontSize: 17, color: color.text, marginTop: 3 },
  pendAviso: { fontSize: 11.5, marginTop: 6, fontFamily: font.body },
  pendActions: { flexDirection: 'row', gap: 8, marginTop: 11 },
  resRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: color.neutral200, paddingVertical: 8, paddingHorizontal: 2 },
  resNombre: { fontSize: 13, fontWeight: '500', color: color.text, fontFamily: font.bodyMedium },
  resRango: { fontSize: 11, color: color.neutral600, fontFamily: font.body },
});
