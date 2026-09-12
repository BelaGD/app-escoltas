import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { color, font } from '../theme/theme';
import { Btn } from '../components/ui/Button';
import { useApp } from '../logic/useApp';

export function Notificaciones() {
  const app = useApp();
  return (
    <View>
      <View style={styles.head}>
        <Text style={styles.resumen}>{app.notifResumen}</Text>
        <Btn label="Marcar leídas" variant="ghost" small onPress={app.marcarLeidas} />
      </View>
      <View style={{ gap: 6 }}>
        {app.notificaciones.map(n => (
          <Pressable key={n.id} onPress={n.onTap} style={[styles.row, { borderLeftColor: n.bar, backgroundColor: n.bg }]}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[styles.tipo, { color: n.tipoColor }]}>{n.tipo}</Text>
              <Text style={styles.texto}>{n.texto}</Text>
            </View>
            <Text style={styles.hora}>{n.hora}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  resumen: { fontFamily: font.heading, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', color: color.text },
  row: { flexDirection: 'row', gap: 11, borderWidth: 1, borderColor: color.neutral200, borderLeftWidth: 3, padding: 11 },
  tipo: { fontFamily: font.heading, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase' },
  texto: { fontSize: 13, lineHeight: 18, color: color.text, marginTop: 3, fontFamily: font.body },
  hora: { fontSize: 10.5, color: color.neutral600, fontFamily: font.body },
});
