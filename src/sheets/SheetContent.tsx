import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { color, font } from '../theme/theme';
import { Avatar } from '../components/ui/Avatar';
import { Field } from '../components/ui/Field';
import { Btn } from '../components/ui/Button';
import { ChipRow, Segmented } from '../components/ui/Segmented';
import { useApp } from '../logic/useApp';

export function SheetContent() {
  const app = useApp();
  switch (app.sheet) {
    case 'asignar': return <AsignarSheet />;
    case 'asignacion': return <AsignacionSheet />;
    case 'detalle': return <DetalleSheet />;
    case 'nuevo': return <NuevoSheet />;
    case 'solicitud': return <SolicitudSheet />;
    default: return null;
  }
}

function AsignarSheet() {
  const app = useApp();
  return (
    <View style={{ gap: 6 }}>
      {app.candidatos.map((c, i) => (
        <Pressable key={i} onPress={c.onTap} style={styles.candRow}>
          <Avatar ini={c.ini} size={32} />
          <View style={{ flex: 1 }}>
            <Text style={styles.candNombre}>{c.nombre}</Text>
            <Text style={[styles.candNota, { color: c.notaColor }]}>{c.nota}</Text>
          </View>
          <Text style={styles.asignarLabel}>ASIGNAR</Text>
        </Pressable>
      ))}
    </View>
  );
}

function AsignacionSheet() {
  const app = useApp();
  return (
    <View style={{ gap: 14 }}>
      <View>
        <Text style={styles.label}>Escolta titular</Text>
        <View style={{ gap: 5 }}>
          {app.asigTitulares.map((t, i) => (
            <Pressable key={i} onPress={t.onTap} style={[styles.pickRow, { borderColor: t.borde, backgroundColor: t.bg }]}>
              <Avatar ini={t.ini} size={26} />
              <View style={{ flex: 1 }}>
                <Text style={styles.pickNombre}>{t.nombre}</Text>
                <Text style={styles.pickNota}>{t.nota}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
      <View>
        <Text style={styles.label}>Suplente</Text>
        <ChipRow options={app.asigSuplentes.map(s => ({ label: s.nombre, on: s.on, onTap: s.onTap }))} />
      </View>
      <Field label="Vigente desde" value={app.asigDesde} onChangeText={app.setAsigDesde} />
      <View style={styles.summaryBox}><Text style={styles.summaryText}>{app.asigResumen}</Text></View>
      <Btn label="Guardar asignación" variant="primary" block onPress={app.guardarAsignacion} />
    </View>
  );
}

function DetalleSheet() {
  const app = useApp();
  const d = app.detalle;
  return (
    <View style={{ gap: 12 }}>
      <View style={styles.detalleBox}>
        <Text style={styles.detalleDesde}>Desde {d.desde}</Text>
        <Text style={styles.detalleNota}>Sin hora de salida: la jornada termina al dejar al protegido en su domicilio.</Text>
        <Text style={styles.detalleProtegido}>{d.protegido}</Text>
        <Text style={styles.detalleTipo}>{d.tipo}</Text>
        <Text style={styles.detalleDotacion}>Dotación: {d.dotacion}</Text>
      </View>
      {app.coord ? (
        <>
          <Btn label="Avisar a la dotación" variant="primary" block onPress={app.notificarDotacion} />
          <Btn label="Cancelar servicio" variant="secondary" block onPress={app.cancelarServicio} />
        </>
      ) : (
        <Btn label="Confirmar que estoy en puesto" variant="primary" block onPress={app.confirmarDetalle} />
      )}
    </View>
  );
}

function NuevoSheet() {
  const app = useApp();
  return (
    <View style={{ gap: 14 }}>
      <View>
        <Text style={styles.label}>Protegido</Text>
        <ChipRow options={app.nvProtegidos} />
      </View>
      <View>
        <Text style={styles.label}>Tipo</Text>
        <Segmented options={app.nvTipos} small />
      </View>
      <View>
        <Text style={styles.label}>Día</Text>
        <ChipRow options={app.nvDias} />
      </View>
      <View>
        <Field label="Hora de presentación" value={app.nvDesde} onChangeText={app.setNvDesde} placeholder="19:00" />
        <Text style={styles.hint}>Sin hora de salida: el servicio termina al dejar al protegido en su domicilio.</Text>
      </View>
      <Field label="Lugar" value={app.nvLugar} onChangeText={app.setNvLugar} placeholder="Hotel Ritz · Plaza de la Lealtad" />
      <View>
        <Text style={styles.label}>Dotación</Text>
        <View style={{ gap: 5 }}>
          {app.nvDotacion.map((e, i) => (
            <Pressable key={i} onPress={e.onTap} style={[styles.pickRow, { borderColor: e.borde, backgroundColor: e.bg }]}>
              <Avatar ini={e.ini} size={26} />
              <View style={{ flex: 1 }}>
                <Text style={styles.pickNombre}>{e.label}</Text>
                <Text style={styles.pickNota}>{e.nota}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={styles.summaryBox}><Text style={styles.summaryText}>{app.nvResumen}</Text></View>
      <Btn label="Crear servicio" variant="primary" block onPress={app.crearServicio} />
    </View>
  );
}

function SolicitudSheet() {
  const app = useApp();
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Field label="Desde" value={app.vacDesde} onChangeText={app.setDesde} style={{ flex: 1 }} />
        <Field label="Hasta" value={app.vacHasta} onChangeText={app.setHasta} style={{ flex: 1 }} />
      </View>
      <Field label="Motivo (opcional)" value={app.vacMotivo} onChangeText={app.setMotivo} placeholder="Vacaciones de verano" />
      <View style={styles.summaryBox}><Text style={styles.summaryText}>{app.cupoAviso}</Text></View>
      <Btn label="Enviar solicitud" variant="primary" block onPress={app.enviarSolicitud} />
    </View>
  );
}

const styles = StyleSheet.create({
  candRow: { flexDirection: 'row', alignItems: 'center', gap: 11, borderWidth: 1, borderColor: color.neutral300, padding: 10 },
  candNombre: { fontSize: 13.5, fontWeight: '600', color: color.text, fontFamily: font.bodySemiBold },
  candNota: { fontSize: 11, fontFamily: font.body },
  asignarLabel: { fontFamily: font.heading, fontSize: 12, color: color.accent700, letterSpacing: 1 },
  label: { fontFamily: font.heading, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: color.neutral600, marginBottom: 6 },
  pickRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, padding: 8 },
  pickNombre: { fontSize: 12.5, fontWeight: '500', color: color.text, fontFamily: font.bodyMedium },
  pickNota: { fontSize: 10.5, color: color.neutral600, fontFamily: font.body },
  summaryBox: { borderWidth: 1, borderColor: color.neutral300, padding: 10 },
  summaryText: { fontSize: 12, lineHeight: 17, color: color.neutral700, fontFamily: font.body },
  detalleBox: { borderWidth: 1, borderColor: color.neutral300, padding: 12 },
  detalleDesde: { fontFamily: font.heading, fontSize: 28, color: color.text },
  detalleNota: { fontSize: 11.5, color: color.neutral600, marginTop: 3, fontFamily: font.body },
  detalleProtegido: { fontSize: 14, fontWeight: '600', color: color.text, marginTop: 6, fontFamily: font.bodySemiBold },
  detalleTipo: { fontSize: 12, color: color.neutral700, marginTop: 3, fontFamily: font.body },
  detalleDotacion: { fontSize: 12, color: color.neutral700, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: color.neutral200, fontFamily: font.body },
  hint: { fontSize: 11, color: color.neutral600, marginTop: 5, fontFamily: font.body },
});
