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
export type Tab = 'hoy' | 'cal' | 'vac' | 'prot' | 'equipo' | 'perfil' | 'ficha' | 'notif' | 'ajustes';
export type Sheet = 'asignar' | 'nuevo' | 'asignacion' | 'detalle' | 'solicitud' | 'historial' | 'nuevoEscolta' | 'nuevoProtegido' | 'nuevaHabilitacion' | 'editarProtegido' | null;
export type AuthView = 'login' | 'recuperar';
export type CalVista = 'Semana' | 'Mes' | 'Año';

export interface ServicioExtra {
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
  dia: number;
  filtro: string;
  fichaId: number | null;
  sheet: Sheet;
  toast: string;
  cubierto: string | null;
  equipo: Escolta[];
  protegidos: Protegido[];
  nuevoEscoltaNombre: string;
  nuevoProtegido: { nombre: string; rol: string; nivel: string; titular: string; suplente: string; inicio: string; rutina: string };
  nuevaHab: { nombre: string; num: string; vence: string; alerta: boolean };
  editProtegido: { id: string; nombre: string; rol: string; nivel: string; rutina: string };
  solicitudes: Solicitud[];
  misSolicitudes: MiSolicitud[];
  vacDesde: string;
  vacHasta: string;
  vacMotivo: string;
  refuerzo: boolean;
  confirmado: boolean;
  cerrado: string;
  fechaDot: string;
  calVista: CalVista;
  calEscolta: string;
  calMes: number;
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
  idioma: string;
  prefs: { servicio: boolean; vacaciones: boolean; silencio: boolean };
  notifs: Notif[];
}

export const initialState: AppState = {
  rol: 'coord',
  tab: 'hoy',
  dia: 12,
  filtro: 'Todos',
  fichaId: null,
  sheet: null,
  toast: '',
  cubierto: null,
  equipo: EQUIPO_INICIAL,
  protegidos: PROTEGIDOS_INICIAL,
  nuevoEscoltaNombre: '',
  nuevoProtegido: { nombre: '', rol: '', nivel: 'NIVEL 1', titular: '', suplente: '', inicio: '08:00', rutina: '' },
  nuevaHab: { nombre: '', num: '', vence: '', alerta: false },
  editProtegido: { id: '', nombre: '', rol: '', nivel: 'NIVEL 1', rutina: '' },
  solicitudes: SOLICITUDES_INICIALES,
  misSolicitudes: MIS_SOLICITUDES_INICIALES,
  vacDesde: '13/10/2026',
  vacHasta: '19/10/2026',
  vacMotivo: '',
  refuerzo: true,
  confirmado: false,
  cerrado: '',
  fechaDot: '2026-09-12',
  calVista: 'Semana',
  calEscolta: 'Marta Ríos',
  calMes: 8,
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
  idioma: 'Español',
  prefs: { servicio: true, vacaciones: true, silencio: false },
  notifs: NOTIFS_INICIALES,
};

export type Patch = Partial<AppState> | ((s: AppState) => Partial<AppState>);

interface StoreValue {
  state: AppState;
  setState: (patch: Patch) => void;
  flash: (text: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setStateRaw] = useState<AppState>(initialState);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mirrors this.setState from the prototype: accepts a partial object or
  // an updater function receiving the previous state.
  const setState = useCallback((patch: Patch) => {
    setStateRaw(prev => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }));
  }, []);

  const flash = useCallback((text: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setState({ toast: text });
    toastTimer.current = setTimeout(() => setState({ toast: '' }), 2600);
  }, [setState]);

  return (
    <StoreContext.Provider value={{ state, setState, flash }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
