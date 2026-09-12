import { ANCLA } from '../data/mock';

// Ciclo 14/7: 14 días de jornada, 7 de libranza. Ported 1:1 from the prototype.
export function diaCiclo(fecha: number, nombre: string): number {
  const dias = Math.round((fecha - Date.UTC(2026, 0, 1)) / 86400000);
  return (((dias + (ANCLA[nombre] || 0)) % 21) + 21) % 21;
}

export function enJornada(fecha: number, nombre: string): boolean {
  return diaCiclo(fecha, nombre) < 14;
}
