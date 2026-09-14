import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { color, font } from '../theme/theme';
import { Segmented, ChipRow } from '../components/ui/Segmented';
import { EmptyHint } from '../components/ui/Section';
import { useApp } from '../logic/useApp';

export function Agenda() {
  const app = useApp();

  return (
    <View>
      <Segmented
        options={['Semana', 'Mes', 'Año'].map(v => ({ label: v, on: app.calVista === v, onTap: () => app.setCalVista(v as any) }))}
        small
      />
      <View style={{ height: 14 }} />

      {app.calVista === 'Semana' && <SemanaView />}
      {app.calVista === 'Mes' && <MesView />}
      {app.calVista === 'Año' && <AnioView />}
    </View>
  );
}

function SemanaView() {
  const app = useApp();
  return (
    <View>
      <View style={styles.weekRow}>
        {app.semana.map(d => (
          <Pressable
            key={d.num}
            onPress={d.onTap}
            style={[
              styles.weekDay,
              { borderColor: d.active ? color.accent700 : color.neutral300, backgroundColor: d.active ? color.accent700 : 'transparent' },
            ]}
          >
            <Text style={[styles.weekDayLabel, { color: d.active ? color.white : color.text, opacity: 0.75 }]}>{d.dia}</Text>
            <Text style={[styles.weekDayNum, { color: d.active ? color.white : color.text }]}>{d.num}</Text>
            <Text style={[styles.weekDayCarga, { color: d.active ? color.white : color.text, opacity: 0.75 }]}>{d.carga}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.diaHeadRow}>
        <Text style={styles.diaTitulo}>{app.diaTitulo}</Text>
        <Text style={styles.diaMeta}>{app.diaMeta}</Text>
      </View>

      <View>
        {app.diaServicios.map((sv, i) => (
          <View key={i} style={styles.timelineRow}>
            <View style={{ width: 52, paddingTop: 2, alignItems: 'flex-end' }}>
              <Text style={styles.timeDesde}>{sv.desde}</Text>
              <Text style={styles.timeHasta}>{sv.hasta}</Text>
            </View>
            <View style={styles.timelineLine}>
              <View style={[styles.timelineDot, { backgroundColor: sv.bar }]} />
            </View>
            <Pressable onPress={sv.onTap} style={[styles.timelineCard, { backgroundColor: sv.bg }]}>
              <Text style={styles.timelineCliente} numberOfLines={1}>{sv.cliente}</Text>
              <Text style={styles.timelineTipo} numberOfLines={1}>{sv.tipo}</Text>
              <Text style={[styles.timelineDot2, { color: sv.dotacionColor }]}>{sv.dotacion}</Text>
            </Pressable>
          </View>
        ))}
      </View>
      {app.diaVacio && <EmptyHint text="Sin servicios asignados este día." />}
    </View>
  );
}

function MesView() {
  const app = useApp();
  return (
    <View>
      <ChipRow options={app.calEscoltas} />
      <View style={{ height: 12 }} />
      <View style={styles.monthNav}>
        <Pressable onPress={app.calMesPrev} hitSlop={8}><Text style={styles.monthArrow}>←</Text></Pressable>
        <Text style={styles.monthName}>{app.calMesNombre}</Text>
        <Pressable onPress={app.calMesNext} hitSlop={8}><Text style={styles.monthArrow}>→</Text></Pressable>
      </View>
      <View style={styles.weekLabelsRow}>
        {app.calDiasSemana.map((d, i) => (
          <Text key={i} style={styles.weekLabel}>{d}</Text>
        ))}
      </View>
      <View style={styles.grid7}>
        {app.calMesDias.map((d, i) => (
          <View key={i} style={[styles.cell, { borderColor: d.borde, backgroundColor: d.bg }]}>
            <Text style={[styles.cellNum, { color: d.fg }]}>{d.num}</Text>
            <Text style={styles.cellMarca}>{d.marca}</Text>
          </View>
        ))}
      </View>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: color.accent200, borderColor: color.neutral300 }]} /><Text style={styles.legendText}>Jornada</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendSwatch, { borderColor: color.neutral300 }]} /><Text style={styles.legendText}>Libranza</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendSwatch, { borderColor: color.accent700 }]} /><Text style={styles.legendText}>Inicio de ciclo</Text></View>
        <View style={styles.legendItem}><Text style={[styles.legendText, { color: color.accent700 }]}>● Servicio especial</Text></View>
      </View>
      <Text style={styles.resumen}>{app.calEscolta} · {app.calMesResumen}</Text>
    </View>
  );
}

function AnioView() {
  const app = useApp();
  return (
    <View>
      <ChipRow options={app.calEscoltas} />
      <View style={{ height: 12 }} />
      <Text style={styles.anioTitulo}>2026 · ciclo 14/7</Text>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: color.accent500 }]} /><Text style={styles.legendText}>Jornada</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: color.neutral200 }]} /><Text style={styles.legendText}>Libranza</Text></View>
      </View>
      <View style={styles.anioGrid}>
        {app.calAnio.map((m, i) => (
          <Pressable key={i} onPress={m.onTap} style={styles.anioMes}>
            <Text style={styles.anioMesNombre}>{m.nombre}</Text>
            <View style={styles.anioMesGrid}>
              {m.dias.map((d, j) => (
                <View key={j} style={[styles.anioMesDia, { backgroundColor: d.bg }]} />
              ))}
            </View>
            <Text style={styles.anioMesStat}>{m.jornada}j · {m.libranza}l</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.resumen}>{app.calEscolta} · {app.calAnioResumen}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  weekRow: { flexDirection: 'row', gap: 5, marginBottom: 18 },
  weekDay: { flex: 1, borderWidth: 1, paddingVertical: 7, alignItems: 'center' },
  weekDayLabel: { fontFamily: font.heading, fontSize: 9.5, letterSpacing: 0.6 },
  weekDayNum: { fontFamily: font.heading, fontSize: 17 },
  weekDayCarga: { fontFamily: font.heading, fontSize: 9 },
  diaHeadRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 },
  diaTitulo: { fontFamily: font.heading, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', color: color.text },
  diaMeta: { fontSize: 11, color: color.neutral600, fontFamily: font.body },
  timelineRow: { flexDirection: 'row', gap: 12, alignItems: 'stretch' },
  timelineLine: { width: 1, backgroundColor: color.neutral300, position: 'relative' },
  timelineDot: { position: 'absolute', left: -3, top: 6, width: 7, height: 7 },
  timelineCard: { flex: 1, marginLeft: 2, marginBottom: 16, borderWidth: 1, borderColor: color.neutral300, padding: 11 },
  timeDesde: { fontFamily: font.heading, fontSize: 14, color: color.text },
  timeHasta: { fontSize: 10.5, color: color.neutral600, fontFamily: font.body },
  timelineCliente: { fontSize: 13.5, fontWeight: '600', color: color.text, fontFamily: font.bodySemiBold },
  timelineTipo: { fontSize: 11.5, color: color.neutral600, marginTop: 2, fontFamily: font.body },
  timelineDot2: { fontSize: 12, marginTop: 6, fontFamily: font.body },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  monthArrow: { fontSize: 16, color: color.accent, padding: 6, fontFamily: font.body },
  monthName: { fontFamily: font.heading, fontSize: 17, letterSpacing: 1, textTransform: 'uppercase', color: color.text },
  weekLabelsRow: { flexDirection: 'row', marginBottom: 4 },
  weekLabel: { flex: 1, textAlign: 'center', fontFamily: font.heading, fontSize: 10, letterSpacing: 1, color: color.neutral600 },
  grid7: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, borderWidth: 0.5, alignItems: 'center', justifyContent: 'center' },
  cellNum: { fontFamily: font.heading, fontSize: 13 },
  cellMarca: { fontSize: 7, lineHeight: 8, color: color.accent700 },
  legendRow: { flexDirection: 'row', gap: 14, marginTop: 12, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendSwatch: { width: 11, height: 11, borderWidth: 1 },
  legendText: { fontSize: 10.5, color: color.neutral600, fontFamily: font.body },
  resumen: { fontSize: 12, color: color.neutral700, marginTop: 10, fontFamily: font.body },
  anioTitulo: { fontFamily: font.heading, fontSize: 17, letterSpacing: 1, textTransform: 'uppercase', color: color.text, marginBottom: 10 },
  anioGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  anioMes: { width: '31%', borderWidth: 1, borderColor: color.neutral300, padding: 7 },
  anioMesNombre: { fontFamily: font.heading, fontSize: 11, letterSpacing: 1, color: color.neutral700, marginBottom: 5 },
  anioMesGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  anioMesDia: { width: '14.28%', aspectRatio: 1, margin: 0.5, borderWidth: 0.5, borderColor: color.neutral300 },
  anioMesStat: { fontSize: 9, color: color.neutral600, marginTop: 5, fontFamily: font.body },
});
