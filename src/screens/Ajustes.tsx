import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { color, font } from '../theme/theme';
import { Blueprint } from '../components/ui/Blueprint';
import { Avatar } from '../components/ui/Avatar';
import { Toggle } from '../components/ui/Toggle';
import { Btn } from '../components/ui/Button';
import { SectionTitle } from '../components/ui/Section';
import { useApp } from '../logic/useApp';

export function Ajustes() {
  const app = useApp();

  return (
    <View>
      <Blueprint style={styles.cuentaBox}>
        <Avatar ini={app.cuenta.ini} size={44} borderColor={color.accent600} />
        <View style={{ flex: 1 }}>
          <Text style={styles.cuentaNombre}>{app.cuenta.nombre}</Text>
          <Text style={styles.cuentaDetalle}>{app.cuenta.detalle}</Text>
        </View>
      </Blueprint>

      <SectionTitle>Avisos</SectionTitle>
      <View style={{ gap: 6, marginBottom: 18 }}>
        {app.preferencias.map((p, i) => (
          <View key={i} style={styles.prefRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.prefLabel}>{p.label}</Text>
              <Text style={styles.prefNota}>{p.nota}</Text>
            </View>
            <Toggle on={p.on} onTap={p.onTap} />
          </View>
        ))}
      </View>

      <SectionTitle>Sesión</SectionTitle>
      <View style={{ gap: 6, marginBottom: 16 }}>
        {app.sesionInfo.map((s, i) => (
          <View key={i} style={styles.sesRow}>
            <Text style={styles.sesK}>{s.k}</Text>
            <Text style={styles.sesV}>{s.v}</Text>
          </View>
        ))}
      </View>

      {app.coord && (
        <>
          <SectionTitle>Seguridad</SectionTitle>
          <Btn label="Ver historial completo" variant="secondary" block onPress={app.abrirHistorialGeneral} style={{ marginBottom: 16 }} />
        </>
      )}

      <Btn label="Cerrar sesión" variant="secondary" block onPress={app.cerrarSesion} />
      <Text style={styles.version}>Relevo 2.4.1 · build 2026.09</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cuentaBox: { padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  cuentaNombre: { fontFamily: font.heading, fontSize: 19, lineHeight: 21, textTransform: 'uppercase', color: color.text },
  cuentaDetalle: { fontSize: 11.5, color: color.neutral600, fontFamily: font.body },
  prefRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: color.neutral200, paddingVertical: 9, paddingHorizontal: 2 },
  prefLabel: { fontSize: 13, fontWeight: '500', color: color.text, fontFamily: font.bodyMedium },
  prefNota: { fontSize: 11, color: color.neutral600, marginTop: 1, fontFamily: font.body },
  sesRow: { flexDirection: 'row', gap: 10, borderBottomWidth: 1, borderBottomColor: color.neutral200, paddingVertical: 8, paddingHorizontal: 2 },
  sesK: { flex: 1, fontSize: 12.5, color: color.neutral600, fontFamily: font.body },
  sesV: { fontSize: 12.5, color: color.text, fontFamily: font.body },
  version: { textAlign: 'center', fontSize: 10.5, color: color.neutral500, marginTop: 14, fontFamily: font.body },
});
