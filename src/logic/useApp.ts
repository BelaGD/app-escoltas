import { useMemo } from 'react';
import { useStore, AppState, Patch } from '../state/store';
import {
  EQUIPO, EST, PROTEGIDOS, SEMANA, MESES, DIA_SERV, EST_PROT, CUPO_DATA, CERTS,
  HOY, WARN, MUT, AC, Escolta, Protegido, ServicioRaw, MiSolicitud,
} from '../data/mock';
import { color } from '../theme/theme';
import { diaCiclo, enJornada } from './ciclo';

export type TagKind = 'accent' | 'outline' | 'neutral';

const corto = (nombre: string) => {
  const parts = nombre.split(' ');
  return parts[0][0] + '. ' + (parts[1] || '');
};

/**
 * Central derived-state hook — a 1:1 port of renderVals() from the
 * prototype (Turnos Escoltas.dc.html). Screens consume this instead of
 * touching raw state, mirroring the {{ bindings }} of the original template.
 */
export function useApp() {
  const { state: st, setState, flash } = useStore();

  const asigDe = (p: Protegido) => ({
    titular: st.asig[p.id]?.titular || p.titular,
    suplente: st.asig[p.id]?.suplente || p.suplente,
  });
  const iniDe = (n: string) => EQUIPO.find(x => x.nombre === n)?.ini || n.slice(0, 2).toUpperCase();
  const protDe = (nombre: string) => PROTEGIDOS.find(p => asigDe(p).titular === nombre);
  const suplenteDe = (nombre: string) => PROTEGIDOS.find(p => asigDe(p).suplente === nombre);
  const estadoDe = (e: Escolta) => e.estado === 'vacaciones' ? 'vacaciones'
    : !enJornada(HOY, e.nombre) ? 'descanso'
    : protDe(e.nombre) ? 'servicio' : 'disponible';

  const coord = st.rol === 'coord';
  const tab = st.tab;

  const porDia = useMemo(() => {
    const out: Record<number, ServicioRaw[]> = {};
    SEMANA.forEach(d => {
      const base = (DIA_SERV[d.num] || []).slice();
      st.extra.forEach(e => {
        if (e.dia === d.num) base.push([e.desde, e.hasta, e.protegido, e.tipo + ' · ' + e.lugar, e.dotacion]);
      });
      base.sort((a, b) => (a[0] === b[0] ? 0 : a[0] < b[0] ? -1 : 1));
      out[d.num] = base.filter(s => st.cancelados.indexOf(d.num + '|' + s[0] + '|' + s[2]) < 0);
    });
    return out;
  }, [st.extra, st.cancelados]);

  const serviciosDe = (dia: number) => porDia[dia] || [];

  const abrirDetalle = (dia: number, s: ServicioRaw) => setState({
    sheet: 'detalle',
    detalle: { dia, desde: s[0], hasta: s[1], protegido: s[2], tipo: s[3], dotacion: s[4] || 'Sin dotación asignada' },
  });

  const heads: Record<string, [string, string]> = {
    hoy: coord ? ['Mando · Sábado 12 SEP', 'Hoy'] : ['Escolta · Sábado 12 SEP', 'Mi jornada'],
    cal: ['Semana 37', 'Calendario'],
    vac: coord ? ['Solicitudes y cupo', 'Vacaciones'] : ['Saldo y solicitudes', 'Vacaciones'],
    prot: ['Familia Ferrán-Rivas', 'Protegidos'],
    equipo: ['12 escoltas activos', 'Equipo'],
    perfil: ['Tu ficha', 'Perfil'],
    ficha: ['Ficha de escolta', 'Equipo'],
    notif: ['Últimos 7 días', 'Avisos'],
    ajustes: ['Cuenta y avisos', 'Ajustes'],
  };
  const head = heads[tab] || heads.hoy;
  const noLeidas = st.notifs.filter(n => !n.leida).length;
  const nDisp = EQUIPO.filter(e => estadoDe(e) === 'disponible').length;
  const nServ = EQUIPO.filter(e => estadoDe(e) === 'servicio').length;

  const navDefs: [string, string][] = coord
    ? [['hoy', 'Hoy'], ['cal', 'Agenda'], ['prot', 'Protegidos'], ['vac', 'Vacac.'], ['equipo', 'Equipo']]
    : [['hoy', 'Hoy'], ['cal', 'Agenda'], ['vac', 'Vacac.'], ['perfil', 'Perfil']];
  const activeTab = tab === 'ficha' ? 'equipo' : tab;

  const servHoy = serviciosDe(12).map(s => {
    const cubierto = s[4] || st.cubierto;
    return {
      desde: s[0], hasta: 'fin al domicilio', cliente: s[2], tipo: s[3],
      dotacion: cubierto || 'Sin dotación asignada',
      dotacionColor: cubierto ? color.neutral800 : WARN,
      bar: cubierto ? color.accent600 : WARN,
      bg: cubierto ? 'transparent' : color.warnBg,
      estado: cubierto ? 'CUBIERTO' : 'SIN CUBRIR',
      tag: (cubierto ? 'outline' : 'accent') as TagKind,
      onTap: cubierto ? () => abrirDetalle(12, [s[0], s[1], s[2], s[3], cubierto]) : () => setState({ sheet: 'asignar' }),
    };
  });

  const diaServ = serviciosDe(st.dia).map(s => {
    const cubierto = s[4] || (st.dia === 12 ? st.cubierto : '');
    return {
      desde: s[0], hasta: 'fin al domicilio', cliente: s[2], tipo: s[3],
      dotacion: cubierto || 'Sin dotación asignada',
      dotacionColor: cubierto ? color.neutral800 : WARN,
      bar: cubierto ? color.accent600 : WARN,
      bg: cubierto ? 'transparent' : color.warnBg,
      onTap: cubierto ? () => abrirDetalle(st.dia, [s[0], s[1], s[2], s[3], cubierto]) : () => setState({ sheet: 'asignar' }),
    };
  });
  const misDia = diaServ.filter(s => s.dotacion.indexOf('M. Ríos') >= 0);
  const diaLista = coord ? diaServ : misDia;

  const filtros = ['Todos', 'Disponibles', 'En servicio', 'Fuera'].map(f => ({
    label: f, on: st.filtro === f, onTap: () => setState({ filtro: f }),
  }));
  const equipoFiltrado = EQUIPO.filter(e =>
    st.filtro === 'Todos' ? true
    : st.filtro === 'Disponibles' ? estadoDe(e) === 'disponible'
    : st.filtro === 'En servicio' ? estadoDe(e) === 'servicio'
    : estadoDe(e) === 'descanso' || estadoDe(e) === 'vacaciones');

  const fichaEsc = EQUIPO.find(e => e.id === st.fichaId) || EQUIPO[0];

  const pend = st.solicitudes.filter(s => s.estado === 'pendiente');
  const res = st.solicitudes.filter(s => s.estado !== 'pendiente');

  const tagEstado = (e: string): TagKind => e === 'aprobada' ? 'accent' : e === 'rechazada' ? 'neutral' : 'outline';
  const txtEstado = (e: string) => e === 'aprobada' ? 'APROBADA' : e === 'rechazada' ? 'RECHAZADA' : 'PENDIENTE';

  const resolver = (id: string, estado: 'aprobada' | 'rechazada', nombre: string) => {
    setState(s => ({ solicitudes: s.solicitudes.map(x => x.id === id ? { ...x, estado } : x) }));
    flash(estado === 'aprobada' ? 'Vacaciones aprobadas · ' + nombre : 'Solicitud rechazada · ' + nombre);
  };

  const dotacion = (() => {
    const p = (st.fechaDot || '').split('-').map(Number);
    const valida = p.length === 3 && p.every(n => Number.isFinite(n) && n > 0) && p[0] >= 2026 && p[0] <= 2030 && p[1] <= 12 && p[2] <= 31;
    const f = valida ? Date.UTC(p[0], p[1] - 1, p[2]) : HOY;
    const esHoy = f === HOY;
    const total = EQUIPO.length;
    const vac = EQUIPO.filter(e => e.estado === 'vacaciones');
    const activos = EQUIPO.filter(e => e.estado !== 'vacaciones');
    const jorn = activos.filter(e => enJornada(f, e.nombre));
    const conProt = jorn.filter(e => protDe(e.nombre));
    const libres = jorn.filter(e => !protDe(e.nombre));
    const libranza = activos.filter(e => !enJornada(f, e.nombre));
    const pct = (n: number) => Math.round((n / total) * 100) + '%';
    const dd = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][new Date(f).getUTCDay()];
    const rango = valida ? '' : ' (rango 2026–2030)';
    return {
      titulo: total + ' escoltas en plantilla',
      fechaTxt: !valida ? 'Fecha no válida · mostrando hoy'
        : esHoy ? 'Hoy · sábado 12 SEP'
        : dd + ' ' + p[2] + ' ' + MESES[p[1] - 1].slice(0, 3).toUpperCase(),
      filas: [
        { k: 'Con protegido', n: conProt.length, w: pct(conProt.length), color: color.accent700, barra: color.accent700, nota: 'Jornada asignada' },
        { k: 'Libres para refuerzo', n: libres.length, w: pct(libres.length), color: color.accent700, barra: color.accent400, nota: 'En jornada, sin protegido fijo' },
        { k: 'De libranza (ciclo 14/7)', n: libranza.length, w: pct(libranza.length), color: color.neutral800, barra: color.neutral400, nota: 'Fuera de ciclo' },
        { k: 'De vacaciones', n: vac.length, w: pct(vac.length), color: color.neutral800, barra: color.neutral300, nota: vac.map(v => v.nombre.split(' ')[0]).join(', ') || 'Nadie' },
      ],
      libresNombres: (libres.length ? 'Disponibles: ' + libres.map(e => e.nombre).join(' · ') : 'Ningún escolta libre para refuerzo ese día') + rango,
    };
  })();

  const protegidosHoy = PROTEGIDOS.map(p => {
    const a = asigDe(p);
    return {
      id: p.id, nombre: p.nombre, titular: a.titular, tit: iniDe(a.titular),
      estadoTxt: EST_PROT[p.estado].txt, tag: EST_PROT[p.estado].tag,
      borde: p.estado === 'sin' ? color.warn : color.neutral300,
      onTap: () => setState({ sheet: 'asignacion', asigProt: p.id }),
    };
  });

  const candidatos = EQUIPO.filter(e => estadoDe(e) === 'disponible').map(e => ({
    ini: e.ini, nombre: e.nombre,
    nota: e.horas > 32 ? e.horas + ' h esta semana · llegaría a ' + (e.horas + 7) + ' h' : e.horas + ' h esta semana · descansó 14 h',
    notaColor: e.horas > 32 ? WARN : MUT,
    onTap: () => {
      const cubierto = e.nombre.split(' ')[0][0] + '. ' + e.nombre.split(' ')[1];
      setState({ sheet: null, cubierto });
      flash(e.nombre + ' asignada a la cena de A. Ferrán');
    },
  }));

  const protActualAsig = PROTEGIDOS.find(p => p.id === st.asigProt) || PROTEGIDOS[0];
  const asigActual = asigDe(protActualAsig);

  const nvProt = PROTEGIDOS.find(p => p.nombre === st.nuevo.protegido) || PROTEGIDOS[0];

  return {
    coord, isEscolta: !coord, tab, head, noLeidas, hayNoLeidas: noLeidas > 0,
    nDisp, nServ,
    headMetaA: coord ? nDisp + ' disponibles' : '41 h esta semana',
    headMetaB: coord ? nServ + ' en servicio' : 'tope 48 h',
    setCoord: () => setState({ rol: 'coord', tab: 'hoy', sheet: null, fichaId: null }),
    setEscolta: () => setState({ rol: 'escolta', tab: 'hoy', sheet: null, fichaId: null }),
    go: (t: AppState['tab']) => setState({ tab: t, fichaId: null, sheet: null }),
    irNotif: () => setState({ tab: 'notif', fichaId: null, sheet: null }),
    irAjustes: () => setState({ tab: 'ajustes', fichaId: null, sheet: null }),

    navDefs, activeTab,

    // ---- Hoy (coordinación) ----
    dotacion,
    fechaDot: st.fechaDot,
    setFechaDot: (v: string) => setState({ fechaDot: v }),
    protegidosHoy,
    servHoy,
    serviciosMeta: servHoy.filter(s => s.estado === 'CUBIERTO').length + ' de ' + servHoy.length + ' cubiertos',
    disponibles: EQUIPO.filter(e => estadoDe(e) === 'disponible').map(e => ({
      ini: e.ini, nombre: e.nombre, nota: 'En jornada · sin protegido fijo', horas: e.horas + ' h / sem',
    })),

    // ---- Agenda ----
    semana: SEMANA.map(d => ({
      dia: d.dia, num: d.num, carga: serviciosDe(d.num).length + ' ev',
      onTap: () => setState({ dia: d.num }),
      active: st.dia === d.num,
    })),
    diaSel: st.dia,
    diaTitulo: (SEMANA.find(d => d.num === st.dia) || SEMANA[5]).dia + ' ' + st.dia + ' SEP',
    diaMeta: coord ? diaServ.length + (diaServ.length === 1 ? ' servicio' : ' servicios')
      : misDia.length + (misDia.length === 1 ? ' servicio mío' : ' servicios míos'),
    diaServicios: diaLista,
    diaVacio: diaLista.length === 0,

    calVista: st.calVista,
    setCalVista: (v: AppState['calVista']) => setState({ calVista: v }),
    calEscolta: st.calEscolta,
    calEscoltas: EQUIPO.map(e => ({ label: e.nombre.split(' ')[0], nombre: e.nombre, on: st.calEscolta === e.nombre, onTap: () => setState({ calEscolta: e.nombre }) })),
    calMesNombre: MESES[st.calMes] + ' 2026',
    calMesPrev: () => setState(s => ({ calMes: (s.calMes + 11) % 12 })),
    calMesNext: () => setState(s => ({ calMes: (s.calMes + 1) % 12 })),
    calDiasSemana: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
    calMesDias: (() => {
      const y = 2026, m = st.calMes;
      const primero = new Date(Date.UTC(y, m, 1)).getUTCDay();
      const hueco = (primero + 6) % 7;
      const total = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
      const out: { num: number | ''; bg: string; fg: string; borde: string; marca: string }[] = [];
      for (let i = 0; i < hueco; i++) out.push({ num: '', bg: 'transparent', fg: 'transparent', borde: 'transparent', marca: '' });
      for (let d = 1; d <= total; d++) {
        const f = Date.UTC(y, m, d);
        const work = enJornada(f, st.calEscolta);
        const c = diaCiclo(f, st.calEscolta);
        const esp = m === 8 ? serviciosDe(d).length : 0;
        out.push({
          num: d,
          bg: work ? color.accent200 : 'transparent',
          fg: work ? color.accent900 : color.neutral600,
          borde: c === 0 ? color.accent700 : color.neutral300,
          marca: esp ? '●' : '',
        });
      }
      return out;
    })(),
    calMesResumen: (() => {
      const y = 2026, m = st.calMes;
      const total = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
      let j = 0;
      for (let d = 1; d <= total; d++) if (enJornada(Date.UTC(y, m, d), st.calEscolta)) j++;
      return j + ' días de jornada · ' + (total - j) + ' de libranza · ciclo 14/7';
    })(),
    calAnio: MESES.map((nombre, m) => {
      const total = new Date(Date.UTC(2026, m + 1, 0)).getUTCDate();
      const primero = new Date(Date.UTC(2026, m, 1)).getUTCDay();
      const hueco = (primero + 6) % 7;
      const dias: { bg: string }[] = [];
      for (let i = 0; i < hueco; i++) dias.push({ bg: 'transparent' });
      for (let d = 1; d <= total; d++) dias.push({ bg: enJornada(Date.UTC(2026, m, d), st.calEscolta) ? color.accent500 : color.neutral200 });
      return { nombre: nombre.slice(0, 3).toUpperCase(), dias, onTap: () => setState({ calMes: m, calVista: 'Mes' }) };
    }),
    calAnioResumen: (() => {
      let j = 0;
      for (let m = 0; m < 12; m++) {
        const total = new Date(Date.UTC(2026, m + 1, 0)).getUTCDate();
        for (let d = 1; d <= total; d++) if (enJornada(Date.UTC(2026, m, d), st.calEscolta)) j++;
      }
      return j + ' días de jornada en 2026 · ' + (365 - j) + ' de libranza';
    })(),

    // ---- Vacaciones (coordinación) ----
    cupo: CUPO_DATA.map(([rango, n]) => ({
      rango, alto: (n / 3) * 100 + '%',
      color: n >= 3 ? WARN : n === 0 ? color.neutral300 : color.accent500,
      txt: n + '/3',
    })),
    pendientes: pend.map(p => ({
      nombre: p.nombre, rango: p.rango, dias: p.dias, aviso: p.aviso, avisoColor: p.warn ? WARN : MUT,
      onAprobar: () => resolver(p.id, 'aprobada', p.nombre),
      onRechazar: () => resolver(p.id, 'rechazada', p.nombre),
    })),
    sinPendientes: pend.length === 0,
    resueltas: res.map(r => ({ nombre: r.nombre, rango: r.rango, estado: txtEstado(r.estado), tag: tagEstado(r.estado) })),

    // ---- Equipo / Ficha ----
    filtros,
    equipo: equipoFiltrado.map(e => ({
      id: e.id, ini: e.ini, nombre: e.nombre,
      nota: protDe(e.nombre) ? 'Titular de ' + protDe(e.nombre)!.nombre
        : suplenteDe(e.nombre) ? 'Suplente de ' + suplenteDe(e.nombre)!.nombre
        : e.estado === 'servicio' ? 'Con ' + e.cli
        : e.estado === 'vacaciones' ? 'Vuelve el 20 SEP'
        : e.horas + ' h esta semana',
      estadoTxt: EST[estadoDe(e)].txt, tag: EST[estadoDe(e)].tag,
      iniBorder: estadoDe(e) === 'servicio' ? color.accent700 : color.neutral400,
      onTap: () => setState({ tab: 'ficha', fichaId: e.id }),
    })),
    ficha: {
      ini: fichaEsc.ini, nombre: fichaEsc.nombre,
      puesto: 'Escolta · TIP 41.882 · Delegación Centro',
      estadoTxt: EST[fichaEsc.estado].txt, tag: EST[fichaEsc.estado].tag,
      metricas: [
        { v: fichaEsc.horas + ' h', k: 'Esta semana' },
        { v: '11', k: 'Días vacac.' },
        { v: '14 h', k: 'Último descanso' },
      ],
      certs: CERTS,
      proximos: [
        { cuando: 'HOY 06:00', cliente: 'Alberto Ferrán · jornada', horas: 'est. 14 h' },
        { cuando: 'DOM 12:00', cliente: 'Almuerzo finca Toledo', horas: 'est. 6 h' },
        { cuando: 'MAR 06:00', cliente: 'Alberto Ferrán · jornada', horas: 'est. 14 h' },
      ],
    },
    volverEquipo: () => setState({ tab: 'equipo', sheet: null }),

    // ---- Hoy (escolta) ----
    miProtegido: (() => {
      const p = protDe('Marta Ríos') || suplenteDe('Marta Ríos');
      if (!p) return { nombre: 'Sin asignación', rol: 'A la espera de coordinación', rutina: 'Coordinación te asignará protegido', suplente: '' };
      const a = asigDe(p);
      return {
        nombre: p.nombre, rol: p.rol + ' · ' + p.nivel,
        rutina: 'Presentación ' + p.inicio + ' · fin al dejar al protegido en su domicilio',
        suplente: 'Suplente: ' + a.suplente,
      };
    })(),
    mio: {
      hora: '06:00',
      cliente: 'Jornada con ' + (protDe('Marta Ríos') || suplenteDe('Marta Ríos') || { nombre: 'protegido por asignar' }).nombre,
      punto: 'Recogida en residencia · Pº de la Castellana 142. Fin de jornada al dejar al protegido en su domicilio.',
      cta: st.confirmado ? 'En puesto desde las 05:58' : 'Confirmar que estoy en puesto',
      nota: st.cerrado
        ? 'Jornada cerrada a las ' + st.cerrado + ' · protegido en su domicilio · 14 h 32 min registradas.'
        : st.confirmado
          ? 'En servicio. Cierra la jornada cuando dejes al protegido en su domicilio.'
          : 'Asignación de coordinación. Confirma al llegar al punto de recogida.',
      enServicio: st.confirmado && !st.cerrado,
      cerrado: !!st.cerrado,
      ctaCierre: 'Protegido en su domicilio · cerrar jornada',
      metricas: [
        { v: '41 h', k: 'Esta semana' },
        { v: '14 h', k: 'Descanso previo' },
        { v: '11', k: 'Días vacac.' },
      ],
      semana: [
        { dia: 'Dom', horas: 'Desde 12:00', cliente: 'Almuerzo · finca de Toledo', tipo: 'Especial', bar: WARN },
        { dia: 'Lun', horas: 'Libre', cliente: 'Descanso · cubre I. Colmenar', tipo: '—', bar: color.neutral300 },
        { dia: 'Mar', horas: 'Desde 06:00', cliente: 'Jornada con A. Ferrán', tipo: 'Fija', bar: color.accent600 },
        { dia: 'Mié', horas: 'Desde 08:00', cliente: 'Consejo de administración', tipo: 'Especial', bar: WARN },
      ],
    },
    confirmar: () => { setState({ confirmado: true }); flash('Presencia confirmada · 05:58 · Alberto Ferrán'); },
    confirmarDetalle: () => { setState({ sheet: null, confirmado: true }); flash('Presencia confirmada · 05:58 · Alberto Ferrán'); },
    cerrarJornada: () => { setState({ cerrado: '20:30' }); flash('Jornada cerrada · 20:30 · 14 h 32 min'); },
    verDetalleJornada: () => setState({ sheet: 'detalle', detalle: { dia: 12, desde: '06:00', hasta: '20:00', protegido: 'Alberto Ferrán', tipo: 'Jornada fija · residencia, oficina y agenda', dotacion: 'M. Ríos · relevo I. Colmenar' } }),

    // ---- Vacaciones (escolta) ----
    saldo: [
      { v: '11', k: 'Días libres', color: color.accent700 },
      { v: '5', k: 'Solicitados', color: color.text },
      { v: '15', k: 'Disfrutados', color: color.neutral600 },
    ],
    misSolicitudes: st.misSolicitudes.map(s => ({ rango: s.rango, dias: s.dias, estado: txtEstado(s.estado), tag: tagEstado(s.estado) })),
    abrirSolicitud: () => setState({ sheet: 'solicitud' }),
    vacDesde: st.vacDesde, vacHasta: st.vacHasta, vacMotivo: st.vacMotivo,
    setDesde: (v: string) => setState({ vacDesde: v }),
    setHasta: (v: string) => setState({ vacHasta: v }),
    setMotivo: (v: string) => setState({ vacMotivo: v }),
    cupoAviso: 'Semana del 13 OCT: 1 de 3 plazas ocupadas. Tu solicitud entraría sin conflicto.',
    enviarSolicitud: () => {
      setState(s => ({
        sheet: null,
        misSolicitudes: ([{ id: 'n' + Date.now(), rango: s.vacDesde + ' – ' + s.vacHasta, dias: '5 días laborables', estado: 'pendiente' }] as MiSolicitud[])
          .concat(s.misSolicitudes.filter(x => x.id !== 'm1')),
      }));
      flash('Solicitud enviada a coordinación');
    },

    // ---- Perfil (escolta) ----
    refuerzo: st.refuerzo,
    refuerzoNota: st.refuerzo ? 'Te avisaremos de servicios de última hora' : 'No recibirás avisos fuera de tu cuadrante',
    toggleRefuerzo: () => setState(s => ({ refuerzo: !s.refuerzo })),
    misCerts: CERTS,
    horasMes: [38, 44, 41, 47, 36, 42, 41, 22].map(h => ({
      alto: Math.round((h / 48) * 100) + '%',
      color: h >= 46 ? WARN : color.accent500,
    })),

    // ---- Protegidos ----
    protegidos: PROTEGIDOS.map(p => {
      const a = asigDe(p);
      return {
        id: p.id, nombre: p.nombre, rol: p.rol, nivel: p.nivel, rutina: p.rutina,
        titular: a.titular, tit: iniDe(a.titular), suplente: 'Suplente: ' + a.suplente,
        estadoTxt: EST_PROT[p.estado].txt, tag: EST_PROT[p.estado].tag,
        borde: p.estado === 'sin' ? WARN : color.neutral300,
        eventos: SEMANA.reduce((n, d) => n + serviciosDe(d.num).filter(s => s[2] === p.nombre).length, 0) + ' esta semana',
        onTap: () => setState({ sheet: 'asignacion', asigProt: p.id }),
        onNuevo: () => setState(s => ({ sheet: 'nuevo', nuevo: { ...s.nuevo, protegido: p.nombre, dotacion: [corto(a.titular)] } })),
      };
    }),

    // ---- Sheet: cubrir servicio ----
    candidatos,

    // ---- Sheet: asignación permanente ----
    asigProtNombre: protActualAsig.nombre,
    asigTitulares: EQUIPO.map(e => {
      const on = asigActual.titular === e.nombre;
      return {
        nombre: e.nombre, ini: e.ini, on,
        bg: on ? color.accent200 : 'transparent', borde: on ? color.accent700 : color.neutral300,
        nota: e.estado === 'vacaciones' ? 'De vacaciones hasta el 20 SEP' : e.estado === 'servicio' ? 'Ahora con ' + e.cli : e.horas + ' h esta semana',
        onTap: () => setState(s => ({ asig: { ...s.asig, [protActualAsig.id]: { titular: e.nombre, suplente: s.asig[protActualAsig.id]?.suplente || protActualAsig.suplente } } })),
      };
    }),
    asigSuplentes: EQUIPO.map(e => {
      const on = asigActual.suplente === e.nombre;
      return {
        nombre: e.nombre, ini: e.ini, on,
        bg: on ? color.accent200 : 'transparent', borde: on ? color.accent700 : color.neutral300,
        onTap: () => setState(s => ({ asig: { ...s.asig, [protActualAsig.id]: { titular: s.asig[protActualAsig.id]?.titular || protActualAsig.titular, suplente: e.nombre } } })),
      };
    }),
    asigDesde: st.asigDesde,
    setAsigDesde: (v: string) => setState({ asigDesde: v }),
    asigResumen: asigActual.titular + ' como titular · ' + asigActual.suplente + ' de suplente, desde el ' + st.asigDesde,
    guardarAsignacion: () => { setState({ sheet: null }); flash('Asignación actualizada · ' + protActualAsig.nombre); },

    // ---- Sheet: detalle de servicio ----
    detalle: st.detalle || { protegido: '', desde: '', hasta: '', tipo: '', dotacion: '', dia: 12 },
    notificarDotacion: () => { setState({ sheet: null }); flash('Aviso enviado a la dotación'); },
    cancelarServicio: () => {
      const d = st.detalle!;
      setState(s => ({ sheet: null, cancelados: s.cancelados.concat([d.dia + '|' + d.desde + '|' + d.protegido]) }));
      flash('Servicio cancelado · ' + d.protegido);
    },

    // ---- FAB / Sheet: nuevo servicio ----
    mostrarFab: coord && (tab === 'hoy' || tab === 'cal' || tab === 'prot'),
    abrirNuevo: () => setState({ sheet: 'nuevo' }),
    nvDias: SEMANA.map(d => ({ label: d.dia + ' ' + d.num, on: st.nuevo.dia === d.num, onTap: () => setState(s => ({ nuevo: { ...s.nuevo, dia: d.num } })) })),
    nvProtegidos: PROTEGIDOS.map(p => ({ label: p.nombre, on: st.nuevo.protegido === p.nombre, onTap: () => setState(s => ({ nuevo: { ...s.nuevo, protegido: p.nombre } })) })),
    nvTipos: ['Evento', 'Traslado', 'Viaje', 'Refuerzo'].map(t => ({ label: t, on: st.nuevo.tipo === t, onTap: () => setState(s => ({ nuevo: { ...s.nuevo, tipo: t } })) })),
    nvDesde: st.nuevo.desde, nvLugar: st.nuevo.lugar,
    setNvDesde: (v: string) => setState(s => ({ nuevo: { ...s.nuevo, desde: v } })),
    setNvLugar: (v: string) => setState(s => ({ nuevo: { ...s.nuevo, lugar: v } })),
    nvDotacion: EQUIPO.map(e => {
      const c = corto(e.nombre);
      const on = st.nuevo.dotacion.indexOf(c) >= 0;
      return {
        label: c, ini: e.ini, on,
        bg: on ? color.accent200 : 'transparent', borde: on ? color.accent700 : color.neutral300,
        nota: e.estado === 'vacaciones' ? 'De vacaciones' : e.estado === 'servicio' ? 'Con ' + e.cli : e.horas + ' h esta semana',
        onTap: () => setState(s => ({ nuevo: { ...s.nuevo, dotacion: on ? s.nuevo.dotacion.filter(x => x !== c) : s.nuevo.dotacion.concat([c]) } })),
      };
    }),
    nvResumen: st.nuevo.protegido + ' · ' + st.nuevo.dia + ' SEP · desde las ' + st.nuevo.desde + ' · ' + (st.nuevo.dotacion.length || 'sin') + ' escolta' + (st.nuevo.dotacion.length === 1 ? '' : 's'),
    crearServicio: () => {
      const n = st.nuevo;
      setState(s => ({
        sheet: null, dia: n.dia,
        extra: s.extra.concat([{ dia: n.dia, desde: n.desde, hasta: '', protegido: n.protegido, tipo: n.tipo, lugar: n.lugar || 'Lugar por confirmar', dotacion: n.dotacion.join(' · ') }]),
      }));
      flash('Servicio especial creado · ' + n.protegido);
    },

    // ---- Notificaciones ----
    notifResumen: noLeidas > 0 ? noLeidas + (noLeidas === 1 ? ' aviso sin leer' : ' avisos sin leer') : 'Todo leído',
    notificaciones: st.notifs.map(n => ({
      id: n.id, tipo: n.tipo, texto: n.texto, hora: n.hora,
      tipoColor: n.urgente ? WARN : AC,
      bar: n.leida ? color.neutral300 : n.urgente ? WARN : color.accent600,
      bg: n.leida ? 'transparent' : color.neutral100,
      onTap: () => setState(s => ({ notifs: s.notifs.map(x => x.id === n.id ? { ...x, leida: true } : x) })),
    })),
    marcarLeidas: () => { setState(s => ({ notifs: s.notifs.map(x => ({ ...x, leida: true })) })); flash('Avisos marcados como leídos'); },

    // ---- Ajustes ----
    cuenta: coord
      ? { ini: 'CB', nombre: 'Carlos Bonet', detalle: 'Coordinación · Delegación Centro' }
      : { ini: 'MR', nombre: 'Marta Ríos', detalle: 'Escolta · TIP 41.882 · Delegación Centro' },
    preferencias: ([
      { key: 'servicio' as const, label: 'Cambios de servicio', nota: 'Altas, bajas y relevos de última hora' },
      { key: 'vacaciones' as const, label: 'Vacaciones', nota: coord ? 'Nuevas solicitudes del equipo' : 'Respuesta de coordinación' },
      { key: 'silencio' as const, label: 'Silencio nocturno', nota: 'Sin avisos entre 00:00 y 06:00' },
    ]).map(p => ({
      label: p.label, nota: p.nota, on: st.prefs[p.key],
      onTap: () => setState(s => ({ prefs: { ...s.prefs, [p.key]: !s.prefs[p.key] } })),
    })),
    idiomas: ['Español', 'English'].map(l => ({ label: l, on: st.idioma === l, onTap: () => setState({ idioma: l }) })),
    sesionInfo: [
      { k: 'Último acceso', v: 'Hoy 05:41 · Madrid' },
      { k: 'Dispositivo', v: 'Pixel 8 · corporativo' },
      { k: 'Rol', v: coord ? 'Coordinación' : 'Escolta' },
    ],
    cerrarSesion: () => setState({ sesion: false, authView: 'login', tab: 'hoy', pass: '', codigo: '', authError: '' }),

    // ---- Bottom sheet chrome ----
    sheet: st.sheet,
    sheetTitulo: st.sheet === 'asignar' ? 'Cubrir servicio'
      : st.sheet === 'nuevo' ? 'Nuevo servicio especial'
      : st.sheet === 'asignacion' ? 'Asignación permanente'
      : st.sheet === 'detalle' ? 'Detalle del servicio'
      : 'Solicitar días',
    sheetSub: st.sheet === 'asignar' ? 'Alberto Ferrán · desde las 19:00 · cena privada'
      : st.sheet === 'nuevo' ? 'Se añade sobre el dispositivo permanente del protegido'
      : st.sheet === 'asignacion' ? 'Titular y suplente de ' + protActualAsig.nombre
      : st.sheet === 'detalle' ? (st.detalle ? st.detalle.protegido + ' · desde las ' + st.detalle.desde : '')
      : 'Cupo máximo: 3 escoltas por semana',
    cerrarSheet: () => setState({ sheet: null }),

    // ---- Auth ----
    sesion: st.sesion,
    authView: st.authView,
    authKicker: st.authView === 'codigo' ? 'Verificación en dos pasos' : st.authView === 'recuperar' ? 'Recuperar acceso' : 'Control de servicios',
    authTitulo: st.authView === 'codigo' ? 'Código' : st.authView === 'recuperar' ? 'Acceso' : 'Relevo',
    authSub: st.authView === 'codigo'
      ? 'Introduce el código de 6 dígitos enviado al ' + (st.tip ? '•••' + st.tip.slice(-3) : 'teléfono registrado') + '.'
      : st.authView === 'recuperar'
        ? 'Te enviaremos un enlace de restablecimiento al correo corporativo asociado a tu TIP.'
        : 'Accede con tu número TIP para consultar cuadrantes, disponibilidad y vacaciones.',
    tip: st.tip, pass: st.pass, correo: st.correo, authError: st.authError,
    setTip: (v: string) => setState({ tip: v, authError: '' }),
    setPass: (v: string) => setState({ pass: v, authError: '' }),
    setCorreo: (v: string) => setState({ correo: v }),
    entrar: () => {
      if (!st.tip || !st.pass) { setState({ authError: 'Introduce tu número TIP y tu contraseña.' }); return; }
      setState({ authView: 'codigo', codigo: '' });
    },
    entrarHuella: () => { setState({ sesion: true, tab: 'hoy' }); flash('Sesión iniciada con huella'); },
    irRecuperar: () => setState({ authView: 'recuperar', authError: '' }),
    volverLogin: () => setState({ authView: 'login', authError: '', codigo: '' }),
    enviarRecuperacion: () => { setState({ authView: 'login' }); flash('Enlace enviado al correo corporativo'); },
    codigo: st.codigo,
    tocarTecla: (t: string) => {
      if (t === '⌫') { setState(s => ({ codigo: s.codigo.slice(0, -1) })); return; }
      const next = (st.codigo + t).slice(0, 6);
      if (next.length === 6) { setState({ codigo: next, sesion: true, tab: 'hoy' }); flash('Bienvenida, ' + (coord ? 'Carlos' : 'Marta')); }
      else setState({ codigo: next });
    },

    toast: st.toast,
  };
}
