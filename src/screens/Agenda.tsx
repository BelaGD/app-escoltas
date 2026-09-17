import React, { useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, ScrollView } from 'react-native';
import ViewShot, { ViewShotRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { color, font } from '../theme/theme';
import { Segmented, ChipRow } from '../components/ui/Segmented';
import { Btn } from '../components/ui/Button';
import { useApp } from '../logic/useApp';

export function Agenda() {
  const app = useApp();
  // Semana es un cuadro de turnos de todo el equipo — solo tiene sentido
  // para coordinación. Si un custodio quedó con esa vista puesta desde
  // antes de cambiar de rol, se cae a Mes en vez de mostrarla vacía.
  const vista = !app.coord && app.calVista === 'Semana' ? 'Mes' : app.calVista;
  const opciones = app.coord ? ['Semana', 'Mes', 'Año'] : ['Mes', 'Año'];
  const shotRef = useRef<ViewShotRef>(null);
  const [generando, setGenerando] = useState(false);

  const compartir = async () => {
    if (!shotRef.current) return;
    setGenerando(true);
    try {
      const uri = await shotRef.current.capture();
      const disponible = await Sharing.isAvailableAsync();
      if (!disponible) {
        Alert.alert('No disponible', 'Este dispositivo no puede abrir el cuadro de compartir.');
        return;
      }
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Agenda · ' + vista });
    } catch {
      Alert.alert('Error', 'No se pudo generar la imagen de la agenda.');
    } finally {
      setGenerando(false);
    }
  };

  return (
    <View>
      <Segmented
        options={opciones.map(v => ({ label: v, on: vista === v, onTap: () => app.setCalVista(v as any) }))}
        small
      />
      <View style={{ height: 14 }} />

      {app.coord && (
        <Btn
          label={generando ? 'Generando…' : 'Compartir ' + vista.toLowerCase() + ' por WhatsApp'}
          onPress={compartir}
          disabled={generando}
          block
          style={{ marginBottom: 14 }}
        />
      )}

      {vista === 'Semana' && <SemanaView />}
      {vista === 'Mes' && <MesView />}
      {vista === 'Año' && <AnioView />}

      {app.coord && (
        <View style={{ marginTop: 20 }}>
          <Text style={styles.previewLabel}>VISTA PREVIA · SE COMPARTIRÁ ESTA IMAGEN</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <ViewShot ref={shotRef} options={{ format: 'png', quality: 1 }}>
              {vista === 'Semana' && <SemanaExport />}
              {vista === 'Mes' && <MesExport />}
              {vista === 'Año' && <AnioExport />}
            </ViewShot>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

function TablaTurnos({ t }: { t: ReturnType<typeof useApp>['semanaTabla'] }) {
  return (
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
  );
}

function LeyendaTurnos() {
  return (
    <View style={styles.legendRow}>
      <View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: color.accent200, borderColor: color.neutral300 }]} /><Text style={styles.legendText}>T · Trabaja</Text></View>
      <View style={styles.legendItem}><View style={[styles.legendSwatch, { borderColor: color.neutral300 }]} /><Text style={styles.legendText}>L · Libre</Text></View>
      <View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: color.neutral500, borderColor: color.neutral500 }]} /><Text style={styles.legendText}>V · Vacaciones</Text></View>
      <View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: color.warnBg, borderColor: color.warn }]} /><Text style={styles.legendText}>B · Baja</Text></View>
    </View>
  );
}

function SemanaView() {
  const app = useApp();
  return (
    <View>
      <View style={styles.monthNav}>
        <Pressable onPress={app.calSemanaPrev} hitSlop={8}><Text style={styles.monthArrow}>←</Text></Pressable>
        <Text style={styles.monthName}>{app.calSemanaLabel}</Text>
        <Pressable onPress={app.calSemanaNext} hitSlop={8}><Text style={styles.monthArrow}>→</Text></Pressable>
      </View>
      <TablaTurnos t={app.semanaTabla} />
      <LeyendaTurnos />
    </View>
  );
}

function LeyendaMes() {
  return (
    <View style={styles.legendRow}>
      <View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: color.accent200, borderColor: color.neutral300 }]} /><Text style={styles.legendText}>Jornada</Text></View>
      <View style={styles.legendItem}><View style={[styles.legendSwatch, { borderColor: color.neutral300 }]} /><Text style={styles.legendText}>Libranza</Text></View>
      <View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: color.neutral500, borderColor: color.neutral500 }]} /><Text style={styles.legendText}>Vacaciones</Text></View>
      <View style={styles.legendItem}><View style={[styles.legendSwatch, { borderColor: color.accent700 }]} /><Text style={styles.legendText}>Inicio de ciclo</Text></View>
      <View style={styles.legendItem}><Text style={[styles.legendText, { color: color.accent700 }]}>● Servicio especial</Text></View>
    </View>
  );
}

function GridMes({ dias, diasSemana, big }: { dias: ReturnType<typeof useApp>['calMesDias']; diasSemana: string[]; big?: boolean }) {
  return (
    <View>
      <View style={styles.weekLabelsRow}>
        {diasSemana.map((d, i) => (
          <Text key={i} style={[styles.weekLabel, big && { fontSize: 12 }]}>{d}</Text>
        ))}
      </View>
      <View style={styles.grid7}>
        {dias.map((d, i) => (
          <View key={i} style={[styles.cell, big && styles.cellBig, { borderColor: d.borde, backgroundColor: d.bg }]}>
            <Text style={[styles.cellNum, big && styles.cellNumBig, { color: d.fg }]}>{d.num}</Text>
            <Text style={[styles.cellMarca, big && styles.cellMarcaBig]}>{d.marca}</Text>
          </View>
        ))}
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
      <GridMes dias={app.calMesDias} diasSemana={app.calDiasSemana} />
      <LeyendaMes />
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
      <LeyendaMes />
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

// ---- Tarjetas para exportar por WhatsApp ----
// Versiones limpias, sin controles interactivos (flechas, chips), pensadas
// para verse bien como imagen: membrete, título, a quién pertenece y leyenda.

function ExportHeader({ titulo, subtitulo }: { titulo: string; subtitulo: string }) {
  return (
    <View style={styles.expHead}>
      <Text style={styles.expEmpresa}>RELEVO · GRUPO ESCOLTA</Text>
      <Text style={styles.expTitulo}>{titulo}</Text>
      <Text style={styles.expSubtitulo}>{subtitulo}</Text>
    </View>
  );
}

function ExportFoot() {
  return <Text style={styles.expWatermark}>DATOS DE EJEMPLO · GENERADO CON RELEVO</Text>;
}

function SemanaExport() {
  const app = useApp();
  return (
    <View style={styles.expCard}>
      <ExportHeader titulo="CUADRO DE TURNOS" subtitulo={'Semana ' + app.calSemanaLabel} />
      <TablaTurnos t={app.semanaTabla} />
      <LeyendaTurnos />
      <ExportFoot />
    </View>
  );
}

function MesExport() {
  const app = useApp();
  return (
    <View style={styles.expCard}>
      <ExportHeader titulo="CALENDARIO MENSUAL" subtitulo={app.calEscolta + ' · ' + app.calMesNombre} />
      <GridMes dias={app.calMesDias} diasSemana={app.calDiasSemana} big />
      <LeyendaMes />
      <Text style={styles.expResumen}>{app.calMesResumen}</Text>
      <ExportFoot />
    </View>
  );
}

const DIAS_SEM_ANIO = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

function AnioExport() {
  const app = useApp();
  return (
    <View style={styles.anioExpCard}>
      <ExportHeader titulo="CALENDARIO ANUAL 2026" subtitulo={app.calEscolta + ' · ciclo 14/7'} />
      <LeyendaMes />
      <View style={styles.anioExpGrid}>
        {app.calAnioExport.map((m, i) => (
          <View key={i} style={styles.anioExpMes}>
            <Text style={styles.anioExpMesNombre}>{m.nombre}</Text>
            <View style={styles.anioExpHeadRow}>
              <Text style={styles.anioExpSemLabel}>SEM</Text>
              {DIAS_SEM_ANIO.map((d, j) => <Text key={j} style={styles.anioExpDiaLabel}>{d}</Text>)}
            </View>
            {m.semanas.map((sem, j) => (
              <View key={j} style={styles.anioExpSemRow}>
                <Text style={styles.anioExpSemNum}>{sem.num}</Text>
                {sem.celdas.map((c, k) => (
                  <View key={k} style={[styles.anioExpCelda, c && { backgroundColor: c.bg, borderColor: c.borde, borderWidth: c.borde === color.accent700 ? 1.5 : 0.5 }]}>
                    {c && <Text style={[styles.anioExpCeldaTxt, { color: c.fg }]}>{c.num}</Text>}
                    {c && !!c.marca && <View style={styles.anioExpDot} />}
                  </View>
                ))}
              </View>
            ))}
          </View>
        ))}
      </View>
      <Text style={styles.expResumen}>{app.calAnioResumen}</Text>
      {app.calAnioVacaciones.length > 0 && (
        <View style={styles.vacBox}>
          <Text style={styles.vacTitulo}>Vacaciones aprobadas en 2026</Text>
          {app.calAnioVacaciones.map((r, i) => <Text key={i} style={styles.vacItem}>{r}</Text>)}
        </View>
      )}
      <ExportFoot />
    </View>
  );
}

const MES_EXPORT_WIDTH = 380;
const ANIO_EXPORT_WIDTH = 900;
const ANIO_EXPORT_MES_WIDTH = 270;

const styles = StyleSheet.create({
  previewLabel: { fontFamily: font.heading, fontSize: 10, letterSpacing: 1, color: color.neutral500, marginBottom: 8 },
  expCard: { width: MES_EXPORT_WIDTH, backgroundColor: '#ffffff', padding: 18, borderWidth: 1, borderColor: color.neutral300 },
  expHead: { alignItems: 'center', marginBottom: 14, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: color.neutral300 },
  expEmpresa: { fontFamily: font.heading, fontSize: 10.5, letterSpacing: 1.5, textAlign: 'center', color: color.accent700 },
  expTitulo: { fontFamily: font.heading, fontSize: 18, letterSpacing: 1, textAlign: 'center', textTransform: 'uppercase', color: color.text, marginTop: 4 },
  expSubtitulo: { fontFamily: font.heading, fontSize: 12.5, letterSpacing: 0.6, textAlign: 'center', color: color.neutral700, marginTop: 3 },
  expResumen: { fontSize: 12, color: color.neutral700, marginTop: 10, fontFamily: font.body, textAlign: 'center' },
  expWatermark: { fontFamily: font.heading, fontSize: 9, letterSpacing: 0.8, color: color.neutral500, textAlign: 'center', marginTop: 16, paddingTop: 10, borderTopWidth: 1, borderTopColor: color.neutral200 },
  cellBig: { aspectRatio: 1.15 },
  cellNumBig: { fontSize: 17 },
  cellMarcaBig: { fontSize: 9, lineHeight: 10 },
  anioExpCard: { width: ANIO_EXPORT_WIDTH, backgroundColor: '#ffffff', padding: 20, borderWidth: 1, borderColor: color.neutral300 },
  anioExpGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginTop: 8 },
  anioExpMes: { width: ANIO_EXPORT_MES_WIDTH, borderWidth: 1, borderColor: color.neutral300, padding: 8 },
  anioExpMesNombre: { fontFamily: font.heading, fontSize: 13, letterSpacing: 1.5, textAlign: 'center', textTransform: 'uppercase', color: color.text, marginBottom: 6 },
  anioExpHeadRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: color.neutral300, paddingBottom: 4, marginBottom: 2 },
  anioExpSemLabel: { width: 22, fontFamily: font.heading, fontSize: 7.5, color: color.neutral500 },
  anioExpDiaLabel: { flex: 1, textAlign: 'center', fontFamily: font.heading, fontSize: 9, color: color.neutral600 },
  anioExpSemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 2.5 },
  anioExpSemNum: { width: 22, fontSize: 8, color: color.neutral400, fontFamily: font.body },
  anioExpCelda: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4, borderWidth: 0.5, borderColor: 'transparent' },
  anioExpCeldaTxt: { fontFamily: font.heading, fontSize: 11 },
  anioExpDot: { position: 'absolute', bottom: 2, width: 3, height: 3, borderRadius: 1.5, backgroundColor: color.accent700 },
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
