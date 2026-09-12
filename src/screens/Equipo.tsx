import React from 'react';
import { View } from 'react-native';
import { ChipRow } from '../components/ui/Segmented';
import { ListRow } from '../components/ui/ListRow';
import { useApp } from '../logic/useApp';

export function Equipo() {
  const app = useApp();
  return (
    <View>
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
