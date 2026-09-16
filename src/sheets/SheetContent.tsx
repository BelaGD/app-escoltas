import React from 'react';
import { View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import { Phone } from 'lucide-react-native';
import { color, font } from '../theme/theme';
import { Avatar } from '../components/ui/Avatar';
import { Field } from '../components/ui/Field';
import { DateField } from '../components/ui/DateField';
import { TimeField } from '../components/ui/TimeField';
import { Btn } from '../components/ui/Button';
import { ChipRow, Segmented } from '../components/ui/Segmented';
import { Toggle } from '../components/ui/Toggle';
import { useApp } from '../logic/useApp';

export function SheetContent() {
  const app = useApp();
  switch (app.sheet) {
    case 'asignar': return <AsignarSheet />;
    case 'asignacion': return <AsignacionSheet />;
    case 'detalle': return <DetalleSheet />;
    case 'nuevo': return <NuevoSheet />;
    case 'solicitud': return <SolicitudSheet />;
    case 'historial': return <HistorialSheet />;
    case 'nuevoEscolta': return <NuevoEscoltaSheet />;
    case 'nuevoProtegido': return <NuevoProtegidoSheet />;
    case 'nuevaHabilitacion': return <NuevaHabilitacionSheet />;
    case 'editarProtegido': return <EditarProtegidoSheet />;
    case 'dotacionDetalle': return <DotacionDetalleSheet />;
    case 'editarJornada': return <EditarJornadaSheet />;
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
      <DateField label="Vigente desde" value={app.asigDesde} onChange={app.setAsigDesde} format="dmy" />
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
      {!!d.telefono && (
        <Pressable style={styles.contactoRow} onPress={() => Linking.openURL('tel:' + d.telefono!.replace(/\s+/g, ''))}>
          <Phone size={16} strokeWidth={1.5} color={color.accent700} />
          <Text style={styles.contactoTexto}>Llamar a {d.protegido} · {d.telefono}</Text>
        </Pressable>
      )}
      {app.coord ? (
        <>
          <Btn label="Avisar a la dotación" variant="primary" block onPress={app.notificarDotacion} />
          {app.puedeEditarServicio && <Btn label="Editar servicio" variant="secondary" block onPress={app.abrirEditarServicio} />}
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
        <TimeField label="Hora de presentación" value={app.nvDesde} onChange={app.setNvDesde} />
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
      <Btn label={app.editandoServicio ? 'Guardar cambios' : 'Crear servicio'} variant="primary" block onPress={app.crearServicio} />
    </View>
  );
}

function SolicitudSheet() {
  const app = useApp();
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <DateField label="Desde" value={app.vacDesde} onChange={app.setDesde} format="dmy" style={{ flex: 1 }} />
        <DateField label="Hasta" value={app.vacHasta} onChange={app.setHasta} format="dmy" style={{ flex: 1 }} />
      </View>
      <Field label="Motivo (opcional)" value={app.vacMotivo} onChangeText={app.setMotivo} placeholder="Vacaciones de verano" />
      <View style={styles.summaryBox}><Text style={styles.summaryText}>{app.cupoAviso}</Text></View>
      <Btn label="Enviar solicitud" variant="primary" block onPress={app.enviarSolicitud} />
    </View>
  );
}

function HistorialSheet() {
  const app = useApp();
  return (
    <View style={{ gap: 10 }}>
      {app.dotacionHistorial.map((d, i) => (
        <View key={i} style={styles.histRow}>
          <Text style={styles.histFecha}>{d.fecha}</Text>
          <View style={styles.histGrid}>
            <View style={styles.histCol}>
              <Text style={[styles.histN, { color: color.accent700 }]}>{d.conProtegido}</Text>
              <Text style={styles.histK}>Con protegido</Text>
            </View>
            <View style={styles.histCol}>
              <Text style={[styles.histN, { color: color.accent700 }]}>{d.libres}</Text>
              <Text style={styles.histK}>Libres</Text>
            </View>
            <View style={styles.histCol}>
              <Text style={[styles.histN, { color: color.neutral800 }]}>{d.libranza}</Text>
              <Text style={styles.histK}>Libranza</Text>
            </View>
            <View style={styles.histCol}>
              <Text style={[styles.histN, { color: color.neutral800 }]}>{d.vacaciones}</Text>
              <Text style={styles.histK}>Vacaciones</Text>
            </View>
          </View>
          <Text style={styles.histLibres} numberOfLines={2}>{d.libresNombres}</Text>
        </View>
      ))}
    </View>
  );
}

function NuevoEscoltaSheet() {
  const app = useApp();
  return (
    <View style={{ gap: 14 }}>
      <Field label="Nombre completo" value={app.nuevoEscoltaNombre} onChangeText={app.setNuevoEscoltaNombre} placeholder="Nombre Apellido" />
      <DateField label="Un día en que empiece su jornada (ciclo 14/7)" value={app.nuevoEscoltaInicio} onChange={app.setNuevoEscoltaInicio} />
      <View style={styles.summaryBox}><Text style={styles.summaryText}>Se añade al equipo como disponible, sin protegido ni horas registradas todavía. El resto del año del ciclo 14/7 se calcula solo a partir de esa fecha.</Text></View>
      <Btn label="Añadir escolta" variant="primary" block onPress={app.crearEscolta} />
    </View>
  );
}

function NuevoProtegidoSheet() {
  const app = useApp();
  return (
    <View style={{ gap: 14 }}>
      <Field label="Nombre completo" value={app.npNombre} onChangeText={app.setNpNombre} placeholder="Nombre Apellido" />
      <Field label="Código (para reportes)" value={app.npCodigo} onChangeText={app.setNpCodigo} placeholder="F1, F2…" />
      <Field label="Rol / relación" value={app.npRol} onChangeText={app.setNpRol} placeholder="Cónyuge, hijo, madre…" />
      <View>
        <Text style={styles.label}>Nivel</Text>
        <Segmented options={app.npNiveles} small />
      </View>
      <View>
        <Text style={styles.label}>Escolta titular</Text>
        <View style={{ gap: 5 }}>
          {app.npTitulares.map((t, i) => (
            <Pressable key={i} onPress={t.onTap} style={[styles.pickRow, { borderColor: t.borde, backgroundColor: t.bg }]}>
              <Avatar ini={t.ini} size={26} />
              <Text style={styles.pickNombre}>{t.nombre}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View>
        <Text style={styles.label}>Suplente</Text>
        <ChipRow options={app.npSuplentes.map(s => ({ label: s.nombre, on: s.on, onTap: s.onTap }))} />
      </View>
      <TimeField label="Hora de presentación" value={app.npInicio} onChange={app.setNpInicio} />
      <Field label="Teléfono de contacto" value={app.npTelefono} onChangeText={app.setNpTelefono} placeholder="+34 611 220 000" keyboardType="phone-pad" />
      <Field label="Rutina (opcional)" value={app.npRutina} onChangeText={app.setNpRutina} placeholder="Presentación 08:00 · domicilio y agenda" />
      <View style={styles.summaryBox}><Text style={styles.summaryText}>{app.npResumen}</Text></View>
      <Btn label="Añadir protegido" variant="primary" block onPress={app.crearProtegido} />
    </View>
  );
}

function NuevaHabilitacionSheet() {
  const app = useApp();
  return (
    <View style={{ gap: 14 }}>
      <Field label="Nombre" value={app.nhNombre} onChangeText={app.setNhNombre} placeholder="Curso de tiro, licencia…" />
      <Field label="Número / referencia (opcional)" value={app.nhNum} onChangeText={app.setNhNum} placeholder="Nº 12.345" />
      <Field label="Vigencia" value={app.nhVence} onChangeText={app.setNhVence} placeholder="Vence 12/2027" />
      <View style={styles.alertaRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.pickNombre}>Marcar como próxima a vencer</Text>
          <Text style={styles.hint}>Se resalta en la ficha para no perderla de vista</Text>
        </View>
        <Toggle on={app.nhAlerta} onTap={app.toggleNhAlerta} />
      </View>
      <Btn label="Añadir habilitación" variant="primary" block onPress={app.crearHabilitacion} />
    </View>
  );
}

function EditarProtegidoSheet() {
  const app = useApp();
  return (
    <View style={{ gap: 14 }}>
      <Field label="Nombre completo" value={app.epNombre} onChangeText={app.setEpNombre} />
      <Field label="Código (para reportes)" value={app.epCodigo} onChangeText={app.setEpCodigo} placeholder="F1, F2…" />
      <Field label="Rol / relación" value={app.epRol} onChangeText={app.setEpRol} />
      <View>
        <Text style={styles.label}>Nivel</Text>
        <Segmented options={app.epNiveles} small />
      </View>
      <Field label="Rutina" value={app.epRutina} onChangeText={app.setEpRutina} />
      <Field label="Teléfono de contacto" value={app.epTelefono} onChangeText={app.setEpTelefono} placeholder="+34 611 220 000" keyboardType="phone-pad" />
      <Btn label="Guardar cambios" variant="primary" block onPress={app.guardarEdicionProtegido} />
    </View>
  );
}

function DotacionDetalleSheet() {
  const app = useApp();
  return (
    <View style={{ gap: 6 }}>
      {app.dotacionDetalleLista.map((e, i) => (
        <View key={i} style={styles.candRow}>
          <Avatar ini={e.nombre.split(' ').map(p => p[0]).slice(0, 2).join('')} size={30} />
          <View style={{ flex: 1 }}>
            <Text style={styles.candNombre}>{e.nombre}</Text>
            <Text style={styles.candNota}>{e.extra}</Text>
          </View>
        </View>
      ))}
      {app.dotacionDetalleLista.length === 0 && (
        <View style={styles.summaryBox}><Text style={styles.summaryText}>Nadie en esta categoría para la fecha consultada.</Text></View>
      )}
    </View>
  );
}

function EditarJornadaSheet() {
  const app = useApp();
  return (
    <View style={{ gap: 14 }}>
      <DateField label="Un día en que empiece jornada" value={app.editarJornadaFecha} onChange={app.setEditarJornadaFecha} />
      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>
          Cualquier fecha en la que ese día sea el primero de un bloque de 14 días de jornada. El ciclo 14/7 completo del resto del año se recalcula solo — no hace falta volver a tocarlo salvo que el patrón real cambie.
        </Text>
      </View>
      <Btn label="Guardar ciclo" variant="primary" block onPress={app.guardarJornada} />
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
  histRow: { borderWidth: 1, borderColor: color.neutral300, padding: 11 },
  histFecha: { fontFamily: font.heading, fontSize: 15, textTransform: 'uppercase', color: color.text, marginBottom: 8 },
  histGrid: { flexDirection: 'row' },
  histCol: { flex: 1, alignItems: 'center' },
  histN: { fontFamily: font.heading, fontSize: 20 },
  histK: { fontSize: 9, letterSpacing: 0.4, textTransform: 'uppercase', color: color.neutral600, marginTop: 2, textAlign: 'center', fontFamily: font.body },
  histLibres: { fontSize: 11, color: color.neutral700, marginTop: 9, paddingTop: 8, borderTopWidth: 1, borderTopColor: color.neutral200, fontFamily: font.body },
  alertaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: color.neutral300, padding: 11 },
  contactoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: color.accent600, padding: 11 },
  contactoTexto: { fontSize: 13, color: color.accent700, fontFamily: font.bodyMedium, flex: 1 },
});
