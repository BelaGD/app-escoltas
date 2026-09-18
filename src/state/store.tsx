import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import {
  Escolta,
  EQUIPO_INICIAL,
  MIS_SOLICITUDES_INICIALES,
  MiSolicitud,
  NOTIFS_INICIALES,
  Notif,
  Protegido,
  PROTEGIDOS_INICIAL,
  Solicitud,
  SOLICITUDES_INICIALES,
} from '../data/mock';

export type Rol = 'coord' | 'escolta';
export type Tab = 'hoy' | 'cal' | 'vac' | 'prot' | 'equipo' | 'perfil' | 'ficha' | 'notif' | 'ajustes' | 'reporte';
export type Sheet = 'asignar' | 'nuevo' | 'asignacion' | 'detalle' | 'solicitud' | 'historial' | 'nuevoEscolta' | 'nuevoProtegido' | 'nuevaHabilitacion' | 'editarProtegido' | 'dotacionDetalle' | 'editarJornada' | null;
export type DotacionDetalleTipo = 'con' | 'libres' | 'libranza' | 'vac' | 'baja';
export type AuthView = 'login' | 'recuperar';
export type CalVista = 'Semana' | 'Mes' | 'Año';

export interface ServicioExtra {
  id: string;
  dia: number;
  desde: string;
  hasta: string;
  protegido: string;
  tipo: string;
  lugar: string;
  dotacion: string;
}

export interface Asignacion {
  titular?: string;
  suplente?: string;
}

export interface Detalle {
  dia: number;
  desde: string;
  hasta: string;
  protegido: string;
  tipo: string;
  dotacion: string;
  extraId?: string;
  telefono?: string;
}

export interface Fichaje {
  id: string;
  escoltaNombre: string;
  protegido: string;
  horaConfirmado: string;
  confirmadoTs: number;
  horaCierre: string | null;
  duracion: string | null;
}

export interface NuevoServicio {
  dia: number;
  protegido: string;
  tipo: string;
  desde: string;
  hasta: string;
  lugar: string;
  dotacion: string[];
}

export interface AppState {
  rol: Rol;
  tab: Tab;
  filtro: string;
  buscarEquipo: string;
  fichaId: number | null;
  sheet: Sheet;
  toast: string;
  cubierto: string | null;
  equipo: Escolta[];
  protegidos: Protegido[];
  nuevoEscoltaNombre: string;
  nuevoEscoltaInicio: string;
  nuevoProtegido: { nombre: string; codigo: string; rol: string; nivel: string; titular: string; suplente: string; inicio: string; rutina: string; telefono: string };
  nuevaHab: { nombre: string; num: string; vence: string; alerta: boolean };
  editProtegido: { id: string; nombre: string; codigo: string; rol: string; nivel: string; rutina: string; telefono: string };
  dotacionDetalleTipo: DotacionDetalleTipo;
  editarJornadaFecha: string;
  editandoServicioId: string | null;
  solicitudes: Solicitud[];
  misSolicitudes: MiSolicitud[];
  vacDesde: string;
  vacHasta: string;
  vacMotivo: string;
  refuerzo: boolean;
  confirmado: boolean;
  cerrado: string;
  horaSalidaManana: string;
  fechaDot: string;
  calVista: CalVista;
  calEscolta: string;
  calMes: number;
  calSemanaInicio: string;
  extra: ServicioExtra[];
  asig: Record<string, Asignacion>;
  cancelados: string[];
  detalle: Detalle | null;
  asigProt: string;
  asigDesde: string;
  nuevo: NuevoServicio;
  sesion: boolean;
  authView: AuthView;
  tip: string;
  pass: string;
  correo: string;
  authError: string;
  prefs: { servicio: boolean; vacaciones: boolean; silencio: boolean };
  notifs: Notif[];
  fichajes: Fichaje[];
}

export const initialState: AppState = {
  rol: 'coord',
  tab: 'hoy',
  filtro: 'Todos',
  buscarEquipo: '',
  fichaId: null,
  sheet: null,
  toast: '',
  cubierto: null,
  equipo: EQUIPO_INICIAL,
  protegidos: PROTEGIDOS_INICIAL,
  nuevoEscoltaNombre: '',
  nuevoEscoltaInicio: '2026-01-01',
  nuevoProtegido: { nombre: '', codigo: '', rol: '', nivel: 'NIVEL 1', titular: '', suplente: '', inicio: '08:00', rutina: '', telefono: '' },
  nuevaHab: { nombre: '', num: '', vence: '', alerta: false },
  editProtegido: { id: '', nombre: '', codigo: '', rol: '', nivel: 'NIVEL 1', rutina: '', telefono: '' },
  dotacionDetalleTipo: 'con',
  editarJornadaFecha: '2026-01-01',
  editandoServicioId: null,
  solicitudes: SOLICITUDES_INICIALES,
  misSolicitudes: MIS_SOLICITUDES_INICIALES,
  vacDesde: '20/09/2026',
  vacHasta: '26/09/2026',
  vacMotivo: '',
  refuerzo: true,
  confirmado: false,
  cerrado: '',
  horaSalidaManana: '06:00',
  fechaDot: '2026-09-12',
  calVista: 'Semana',
  calEscolta: 'Marta Ríos',
  calMes: 8,
  calSemanaInicio: '2026-09-07',
  extra: [],
  asig: {},
  cancelados: [],
  detalle: null,
  asigProt: 'p1',
  asigDesde: '15/09/2026',
  nuevo: { dia: 12, protegido: 'Alberto Ferrán', tipo: 'Evento', desde: '19:00', hasta: '23:30', lugar: '', dotacion: ['M. Ríos'] },
  sesion: false,
  authView: 'login',
  tip: '',
  pass: '',
  correo: '',
  authError: '',
  prefs: { servicio: true, vacaciones: true, silencio: false },
  notifs: NOTIFS_INICIALES,
  fichajes: [],
};

export type Patch = Partial<AppState> | ((s: AppState) => Partial<AppState>);

interface StoreValue {
  state: AppState;
  setState: (patch: Patch) => void;
  flash: (text: string, onDeshacer?: () => void) => void;
  toastUndo: (() => void) | null;
  deshacerToast: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setStateRaw] = useState<AppState>(initialState);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastUndoRef = useRef<(() => void) | null>(null);

  // Mirrors this.setState from the prototype: accepts a partial object or
  // an updater function receiving the previous state.
  const setState = useCallback((patch: Patch) => {
    setStateRaw(prev => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }));
  }, []);

  // A destructive action can pass onDeshacer to offer a brief "Deshacer"
  // window on the toast instead of applying the change irreversibly.
  const flash = useCallback((text: string, onDeshacer?: () => void) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastUndoRef.current = onDeshacer || null;
    setState({ toast: text });
    toastTimer.current = setTimeout(() => {
      toastUndoRef.current = null;
      setState({ toast: '' });
    }, onDeshacer ? 4500 : 2600);
  }, [setState]);

  const deshacerToast = useCallback(() => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    const fn = toastUndoRef.current;
    toastUndoRef.current = null;
    setState({ toast: '' });
    fn?.();
  }, [setState]);

  return (
    <StoreContext.Provider value={{ state, setState, flash, toastUndo: toastUndoRef.current, deshacerToast }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
