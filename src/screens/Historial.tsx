import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { color, font } from '../theme/theme';
import { Btn } from '../components/ui/Button';
import { EmptyHint } from '../components/ui/Section';
import { useApp } from '../logic/useApp';

const COLOR_TIPO: Record<string, string> = {
  Fichaje: color.accent700,
  Vacaciones: color.accent500,
  Equipo: color.neutral700,
  Protegidos: color.neutral700,
  Servicios: color.warn,
};

export function Historial() {
  const app = useApp();
  const eventos = app.historialGeneral;

  return (
    <View>
      <Btn label="← Ajustes" variant="ghost" onPress={() => app.go('ajustes')} small style={{ alignSelf: 'flex-start', marginBottom: 10 }} />
      <Text style={styles.nota}>
        Registro de auditoría de la sesión actual: fichajes, vacaciones, altas y bajas, asignaciones y servicios especiales.
        Vive solo en memoria — se pierde al cerrar la app (persistencia pendiente).
      </Text>

      {eventos.length === 0 ? (
        <EmptyHint text="Todavía no hay actividad registrada en esta sesión." />
      ) : (
        <View style={{ gap: 8 }}>
          {eventos.map(e => (
            <View key={e.id} style={styles.fila}>
              <View style={styles.filaHead}>
                <Text style={[styles.tipo, { color: COLOR_TIPO[e.tipo] || color.neutral700 }]}>{e.tipo.toUpperCase()}</Text>
                <Text style={styles.cuando}>{e.cuando}</Text>
              </View>
              <Text style={styles.texto}>{e.texto}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  nota: { fontSize: 11.5, color: color.neutral600, fontFamily: font.body, marginBottom: 16, lineHeight: 16 },
  fila: { borderWidth: 1, borderColor: color.neutral300, padding: 11 },
  filaHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 },
  tipo: { fontFamily: font.heading, fontSize: 10, letterSpacing: 1 },
  cuando: { fontSize: 10.5, color: color.neutral600, fontFamily: font.body },
  texto: { fontSize: 13, color: color.text, fontFamily: font.body },
});
