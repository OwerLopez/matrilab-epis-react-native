/**
 * Estado global con Context + useReducer. El reductor es la única puerta para modificar cupos,
 * de modo que la reserva se aplica de forma atómica (RF-05) aunque dos acciones lleguen seguidas.
 */
import { createContext, useContext, useMemo, useReducer, type Dispatch, type ReactNode } from 'react';
import { CURSOS, LABORATORIOS, MATRICULAS, TEORIA, TURNOS, USUARIOS, configInicial, nominaDemo } from '../domain/datos';
import { huella, liberarCupo, payloadQR, reservarCupo } from '../domain/reglas';
import type { ConfigMatricula, Laboratorio, Matricula, Rol, Turno, Usuario } from '../domain/types';

export interface Estado {
  usuario: Usuario | null;
  turnos: Turno[];
  matriculas: Matricula[];
  laboratorios: Laboratorio[];
  config: ConfigMatricula;
  /** Asistencias marcadas en la sesión actual: id de fila de nómina -> hora "HH:MM". */
  asistencias: Record<string, string>;
}

type Accion =
  | { tipo: 'INICIAR_SESION'; usuario: Usuario }
  | { tipo: 'CERRAR_SESION' }
  | { tipo: 'MATRICULAR'; turnoId: string; ahora: string }
  | { tipo: 'ANULAR'; matriculaId: string }
  | { tipo: 'MARCAR_ASISTENCIA'; filaId: string; hora: string }
  | { tipo: 'ACTUALIZAR_LABORATORIO'; laboratorio: Laboratorio }
  | { tipo: 'ACTUALIZAR_CONFIG'; config: ConfigMatricula };

export const estadoInicial: Estado = {
  usuario: null,
  turnos: TURNOS,
  matriculas: MATRICULAS,
  laboratorios: LABORATORIOS,
  config: configInicial(),
  asistencias: {},
};

export function reductor(e: Estado, a: Accion): Estado {
  switch (a.tipo) {
    case 'INICIAR_SESION':
      return { ...e, usuario: a.usuario };
    case 'CERRAR_SESION':
      return { ...e, usuario: null };
    case 'MATRICULAR': {
      if (!e.usuario) return e;
      const { turnos, reservado } = reservarCupo(e.turnos, a.turnoId);
      if (!reservado) return e;
      const id = `M-${String(e.matriculas.length + 1).padStart(4, '0')}`;
      return {
        ...e,
        turnos,
        matriculas: [...e.matriculas, { id, estudianteId: e.usuario.id, turnoId: a.turnoId, fecha: a.ahora, codigo: id, estado: 'confirmada' }],
      };
    }
    case 'ANULAR': {
      const m = e.matriculas.find((x) => x.id === a.matriculaId);
      if (!m || m.estado === 'anulada') return e;
      return {
        ...e,
        turnos: liberarCupo(e.turnos, m.turnoId),
        matriculas: e.matriculas.map((x) => (x.id === m.id ? { ...x, estado: 'anulada' } : x)),
      };
    }
    case 'MARCAR_ASISTENCIA':
      return e.asistencias[a.filaId] ? e : { ...e, asistencias: { ...e.asistencias, [a.filaId]: a.hora } };
    case 'ACTUALIZAR_LABORATORIO':
      return { ...e, laboratorios: e.laboratorios.map((l) => (l.id === a.laboratorio.id ? a.laboratorio : l)) };
    case 'ACTUALIZAR_CONFIG':
      return { ...e, config: a.config };
  }
}

const Contexto = createContext<{ estado: Estado; dispatch: Dispatch<Accion> } | null>(null);

export function ProveedorApp({ children }: { children: ReactNode }) {
  const [estado, dispatch] = useReducer(reductor, estadoInicial);
  const valor = useMemo(() => ({ estado, dispatch }), [estado]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useApp() {
  const v = useContext(Contexto);
  if (!v) throw new Error('useApp debe usarse dentro de ProveedorApp');
  return v;
}

// ---------- Selectores ----------

export const curso = (id: string) => CURSOS.find((c) => c.id === id)!;
export const usuario = (id: string) => USUARIOS.find((u) => u.id === id);
export const teoriaDelEstudiante = () => TEORIA;
export const usuarioDemo = (rol: Rol) => USUARIOS.find((u) => u.rol === rol)!;

export function matriculasActivas(e: Estado): Matricula[] {
  return e.matriculas.filter((m) => m.estado === 'confirmada' && m.estudianteId === e.usuario?.id);
}

export function laboratorio(e: Estado, id: string): Laboratorio {
  return e.laboratorios.find((l) => l.id === id)!;
}

/** Huella corta que el docente puede digitar si la cámara no está disponible. */
export function codigoVerificacion(m: Matricula): string {
  return huella(payloadQR(m).split('|').slice(0, 4).join('|'));
}

export interface FilaNomina {
  id: string;
  cui: string;
  nombre: string;
  correo: string;
  matriculaId?: string;
}

/** Nómina del turno: estudiantes de demostración más las matrículas reales hechas en la app. */
export function nomina(e: Estado, turnoId: string): FilaNomina[] {
  const turno = e.turnos.find((t) => t.id === turnoId)!;
  const reales = e.matriculas.filter((m) => m.turnoId === turnoId && m.estado === 'confirmada');
  const sinteticas = nominaDemo({ ...turno, cuposOcupados: Math.max(0, turno.cuposOcupados - reales.length) });
  const propias: FilaNomina[] = reales.map((m) => {
    const u = usuario(m.estudianteId)!;
    return { id: m.id, cui: u.cui ?? '', nombre: u.nombre, correo: u.correo, matriculaId: m.id };
  });
  return [...propias, ...sinteticas].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}
