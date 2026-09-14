import React from 'react';
import { View } from 'react-native';
import { ChipRow } from '../components/ui/Segmented';
import { ListRow } from '../components/ui/ListRow';
import { Btn } from '../components/ui/Button';
import { useApp } from '../logic/useApp';

export function Equipo() {
  const app = useApp();
  return (
    <View>
      {app.coord && <Btn label="+ Añadir escolta" variant="primary" block onPress={app.abrirNuevoEscolta} style={{ marginBottom: 14 }} />}
      <ChipRow options={app.filtros} />
      <View style={{ height: 14 }} />
      <View style={{ gap: 6 }}>
        {app.equipo.map(e => (
          <ListRow
            key={e.id}
            ini={e.ini}
            iniColor={e.iniBorder}
            nombre={e.nombre}
            nota={e.nota}
            tag={e.estadoTxt}
            tagKind={e.tag}
            onTap={e.onTap}
          />
        ))}
      </View>
    </View>
  );
}
