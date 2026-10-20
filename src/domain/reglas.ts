/**
 * Reglas de negocio puras de MatriLab. No dependen de React ni de la plataforma,
 * por eso se prueban con Jest sin emulador (ver __tests__/reglas.test.ts).
 */
import type { Bloque, ClaseTeoria, ConfigMatricula, Dia, Matricula, Semaforo, Turno } from './types';

export const DIAS: Dia[] = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
export const NOMBRE_DIA: Record<Dia, string> = {
  LUN: 'Lunes', MAR: 'Martes', MIE: 'Miércoles', JUE: 'Jueves', VIE: 'Viernes', SAB: 'Sábado',
};

/** "07:00" -> 420 */
export function aMinutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

/** 420 -> "07:00" */
export function aHora(minutos: number): string {
  const h = Math.floor(minutos / 60).toString().padStart(2, '0');
  const m = (minutos % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

export function rango(b: Bloque): string {
  return `${aHora(b.inicio)}–${aHora(b.fin)}`;
}

/** RN-02: dos bloques se cruzan si comparten día y sus intervalos se solapan (los extremos no cuentan). */
export function haySolape(a: Bloque, b: Bloque): boolean {
  return a.dia === b.dia && a.inicio < b.fin && b.inicio < a.fin;
}

export function cuposLibres(t: Turno): number {
  return Math.max(0, t.cuposTotales - t.cuposOcupados);
}

/** Semáforo de vacantes: rojo sin cupo, ámbar con menos del 30 % libre, verde en otro caso. */
export function semaforo(t: Turno): Semaforo {
  const libres = cuposLibres(t);
  if (libres === 0) return 'rojo';
  return libres / t.cuposTotales < 0.3 ? 'ambar' : 'verde';
}

export function ventanaAbierta(config: ConfigMatricula, ahora: Date): boolean {
  const t = ahora.getTime();
  return t >= new Date(config.inicio).getTime() && t <= new Date(config.fin).getTime();
}

export type ResultadoValidacion =
  | { ok: true }
  | { ok: false; motivo: 'VENTANA_CERRADA' | 'SIN_CUPO' | 'YA_MATRICULADO' | 'MISMO_CURSO' | 'LIMITE' | 'CRUCE'; detalle: string };

export interface ContextoValidacion {
  turno: Turno;
  turnos: Turno[];
  teoria: ClaseTeoria[];
  matriculasActivas: Matricula[];
  config: ConfigMatricula;
  ahora: Date;
  nombreCurso: (cursoId: string) => string;
}

/** Valida una solicitud de matrícula en el mismo orden del proceso BPMN definido en el LAB 01. */
export function validarMatricula(c: ContextoValidacion): ResultadoValidacion {
  if (!ventanaAbierta(c.config, c.ahora)) {
    return { ok: false, motivo: 'VENTANA_CERRADA', detalle: 'La ventana de matrícula no está abierta.' };
  }
  const propios = c.matriculasActivas
    .map((m) => c.turnos.find((t) => t.id === m.turnoId))
    .filter((t): t is Turno => Boolean(t));

  if (propios.some((t) => t.id === c.turno.id)) {
    return { ok: false, motivo: 'YA_MATRICULADO', detalle: 'Ya estás matriculado en este grupo.' };
  }
  if (propios.some((t) => t.cursoId === c.turno.cursoId)) {
    return { ok: false, motivo: 'MISMO_CURSO', detalle: 'Ya tienes un grupo de laboratorio de este curso.' };
  }
  if (propios.length >= c.config.maxLaboratoriosPorEstudiante) {
    return { ok: false, motivo: 'LIMITE', detalle: `El máximo es ${c.config.maxLaboratoriosPorEstudiante} laboratorios por estudiante.` };
  }
  const cruceLab = propios.find((t) => haySolape(t, c.turno));
  if (cruceLab) {
    return { ok: false, motivo: 'CRUCE', detalle: `Se cruza con el laboratorio de ${c.nombreCurso(cruceLab.cursoId)} (${NOMBRE_DIA[cruceLab.dia]} ${rango(cruceLab)}).` };
  }
  const cruceTeoria = c.teoria.find((t) => haySolape(t, c.turno));
  if (cruceTeoria) {
    return { ok: false, motivo: 'CRUCE', detalle: `Se cruza con la teoría de ${c.nombreCurso(cruceTeoria.cursoId)} (${NOMBRE_DIA[cruceTeoria.dia]} ${rango(cruceTeoria)}).` };
  }
  if (cuposLibres(c.turno) === 0) {
    return { ok: false, motivo: 'SIN_CUPO', detalle: 'El grupo no tiene vacantes disponibles.' };
  }
  return { ok: true };
}

/**
 * RF-05: reserva el cupo de forma atómica sobre el arreglo inmutable de turnos.
 * Si entre la consulta y la confirmación el cupo se agotó, no modifica nada.
 */
export function reservarCupo(turnos: Turno[], turnoId: string): { turnos: Turno[]; reservado: boolean } {
  const objetivo = turnos.find((t) => t.id === turnoId);
  if (!objetivo || cuposLibres(objetivo) === 0) return { turnos, reservado: false };
  return {
    reservado: true,
    turnos: turnos.map((t) => (t.id === turnoId ? { ...t, cuposOcupados: t.cuposOcupados + 1 } : t)),
  };
}

export function liberarCupo(turnos: Turno[], turnoId: string): Turno[] {
  return turnos.map((t) => (t.id === turnoId && t.cuposOcupados > 0 ? { ...t, cuposOcupados: t.cuposOcupados - 1 } : t));
}

/** Huella FNV-1a de 32 bits: identifica el pase sin depender de librerías nativas. No es un hash criptográfico. */
export function huella(texto: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).toUpperCase().padStart(8, '0');
}

/** Contenido del código QR: "MATRILAB|<matricula>|<turno>|<estudiante>|<huella>". */
export function payloadQR(m: Pick<Matricula, 'id' | 'turnoId' | 'estudianteId'>): string {
  const base = `MATRILAB|${m.id}|${m.turnoId}|${m.estudianteId}`;
  return `${base}|${huella(base)}`;
}

/** Comprueba que un QR leído tenga el formato esperado y una huella íntegra. */
export function verificarQR(texto: string): { valido: boolean; matriculaId?: string } {
  const partes = texto.split('|');
  if (partes.length !== 5 || partes[0] !== 'MATRILAB') return { valido: false };
  const base = partes.slice(0, 4).join('|');
  return huella(base) === partes[4] ? { valido: true, matriculaId: partes[1] } : { valido: false };
}

/** RF-10: nómina en CSV con separador ";" (Excel en español lo abre sin asistente). */
export function nominaCSV(filas: { cui: string; nombre: string; correo: string; asistio: boolean }[]): string {
  const cab = 'CUI;Apellidos y nombres;Correo;Asistencia';
  const cuerpo = filas.map((f) => [f.cui, f.nombre, f.correo, f.asistio ? 'Presente' : 'Pendiente'].join(';'));
  return [cab, ...cuerpo].join('\n');
}

/** Ordena bloques por día y hora para listas cronológicas. */
export function ordenarBloques<T extends Bloque>(bloques: T[]): T[] {
  return [...bloques].sort((a, b) => DIAS.indexOf(a.dia) - DIAS.indexOf(b.dia) || a.inicio - b.inicio);
}
