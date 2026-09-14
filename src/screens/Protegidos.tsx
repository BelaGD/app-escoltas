import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { color, font } from '../theme/theme';
import { Blueprint } from '../components/ui/Blueprint';
import { Btn } from '../components/ui/Button';
import { Tag } from '../components/ui/Tag';
import { Avatar } from '../components/ui/Avatar';
import { useApp } from '../logic/useApp';
import { confirmarEliminar } from '../logic/confirm';

export function Protegidos() {
  const app = useApp();

  return (
    <View>
      <Btn label="+ Añadir protegido" variant="primary" block onPress={app.abrirNuevoProtegido} style={{ marginBottom: 14 }} />
      <Text style={styles.intro}>Cada miembro tiene escolta titular asignado toda la jornada. Los servicios especiales se añaden sobre esta base.</Text>
      <View style={{ gap: 10 }}>
        {app.protegidos.map(p => (
          <Blueprint key={p.id} style={styles.card} borderColor={p.borde}>
            <View style={styles.headRow}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.nivel}>{p.nivel}</Text>
                <Text style={styles.nombre}>{p.nombre}</Text>
                <Text style={styles.rol}>{p.rol}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 8 }}>
                <Tag label={p.estadoTxt} kind={p.tag} />
                <Pressable
                  onPress={() => confirmarEliminar('Se eliminará a ' + p.nombre + ' y su asignación de titular/suplente.', p.onEliminar)}
                  hitSlop={8}
                >
                  <Trash2 size={15} strokeWidth={1.5} color={color.neutral500} />
                </Pressable>
              </View>
            </View>
            <View style={styles.asigRow}>
              <Avatar ini={p.tit} size={30} />
              <View style={{ flex: 1 }}>
                <Text style={styles.titular}>{p.titular}</Text>
                <Text style={styles.suplente}>{p.suplente}</Text>
              </View>
            </View>
            <Text style={styles.rutina}>{p.rutina}</Text>
            <Text style={styles.eventos}>Servicios especiales: {p.eventos}</Text>
            <View style={styles.actions}>
              <Btn label="Editar asignación" variant="primary" onPress={p.onTap} style={{ flex: 1 }} small />
              <Btn label="Añadir servicio" variant="secondary" onPress={p.onNuevo} style={{ flex: 1 }} small />
            </View>
            <Btn label="Editar datos" variant="ghost" onPress={p.onEditarDatos} small style={{ marginTop: 2 }} />
          </Blueprint>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 12.5, lineHeight: 18, color: color.neutral700, marginBottom: 14, fontFamily: font.body },
  card: { padding: 12 },
  headRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  nivel: { fontFamily: font.heading, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: color.accent700 },
  nombre: { fontFamily: font.heading, fontSize: 21, lineHeight: 23, textTransform: 'uppercase', color: color.text, marginTop: 2 },
  rol: { fontSize: 11.5, color: color.neutral600, fontFamily: font.body },
  asigRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 11, paddingTop: 10, borderTopWidth: 1, borderTopColor: color.neutral200 },
  titular: { fontSize: 13, fontWeight: '600', color: color.text, fontFamily: font.bodySemiBold },
  suplente: { fontSize: 11, color: color.neutral600, fontFamily: font.body },
  rutina: { fontSize: 11.5, color: color.neutral700, marginTop: 9, fontFamily: font.body },
  eventos: { fontSize: 11, color: color.neutral600, marginTop: 11, fontFamily: font.body },
  actions: { flexDirection: 'row', gap: 8, marginTop: 9 },
});
