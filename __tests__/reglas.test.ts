import { CURSOS, MATRICULAS, TEORIA, TURNOS, configInicial, nominaDemo } from '../src/domain/datos';
import {
  aHora, aMinutos, cuposLibres, haySolape, huella, nominaCSV, payloadQR, reservarCupo, semaforo, validarMatricula, ventanaAbierta, verificarQR,
} from '../src/domain/reglas';
import type { Turno } from '../src/domain/types';
import { estadoInicial, nomina, reductor } from '../src/state/AppStore';

const turno = (id: string) => TURNOS.find((t) => t.id === id)!;
const nombreCurso = (id: string) => CURSOS.find((c) => c.id === id)!.nombre;
const AHORA = new Date();
const contexto = (t: Turno, extra: Partial<Parameters<typeof validarMatricula>[0]> = {}) => ({
  turno: t, turnos: TURNOS, teoria: TEORIA, matriculasActivas: MATRICULAS, config: configInicial(AHORA), ahora: AHORA, nombreCurso, ...extra,
});

describe('horas', () => {
  it('convierte entre texto y minutos', () => {
    expect(aMinutos('07:00')).toBe(420);
    expect(aHora(640)).toBe('10:40');
  });
});

describe('RN-02 · cruce de horario', () => {
  const b = (dia: 'LUN' | 'MAR', ini: string, fin: string) => ({ dia, inicio: aMinutos(ini), fin: aMinutos(fin) });
  it('detecta solape en el mismo día', () => expect(haySolape(b('LUN', '07:00', '08:40'), b('LUN', '08:00', '09:00'))).toBe(true));
  it('bloques contiguos no se cruzan', () => expect(haySolape(b('LUN', '07:00', '08:40'), b('LUN', '08:40', '10:30'))).toBe(false));
  it('días distintos no se cruzan', () => expect(haySolape(b('LUN', '07:00', '08:40'), b('MAR', '07:00', '08:40'))).toBe(false));
});

describe('semáforo de vacantes', () => {
  it('rojo sin cupos, ámbar con menos del 30 % y verde en otro caso', () => {
    expect(semaforo(turno('PE-A'))).toBe('rojo');
    expect(semaforo(turno('GPS-A'))).toBe('ambar');
    expect(semaforo(turno('GPS-B'))).toBe('verde');
  });
});

describe('validarMatricula', () => {
  it('acepta un grupo libre y sin cruces', () => expect(validarMatricula(contexto(turno('PE-B')))).toEqual({ ok: true }));
  it('rechaza el cruce con la teoría ya inscrita', () => {
    const r = validarMatricula(contexto(turno('PE-C')));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.motivo).toBe('CRUCE');
  });
  it('rechaza un segundo grupo del mismo curso', () => {
    const r = validarMatricula(contexto(turno('CS-A')));
    expect(!r.ok && r.motivo).toBe('MISMO_CURSO');
  });
  it('rechaza un grupo agotado', () => {
    const r = validarMatricula(contexto(turno('PE-A'), { teoria: [] }));
    expect(!r.ok && r.motivo).toBe('SIN_CUPO');
  });
  it('rechaza fuera de la ventana de matrícula', () => {
    const r = validarMatricula(contexto(turno('PE-B'), { ahora: new Date(AHORA.getTime() + 10 * 86400000) }));
    expect(!r.ok && r.motivo).toBe('VENTANA_CERRADA');
  });
  it('respeta el máximo de laboratorios por estudiante', () => {
    const config = { ...configInicial(AHORA), maxLaboratoriosPorEstudiante: 1 };
    const r = validarMatricula(contexto(turno('PE-B'), { config }));
    expect(!r.ok && r.motivo).toBe('LIMITE');
  });
});

describe('RF-05 · reserva atómica', () => {
  it('incrementa en uno los cupos ocupados sin mutar el arreglo original', () => {
    const antes = turno('PE-B').cuposOcupados;
    const { turnos, reservado } = reservarCupo(TURNOS, 'PE-B');
    expect(reservado).toBe(true);
    expect(turnos.find((t) => t.id === 'PE-B')!.cuposOcupados).toBe(antes + 1);
    expect(turno('PE-B').cuposOcupados).toBe(antes);
  });
  it('no reserva si el cupo ya se agotó', () => {
    const { turnos, reservado } = reservarCupo(TURNOS, 'PE-A');
    expect(reservado).toBe(false);
    expect(turnos).toBe(TURNOS);
  });
  it('nunca supera el aforo físico aunque lleguen más solicitudes que vacantes', () => {
    let turnos = TURNOS;
    const libres = cuposLibres(turno('GPS-A'));
    let aceptadas = 0;
    for (let i = 0; i < libres + 5; i++) {
      const r = reservarCupo(turnos, 'GPS-A');
      turnos = r.turnos;
      if (r.reservado) aceptadas++;
    }
    expect(aceptadas).toBe(libres);
    expect(turnos.find((t) => t.id === 'GPS-A')!.cuposOcupados).toBe(turno('GPS-A').cuposTotales);
  });
});

describe('pase QR', () => {
  const m = { id: 'M-0009', turnoId: 'PE-B', estudianteId: 'E01' };
  it('el contenido generado se verifica y devuelve la matrícula', () => expect(verificarQR(payloadQR(m))).toEqual({ valido: true, matriculaId: 'M-0009' }));
  it('un QR alterado se rechaza', () => expect(verificarQR(payloadQR(m).replace('E01', 'E02')).valido).toBe(false));
  it('la huella es estable y de 8 caracteres hexadecimales', () => {
    expect(huella('MATRILAB')).toBe(huella('MATRILAB'));
    expect(huella('MATRILAB')).toMatch(/^[0-9A-F]{8}$/);
  });
});

describe('ventana y nómina', () => {
  it('la ventana de demostración está abierta hoy', () => expect(ventanaAbierta(configInicial(AHORA), AHORA)).toBe(true));
  it('la nómina sintética tiene tantas filas como cupos ocupados', () => expect(nominaDemo(turno('PE-B'))).toHaveLength(turno('PE-B').cuposOcupados));
  it('el CSV usa punto y coma y cabecera en español', () => {
    const csv = nominaCSV([{ cui: '1', nombre: 'A, B', correo: 'a@unsa.edu.pe', asistio: true }]);
    expect(csv.split('\n')[0]).toBe('CUI;Apellidos y nombres;Correo;Asistencia');
    expect(csv).toContain('Presente');
  });
});

describe('reductor', () => {
  const conSesion = reductor(estadoInicial, { tipo: 'INICIAR_SESION', usuario: { id: 'E01', nombre: 'Lopez Arela, Ower Frank', correo: 'olopeza@unsa.edu.pe', rol: 'estudiante', cui: '20213412' } });
  it('matricular agrega la matrícula y ocupa un cupo', () => {
    const e = reductor(conSesion, { tipo: 'MATRICULAR', turnoId: 'PE-B', ahora: AHORA.toISOString() });
    expect(e.matriculas).toHaveLength(2);
    expect(e.turnos.find((t) => t.id === 'PE-B')!.cuposOcupados).toBe(turno('PE-B').cuposOcupados + 1);
    expect(nomina(e, 'PE-B').some((f) => f.matriculaId === 'M-0002')).toBe(true);
  });
  it('anular libera el cupo', () => {
    const e1 = reductor(conSesion, { tipo: 'MATRICULAR', turnoId: 'PE-B', ahora: AHORA.toISOString() });
    const e2 = reductor(e1, { tipo: 'ANULAR', matriculaId: 'M-0002' });
    expect(e2.turnos.find((t) => t.id === 'PE-B')!.cuposOcupados).toBe(turno('PE-B').cuposOcupados);
  });
  it('una asistencia solo se marca una vez', () => {
    const e1 = reductor(conSesion, { tipo: 'MARCAR_ASISTENCIA', filaId: 'X', hora: '07:05' });
    const e2 = reductor(e1, { tipo: 'MARCAR_ASISTENCIA', filaId: 'X', hora: '07:30' });
    expect(e2.asistencias.X).toBe('07:05');
  });
});
