/**
 * Datos de demostración del semestre 2026-B. Los nombres de estudiantes y docentes son ficticios,
 * salvo el de la cuenta de demostración del estudiante, que corresponde al equipo del laboratorio.
 */
import { aMinutos } from './reglas';
import type { ClaseTeoria, ConfigMatricula, Curso, Dia, Laboratorio, Matricula, Turno, Usuario } from './types';

export const CURSOS: Curso[] = [
  { id: 'PE', codigo: 'PE-VIII', nombre: 'Plataformas Emergentes (E)', creditos: 3, color: '#C3141E' },
  { id: 'CS', codigo: 'CS-VIII', nombre: 'Calidad de Software', creditos: 3, color: '#19375A' },
  { id: 'GPS', codigo: 'GPS-VIII', nombre: 'Gestión de Proyectos de Software', creditos: 3, color: '#2D7D5A' },
  { id: 'GSTI', codigo: 'GSTI-VIII', nombre: 'Gestión de Servicios de TI', creditos: 3, color: '#8A5A00' },
];

export const LABORATORIOS: Laboratorio[] = [
  { id: 'L1', nombre: 'Laboratorio 1', pabellon: 'Pabellón de Sistemas · 2.º piso', capacidadPcs: 25, operativo: true, equipamiento: 'Core i7 · 16 GB · Android Studio' },
  { id: 'L2', nombre: 'Laboratorio 2', pabellon: 'Pabellón de Sistemas · 2.º piso', capacidadPcs: 25, operativo: true, equipamiento: 'Core i5 · 16 GB · Docker' },
  { id: 'L3', nombre: 'Laboratorio 3', pabellon: 'Pabellón de Sistemas · 3.er piso', capacidadPcs: 20, operativo: true, equipamiento: 'Ryzen 7 · 32 GB · GPU' },
  { id: 'L4', nombre: 'Laboratorio 4', pabellon: 'Pabellón de Sistemas · 3.er piso', capacidadPcs: 25, operativo: false, equipamiento: 'Core i5 · 8 GB · en mantenimiento' },
  { id: 'CC', nombre: 'Centro de Cómputo', pabellon: 'Biblioteca de Ingenierías', capacidadPcs: 30, operativo: true, equipamiento: 'Core i7 · 16 GB · Office' },
];

export const USUARIOS: Usuario[] = [
  { id: 'E01', nombre: 'Lopez Arela, Ower Frank', correo: 'olopeza@unsa.edu.pe', rol: 'estudiante', cui: '20213412', semestre: 8 },
  { id: 'D01', nombre: 'Mg. Carla Medina Rojas', correo: 'cmedina@unsa.edu.pe', rol: 'docente' },
  { id: 'D02', nombre: 'Ing. Luis Paredes Vega', correo: 'lparedes@unsa.edu.pe', rol: 'docente' },
  { id: 'D03', nombre: 'Dr. Jorge Quispe Huanca', correo: 'jquispe@unsa.edu.pe', rol: 'docente' },
  { id: 'A01', nombre: 'Coordinación de Laboratorios', correo: 'laboratorios.epis@unsa.edu.pe', rol: 'admin' },
];

const t = (id: string, cursoId: string, grupo: string, dia: Dia, ini: string, fin: string, docenteId: string, laboratorioId: string, ocupados: number, total = 25): Turno => ({
  id, cursoId, grupo, dia, inicio: aMinutos(ini), fin: aMinutos(fin), docenteId, laboratorioId, cuposTotales: total, cuposOcupados: ocupados,
});

export const TURNOS: Turno[] = [
  t('PE-A', 'PE', 'A', 'LUN', '07:00', '08:40', 'D01', 'L1', 25),
  t('PE-B', 'PE', 'B', 'MAR', '14:00', '15:40', 'D01', 'L2', 19),
  t('PE-C', 'PE', 'C', 'JUE', '10:40', '12:20', 'D01', 'L3', 8, 20),
  t('CS-A', 'CS', 'A', 'LUN', '10:40', '12:20', 'D02', 'L2', 23),
  t('CS-B', 'CS', 'B', 'MIE', '08:50', '10:30', 'D02', 'L1', 12),
  t('GPS-A', 'GPS', 'A', 'MAR', '07:00', '08:40', 'D03', 'L3', 17, 20),
  t('GPS-B', 'GPS', 'B', 'VIE', '14:00', '15:40', 'D03', 'L1', 6),
  t('GSTI-A', 'GSTI', 'A', 'MIE', '14:00', '15:40', 'D02', 'L2', 21),
  t('GSTI-B', 'GSTI', 'B', 'JUE', '07:00', '08:40', 'D03', 'CC', 11, 30),
];

/** Teoría ya inscrita del estudiante de demostración: produce cruces reales con algunos grupos. */
export const TEORIA: ClaseTeoria[] = [
  { id: 'T-PE', cursoId: 'PE', dia: 'LUN', inicio: aMinutos('08:50'), fin: aMinutos('10:30'), aula: 'Aula 301' },
  { id: 'T-CS', cursoId: 'CS', dia: 'MIE', inicio: aMinutos('07:00'), fin: aMinutos('08:40'), aula: 'Aula 205' },
  { id: 'T-GPS', cursoId: 'GPS', dia: 'JUE', inicio: aMinutos('10:40'), fin: aMinutos('12:20'), aula: 'Aula 302' },
  { id: 'T-GSTI', cursoId: 'GSTI', dia: 'VIE', inicio: aMinutos('08:50'), fin: aMinutos('10:30'), aula: 'Aula 204' },
];

/** Estudiante de demostración ya matriculado en Calidad de Software (grupo B). */
export const MATRICULAS: Matricula[] = [
  { id: 'M-0001', estudianteId: 'E01', turnoId: 'CS-B', fecha: '2026-10-19T08:03:12-05:00', codigo: 'M-0001', estado: 'confirmada' },
];

/**
 * La ventana de matrícula de demostración se calcula respecto de la fecha actual
 * (abre ayer a las 08:00 y cierra en cuatro días) para que la app siempre pueda probarse.
 */
export function configInicial(ahora: Date = new Date()): ConfigMatricula {
  const inicio = new Date(ahora);
  inicio.setDate(inicio.getDate() - 1);
  inicio.setHours(8, 0, 0, 0);
  const fin = new Date(ahora);
  fin.setDate(fin.getDate() + 4);
  fin.setHours(23, 59, 0, 0);
  return {
    inicio: inicio.toISOString(),
    fin: fin.toISOString(),
    maxLaboratoriosPorEstudiante: 4,
    permitirAnulacion: true,
    notificarAforoCompleto: true,
  };
}

const NOMBRES = [
  'Apaza Mamani, Lucía Fernanda', 'Benavente Ccama, Renzo Alonso', 'Cáceres Huamán, Valeria Isabel', 'Chávez Flores, Diego Sebastián',
  'Condori Quispe, María José', 'Delgado Paz, Andrés Felipe', 'Espinoza Rivera, Camila Andrea', 'Flores Ticona, Bruno Martín',
  'Gutiérrez Salas, Ana Sofía', 'Huanca Choque, Kevin Joel', 'Linares Ortiz, Daniela Paola', 'Mendoza Torres, Joaquín Eduardo',
  'Núñez Vargas, Fiorella Antonia', 'Pacheco Rojas, Rodrigo Iván', 'Quispe Mamani, Brenda Lizeth', 'Ramos Cutipa, Sergio Alejandro',
  'Salinas Pérez, Nicole Abigail', 'Tapia Zúñiga, Gonzalo André', 'Urquizo Medina, Ariana Belén', 'Vilca Arce, Marco Antonio',
  'Yucra Lazo, Ximena Rocío', 'Zapata Coaguila, Luis Fernando', 'Alvarado Neyra, Paula Cristina', 'Bustamante Ríos, Hugo Daniel',
  'Coaquira Pari, Karla Noemí', 'Díaz Llerena, Mauricio José', 'Escobar Tejada, Silvia Mercedes', 'Gallegos Huerta, Adrián Elías',
  'Herrera Mendoza, Gabriela Inés', 'Ibáñez Calla, Franco Rafael',
];

/** Nómina sintética por turno, coherente con los cupos ocupados de cada grupo. */
export function nominaDemo(turno: Turno): { id: string; cui: string; nombre: string; correo: string }[] {
  const desplazamiento = TURNOS.findIndex((x) => x.id === turno.id) * 3;
  return Array.from({ length: turno.cuposOcupados }, (_, i) => {
    const nombre = NOMBRES[(i + desplazamiento) % NOMBRES.length];
    const usuario = nombre.split(',')[0].split(' ')[0].toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    return {
      id: `${turno.id}-${i + 1}`,
      cui: String(20210000 + ((i * 37 + desplazamiento * 11) % 9000)).padStart(8, '0'),
      nombre,
      correo: `${nombre.split(', ')[1][0].toLowerCase()}${usuario}@unsa.edu.pe`,
    };
  });
}
