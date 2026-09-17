import { useMemo } from 'react';
import { useStore, AppState, Patch, Fichaje } from '../state/store';
import {
  EST, SEMANA, MESES, DIA_SERV, EST_PROT,
  HOY, WARN, MUT, AC, Escolta, Protegido, ServicioRaw, MiSolicitud, Solicitud,
} from '../data/mock';
import { color } from '../theme/theme';
import { diaCiclo, enJornada } from './ciclo';
import { dmyToLocalDate, localDateToIso, formatIsoShort, utcMsToIso, isoToUtcMs } from './date';

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
  const { state: st, setState, flash, toastUndo, deshacerToast } = useStore();

  const asigDe = (p: Protegido) => ({
    titular: st.asig[p.id]?.titular || p.titular,
    suplente: st.asig[p.id]?.suplente || p.suplente,
  });
  const iniDe = (n: string) => st.equipo.find(x => x.nombre === n)?.ini || n.slice(0, 2).toUpperCase();
  const inicioDe = (nombre: string) => st.equipo.find(x => x.nombre === nombre)?.inicioJornada || '2026-01-01';
  // ¿Tiene nombre una solicitud de vacaciones APROBADA que cubra la fecha f (timestamp UTC)?
  const enVacacionAprobada = (nombre: string, f: number) => st.solicitudes.some(s => {
    if (s.nombre !== nombre || s.estado !== 'aprobada' || !s.desde || !s.hasta) return false;
    const desdeF = isoToUtcMs(s.desde);
    const hastaF = isoToUtcMs(s.hasta);
    return f >= desdeF && f <= hastaF;
  });
  // Semana del año (lunes primero), para el calendario anual exportable —
  // la semana 1 es la que contiene el 1 de enero.
  const semanaDelAnio = (f: number) => {
    const inicioAnio = Date.UTC(2026, 0, 1);
    const huecoIni = (new Date(inicioAnio).getUTCDay() + 6) % 7;
    const diffDias = Math.floor((f - inicioAnio) / 86400000);
    return Math.floor((diffDias + huecoIni) / 7) + 1;
  };
  const protDe = (nombre: string) => st.protegidos.find(p => asigDe(p).titular === nombre);
  const suplenteDe = (nombre: string) => st.protegidos.find(p => asigDe(p).suplente === nombre);
  const estadoDe = (e: Escolta) => e.estado === 'vacaciones' ? 'vacaciones'
    : e.estado === 'baja' ? 'baja'
    : !enJornada(HOY, e.inicioJornada) ? 'descanso'
    : protDe(e.nombre) ? 'servicio' : 'disponible';

  const coord = st.rol === 'coord';
  const tab = st.tab;
  const MI_NOMBRE = 'Marta Ríos';
  // El custodio solo ve su propia jornada en Agenda, sin selector de equipo.
  const calEscoltaEfectivo = coord ? st.calEscolta : MI_NOMBRE;

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

  const abrirDetalle = (dia: number, s: ServicioRaw) => {
    const extraMatch = st.extra.find(e => e.dia === dia && e.desde === s[0] && e.protegido === s[2]);
    const protegido = st.protegidos.find(p => p.nombre === s[2]);
    setState({
      sheet: 'detalle',
      detalle: { dia, desde: s[0], hasta: s[1], protegido: s[2], tipo: s[3], dotacion: s[4] || 'Sin dotación asignada', extraId: extraMatch?.id, telefono: protegido?.telefono },
    });
  };

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
    reporte: ['Para compartir', 'Reporte del día'],
  };
  const head = heads[tab] || heads.hoy;
  const noLeidas = st.notifs.filter(n => !n.leida).length;
  const nDisp = st.equipo.filter(e => estadoDe(e) === 'disponible').length;
  const nServ = st.equipo.filter(e => estadoDe(e) === 'servicio').length;

  const navDefs: [string, string][] = coord
    ? [['hoy', 'Hoy'], ['cal', 'Agenda'], ['prot', 'Protegidos'], ['vac', 'Vacac.'], ['equipo', 'Equipo']]
    : [['hoy', 'Hoy'], ['cal', 'Agenda'], ['vac', 'Vacac.'], ['perfil', 'Perfil']];
  const activeTab = tab === 'ficha' ? 'equipo' : tab === 'reporte' ? 'hoy' : tab;

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

  const filtros = ['Todos', 'Disponibles', 'En servicio', 'Fuera'].map(f => ({
    label: f, on: st.filtro === f, onTap: () => setState({ filtro: f }),
  }));
  const equipoFiltrado = st.equipo.filter(e => {
    const pasaFiltro = st.filtro === 'Todos' ? true
      : st.filtro === 'Disponibles' ? estadoDe(e) === 'disponible'
      : st.filtro === 'En servicio' ? estadoDe(e) === 'servicio'
      : estadoDe(e) === 'descanso' || estadoDe(e) === 'vacaciones' || estadoDe(e) === 'baja';
    const pasaBusqueda = !st.buscarEquipo.trim() || e.nombre.toLowerCase().includes(st.buscarEquipo.trim().toLowerCase());
    return pasaFiltro && pasaBusqueda;
  });

  const fichaEsc = st.equipo.find(e => e.id === st.fichaId) || st.equipo[0];

  const pend = st.solicitudes.filter(s => s.estado === 'pendiente');
  const res = st.solicitudes.filter(s => s.estado !== 'pendiente');

  const tagEstado = (e: string): TagKind => e === 'aprobada' ? 'accent' : e === 'rechazada' ? 'neutral' : 'outline';
  const txtEstado = (e: string) => e === 'aprobada' ? 'APROBADA' : e === 'rechazada' ? 'RECHAZADA' : 'PENDIENTE';

  const resolver = (id: string, estado: 'aprobada' | 'rechazada', nombre: string) => {
    setState(s => ({
      solicitudes: s.solicitudes.map(x => x.id === id ? { ...x, estado } : x),
      misSolicitudes: s.misSolicitudes.map(x => x.id === id ? { ...x, estado } : x),
      equipo: estado === 'aprobada' ? s.equipo.map(e => e.nombre === nombre ? { ...e, estado: 'vacaciones' } : e) : s.equipo,
    }));
    flash(estado === 'aprobada' ? 'Vacaciones aprobadas · ' + nombre + ' pasa a vacaciones' : 'Solicitud rechazada · ' + nombre);
  };

  const dotacionPara = (f: number) => {
    const esHoy = f === HOY;
    const total = st.equipo.length;
    const vac = st.equipo.filter(e => e.estado === 'vacaciones');
    const baja = st.equipo.filter(e => e.estado === 'baja');
    const activos = st.equipo.filter(e => e.estado !== 'vacaciones' && e.estado !== 'baja');
    const jorn = activos.filter(e => enJornada(f, e.inicioJornada));
    const conProt = jorn.filter(e => protDe(e.nombre));
    const libres = jorn.filter(e => !protDe(e.nombre));
    const libranza = activos.filter(e => !enJornada(f, e.inicioJornada));
    return { esHoy, total, vac, baja, conProt, libres, libranza };
  };

  // Cupo de vacaciones: 6 semanas desde el día 1 del mes en curso, y cuántos
  // escoltas tienen vacaciones APROBADAS que se solapan con cada una.
  // Se comparte entre el gráfico de coordinación y el aviso del formulario
  // de solicitud del escolta, para que ambos digan siempre lo mismo.
  const CUPO_MAX = 3;
  const cupoSemanas = Array.from({ length: 6 }, (_, i) => {
    const y = new Date(HOY).getUTCFullYear();
    const mesHoy = new Date(HOY).getUTCMonth();
    const inicioMes = Date.UTC(y, mesHoy, 1);
    const desdeSemana = inicioMes + i * 7 * 86400000;
    const hastaSemana = desdeSemana + 6 * 86400000;
    const n = st.equipo.filter(e => st.solicitudes.some(s =>
      s.nombre === e.nombre && s.estado === 'aprobada' && s.desde && s.hasta
      && isoToUtcMs(s.hasta) >= desdeSemana && isoToUtcMs(s.desde) <= hastaSemana
    )).length;
    return { desdeSemana, hastaSemana, n };
  });

  const fechaDotParsed = (() => {
    const p = (st.fechaDot || '').split('-').map(Number);
    const valida = p.length === 3 && p.every(n => Number.isFinite(n) && n > 0) && p[0] >= 2026 && p[0] <= 2030 && p[1] <= 12 && p[2] <= 31;
    const f = valida ? Date.UTC(p[0], p[1] - 1, p[2]) : HOY;
    return { p, valida, f };
  })();
  const { p: fechaDotP, valida: fechaDotValida, f: fechaDotF } = fechaDotParsed;
  const dotacionSel = dotacionPara(fechaDotF);

  const dotacion = (() => {
    const { esHoy, total, vac, baja, conProt, libres, libranza } = dotacionSel;
    const pct = (n: number) => Math.round((n / total) * 100) + '%';
    const dd = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][new Date(fechaDotF).getUTCDay()];
    const rango = fechaDotValida ? '' : ' (rango 2026–2030)';
    return {
      titulo: total + ' escoltas en plantilla',
      fechaTxt: !fechaDotValida ? 'Fecha no válida · mostrando hoy'
        : esHoy ? 'Hoy · sábado 12 SEP'
        : dd + ' ' + fechaDotP[2] + ' ' + MESES[fechaDotP[1] - 1].slice(0, 3).toUpperCase(),
      filas: [
        { k: 'Con protegido', n: conProt.length, w: pct(conProt.length), color: color.accent700, barra: color.accent700, nota: 'Jornada asignada', onTap: () => setState({ sheet: 'dotacionDetalle', dotacionDetalleTipo: 'con' }) },
        { k: 'Libres para refuerzo', n: libres.length, w: pct(libres.length), color: color.accent700, barra: color.accent400, nota: 'En jornada, sin protegido fijo', onTap: () => setState({ sheet: 'dotacionDetalle', dotacionDetalleTipo: 'libres' }) },
        { k: 'De libranza (ciclo 14/7)', n: libranza.length, w: pct(libranza.length), color: color.neutral800, barra: color.neutral400, nota: 'Fuera de ciclo', onTap: () => setState({ sheet: 'dotacionDetalle', dotacionDetalleTipo: 'libranza' }) },
        { k: 'De vacaciones', n: vac.length, w: pct(vac.length), color: color.neutral800, barra: color.neutral300, nota: vac.map(v => v.nombre.split(' ')[0]).join(', ') || 'Nadie', onTap: () => setState({ sheet: 'dotacionDetalle', dotacionDetalleTipo: 'vac' }) },
        { k: 'De baja', n: baja.length, w: pct(baja.length), color: WARN, barra: WARN, nota: baja.map(v => v.nombre.split(' ')[0]).join(', ') || 'Nadie', onTap: () => setState({ sheet: 'dotacionDetalle', dotacionDetalleTipo: 'baja' }) },
      ],
      libresNombres: (libres.length ? 'Disponibles: ' + libres.map(e => e.nombre).join(' · ') : 'Ningún escolta libre para refuerzo ese día') + rango,
    };
  })();

  const dotacionDetalleTitulos: Record<string, string> = {
    con: 'Con protegido', libres: 'Libres para refuerzo', libranza: 'De libranza (ciclo 14/7)', vac: 'De vacaciones', baja: 'De baja',
  };
  const dotacionDetalleListas: Record<string, { nombre: string; extra: string }[]> = {
    con: dotacionSel.conProt.map(e => ({ nombre: e.nombre, extra: 'Con ' + (protDe(e.nombre)?.nombre || 'protegido sin identificar') })),
    libres: dotacionSel.libres.map(e => ({ nombre: e.nombre, extra: e.horas + ' h esta semana' })),
    libranza: dotacionSel.libranza.map(e => ({ nombre: e.nombre, extra: 'Fuera del ciclo de jornada' })),
    vac: dotacionSel.vac.map(e => ({ nombre: e.nombre, extra: 'De vacaciones' })),
    baja: dotacionSel.baja.map(e => ({ nombre: e.nombre, extra: 'De baja' })),
  };

  const abrirHistorialDotacion = () => setState({ sheet: 'historial' });
  const dotacionHistorial = Array.from({ length: 7 }, (_, i) => {
    const f = HOY - i * 86400000;
    const { esHoy, conProt, libres, libranza, vac } = dotacionPara(f);
    const dd = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'][new Date(f).getUTCDay()];
    const fecha = new Date(f);
    return {
      fecha: esHoy ? 'Hoy · ' + dd + ' ' + fecha.getUTCDate() + ' SEP' : dd + ' ' + fecha.getUTCDate() + ' SEP',
      conProtegido: conProt.length, libres: libres.length, libranza: libranza.length, vacaciones: vac.length,
      libresNombres: libres.length ? libres.map(e => e.nombre).join(' · ') : 'Nadie libre para refuerzo',
    };
  });


  const protegidosHoy = st.protegidos.map(p => {
    const a = asigDe(p);
    return {
      id: p.id, nombre: p.nombre, titular: a.titular, tit: iniDe(a.titular),
      estadoTxt: EST_PROT[p.estado].txt, tag: EST_PROT[p.estado].tag,
      borde: p.estado === 'sin' ? color.warn : color.neutral300,
      onTap: () => setState({ sheet: 'asignacion', asigProt: p.id }),
    };
  });

  const reporte = (() => {
    const DIAS_LARGO = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
    // Usa la MISMA fecha que "Consultar fecha" en Dotación disponible — el
    // reporte se prepara la noche anterior para el día siguiente, o para
    // cualquier otro día que pidan, así que debe seguir a esa fecha, no al
    // reloj del teléfono ni a un día fijo.
    const diaSemana = DIAS_LARGO[new Date(fechaDotF).getUTCDay()];
    const dd = String(fechaDotValida ? fechaDotP[2] : 12).padStart(2, '0');
    const mm = String(fechaDotValida ? fechaDotP[1] : 9).padStart(2, '0');
    const aaaa = fechaDotValida ? fechaDotP[0] : 2026;
    const diaNum = fechaDotValida ? fechaDotP[2] : 12;
    const dispositivo = st.protegidos.map(p => {
      const a = asigDe(p);
      return { codigo: p.codigo, titular: a.titular, suplente: a.suplente, cubierto: p.estado !== 'sin' };
    });
    const especiales = serviciosDe(diaNum).map(s => {
      const p = st.protegidos.find(x => x.nombre === s[2]);
      return { hora: s[0], codigo: p?.codigo || s[2], tipo: s[3], dotacion: s[4] || '' };
    });
    const francos = dotacionSel.libranza.map(e => e.nombre);
    const vacaciones = dotacionSel.vac.map(e => e.nombre);
    const baja = dotacionSel.baja.map(e => e.nombre);
    return { fechaTitulo: diaSemana + ' ' + dd + '/' + mm + '/' + aaaa, dispositivo, especiales, francos, vacaciones, baja };
  })();

  const candidatos = st.equipo.filter(e => estadoDe(e) === 'disponible').map(e => ({
    ini: e.ini, nombre: e.nombre,
    nota: e.horas > 32 ? e.horas + ' h esta semana · llegaría a ' + (e.horas + 7) + ' h' : e.horas + ' h esta semana · descansó 14 h',
    notaColor: e.horas > 32 ? WARN : MUT,
    onTap: () => {
      const cubierto = e.nombre.split(' ')[0][0] + '. ' + e.nombre.split(' ')[1];
      setState({ sheet: null, cubierto });
      flash(e.nombre + ' asignada a la cena de A. Ferrán');
    },
  }));

  const protActualAsig = st.protegidos.find(p => p.id === st.asigProt) || st.protegidos[0];
  const asigActual = asigDe(protActualAsig);

  // ---- CRUD: equipo y protegidos (solo coordinación) ----
  const crearEscolta = () => {
    const nombre = st.nuevoEscoltaNombre.trim();
    if (!nombre) { flash('Escribe un nombre'); return; }
    const partes = nombre.split(' ');
    const ini = (partes[0][0] + (partes[1]?.[0] || '')).toUpperCase();
    setState(s => ({
      sheet: null,
      nuevoEscoltaNombre: '',
      equipo: s.equipo.concat([{ id: Date.now(), nombre, ini, estado: 'disponible', horas: 0, cli: '', certs: [], inicioJornada: s.nuevoEscoltaInicio }]),
    }));
    flash('Escolta añadido · ' + nombre);
  };
  const eliminarEscolta = (id: number) => {
    const e = st.equipo.find(x => x.id === id);
    if (!e) return;
    if (st.equipo.length <= 1) { flash('Debe quedar al menos un escolta en el equipo'); return; }
    const asignado = protDe(e.nombre) || suplenteDe(e.nombre);
    if (asignado) { flash('No se puede eliminar: es titular o suplente de ' + asignado.nombre); return; }
    setState(s => ({ equipo: s.equipo.filter(x => x.id !== id), tab: 'equipo', fichaId: null }));
    flash('Escolta eliminado · ' + e.nombre, () => setState(s => ({ equipo: s.equipo.concat([e]) })));
  };

  const crearProtegido = () => {
    const n = st.nuevoProtegido;
    if (!n.nombre.trim() || !n.titular) { flash('Falta el nombre o el titular'); return; }
    if (!n.suplente) { flash('Elige un suplente — no debería quedar sin respaldo'); return; }
    const id = 'p' + Date.now();
    setState(s => ({
      sheet: null,
      nuevoProtegido: { nombre: '', codigo: '', rol: '', nivel: 'NIVEL 1', titular: '', suplente: '', inicio: '08:00', rutina: '', telefono: '' },
      protegidos: s.protegidos.concat([{
        id, nombre: n.nombre.trim(), codigo: n.codigo.trim() || ('P' + (s.protegidos.length + 1)), rol: n.rol.trim() || 'Protegido', nivel: n.nivel,
        titular: n.titular, tit: iniDe(n.titular), suplente: n.suplente,
        inicio: n.inicio || '08:00',
        rutina: n.rutina.trim() || ('Presentación ' + (n.inicio || '08:00')),
        estado: 'con', telefono: n.telefono.trim(),
      }]),
    }));
    flash('Protegido añadido · ' + n.nombre.trim());
  };
  const eliminarProtegido = (id: string) => {
    const p = st.protegidos.find(x => x.id === id);
    if (!p) return;
    if (st.protegidos.length <= 1) { flash('Debe quedar al menos un protegido'); return; }
    const asigPrevia = st.asig[id];
    setState(s => {
      const { [id]: _quitado, ...asigResto } = s.asig;
      return {
        protegidos: s.protegidos.filter(x => x.id !== id),
        asig: asigResto,
        asigProt: s.asigProt === id ? s.protegidos.filter(x => x.id !== id)[0].id : s.asigProt,
      };
    });
    flash('Protegido eliminado · ' + p.nombre, () => setState(s => ({
      protegidos: s.protegidos.concat([p]),
      asig: asigPrevia ? { ...s.asig, [id]: asigPrevia } : s.asig,
    })));
  };

  const abrirEditarProtegido = (p: Protegido) => setState({
    sheet: 'editarProtegido',
    editProtegido: { id: p.id, nombre: p.nombre, codigo: p.codigo, rol: p.rol, nivel: p.nivel, rutina: p.rutina, telefono: p.telefono },
  });
  const guardarEdicionProtegido = () => {
    const ep = st.editProtegido;
    if (!ep.nombre.trim()) { flash('El nombre no puede quedar vacío'); return; }
    setState(s => ({
      sheet: null,
      protegidos: s.protegidos.map(p => p.id === ep.id
        ? { ...p, nombre: ep.nombre.trim(), codigo: ep.codigo.trim() || p.codigo, rol: ep.rol.trim(), nivel: ep.nivel, rutina: ep.rutina.trim(), telefono: ep.telefono.trim() }
        : p),
    }));
    flash('Datos actualizados · ' + ep.nombre.trim());
  };

  const crearHabilitacion = () => {
    const h = st.nuevaHab;
    if (!h.nombre.trim()) { flash('Escribe el nombre de la habilitación'); return; }
    const escoltaId = fichaEsc.id;
    setState(s => ({
      sheet: null,
      nuevaHab: { nombre: '', num: '', vence: '', alerta: false },
      equipo: s.equipo.map(e => e.id === escoltaId
        ? { ...e, certs: e.certs.concat([{ id: 'c' + Date.now(), nombre: h.nombre.trim(), num: h.num.trim(), vence: h.vence.trim() || 'Sin fecha', alerta: h.alerta }]) }
        : e),
    }));
    flash('Habilitación añadida · ' + h.nombre.trim());
  };
  const eliminarHabilitacion = (certId: string) => {
    const escoltaId = fichaEsc.id;
    const cert = fichaEsc.certs.find(c => c.id === certId);
    setState(s => ({
      equipo: s.equipo.map(e => e.id === escoltaId ? { ...e, certs: e.certs.filter(c => c.id !== certId) } : e),
    }));
    flash('Habilitación eliminada', cert ? () => setState(s => ({
      equipo: s.equipo.map(e => e.id === escoltaId ? { ...e, certs: e.certs.concat([cert]) } : e),
    })) : undefined);
  };

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
    dotacionHistorial,
    abrirHistorialDotacion,
    dotacionDetalleTitulo: dotacionDetalleTitulos[st.dotacionDetalleTipo],
    dotacionDetalleLista: dotacionDetalleListas[st.dotacionDetalleTipo],
    fechaDot: st.fechaDot,
    setFechaDot: (v: string) => setState({ fechaDot: v }),
    protegidosHoy,
    reporte,
    abrirReporte: () => setState({ tab: 'reporte' }),
    servHoy,
    serviciosMeta: servHoy.filter(s => s.estado === 'CUBIERTO').length + ' de ' + servHoy.length + ' cubiertos',
    disponibles: st.equipo.filter(e => estadoDe(e) === 'disponible').map(e => ({
      ini: e.ini, nombre: e.nombre, nota: 'En jornada · sin protegido fijo', horas: e.horas + ' h / sem',
    })),

    // ---- Agenda ----
    ...(() => {
      const DIAS_CORTO = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
      const inicioSemanaF = isoToUtcMs(st.calSemanaInicio);
      const diasSemana = Array.from({ length: 7 }, (_, i) => {
        const f = inicioSemanaF + i * 86400000;
        const dt = new Date(f);
        return { dia: DIAS_CORTO[dt.getUTCDay()], num: dt.getUTCDate(), f, esHoy: f === HOY };
      });
      // Cuadro tipo "distributivo de personal": columnas = días de la
      // semana mostrada, filas = escoltas. El custodio solo ve su propia fila.
      const escoltasSemana = coord ? st.equipo : st.equipo.filter(e => e.nombre === MI_NOMBRE);
      const semanaTabla = {
        dias: diasSemana,
        filas: escoltasSemana.map(e => ({
          nombre: e.nombre, ini: e.ini,
          celdas: diasSemana.map(d => {
            if (e.estado === 'baja') return { txt: 'B', bg: color.warnBg, fg: color.warn };
            if (enVacacionAprobada(e.nombre, d.f)) return { txt: 'V', bg: color.neutral500, fg: color.white };
            if (enJornada(d.f, e.inicioJornada)) return { txt: 'T', bg: color.accent200, fg: color.accent900 };
            return { txt: 'L', bg: 'transparent', fg: color.neutral600 };
          }),
        })),
      };
      const finSemanaF = inicioSemanaF + 6 * 86400000;
      const mesIni = MESES[new Date(inicioSemanaF).getUTCMonth()].slice(0, 3).toUpperCase();
      const mesFin = MESES[new Date(finSemanaF).getUTCMonth()].slice(0, 3).toUpperCase();
      return {
        semanaTabla,
        calSemanaLabel: mesIni === mesFin
          ? new Date(inicioSemanaF).getUTCDate() + '–' + new Date(finSemanaF).getUTCDate() + ' ' + mesIni
          : new Date(inicioSemanaF).getUTCDate() + ' ' + mesIni + ' – ' + new Date(finSemanaF).getUTCDate() + ' ' + mesFin,
        calSemanaPrev: () => setState(s => ({ calSemanaInicio: utcMsToIso(isoToUtcMs(s.calSemanaInicio) - 7 * 86400000) })),
        calSemanaNext: () => setState(s => ({ calSemanaInicio: utcMsToIso(isoToUtcMs(s.calSemanaInicio) + 7 * 86400000) })),
      };
    })(),

    calVista: st.calVista,
    setCalVista: (v: AppState['calVista']) => setState({ calVista: v }),
    calEscolta: calEscoltaEfectivo,
    calEscoltas: st.equipo.map(e => ({ label: e.nombre.split(' ')[0], nombre: e.nombre, on: st.calEscolta === e.nombre, onTap: () => setState({ calEscolta: e.nombre }) })),
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
        const enVac = enVacacionAprobada(calEscoltaEfectivo, f);
        const work = enJornada(f, inicioDe(calEscoltaEfectivo));
        const c = diaCiclo(f, inicioDe(calEscoltaEfectivo));
        const esp = m === 8 ? serviciosDe(d).length : 0;
        out.push({
          num: d,
          bg: enVac ? color.neutral500 : work ? color.accent200 : 'transparent',
          fg: enVac ? color.white : work ? color.accent900 : color.neutral600,
          borde: c === 0 ? color.accent700 : color.neutral300,
          marca: esp ? '●' : '',
        });
      }
      return out;
    })(),
    calMesResumen: (() => {
      const y = 2026, m = st.calMes;
      const total = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
      let j = 0, v = 0;
      for (let d = 1; d <= total; d++) {
        const f = Date.UTC(y, m, d);
        if (enVacacionAprobada(calEscoltaEfectivo, f)) v++;
        else if (enJornada(f, inicioDe(calEscoltaEfectivo))) j++;
      }
      return j + ' días de jornada · ' + (total - j - v) + ' de libranza' + (v ? ' · ' + v + ' de vacaciones' : '') + ' · ciclo 14/7';
    })(),
    // Un mes = semanas (filas) de 7 columnas Lu–Do, como un calendario de
    // pared real — no un mosaico de cuadritos. Se usa tanto en pantalla
    // como en el reporte exportable, para que ambos muestren lo mismo.
    calAnio: MESES.map((nombre, m) => {
      const total = new Date(Date.UTC(2026, m + 1, 0)).getUTCDate();
      const primero = new Date(Date.UTC(2026, m, 1)).getUTCDay();
      const hueco = (primero + 6) % 7;
      type Celda = { num: number; bg: string; fg: string; borde: string; marca: string } | null;
      const planas: Celda[] = [];
      let jornada = 0, vacaciones = 0;
      for (let i = 0; i < hueco; i++) planas.push(null);
      for (let d = 1; d <= total; d++) {
        const f = Date.UTC(2026, m, d);
        const enVac = enVacacionAprobada(calEscoltaEfectivo, f);
        const work = enJornada(f, inicioDe(calEscoltaEfectivo));
        const c = diaCiclo(f, inicioDe(calEscoltaEfectivo));
        const esp = m === 8 ? serviciosDe(d).length : 0;
        if (enVac) vacaciones++;
        else if (work) jornada++;
        planas.push({
          num: d,
          bg: enVac ? color.neutral500 : work ? color.accent200 : 'transparent',
          fg: enVac ? color.white : work ? color.accent900 : color.neutral600,
          borde: c === 0 ? color.accent700 : color.neutral300,
          marca: esp ? '●' : '',
        });
      }
      while (planas.length % 7 !== 0) planas.push(null);
      const semanas: { num: number; celdas: Celda[] }[] = [];
      for (let i = 0; i < planas.length; i += 7) {
        const celdas = planas.slice(i, i + 7);
        const primerDia = celdas.find(c => c !== null) as { num: number } | undefined;
        semanas.push({ num: primerDia ? semanaDelAnio(Date.UTC(2026, m, primerDia.num)) : 0, celdas });
      }
      return {
        nombre: nombre.slice(0, 3).toUpperCase(),
        semanas, jornada, vacaciones, libranza: total - jornada - vacaciones,
      };
    }),
    calAnioResumen: (() => {
      let j = 0, v = 0;
      for (let m = 0; m < 12; m++) {
        const total = new Date(Date.UTC(2026, m + 1, 0)).getUTCDate();
        for (let d = 1; d <= total; d++) {
          const f = Date.UTC(2026, m, d);
          if (enVacacionAprobada(calEscoltaEfectivo, f)) v++;
          else if (enJornada(f, inicioDe(calEscoltaEfectivo))) j++;
        }
      }
      return j + ' días de jornada en 2026 · ' + (365 - j - v) + ' de libranza' + (v ? ' · ' + v + ' de vacaciones' : '');
    })(),
    calAnioVacaciones: st.solicitudes.filter(s => s.nombre === calEscoltaEfectivo && s.estado === 'aprobada').map(s => s.rango),

    // ---- Vacaciones (coordinación) ----
    // Cupo real: cuenta, semana a semana desde el día 1 del mes actual,
    // cuántos escoltas tienen vacaciones aprobadas que se solapan con esa
    // semana — ya no son números de ejemplo fijos.
    cupoMesNombre: MESES[new Date(HOY).getUTCMonth()],
    cupo: cupoSemanas.map(({ desdeSemana, hastaSemana, n }) => ({
      rango: new Date(desdeSemana).getUTCDate() + '–' + new Date(hastaSemana).getUTCDate(),
      alto: Math.min((n / CUPO_MAX) * 100, 100) + '%',
      color: n >= CUPO_MAX ? WARN : n === 0 ? color.neutral300 : color.accent500,
      txt: n + '/' + CUPO_MAX,
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
    buscarEquipo: st.buscarEquipo,
    setBuscarEquipo: (v: string) => setState({ buscarEquipo: v }),
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
    abrirNuevoEscolta: () => setState({ sheet: 'nuevoEscolta' }),
    nuevoEscoltaNombre: st.nuevoEscoltaNombre,
    setNuevoEscoltaNombre: (v: string) => setState({ nuevoEscoltaNombre: v }),
    nuevoEscoltaInicio: st.nuevoEscoltaInicio,
    setNuevoEscoltaInicio: (v: string) => setState({ nuevoEscoltaInicio: v }),
    crearEscolta,
    ficha: {
      ini: fichaEsc.ini, nombre: fichaEsc.nombre,
      puesto: 'Escolta · TIP 41.882 · Delegación Centro',
      estadoTxt: EST[fichaEsc.estado].txt, tag: EST[fichaEsc.estado].tag,
      metricas: [
        { v: fichaEsc.horas + ' h', k: 'Esta semana' },
        { v: '11', k: 'Días vacac.' },
        { v: '14 h', k: 'Último descanso' },
      ],
      certs: fichaEsc.certs.map(c => ({
        id: c.id, nombre: c.nombre, num: c.num, vence: c.vence,
        color: c.alerta ? WARN : MUT,
        onEliminar: () => eliminarHabilitacion(c.id),
      })),
      proximos: [
        { cuando: 'HOY 06:00', cliente: 'Alberto Ferrán · jornada', horas: 'est. 14 h' },
        { cuando: 'DOM 12:00', cliente: 'Almuerzo finca Toledo', horas: 'est. 6 h' },
        { cuando: 'MAR 06:00', cliente: 'Alberto Ferrán · jornada', horas: 'est. 14 h' },
      ],
    },
    abrirNuevaHabilitacion: () => setState({ sheet: 'nuevaHabilitacion' }),
    nhNombre: st.nuevaHab.nombre, nhNum: st.nuevaHab.num, nhVence: st.nuevaHab.vence, nhAlerta: st.nuevaHab.alerta,
    setNhNombre: (v: string) => setState(s => ({ nuevaHab: { ...s.nuevaHab, nombre: v } })),
    setNhNum: (v: string) => setState(s => ({ nuevaHab: { ...s.nuevaHab, num: v } })),
    setNhVence: (v: string) => setState(s => ({ nuevaHab: { ...s.nuevaHab, vence: v } })),
    toggleNhAlerta: () => setState(s => ({ nuevaHab: { ...s.nuevaHab, alerta: !s.nuevaHab.alerta } })),
    crearHabilitacion,
    eliminarEscoltaActual: () => eliminarEscolta(fichaEsc.id),
    enVacaciones: fichaEsc.estado === 'vacaciones',
    finalizarVacaciones: () => {
      const id = fichaEsc.id;
      setState(s => ({ equipo: s.equipo.map(e => e.id === id ? { ...e, estado: 'disponible' } : e) }));
      flash(fichaEsc.nombre + ' vuelve de vacaciones');
    },
    enBaja: fichaEsc.estado === 'baja',
    marcarDeBaja: () => {
      const id = fichaEsc.id;
      const nombre = fichaEsc.nombre;
      const titularDe = protDe(nombre);
      const suplenteDeAlguien = suplenteDe(nombre);
      const notifId = 'n' + Date.now();
      const textoAviso = titularDe
        ? nombre + ' se dio de baja — es titular de ' + titularDe.nombre + ', necesita reemplazo ya.'
        : suplenteDeAlguien
          ? nombre + ' se dio de baja — es suplente de ' + suplenteDeAlguien.nombre + '.'
          : nombre + ' se dio de baja.';
      setState(s => ({
        equipo: s.equipo.map(e => e.id === id ? { ...e, estado: 'baja' } : e),
        notifs: [{ id: notifId, tipo: 'Cobertura', texto: textoAviso, hora: 'ahora', leida: false, urgente: !!titularDe }].concat(s.notifs),
        ...(titularDe ? { tab: 'prot' as const, sheet: 'asignacion' as const, asigProt: titularDe.id } : {}),
      }));
      flash(titularDe ? 'Baja registrada · elige reemplazo para ' + titularDe.nombre : 'Baja registrada · ' + nombre);
    },
    volverDeBaja: () => {
      const id = fichaEsc.id;
      setState(s => ({ equipo: s.equipo.map(e => e.id === id ? { ...e, estado: 'disponible' } : e) }));
      flash(fichaEsc.nombre + ' se reincorpora');
    },
    volverEquipo: () => setState({ tab: 'equipo', sheet: null }),
    jornadaInfo: {
      inicioTxt: formatIsoShort(fichaEsc.inicioJornada),
      hoyEnJornada: enJornada(HOY, fichaEsc.inicioJornada),
      diaDeCiclo: diaCiclo(HOY, fichaEsc.inicioJornada) + 1,
    },
    abrirEditarJornada: () => setState({ sheet: 'editarJornada', editarJornadaFecha: fichaEsc.inicioJornada }),
    editarJornadaFecha: st.editarJornadaFecha,
    setEditarJornadaFecha: (v: string) => setState({ editarJornadaFecha: v }),
    guardarJornada: () => {
      const id = fichaEsc.id;
      const fecha = st.editarJornadaFecha;
      setState(s => ({ sheet: null, equipo: s.equipo.map(e => e.id === id ? { ...e, inicioJornada: fecha } : e) }));
      flash('Ciclo 14/7 actualizado · ' + fichaEsc.nombre);
    },

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
    confirmar: () => {
      const protegido = (protDe('Marta Ríos') || suplenteDe('Marta Ríos') || { nombre: 'protegido por asignar' }).nombre;
      setState(s => ({ confirmado: true, fichajes: ([{ id: 'f' + Date.now(), escoltaNombre: 'Marta Ríos', protegido, horaConfirmado: '05:58', horaCierre: null, duracion: null }] as Fichaje[]).concat(s.fichajes) }));
      flash('Presencia confirmada · 05:58 · ' + protegido);
    },
    confirmarDetalle: () => {
      const protegido = (protDe('Marta Ríos') || suplenteDe('Marta Ríos') || { nombre: 'protegido por asignar' }).nombre;
      setState(s => ({ sheet: null, confirmado: true, fichajes: ([{ id: 'f' + Date.now(), escoltaNombre: 'Marta Ríos', protegido, horaConfirmado: '05:58', horaCierre: null, duracion: null }] as Fichaje[]).concat(s.fichajes) }));
      flash('Presencia confirmada · 05:58 · ' + protegido);
    },
    cerrarJornada: () => {
      setState(s => ({
        cerrado: '20:30',
        fichajes: s.fichajes.map((f, i) => i === 0 && f.escoltaNombre === 'Marta Ríos' && !f.horaCierre ? { ...f, horaCierre: '20:30', duracion: '14 h 32 min' } : f),
      }));
      flash('Jornada cerrada · 20:30 · 14 h 32 min');
    },
    verDetalleJornada: () => setState({ sheet: 'detalle', detalle: { dia: 12, desde: '06:00', hasta: '20:00', protegido: 'Alberto Ferrán', tipo: 'Jornada fija · residencia, oficina y agenda', dotacion: 'M. Ríos · relevo I. Colmenar', telefono: st.protegidos.find(p => p.nombre === 'Alberto Ferrán')?.telefono } }),

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
    // Mismo cupo real que ve coordinación, pero mirando la fecha "Desde"
    // que el escolta está por enviar — antes era un texto de ejemplo fijo.
    cupoAviso: (() => {
      const desdeF = isoToUtcMs(localDateToIso(dmyToLocalDate(st.vacDesde)));
      const semana = cupoSemanas.find(sem => desdeF >= sem.desdeSemana && desdeF <= sem.hastaSemana);
      if (!semana) return 'Ese cupo solo se controla para ' + MESES[new Date(HOY).getUTCMonth()] + ' — fuera de ese mes no hay dato de plazas.';
      const rango = new Date(semana.desdeSemana).getUTCDate() + '–' + new Date(semana.hastaSemana).getUTCDate() + ' ' + MESES[new Date(HOY).getUTCMonth()].slice(0, 3).toUpperCase();
      return semana.n >= CUPO_MAX
        ? 'Semana del ' + rango + ': cupo lleno (' + semana.n + '/' + CUPO_MAX + '). Podría generar conflicto.'
        : 'Semana del ' + rango + ': ' + semana.n + ' de ' + CUPO_MAX + ' plazas ocupadas. Tu solicitud entraría ' + (semana.n === 0 ? 'sin conflicto' : 'con margen') + '.';
    })(),
    enviarSolicitud: () => {
      if (dmyToLocalDate(st.vacHasta).getTime() < dmyToLocalDate(st.vacDesde).getTime()) {
        flash('La fecha "Hasta" no puede ser anterior a "Desde"');
        return;
      }
      const id = 'n' + Date.now();
      const rango = st.vacDesde + ' – ' + st.vacHasta;
      const desdeIso = localDateToIso(dmyToLocalDate(st.vacDesde));
      const hastaIso = localDateToIso(dmyToLocalDate(st.vacHasta));
      setState(s => ({
        sheet: null,
        misSolicitudes: ([{ id, rango, desde: desdeIso, hasta: hastaIso, dias: '5 días laborables', estado: 'pendiente' }] as MiSolicitud[])
          .concat(s.misSolicitudes.filter(x => x.id !== 'm1')),
        solicitudes: ([{ id, nombre: 'Marta Ríos', rango, desde: desdeIso, hasta: hastaIso, dias: '5 días laborables', aviso: '', warn: false, estado: 'pendiente' }] as Solicitud[])
          .concat(s.solicitudes),
      }));
      flash('Solicitud enviada a coordinación');
    },

    // ---- Perfil (escolta) ----
    refuerzo: st.refuerzo,
    refuerzoNota: st.refuerzo ? 'Te avisaremos de servicios de última hora' : 'No recibirás avisos fuera de tu cuadrante',
    toggleRefuerzo: () => setState(s => ({ refuerzo: !s.refuerzo })),
    misCerts: (st.equipo.find(e => e.nombre === 'Marta Ríos')?.certs || []).map(c => ({
      nombre: c.nombre, num: c.num, vence: c.vence, color: c.alerta ? WARN : MUT,
    })),
    horasMes: [38, 44, 41, 47, 36, 42, 41, 22].map(h => ({
      alto: Math.round((h / 48) * 100) + '%',
      color: h >= 46 ? WARN : color.accent500,
    })),
    misFichajes: st.fichajes.filter(f => f.escoltaNombre === 'Marta Ríos').map(f => ({
      protegido: f.protegido, horaConfirmado: f.horaConfirmado,
      horaCierre: f.horaCierre || 'en curso', duracion: f.duracion || '—',
    })),

    // ---- Protegidos ----
    protegidos: st.protegidos.map(p => {
      const a = asigDe(p);
      return {
        id: p.id, nombre: p.nombre, rol: p.rol, nivel: p.nivel, rutina: p.rutina,
        titular: a.titular, tit: iniDe(a.titular), suplente: 'Suplente: ' + a.suplente,
        estadoTxt: EST_PROT[p.estado].txt, tag: EST_PROT[p.estado].tag,
        borde: p.estado === 'sin' ? WARN : color.neutral300,
        eventos: SEMANA.reduce((n, d) => n + serviciosDe(d.num).filter(s => s[2] === p.nombre).length, 0) + ' esta semana',
        onTap: () => setState({ sheet: 'asignacion', asigProt: p.id }),
        onNuevo: () => setState(s => ({ sheet: 'nuevo', editandoServicioId: null, nuevo: { ...s.nuevo, protegido: p.nombre, dotacion: [corto(a.titular)] } })),
        onEliminar: () => eliminarProtegido(p.id),
        onEditarDatos: () => abrirEditarProtegido(p),
      };
    }),
    abrirNuevoProtegido: () => setState({ sheet: 'nuevoProtegido' }),
    epNombre: st.editProtegido.nombre, epCodigo: st.editProtegido.codigo, epRol: st.editProtegido.rol, epRutina: st.editProtegido.rutina, epTelefono: st.editProtegido.telefono,
    setEpNombre: (v: string) => setState(s => ({ editProtegido: { ...s.editProtegido, nombre: v } })),
    setEpCodigo: (v: string) => setState(s => ({ editProtegido: { ...s.editProtegido, codigo: v } })),
    setEpRol: (v: string) => setState(s => ({ editProtegido: { ...s.editProtegido, rol: v } })),
    setEpRutina: (v: string) => setState(s => ({ editProtegido: { ...s.editProtegido, rutina: v } })),
    setEpTelefono: (v: string) => setState(s => ({ editProtegido: { ...s.editProtegido, telefono: v } })),
    epNiveles: ['NIVEL 1', 'NIVEL 2', 'NIVEL 3'].map(n => ({
      label: n, on: st.editProtegido.nivel === n,
      onTap: () => setState(s => ({ editProtegido: { ...s.editProtegido, nivel: n } })),
    })),
    guardarEdicionProtegido,
    npNombre: st.nuevoProtegido.nombre, npCodigo: st.nuevoProtegido.codigo, npRol: st.nuevoProtegido.rol, npInicio: st.nuevoProtegido.inicio, npRutina: st.nuevoProtegido.rutina, npTelefono: st.nuevoProtegido.telefono,
    setNpCodigo: (v: string) => setState(s => ({ nuevoProtegido: { ...s.nuevoProtegido, codigo: v } })),
    setNpTelefono: (v: string) => setState(s => ({ nuevoProtegido: { ...s.nuevoProtegido, telefono: v } })),
    setNpNombre: (v: string) => setState(s => ({ nuevoProtegido: { ...s.nuevoProtegido, nombre: v } })),
    setNpRol: (v: string) => setState(s => ({ nuevoProtegido: { ...s.nuevoProtegido, rol: v } })),
    setNpInicio: (v: string) => setState(s => ({ nuevoProtegido: { ...s.nuevoProtegido, inicio: v } })),
    setNpRutina: (v: string) => setState(s => ({ nuevoProtegido: { ...s.nuevoProtegido, rutina: v } })),
    npNiveles: ['NIVEL 1', 'NIVEL 2', 'NIVEL 3'].map(n => ({
      label: n, on: st.nuevoProtegido.nivel === n,
      onTap: () => setState(s => ({ nuevoProtegido: { ...s.nuevoProtegido, nivel: n } })),
    })),
    npTitulares: st.equipo.map(e => ({
      nombre: e.nombre, ini: e.ini, on: st.nuevoProtegido.titular === e.nombre,
      bg: st.nuevoProtegido.titular === e.nombre ? color.accent200 : 'transparent',
      borde: st.nuevoProtegido.titular === e.nombre ? color.accent700 : color.neutral300,
      onTap: () => setState(s => ({ nuevoProtegido: { ...s.nuevoProtegido, titular: e.nombre } })),
    })),
    npSuplentes: st.equipo.map(e => ({
      nombre: e.nombre, on: st.nuevoProtegido.suplente === e.nombre,
      onTap: () => setState(s => ({ nuevoProtegido: { ...s.nuevoProtegido, suplente: e.nombre } })),
    })),
    npResumen: (st.nuevoProtegido.nombre || 'Nuevo protegido') + ' · ' + st.nuevoProtegido.nivel
      + (st.nuevoProtegido.titular ? ' · titular ' + st.nuevoProtegido.titular : ' · sin titular')
      + (st.nuevoProtegido.suplente ? ' · suplente ' + st.nuevoProtegido.suplente : ''),
    crearProtegido,

    // ---- Sheet: cubrir servicio ----
    candidatos,

    // ---- Sheet: asignación permanente ----
    asigProtNombre: protActualAsig.nombre,
    asigTitulares: st.equipo.map(e => {
      const on = asigActual.titular === e.nombre;
      return {
        nombre: e.nombre, ini: e.ini, on,
        bg: on ? color.accent200 : 'transparent', borde: on ? color.accent700 : color.neutral300,
        nota: e.estado === 'vacaciones' ? 'De vacaciones hasta el 20 SEP' : e.estado === 'servicio' ? 'Ahora con ' + e.cli : e.horas + ' h esta semana',
        onTap: () => setState(s => ({ asig: { ...s.asig, [protActualAsig.id]: { titular: e.nombre, suplente: s.asig[protActualAsig.id]?.suplente || protActualAsig.suplente } } })),
      };
    }),
    asigSuplentes: st.equipo.map(e => {
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
    puedeEditarServicio: coord && !!st.detalle?.extraId,
    abrirEditarServicio: () => {
      const item = st.extra.find(e => e.id === st.detalle?.extraId);
      if (!item) return;
      setState({
        sheet: 'nuevo',
        editandoServicioId: item.id,
        nuevo: { dia: item.dia, protegido: item.protegido, tipo: item.tipo, desde: item.desde, hasta: item.hasta, lugar: item.lugar, dotacion: item.dotacion.split(' · ').filter(Boolean) },
      });
    },
    cancelarServicio: () => {
      const d = st.detalle!;
      setState(s => ({ sheet: null, cancelados: s.cancelados.concat([d.dia + '|' + d.desde + '|' + d.protegido]) }));
      flash('Servicio cancelado · ' + d.protegido);
    },

    // ---- FAB / Sheet: nuevo servicio ----
    mostrarFab: coord && (tab === 'hoy' || tab === 'cal' || tab === 'prot'),
    abrirNuevo: () => setState({ sheet: 'nuevo', editandoServicioId: null }),
    editandoServicio: !!st.editandoServicioId,
    nvDias: SEMANA.map(d => ({ label: d.dia + ' ' + d.num, on: st.nuevo.dia === d.num, onTap: () => setState(s => ({ nuevo: { ...s.nuevo, dia: d.num } })) })),
    nvProtegidos: st.protegidos.map(p => ({ label: p.nombre, on: st.nuevo.protegido === p.nombre, onTap: () => setState(s => ({ nuevo: { ...s.nuevo, protegido: p.nombre } })) })),
    nvTipos: ['Evento', 'Traslado', 'Viaje', 'Refuerzo'].map(t => ({ label: t, on: st.nuevo.tipo === t, onTap: () => setState(s => ({ nuevo: { ...s.nuevo, tipo: t } })) })),
    nvDesde: st.nuevo.desde, nvLugar: st.nuevo.lugar,
    setNvDesde: (v: string) => setState(s => ({ nuevo: { ...s.nuevo, desde: v } })),
    setNvLugar: (v: string) => setState(s => ({ nuevo: { ...s.nuevo, lugar: v } })),
    nvDotacion: st.equipo.map(e => {
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
      if (st.editandoServicioId) {
        const id = st.editandoServicioId;
        setState(s => ({
          sheet: null, editandoServicioId: null,
          extra: s.extra.map(e => e.id === id
            ? { ...e, dia: n.dia, desde: n.desde, protegido: n.protegido, tipo: n.tipo, lugar: n.lugar || 'Lugar por confirmar', dotacion: n.dotacion.join(' · ') }
            : e),
        }));
        flash('Servicio actualizado · ' + n.protegido);
      } else {
        setState(s => ({
          sheet: null,
          extra: s.extra.concat([{ id: 's' + Date.now(), dia: n.dia, desde: n.desde, hasta: '', protegido: n.protegido, tipo: n.tipo, lugar: n.lugar || 'Lugar por confirmar', dotacion: n.dotacion.join(' · ') }]),
        }));
        flash('Servicio especial creado · ' + n.protegido);
      }
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
    sesionInfo: [
      { k: 'Último acceso', v: 'Hoy 05:41 · Madrid' },
      { k: 'Dispositivo', v: 'Pixel 8 · corporativo' },
      { k: 'Rol', v: coord ? 'Coordinación' : 'Escolta' },
    ],
    cerrarSesion: () => setState({ sesion: false, authView: 'login', tab: 'hoy', pass: '', authError: '' }),

    // ---- Bottom sheet chrome ----
    sheet: st.sheet,
    sheetTitulo: st.sheet === 'asignar' ? 'Cubrir servicio'
      : st.sheet === 'nuevo' ? (st.editandoServicioId ? 'Editar servicio especial' : 'Nuevo servicio especial')
      : st.sheet === 'asignacion' ? 'Asignación permanente'
      : st.sheet === 'detalle' ? 'Detalle del servicio'
      : st.sheet === 'historial' ? 'Historial de dotación'
      : st.sheet === 'nuevoEscolta' ? 'Añadir escolta'
      : st.sheet === 'nuevoProtegido' ? 'Añadir protegido'
      : st.sheet === 'nuevaHabilitacion' ? 'Añadir habilitación'
      : st.sheet === 'editarProtegido' ? 'Editar datos'
      : st.sheet === 'dotacionDetalle' ? dotacionDetalleTitulos[st.dotacionDetalleTipo]
      : st.sheet === 'editarJornada' ? 'Ciclo 14/7'
      : 'Solicitar días',
    sheetSub: st.sheet === 'asignar' ? 'Alberto Ferrán · desde las 19:00 · cena privada'
      : st.sheet === 'nuevo' ? (st.editandoServicioId ? 'Modifica los datos y guarda' : 'Se añade sobre el dispositivo permanente del protegido')
      : st.sheet === 'asignacion' ? 'Titular y suplente de ' + protActualAsig.nombre
      : st.sheet === 'detalle' ? (st.detalle ? st.detalle.protegido + ' · desde las ' + st.detalle.desde : '')
      : st.sheet === 'historial' ? 'Últimos 7 días, según el ciclo 14/7 y las asignaciones actuales'
      : st.sheet === 'nuevoEscolta' ? 'Se añade al equipo como disponible'
      : st.sheet === 'nuevoProtegido' ? 'Se añade con su titular y suplente fijos'
      : st.sheet === 'nuevaHabilitacion' ? 'Para ' + fichaEsc.nombre
      : st.sheet === 'editarProtegido' ? 'Nombre, rol, nivel y rutina'
      : st.sheet === 'dotacionDetalle' ? dotacion.fechaTxt
      : st.sheet === 'editarJornada' ? 'Un día en que ' + fichaEsc.nombre + ' empiece jornada — el resto del año se calcula solo'
      : 'Cupo máximo: 3 escoltas por semana',
    cerrarSheet: () => setState({ sheet: null, editandoServicioId: null }),

    // ---- Auth ----
    sesion: st.sesion,
    authView: st.authView,
    authKicker: st.authView === 'recuperar' ? 'Recuperar acceso' : 'Control de servicios',
    authTitulo: st.authView === 'recuperar' ? 'Acceso' : 'Relevo',
    authSub: st.authView === 'recuperar'
      ? 'Te enviaremos un enlace de restablecimiento al correo corporativo asociado a tu TIP.'
      : 'Accede con tu número TIP para consultar cuadrantes, disponibilidad y vacaciones.',
    tip: st.tip, pass: st.pass, correo: st.correo, authError: st.authError,
    setTip: (v: string) => setState({ tip: v, authError: '' }),
    setPass: (v: string) => setState({ pass: v, authError: '' }),
    setCorreo: (v: string) => setState({ correo: v }),
    entrar: () => {
      if (!st.tip || !st.pass) { setState({ authError: 'Introduce tu número TIP y tu contraseña.' }); return; }
      setState({ sesion: true, tab: 'hoy' });
      flash('Bienvenida, ' + (coord ? 'Carlos' : 'Marta'));
    },
    entrarHuella: () => { setState({ sesion: true, tab: 'hoy' }); flash('Sesión iniciada con huella'); },
    irRecuperar: () => setState({ authView: 'recuperar', authError: '' }),
    volverLogin: () => setState({ authView: 'login', authError: '' }),
    enviarRecuperacion: () => { setState({ authView: 'login' }); flash('Enlace enviado al correo corporativo'); },

    toast: st.toast,
    toastUndo,
    deshacerToast,
  };
}
