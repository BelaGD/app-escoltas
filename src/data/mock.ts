// Mock data ported verbatim from the Claude Design prototype
// (project/Turnos Escoltas.dc.html, lines 822-921).
// "Today" in the prototype's fixed sample data is always Saturday 12 Sep 2026.

import { color } from '../theme/theme';

export const WARN = color.warn;
export const MUT = color.neutral600;
export const AC = color.accent700;

export const HOY = Date.UTC(2026, 8, 12);

export type EstadoEscolta = 'servicio' | 'disponible' | 'descanso' | 'vacaciones' | 'baja';

export interface Cert {
  id: string;
  nombre: string;
  num: string;
  vence: string;
  alerta: boolean;
}

export interface Escolta {
  id: number;
  nombre: string;
  ini: string;
  estado: EstadoEscolta;
  horas: number;
  cli: string;
  certs: Cert[];
}

const CERTS_BASE: Omit<Cert, 'id'>[] = [
  { nombre: 'TIP habilitación escolta', num: 'Nº 41.882', vence: 'Vence 04/2028', alerta: false },
  { nombre: 'Licencia de armas tipo C', num: 'Nº C-77 214', vence: 'Vence 11/2026', alerta: true },
  { nombre: 'Tiro obligatorio', num: '2º semestre', vence: 'Hecho 06/2026', alerta: false },
  { nombre: 'Primeros auxilios', num: 'Cruz Roja', vence: 'Vence 02/2027', alerta: false },
];
function certsIniciales(escoltaId: number): Cert[] {
  return CERTS_BASE.map((c, i) => ({ ...c, id: escoltaId + '-c' + i }));
}

type EscoltaSeed = Omit<Escolta, 'certs'>;
const EQUIPO_SEED: EscoltaSeed[] = [
  { id: 1, nombre: 'Marta Ríos', ini: 'MR', estado: 'servicio', horas: 41, cli: 'Alberto Ferrán' },
  { id: 2, nombre: 'Iván Colmenar', ini: 'IC', estado: 'servicio', horas: 44, cli: 'Alberto Ferrán · relevo' },
  { id: 3, nombre: 'Nuria Palau', ini: 'NP', estado: 'disponible', horas: 28, cli: '' },
  { id: 4, nombre: 'Damián Sosa', ini: 'DS', estado: 'disponible', horas: 33, cli: '' },
  { id: 5, nombre: 'Elena Bustos', ini: 'EB', estado: 'servicio', horas: 39, cli: 'Carmen Rivas' },
  { id: 6, nombre: 'Rubén Cid', ini: 'RC', estado: 'descanso', horas: 46, cli: '' },
  { id: 7, nombre: 'Aitor Lemos', ini: 'AL', estado: 'vacaciones', horas: 0, cli: '' },
  { id: 8, nombre: 'Sara Quintana', ini: 'SQ', estado: 'disponible', horas: 22, cli: '' },
  { id: 9, nombre: 'Jon Aramburu', ini: 'JA', estado: 'servicio', horas: 37, cli: 'Tomás Ferrán' },
  { id: 10, nombre: 'Lucía Vega', ini: 'LV', estado: 'descanso', horas: 43, cli: '' },
  { id: 11, nombre: 'Óscar Tena', ini: 'OT', estado: 'vacaciones', horas: 0, cli: '' },
  { id: 12, nombre: 'Paula Serna', ini: 'PS', estado: 'disponible', horas: 30, cli: '' },
];
export const EQUIPO_INICIAL: Escolta[] = EQUIPO_SEED.map(e => ({ ...e, certs: certsIniciales(e.id) }));

export const EST: Record<EstadoEscolta, { txt: string; tag: 'accent' | 'outline' | 'neutral' }> = {
  servicio: { txt: 'EN SERVICIO', tag: 'accent' },
  disponible: { txt: 'DISPONIBLE', tag: 'outline' },
  descanso: { txt: 'DESCANSO', tag: 'neutral' },
  vacaciones: { txt: 'VACACIONES', tag: 'neutral' },
  baja: { txt: 'DE BAJA', tag: 'neutral' },
};

export const SEMANA = [
  { dia: 'LUN', num: 7 },
  { dia: 'MAR', num: 8 },
  { dia: 'MIÉ', num: 9 },
  { dia: 'JUE', num: 10 },
  { dia: 'VIE', num: 11 },
  { dia: 'SÁB', num: 12 },
  { dia: 'DOM', num: 13 },
];

export type EstadoProtegido = 'con' | 'relevo' | 'sin';

export interface Protegido {
  id: string;
  nombre: string;
  rol: string;
  nivel: string;
  titular: string;
  tit: string;
  suplente: string;
  inicio: string;
  rutina: string;
  estado: EstadoProtegido;
  telefono: string;
}

export const PROTEGIDOS_INICIAL: Protegido[] = [
  { id: 'p1', nombre: 'Alberto Ferrán', rol: 'Principal · Grupo Ferrán', nivel: 'NIVEL 3', titular: 'Marta Ríos', tit: 'MR', suplente: 'Iván Colmenar', inicio: '06:00', rutina: 'Presentación 06:00 · residencia, oficina y agenda', estado: 'con', telefono: '+34 611 220 034' },
  { id: 'p2', nombre: 'Carmen Rivas', rol: 'Cónyuge', nivel: 'NIVEL 2', titular: 'Elena Bustos', tit: 'EB', suplente: 'Nuria Palau', inicio: '08:30', rutina: 'Presentación 08:30 · fundación y agenda social', estado: 'con', telefono: '+34 611 220 035' },
  { id: 'p3', nombre: 'Elisa Ferrán', rol: 'Hija · 14 años', nivel: 'NIVEL 2', titular: 'Lucía Vega', tit: 'LV', suplente: 'Paula Serna', inicio: '07:15', rutina: 'Presentación 07:15 · colegio y extraescolares', estado: 'relevo', telefono: '+34 611 220 036' },
  { id: 'p4', nombre: 'Tomás Ferrán', rol: 'Hijo · 9 años', nivel: 'NIVEL 1', titular: 'Jon Aramburu', tit: 'JA', suplente: 'Damián Sosa', inicio: '07:15', rutina: 'Presentación 07:15 · colegio y domicilio', estado: 'con', telefono: '+34 611 220 037' },
  { id: 'p5', nombre: 'Rosa Ferrán', rol: 'Madre · residencia', nivel: 'NIVEL 1', titular: 'Rubén Cid', tit: 'RC', suplente: 'Sara Quintana', inicio: '09:00', rutina: 'Presentación 09:00 · domicilio y clínica', estado: 'sin', telefono: '+34 611 220 038' },
];

export const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export const ANCLA: Record<string, number> = {
  'Marta Ríos': 0, 'Iván Colmenar': 14, 'Elena Bustos': 3, 'Nuria Palau': 17, 'Lucía Vega': 7,
  'Paula Serna': 0, 'Jon Aramburu': 10, 'Damián Sosa': 3, 'Rubén Cid': 17, 'Sara Quintana': 7,
  'Aitor Lemos': 10, 'Óscar Tena': 14,
};

export const EST_PROT: Record<EstadoProtegido, { txt: string; tag: 'accent' | 'outline' | 'neutral' }> = {
  con: { txt: 'CON PROTEGIDO', tag: 'accent' },
  relevo: { txt: 'EN RELEVO', tag: 'outline' },
  sin: { txt: 'SIN COBERTURA', tag: 'neutral' },
};

// [desde, hasta, protegido, tipo, dotación]
export type ServicioRaw = [string, string, string, string, string];

export const DIA_SERV: Record<number, ServicioRaw[]> = {
  7: [['19:30', '23:30', 'Carmen Rivas', 'Gala benéfica · Hotel Ritz', 'E. Bustos · N. Palau']],
  8: [['07:00', '15:00', 'Alberto Ferrán', 'Viaje Barcelona · ida y vuelta', 'M. Ríos · I. Colmenar']],
  9: [
    ['09:00', '13:00', 'Rosa Ferrán', 'Consulta · Clínica Aurora', 'R. Cid'],
    ['16:30', '20:00', 'Elisa Ferrán', 'Torneo escolar · Pozuelo', 'L. Vega'],
  ],
  10: [
    ['08:00', '18:00', 'Alberto Ferrán', 'Consejo de administración', 'M. Ríos · D. Sosa'],
    ['17:00', '21:00', 'Tomás Ferrán', 'Cumpleaños familiar · Aravaca', 'J. Aramburu'],
  ],
  11: [['10:00', '14:00', 'Carmen Rivas', 'Acto institucional · Ayuntamiento', 'E. Bustos']],
  12: [
    ['09:30', '13:00', 'Elisa Ferrán', 'Competición · Club Hípico', 'L. Vega'],
    ['19:00', '01:30', 'Alberto Ferrán', 'Cena privada · Casa de Campo', ''],
  ],
  13: [['12:00', '18:00', 'Familia completa', 'Almuerzo · finca de Toledo', 'M. Ríos · E. Bustos · J. Aramburu']],
};

export interface Solicitud {
  id: string;
  nombre: string;
  rango: string;
  dias: string;
  aviso: string;
  warn: boolean;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
}

export const SOLICITUDES_INICIALES: Solicitud[] = [
  { id: 'a', nombre: 'Rubén Cid', rango: '22 SEP – 03 OCT', dias: '10 días laborables', aviso: 'Coincide con Lucía Vega (2 de 3 del cupo)', warn: false, estado: 'pendiente' },
  { id: 'b', nombre: 'Sara Quintana', rango: '29 SEP – 05 OCT', dias: '5 días laborables', aviso: 'Deja el nocturno de Clínica Aurora sin relevo', warn: true, estado: 'pendiente' },
  { id: 'c', nombre: 'Aitor Lemos', rango: '01 SEP – 19 SEP', dias: '15 días laborables', aviso: '', warn: false, estado: 'aprobada' },
  { id: 'd', nombre: 'Óscar Tena', rango: '08 SEP – 16 SEP', dias: '7 días laborables', aviso: '', warn: false, estado: 'aprobada' },
  { id: 'e', nombre: 'Jon Aramburu', rango: '24 DIC – 02 ENE', dias: '6 días laborables', aviso: '', warn: false, estado: 'rechazada' },
];

export interface MiSolicitud {
  id: string;
  rango: string;
  dias: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
}

export const MIS_SOLICITUDES_INICIALES: MiSolicitud[] = [
  { id: 'm1', rango: '13 OCT – 19 OCT', dias: '5 días laborables', estado: 'pendiente' },
  { id: 'm2', rango: '04 AGO – 22 AGO', dias: '15 días laborables', estado: 'aprobada' },
];

export const CUPO_DATA: [string, number][] = [
  ['1–7', 2], ['8–14', 3], ['15–21', 1], ['22–28', 2], ['29–5', 3], ['6–12', 0],
];


export interface Notif {
  id: string;
  tipo: string;
  texto: string;
  hora: string;
  leida: boolean;
  urgente: boolean;
}

export const NOTIFS_INICIALES: Notif[] = [
  { id: 'n1', tipo: 'Cobertura', texto: 'Familia Rivas 19:00 sigue sin dotación asignada.', hora: 'hace 12 min', leida: false, urgente: true },
  { id: 'n2', tipo: 'Vacaciones', texto: 'Sara Quintana solicita del 29 SEP al 05 OCT.', hora: 'hace 1 h', leida: false, urgente: false },
  { id: 'n3', tipo: 'Habilitación', texto: 'La licencia de armas de M. Ríos vence en 60 días.', hora: 'ayer', leida: false, urgente: true },
  { id: 'n4', tipo: 'Cuadrante', texto: 'Consulado NL amplió el estático del sábado a 10 h.', hora: 'ayer', leida: true, urgente: false },
  { id: 'n5', tipo: 'Fichaje', texto: 'J. Aramburu cerró servicio a las 22:07.', hora: 'jue', leida: true, urgente: false },
];
