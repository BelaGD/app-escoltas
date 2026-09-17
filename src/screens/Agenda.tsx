import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { color, font } from '../theme/theme';
import { Segmented, ChipRow } from '../components/ui/Segmented';
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
  const t = app.semanaTabla;
  return (
    <View>
      <View style={styles.monthNav}>
        <Pressable onPress={app.calSemanaPrev} hitSlop={8}><Text style={styles.monthArrow}>←</Text></Pressable>
        <Text style={styles.monthName}>{app.calSemanaLabel}</Text>
        <Pressable onPress={app.calSemanaNext} hitSlop={8}><Text style={styles.monthArrow}>→</Text></Pressable>
      </View>

      <View style={styles.tabla}>
        <View style={styles.tablaRow}>
          <View style={styles.tablaNombreCol} />
          {t.dias.map(d => (
            <View key={d.f} style={[styles.tablaDiaHead, d.esHoy && { backgroundColor: color.accent700 }]}>
              <Text style={[styles.tablaDiaHeadDia, d.esHoy && { color: color.white }]}>{d.dia}</Text>
              <Text style={[styles.tablaDiaHeadNum, d.esHoy && { color: color.white }]}>{d.num}</Text>
            </View>
          ))}
        </View>
        {t.filas.map((fila, i) => (
          <View key={i} style={[styles.tablaRow, { borderTopWidth: 1, borderTopColor: color.neutral200 }]}>
            <View style={styles.tablaNombreCol}>
              <Text style={styles.tablaNombre} numberOfLines={1}>{fila.nombre}</Text>
            </View>
            {fila.celdas.map((c, j) => (
              <View key={j} style={[styles.tablaCelda, { backgroundColor: c.bg }]}>
                <Text style={[styles.tablaCeldaTxt, { color: c.fg }]}>{c.txt}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: color.accent200, borderColor: color.neutral300 }]} /><Text style={styles.legendText}>T · Trabaja</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendSwatch, { borderColor: color.neutral300 }]} /><Text style={styles.legendText}>L · Libre</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: color.neutral500, borderColor: color.neutral500 }]} /><Text style={styles.legendText}>V · Vacaciones</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: color.warnBg, borderColor: color.warn }]} /><Text style={styles.legendText}>B · Baja</Text></View>
      </View>
    </View>
  );
}

function MesView() {
  const app = useApp();
  return (
    <View>
      {app.coord && <ChipRow options={app.calEscoltas} />}
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
        <View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: color.neutral500, borderColor: color.neutral500 }]} /><Text style={styles.legendText}>Vacaciones</Text></View>
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
      {app.coord && <ChipRow options={app.calEscoltas} />}
      <View style={{ height: 12 }} />
      <Text style={styles.anioTitulo}>2026 · ciclo 14/7</Text>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: color.accent200, borderColor: color.neutral300 }]} /><Text style={styles.legendText}>Jornada</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendSwatch, { borderColor: color.neutral300 }]} /><Text style={styles.legendText}>Libranza</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: color.neutral500, borderColor: color.neutral500 }]} /><Text style={styles.legendText}>Vacaciones</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendSwatch, { borderColor: color.accent700 }]} /><Text style={styles.legendText}>Inicio de ciclo</Text></View>
        <View style={styles.legendItem}><Text style={[styles.legendText, { color: color.accent700 }]}>● Servicio especial</Text></View>
      </View>
      <View style={styles.anioGrid}>
        {app.calAnio.map((m, i) => (
          <View key={i} style={styles.anioMes}>
            <Text style={styles.anioMesNombre}>{m.nombre}</Text>
            <View style={styles.anioMesDivider} />
            <View style={styles.anioMesGrid}>
              {m.dias.map((d, j) => (
                <View key={j} style={[styles.anioMesDia, { backgroundColor: d.bg, borderColor: d.num === '' ? 'transparent' : d.borde }]}>
                  {d.num !== '' && <Text style={[styles.anioMesDiaNum, { color: d.fg }]}>{d.num}</Text>}
                  {!!d.marca && <Text style={styles.anioMesDiaMarca}>{d.marca}</Text>}
                </View>
              ))}
            </View>
            <Text style={styles.anioMesStat}>{m.jornada}j · {m.libranza}l{m.vacaciones ? ' · ' + m.vacaciones + 'v' : ''}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.resumen}>{app.calEscolta} · {app.calAnioResumen}</Text>
      {app.calAnioVacaciones.length > 0 && (
        <View style={styles.vacBox}>
          <Text style={styles.vacTitulo}>Vacaciones aprobadas en 2026</Text>
          {app.calAnioVacaciones.map((r, i) => <Text key={i} style={styles.vacItem}>{r}</Text>)}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabla: { borderWidth: 1, borderColor: color.neutral300, marginBottom: 14 },
  tablaRow: { flexDirection: 'row', alignItems: 'stretch' },
  tablaNombreCol: { width: 96, paddingVertical: 6, paddingHorizontal: 6, justifyContent: 'center' },
  tablaNombre: { fontSize: 10.5, color: color.text, fontFamily: font.bodySemiBold },
  tablaDiaHead: { flex: 1, alignItems: 'center', paddingVertical: 6, borderLeftWidth: 1, borderLeftColor: color.neutral300, backgroundColor: color.neutral100 },
  tablaDiaHeadDia: { fontFamily: font.heading, fontSize: 8.5, letterSpacing: 0.5, color: color.neutral600 },
  tablaDiaHeadNum: { fontFamily: font.heading, fontSize: 13, color: color.text },
  tablaCelda: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 6, borderLeftWidth: 1, borderLeftColor: color.neutral300 },
  tablaCeldaTxt: { fontFamily: font.heading, fontSize: 11 },
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
  anioTitulo: { fontFamily: font.heading, fontSize: 17, letterSpacing: 1, textTransform: 'uppercase', color: color.text, marginBottom: 4 },
  anioGrid: { gap: 10, marginTop: 4 },
  anioMes: { width: '100%', borderWidth: 1, borderColor: color.neutral300, backgroundColor: color.surface, padding: 12 },
  anioMesNombre: { fontFamily: font.heading, fontSize: 13, letterSpacing: 1.5, color: color.text },
  anioMesDivider: { height: 1, backgroundColor: color.neutral200, marginTop: 6, marginBottom: 10 },
  anioMesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 2.5 },
  anioMesDia: { width: 17, height: 17, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  anioMesDiaNum: { fontFamily: font.heading, fontSize: 7.5, lineHeight: 8 },
  anioMesDiaMarca: { fontSize: 5, lineHeight: 5, color: color.accent700, position: 'absolute', top: 1, right: 1 },
  anioMesStat: { fontSize: 10.5, color: color.neutral600, marginTop: 10, fontFamily: font.body },
  vacBox: { borderWidth: 1, borderColor: color.neutral300, padding: 12, marginTop: 14 },
  vacTitulo: { fontFamily: font.heading, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.neutral700, marginBottom: 6 },
  vacItem: { fontSize: 12.5, color: color.text, paddingVertical: 2, fontFamily: font.body },
});
