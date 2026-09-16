import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import ViewShot, { ViewShotRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { color, font } from '../theme/theme';
import { Btn } from '../components/ui/Button';
import { useApp } from '../logic/useApp';

export function Reporte() {
  const app = useApp();
  const r = app.reporte;
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
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Distributivo de personal' });
    } catch {
      Alert.alert('Error', 'No se pudo generar la imagen del reporte.');
    } finally {
      setGenerando(false);
    }
  };

  return (
    <View>
      <Btn label="← Hoy" variant="ghost" onPress={() => app.go('hoy')} small style={{ alignSelf: 'flex-start', marginBottom: 10 }} />
      <Btn label={generando ? 'Generando…' : 'Compartir por WhatsApp'} variant="primary" block onPress={compartir} disabled={generando} style={{ marginBottom: 16 }} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <ViewShot ref={shotRef} options={{ format: 'png', quality: 1 }}>
          <View style={styles.card}>
            <Text style={styles.empresa}>RELEVO · GRUPO ESCOLTA</Text>
            <Text style={styles.titulo}>DISTRIBUTIVO DE PERSONAL</Text>
            <Text style={styles.fecha}>{r.fechaTitulo}</Text>

            <Text style={styles.seccion}>DISPOSITIVO PERMANENTE</Text>
            {r.dispositivo.map((d, i) => (
              <View key={i} style={styles.filaProt}>
                <Text style={styles.codigo}>{d.codigo}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nombreEscolta}>{d.titular}</Text>
                  <Text style={styles.suplenteTxt}>Posterior {d.suplente}</Text>
                </View>
                {!d.cubierto && <Text style={styles.alerta}>SIN COBERTURA</Text>}
              </View>
            ))}

            {r.especiales.length > 0 && (
              <>
                <Text style={styles.seccion}>SERVICIOS ESPECIALES</Text>
                {r.especiales.map((s, i) => (
                  <View key={i} style={styles.filaServ}>
                    <Text style={styles.hora}>{s.hora}</Text>
                    <Text style={styles.codigo}>{s.codigo}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.tipoServ}>{s.tipo}</Text>
                      {!!s.dotacion && <Text style={styles.suplenteTxt}>{s.dotacion}</Text>}
                    </View>
                  </View>
                ))}
              </>
            )}

            <Text style={styles.seccion}>FRANCOS</Text>
            {r.francos.length === 0
              ? <Text style={styles.vacio}>Nadie de franco hoy</Text>
              : r.francos.map((n, i) => <Text key={i} style={styles.nombreLista}>{n}</Text>)}

            {r.vacaciones.length > 0 && (
              <>
                <Text style={styles.seccion}>VACACIONES</Text>
                {r.vacaciones.map((n, i) => <Text key={i} style={styles.nombreLista}>{n}</Text>)}
              </>
            )}

            {r.baja.length > 0 && (
              <>
                <Text style={styles.seccion}>DE BAJA</Text>
                {r.baja.map((n, i) => <Text key={i} style={styles.nombreLista}>{n}</Text>)}
              </>
            )}
          </View>
        </ViewShot>
      </ScrollView>
    </View>
  );
}

const CARD_WIDTH = 360;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH, backgroundColor: '#ffffff', padding: 20,
    borderWidth: 1, borderColor: color.neutral300,
  },
  empresa: { fontFamily: font.heading, fontSize: 11, letterSpacing: 1.5, textAlign: 'center', color: color.accent700 },
  titulo: { fontFamily: font.heading, fontSize: 20, letterSpacing: 1, textAlign: 'center', textTransform: 'uppercase', color: color.text, marginTop: 4 },
  fecha: { fontFamily: font.heading, fontSize: 14, letterSpacing: 1, textAlign: 'center', color: color.neutral700, marginTop: 2, marginBottom: 14, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: color.neutral300 },
  seccion: { fontFamily: font.heading, fontSize: 12, letterSpacing: 1.2, color: color.accent700, marginTop: 12, marginBottom: 6 },
  filaProt: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 4 },
  filaServ: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 4 },
  codigo: { fontFamily: font.heading, fontSize: 13, color: color.text, minWidth: 24 },
  hora: { fontFamily: font.heading, fontSize: 12, color: color.text, minWidth: 40 },
  nombreEscolta: { fontSize: 13, fontWeight: '600', color: color.text, fontFamily: font.bodySemiBold },
  tipoServ: { fontSize: 12.5, color: color.text, fontFamily: font.body },
  suplenteTxt: { fontSize: 11, color: color.neutral600, marginTop: 1, fontFamily: font.body },
  alerta: { fontFamily: font.heading, fontSize: 10, color: color.warn, letterSpacing: 0.5 },
  nombreLista: { fontSize: 12.5, color: color.text, paddingVertical: 2, fontFamily: font.body },
  vacio: { fontSize: 12, color: color.neutral600, fontStyle: 'italic', fontFamily: font.body },
});
