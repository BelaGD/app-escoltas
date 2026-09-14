import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color } from '../theme/theme';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { Fab } from '../components/Fab';
import { Toast } from '../components/ui/Toast';
import { Segmented } from '../components/ui/Segmented';
import { BottomSheet } from '../components/ui/BottomSheet';
import { SheetContent } from '../sheets/SheetContent';
import { useApp } from '../logic/useApp';

import { HoyCoord } from './HoyCoord';
import { HoyEscolta } from './HoyEscolta';
import { Agenda } from './Agenda';
import { VacacionesCoord } from './VacacionesCoord';
import { VacacionesEscolta } from './VacacionesEscolta';
import { Protegidos } from './Protegidos';
import { Equipo } from './Equipo';
import { Ficha } from './Ficha';
import { Perfil } from './Perfil';
import { Notificaciones } from './Notificaciones';
import { Ajustes } from './Ajustes';

function Content() {
  const app = useApp();
  switch (app.tab) {
    case 'hoy': return app.coord ? <HoyCoord /> : <HoyEscolta />;
    case 'cal': return <Agenda />;
    case 'vac': return app.coord ? <VacacionesCoord /> : <VacacionesEscolta />;
    case 'prot': return <Protegidos />;
    case 'equipo': return <Equipo />;
    case 'ficha': return <Ficha />;
    case 'perfil': return <Perfil />;
    case 'notif': return <Notificaciones />;
    case 'ajustes': return <Ajustes />;
    default: return null;
  }
}

export function Shell() {
  const app = useApp();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.roleSwitch}>
        <Segmented
          options={[
            { label: 'Coordinación', on: app.coord, onTap: app.setCoord },
            { label: 'Escolta', on: !app.coord, onTap: app.setEscolta },
          ]}
        />
      </View>

      <Header
        kicker={app.head[0]}
        title={app.head[1]}
        metaA={app.headMetaA}
        metaB={app.headMetaB}
        noLeidas={app.noLeidas}
        hayNoLeidas={app.hayNoLeidas}
        onNotif={app.irNotif}
        onAjustes={app.irAjustes}
      />

      <View style={styles.contentArea}>
        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled">
          <Content />
        </ScrollView>

        {app.mostrarFab && <Fab onPress={app.abrirNuevo} />}
      </View>

      <View style={{ paddingBottom: insets.bottom }}>
        <BottomNav items={app.navDefs as [string, string][]} active={app.activeTab} onTap={t => app.go(t as any)} />
      </View>

      <BottomSheet open={!!app.sheet} title={app.sheetTitulo} subtitle={app.sheetSub} onClose={app.cerrarSheet}>
        <SheetContent />
      </BottomSheet>

      <Toast text={app.toast} onDeshacer={app.toastUndo ? app.deshacerToast : null} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.bg },
  roleSwitch: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  contentArea: { flex: 1 },
  body: { flex: 1 },
  bodyContent: { padding: 16, paddingBottom: 90 },
});
