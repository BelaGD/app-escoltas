import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Fingerprint } from 'lucide-react-native';
import { color, font } from '../theme/theme';
import { Field } from '../components/ui/Field';
import { Btn } from '../components/ui/Button';
import { useApp } from '../logic/useApp';

export function AuthScreen() {
  const app = useApp();

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <Text style={styles.mark}>R</Text>
          <Text style={styles.kicker}>{app.authKicker}</Text>
          <Text style={styles.titulo}>{app.authTitulo}</Text>
          <Text style={styles.sub}>{app.authSub}</Text>
        </View>

        {app.authView === 'login' && (
          <View style={styles.form}>
            <Field label="Número TIP" value={app.tip} onChangeText={app.setTip} placeholder="41882" keyboardType="number-pad" />
            <Field label="Contraseña" value={app.pass} onChangeText={app.setPass} placeholder="••••••••" secure />
            {!!app.authError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{app.authError}</Text>
              </View>
            )}
            <Btn label="Entrar" variant="primary" block onPress={app.entrar} />
            <Pressable style={[styles.huella]} onPress={app.entrarHuella}>
              <Fingerprint size={17} strokeWidth={1.5} color={color.text} />
              <Text style={styles.huellaLabel}>Entrar con huella</Text>
            </Pressable>
            <Btn label="¿Has olvidado tu acceso?" variant="ghost" block small onPress={app.irRecuperar} />
          </View>
        )}

        {app.authView === 'codigo' && (
          <View style={styles.form}>
            <View style={styles.digitsRow}>
              {[0, 1, 2, 3, 4, 5].map(i => (
                <View
                  key={i}
                  style={[styles.digit, { borderColor: i === app.codigo.length ? color.accent700 : color.neutral300 }]}
                >
                  <Text style={styles.digitText}>{app.codigo[i] || ''}</Text>
                </View>
              ))}
            </View>
            <View style={styles.keypad}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((t, i) => (
                <Pressable
                  key={i}
                  disabled={!t}
                  onPress={() => app.tocarTecla(t)}
                  style={[styles.key, !t && styles.keyEmpty]}
                >
                  <Text style={styles.keyLabel}>{t}</Text>
                </Pressable>
              ))}
            </View>
            <Btn label="Volver" variant="ghost" block small onPress={app.volverLogin} />
          </View>
        )}

        {app.authView === 'recuperar' && (
          <View style={styles.form}>
            <Field label="Número TIP" value={app.tip} onChangeText={app.setTip} placeholder="41882" keyboardType="number-pad" />
            <Field label="Correo corporativo" value={app.correo} onChangeText={app.setCorreo} placeholder="nombre@empresa.es" keyboardType="email-address" />
            <Btn label="Enviar enlace" variant="primary" block onPress={app.enviarRecuperacion} />
            <Btn label="Volver al acceso" variant="ghost" block small onPress={app.volverLogin} />
          </View>
        )}

        <Text style={styles.footer}>Uso restringido a personal habilitado. Los accesos quedan registrados.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.bg },
  scroll: { flexGrow: 1, paddingHorizontal: 22, paddingBottom: 20 },
  brand: { paddingTop: 56, paddingBottom: 30 },
  mark: {
    width: 52, height: 52, borderWidth: 1, borderColor: color.accent700,
    textAlign: 'center', lineHeight: 50, fontFamily: font.heading, fontSize: 20, color: color.accent700, marginBottom: 16,
  },
  kicker: { fontFamily: font.heading, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: color.accent700 },
  titulo: { fontFamily: font.heading, fontWeight: '600', fontSize: 38, lineHeight: 40, textTransform: 'uppercase', color: color.text, marginTop: 4 },
  sub: { fontSize: 13, lineHeight: 19, color: color.neutral700, marginTop: 8, maxWidth: 300, fontFamily: font.body },
  form: { gap: 14 },
  errorBox: { borderWidth: 1, borderColor: color.warn, paddingVertical: 9, paddingHorizontal: 11 },
  errorText: { fontSize: 12, color: color.warn, fontFamily: font.body },
  huella: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: color.divider, paddingVertical: 10, marginTop: 7 },
  huellaLabel: { fontFamily: font.heading, fontSize: 14, color: color.text },
  digitsRow: { flexDirection: 'row', gap: 7 },
  digit: { flex: 1, height: 52, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  digitText: { fontFamily: font.heading, fontSize: 24, color: color.text },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  key: { width: '31.5%', height: 46, borderWidth: 1, borderColor: color.neutral300, alignItems: 'center', justifyContent: 'center' },
  keyEmpty: { borderColor: 'transparent' },
  keyLabel: { fontFamily: font.heading, fontSize: 19, color: color.text },
  footer: { marginTop: 'auto', paddingVertical: 20, fontSize: 10.5, lineHeight: 15, color: color.neutral500, fontFamily: font.body },
});
