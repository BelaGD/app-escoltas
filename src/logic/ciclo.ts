// Ciclo 14/7: 14 días de jornada, 7 de libranza, en un ciclo de 21 días.
// Cada escolta fija UNA fecha de referencia (inicioJornada, "YYYY-MM-DD" —
// cualquier día en que empiece uno de sus bloques de 14 días de jornada) y
// todo el resto del año se calcula solo a partir de ahí: no hay que volver
// a configurar nada, el patrón se repite automáticamente.

// Desplazamiento (ancla) que hace que diaCiclo() dé 0 justo en inicioJornada.
export function anclaDesde(inicioJornada: string): number {
  const [y, m, d] = (inicioJornada || '2026-01-01').split('-').map(Number);
  const valido = Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d);
  const diasR = valido
    ? Math.round((Date.UTC(y, m - 1, d) - Date.UTC(2026, 0, 1)) / 86400000)
    : 0;
  return (((-diasR % 21) + 21) % 21);
}

export function diaCiclo(fecha: number, inicioJornada: string): number {
  const dias = Math.round((fecha - Date.UTC(2026, 0, 1)) / 86400000);
  return ((dias + anclaDesde(inicioJornada)) % 21 + 21) % 21;
}

export function enJornada(fecha: number, inicioJornada: string): boolean {
  return diaCiclo(fecha, inicioJornada) < 14;
}
