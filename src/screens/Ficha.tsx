import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { color, font } from '../theme/theme';
import { Blueprint } from '../components/ui/Blueprint';
import { Btn } from '../components/ui/Button';
import { Tag } from '../components/ui/Tag';
import { Avatar } from '../components/ui/Avatar';
import { SectionTitle } from '../components/ui/Section';
import { useApp } from '../logic/useApp';
import { confirmarEliminar } from '../logic/confirm';

export function Ficha() {
  const app = useApp();
  const f = app.ficha;

  return (
    <View>
      <Btn label="← Equipo" variant="ghost" onPress={app.volverEquipo} small style={styles.back} />
      <View style={styles.headRow}>
        <Avatar ini={f.ini} size={56} borderColor={color.accent600} />
        <View style={{ flex: 1 }}>
          <Text style={styles.nombre}>{f.nombre}</Text>
          <Text style={styles.puesto}>{f.puesto}</Text>
        </View>
        <Tag label={f.estadoTxt} kind={f.tag} />
      </View>

      <View style={styles.metricRow}>
        {f.metricas.map((m, i) => (
          <Blueprint key={i} style={styles.metric}>
            <Text style={styles.metricV}>{m.v}</Text>
            <Text style={styles.metricK}>{m.k}</Text>
          </Blueprint>
        ))}
      </View>

      <SectionTitle>Habilitaciones</SectionTitle>
      <View style={{ gap: 6, marginBottom: 10 }}>
        {f.certs.map(c => (
          <View key={c.id} style={styles.certRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.certNombre}>{c.nombre}</Text>
              <Text style={styles.certNum}>{c.num}</Text>
            </View>
            <Text style={[styles.certVence, { color: c.color }]}>{c.vence}</Text>
            <Pressable
              onPress={() => confirmarEliminar('Se eliminará "' + c.nombre + '" de las habilitaciones de ' + f.nombre + '.', c.onEliminar)}
              hitSlop={8}
            >
              <Trash2 size={14} strokeWidth={1.5} color={color.neutral500} />
            </Pressable>
          </View>
        ))}
        {f.certs.length === 0 && <Text style={styles.certVacio}>Sin habilitaciones registradas.</Text>}
      </View>
      <Btn label="+ Añadir habilitación" variant="secondary" onPress={app.abrirNuevaHabilitacion} small style={{ marginBottom: 18 }} />

      <SectionTitle>Próximos servicios</SectionTitle>
      <View style={{ gap: 6, marginBottom: 20 }}>
        {f.proximos.map((p, i) => (
          <View key={i} style={styles.proxRow}>
            <Text style={styles.proxCuando}>{p.cuando}</Text>
            <Text style={styles.proxCliente} numberOfLines={1}>{p.cliente}</Text>
            <Text style={styles.proxHoras}>{p.horas}</Text>
          </View>
        ))}
      </View>

      <Btn
        label="Eliminar escolta"
        variant="secondary"
        block
        onPress={() => confirmarEliminar('Se eliminará a ' + f.nombre + ' del equipo. Esta acción no se puede deshacer.', app.eliminarEscoltaActual)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: 'flex-start', marginBottom: 10, marginTop: 0 },
  headRow: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 16 },
  nombre: { fontFamily: font.heading, fontSize: 22, lineHeight: 24, textTransform: 'uppercase', color: color.text },
  puesto: { fontSize: 11.5, color: color.neutral600, fontFamily: font.body },
  metricRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  metric: { flex: 1, paddingVertical: 10, paddingHorizontal: 6, alignItems: 'center' },
  metricV: { fontFamily: font.heading, fontSize: 22 },
  metricK: { fontSize: 9.5, letterSpacing: 0.6, textTransform: 'uppercase', color: color.neutral600, marginTop: 3, textAlign: 'center', fontFamily: font.body },
  certRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: color.neutral200, paddingVertical: 8, paddingHorizontal: 2 },
  certNombre: { fontSize: 13, fontWeight: '500', color: color.text, fontFamily: font.bodyMedium },
  certNum: { fontSize: 11, color: color.neutral600, fontFamily: font.body },
  certVence: { fontSize: 11.5, textAlign: 'right', fontFamily: font.body },
  certVacio: { fontSize: 12, color: color.neutral600, fontStyle: 'italic', paddingVertical: 6, fontFamily: font.body },
  proxRow: { flexDirection: 'row', gap: 10, borderBottomWidth: 1, borderBottomColor: color.neutral200, paddingVertical: 8, paddingHorizontal: 2 },
  proxCuando: { fontFamily: font.heading, fontSize: 13, minWidth: 74, color: color.text },
  proxCliente: { flex: 1, fontSize: 12.5, color: color.text, fontFamily: font.body },
  proxHoras: { fontSize: 11.5, color: color.neutral600, fontFamily: font.body },
});
