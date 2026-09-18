import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { color, font } from '../theme/theme';
import { Blueprint } from '../components/ui/Blueprint';
import { Btn } from '../components/ui/Button';
import { SectionTitle } from '../components/ui/Section';
import { useApp } from '../logic/useApp';

export function HoyEscolta() {
  const app = useApp();
  const { miProtegido: mp, mio } = app;

  return (
    <View>
      <View style={styles.protBox}>
        <Text style={styles.kickerMuted}>Tu protegido</Text>
        <Text style={styles.protNombre}>{mp.nombre}</Text>
        <Text style={styles.protRol}>{mp.rol}</Text>
        <Text style={styles.protRutina}>{mp.rutina}</Text>
        <Text style={styles.protSuplente}>{mp.suplente}</Text>
      </View>

      <Blueprint style={styles.jornadaBox} borderColor={color.accent600}>
        <Text style={styles.kickerAccent}>Tu próxima jornada</Text>
        <Text style={styles.hora}>{mio.hora}</Text>
        <Text style={styles.cliente}>{mio.cliente}</Text>
        <Text style={styles.punto}>{mio.punto}</Text>
        <Text style={styles.nota}>{mio.nota}</Text>
        {mio.enServicio && <Btn label={mio.ctaCierre} variant="primary" block onPress={app.cerrarJornada} />}
        {mio.cerrado ? (
          <Btn label="Ver detalle" variant="secondary" onPress={app.verDetalleJornada} block small style={{ marginTop: 12 }} />
        ) : (
          <View style={styles.ctaRow}>
            <Btn label={mio.cta} variant="primary" onPress={app.confirmar} style={{ flex: 1 }} small />
            <Btn label="Ver detalle" variant="secondary" onPress={app.verDetalleJornada} style={{ flex: 1 }} small />
          </View>
        )}
      </Blueprint>

      {mio.cerrado && (
        <View style={styles.proximaBox}>
          <Text style={styles.kickerMuted}>Tu próxima jornada</Text>
          <Text style={styles.proximaFecha}>{app.proximaJornadaTxt}</Text>
        </View>
      )}

      <View style={styles.metricRow}>
        {mio.metricas.map((m, i) => (
          <View key={i} style={styles.metric}>
            <Text style={styles.metricV}>{m.v}</Text>
            <Text style={styles.metricK}>{m.k}</Text>
          </View>
        ))}
      </View>

      <SectionTitle>Resto de la semana</SectionTitle>
      <View style={{ gap: 6 }}>
        {mio.semana.map((s, i) => (
          <View key={i} style={[styles.semRow, { borderLeftColor: s.bar }]}>
            <View style={{ minWidth: 56 }}>
              <Text style={styles.semDia}>{s.dia}</Text>
              <Text style={styles.semHoras}>{s.horas}</Text>
            </View>
            <Text style={styles.semCliente} numberOfLines={1}>{s.cliente}</Text>
            <Text style={styles.semTipo}>{s.tipo}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  protBox: { borderWidth: 1, borderColor: color.neutral300, padding: 12, marginBottom: 14 },
  kickerMuted: { fontFamily: font.heading, fontSize: 10.5, letterSpacing: 2, textTransform: 'uppercase', color: color.neutral600 },
  protNombre: { fontFamily: font.heading, fontSize: 24, lineHeight: 26, textTransform: 'uppercase', color: color.text, marginTop: 3 },
  protRol: { fontSize: 11.5, color: color.neutral600, fontFamily: font.body },
  protRutina: { fontSize: 12, color: color.neutral700, marginTop: 8, fontFamily: font.body },
  protSuplente: { fontSize: 11, color: color.neutral600, marginTop: 3, fontFamily: font.body },
  jornadaBox: { padding: 14, marginBottom: 16 },
  proximaBox: { borderWidth: 1, borderColor: color.neutral300, padding: 12, marginTop: -2, marginBottom: 16 },
  proximaFecha: { fontFamily: font.heading, fontSize: 20, color: color.text, marginTop: 3 },
  kickerAccent: { fontFamily: font.heading, fontSize: 10.5, letterSpacing: 2, textTransform: 'uppercase', color: color.accent700 },
  hora: { fontFamily: font.heading, fontSize: 34, lineHeight: 36, color: color.text, marginTop: 6 },
  cliente: { fontSize: 15, fontWeight: '600', color: color.text, marginTop: 6, fontFamily: font.bodySemiBold },
  punto: { fontSize: 12.5, color: color.neutral700, marginTop: 3, fontFamily: font.body },
  nota: { fontSize: 11.5, color: color.neutral600, marginTop: 6, fontFamily: font.body },
  ctaRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  metricRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  metric: { flex: 1, borderWidth: 1, borderColor: color.neutral300, paddingVertical: 10, paddingHorizontal: 6, alignItems: 'center' },
  metricV: { fontFamily: font.heading, fontSize: 22, color: color.text },
  metricK: { fontSize: 9.5, letterSpacing: 0.6, textTransform: 'uppercase', color: color.neutral600, marginTop: 3, textAlign: 'center', fontFamily: font.body },
  semRow: { flexDirection: 'row', gap: 10, alignItems: 'center', borderWidth: 1, borderColor: color.neutral200, borderLeftWidth: 3, paddingVertical: 9, paddingHorizontal: 10 },
  semDia: { fontFamily: font.heading, fontSize: 13, textTransform: 'uppercase', color: color.text },
  semHoras: { fontSize: 10.5, color: color.neutral600, fontFamily: font.body },
  semCliente: { flex: 1, fontSize: 12.5, color: color.text, fontFamily: font.body },
  semTipo: { fontSize: 11, color: color.neutral600, fontFamily: font.body },
});
