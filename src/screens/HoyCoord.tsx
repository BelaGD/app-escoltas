import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { History } from 'lucide-react-native';
import { color, font } from '../theme/theme';
import { Blueprint } from '../components/ui/Blueprint';
import { DateField } from '../components/ui/DateField';
import { Tag } from '../components/ui/Tag';
import { ListRow } from '../components/ui/ListRow';
import { SectionTitle } from '../components/ui/Section';
import { useApp } from '../logic/useApp';

export function HoyCoord() {
  const app = useApp();
  const { dotacion } = app;

  return (
    <View>
      <Blueprint style={styles.dotacionBox}>
        <View style={styles.dotacionHead}>
          <View style={{ flex: 1 }}>
            <Text style={styles.kicker}>Dotación disponible</Text>
            <Text style={styles.h}>{dotacion.titulo}</Text>
          </View>
          <Pressable style={styles.historialBtn} onPress={app.abrirHistorialDotacion} hitSlop={6}>
            <History size={16} strokeWidth={1.5} color={color.accent700} />
          </Pressable>
        </View>
        <View style={styles.dateRow}>
          <DateField label="Consultar fecha" value={app.fechaDot} onChange={app.setFechaDot} style={{ flex: 1 }} />
          <Text style={styles.dateHint}>{dotacion.fechaTxt}</Text>
        </View>
        <View style={{ gap: 9, marginTop: 12 }}>
          {dotacion.filas.map((f, i) => (
            <Pressable key={i} onPress={f.onTap}>
              <View style={styles.filaRow}>
                <Text style={[styles.filaN, { color: f.color }]}>{f.n}</Text>
                <Text style={styles.filaK}>{f.k}</Text>
                <Text style={styles.filaNota}>{f.nota}</Text>
              </View>
              <View style={styles.bar}>
                <View style={[styles.barFill, { width: f.w as any, backgroundColor: f.barra }]} />
              </View>
            </Pressable>
          ))}
        </View>
        <Text style={styles.libres}>{dotacion.libresNombres}</Text>
      </Blueprint>

      <SectionTitle>Dispositivo permanente</SectionTitle>
      <View style={{ gap: 6, marginBottom: 22 }}>
        {app.protegidosHoy.map(p => (
          <ListRow key={p.id} ini={p.tit} nombre={p.nombre} nota={p.titular} tag={p.estadoTxt} tagKind={p.tag} onTap={p.onTap} borde={p.borde} />
        ))}
      </View>

      <SectionTitle meta={app.serviciosMeta}>Servicios especiales</SectionTitle>
      <View style={{ gap: 8, marginBottom: 22 }}>
        {app.servHoy.map((s, i) => (
          <Pressable key={i} onPress={s.onTap} style={[styles.servicio, { borderLeftColor: s.bar, backgroundColor: s.bg }]}>
            <View style={styles.servicioHora}>
              <Text style={styles.servicioDesde}>{s.desde}</Text>
              <Text style={styles.servicioHasta}>{s.hasta}</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.servicioCliente} numberOfLines={1}>{s.cliente}</Text>
              <Text style={styles.servicioTipo} numberOfLines={1}>{s.tipo}</Text>
              <Text style={[styles.servicioDot, { color: s.dotacionColor }]}>{s.dotacion}</Text>
            </View>
            <Tag label={s.estado} kind={s.tag} />
          </Pressable>
        ))}
      </View>

      <SectionTitle>Disponibles ahora</SectionTitle>
      <View style={{ gap: 0 }}>
        {app.disponibles.map((d, i) => (
          <View key={i} style={styles.dispRow}>
            <ListRowMini ini={d.ini} nombre={d.nombre} nota={d.nota} trailing={d.horas} />
          </View>
        ))}
      </View>
    </View>
  );
}

function ListRowMini({ ini, nombre, nota, trailing }: { ini: string; nombre: string; nota: string; trailing: string }) {
  return (
    <View style={styles.miniRow}>
      <View style={styles.miniAvatar}><Text style={styles.miniAvatarText}>{ini}</Text></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.miniNombre}>{nombre}</Text>
        <Text style={styles.miniNota}>{nota}</Text>
      </View>
      <Text style={styles.miniTrailing}>{trailing}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  dotacionBox: { padding: 13, marginBottom: 20 },
  dotacionHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  historialBtn: { width: 30, height: 30, borderWidth: 1, borderColor: color.neutral300, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  kicker: { fontFamily: font.heading, fontSize: 11, letterSpacing: 1.8, textTransform: 'uppercase', color: color.accent700 },
  h: { fontFamily: font.heading, fontSize: 26, lineHeight: 27, textTransform: 'uppercase', color: color.text, marginTop: 3 },
  dateRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginTop: 10 },
  dateHint: { fontSize: 11.5, color: color.neutral700, paddingBottom: 9, fontFamily: font.body },
  filaRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  filaN: { fontFamily: font.heading, fontWeight: '600', fontSize: 22, minWidth: 26 },
  filaK: { flex: 1, fontSize: 12.5, fontWeight: '500', color: color.text, fontFamily: font.bodyMedium },
  filaNota: { fontSize: 10.5, color: color.neutral600, fontFamily: font.body },
  bar: { height: 5, backgroundColor: color.neutral200, marginTop: 5 },
  barFill: { height: '100%' },
  libres: { fontSize: 11.5, lineHeight: 16, color: color.neutral700, marginTop: 11, paddingTop: 10, borderTopWidth: 1, borderTopColor: color.neutral200, fontFamily: font.body },
  servicio: { borderWidth: 1, borderColor: color.neutral300, borderLeftWidth: 3, padding: 11, flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  servicioHora: { minWidth: 64 },
  servicioDesde: { fontFamily: font.heading, fontSize: 16, color: color.text },
  servicioHasta: { fontSize: 11, color: color.neutral600, fontFamily: font.body },
  servicioCliente: { fontSize: 14, fontWeight: '600', color: color.text, fontFamily: font.bodySemiBold },
  servicioTipo: { fontSize: 11.5, color: color.neutral600, marginTop: 2, fontFamily: font.body },
  servicioDot: { fontSize: 12, marginTop: 6, fontFamily: font.body },
  dispRow: {},
  miniRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: color.neutral200, paddingVertical: 8, paddingHorizontal: 2 },
  miniAvatar: { width: 30, height: 30, borderWidth: 1, borderColor: color.accent500, alignItems: 'center', justifyContent: 'center' },
  miniAvatarText: { fontFamily: font.heading, fontSize: 12, color: color.accent700 },
  miniNombre: { fontSize: 13.5, fontWeight: '500', color: color.text, fontFamily: font.bodyMedium },
  miniNota: { fontSize: 11, color: color.neutral600, fontFamily: font.body },
  miniTrailing: { fontSize: 11.5, color: color.neutral700, textAlign: 'right', fontFamily: font.body },
});
