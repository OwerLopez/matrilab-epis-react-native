/** Modelo de dominio de MatriLab EPIS-UNSA (heredado de los laboratorios 01 y 02). */

export type Rol = 'estudiante' | 'docente' | 'admin';

export type Dia = 'LUN' | 'MAR' | 'MIE' | 'JUE' | 'VIE' | 'SAB';

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
  cui?: string;
  semestre?: number;
}

export interface Laboratorio {
  id: string;
  nombre: string;
  pabellon: string;
  capacidadPcs: number;
  operativo: boolean;
  equipamiento: string;
}

export interface Curso {
  id: string;
  codigo: string;
  nombre: string;
  creditos: number;
  color: string;
}

/** Bloque horario en minutos desde las 00:00 para comparar sin ambigüedad. */
export interface Bloque {
  dia: Dia;
  inicio: number;
  fin: number;
}

export interface Turno extends Bloque {
  id: string;
  cursoId: string;
  grupo: string;
  docenteId: string;
  laboratorioId: string;
  cuposTotales: number;
  cuposOcupados: number;
}

/** Clase de teoría ya registrada en el horario del estudiante (no se matricula aquí). */
export interface ClaseTeoria extends Bloque {
  id: string;
  cursoId: string;
  aula: string;
}

export interface Matricula {
  id: string;
  estudianteId: string;
  turnoId: string;
  fecha: string;
  codigo: string;
  estado: 'confirmada' | 'anulada';
}

export interface Asistencia {
  id: string;
  matriculaId: string;
  fecha: string;
  hora: string;
  validadoPor: string;
}

export interface ConfigMatricula {
  inicio: string;
  fin: string;
  maxLaboratoriosPorEstudiante: number;
  permitirAnulacion: boolean;
  notificarAforoCompleto: boolean;
}

export type Semaforo = 'verde' | 'ambar' | 'rojo';
