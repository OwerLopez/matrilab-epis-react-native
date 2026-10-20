/**
 * Interfaz 4 · Detalle del grupo y confirmación de matrícula (RF-04, RF-05).
 * Se presenta como hoja modal nativa (presentation: 'modal' en native-stack).
 * Layout destacado: el mapa de puestos usa flexWrap con celdas de ancho fijo, de modo que
 * la cuadrícula de 20, 25 o 30 PC se reacomoda sola en cualquier ancho de pantalla.
 */
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Boton, Insignia, Tarjeta } from '../../components/ui';
import { NOMBRE_DIA, cuposLibres, rango, semaforo, validarMatricula } from '../../domain/reglas';
import type { PantallaRaiz } from '../../navigation/tipos';
import { curso, laboratorio, matriculasActivas, teoriaDelEstudiante, useApp, usuario } from '../../state/AppStore';
import { useTema } from '../../theme/ThemeContext';
import { espacio, radio, tipo } from '../../theme/tokens';

export default function DetalleTurnoScreen({ route, navigation }: PantallaRaiz<'DetalleTurno'>) {
  const { c } = useTema();
  const { estado, dispatch } = useApp();
  const [procesando, setProcesando] = useState(false);
  const turno = estado.turnos.find((t) => t.id === route.params.turnoId)!;
  const cur = curso(turno.cursoId);
  const lab = laboratorio(estado, turno.laboratorioId);
  const libres = cuposLibres(turno);

  const validacion = useMemo(
    () => validarMatricula({
      turno,
      turnos: estado.turnos,
      teoria: teoriaDelEstudiante(),
      matriculasActivas: matriculasActivas(estado),
      config: estado.config,
      ahora: new Date(),
      nombreCurso: (id) => curso(id).nombre,
    }),
    [turno, estado],
  );

  const confirmar = () => {
    setProcesando(true);
    // Simula la latencia de la transacción en el servidor antes de asentar la reserva.
    setTimeout(() => {
      dispatch({ tipo: 'MATRICULAR', turnoId: turno.id, ahora: new Date().toISOString() });
      setProcesando(false);
      navigation.replace('FichaQR', { matriculaId: `M-${String(estado.matriculas.length + 1).padStart(4, '0')}` });
    }, 900);
  };

  const filas: [string, string, string][] = [
    ['calendar-outline', 'Horario', `${NOMBRE_DIA[turno.dia]} · ${rango(turno)}`],
    ['location-outline', 'Ambiente', `${lab.nombre} · ${lab.pabellon}`],
    ['person-outline', 'Docente', usuario(turno.docenteId)?.nombre ?? '—'],
    ['hardware-chip-outline', 'Equipamiento', lab.equipamiento],
  ];

  return (
    <View style={{ flex: 1, backgroundColor: c.fondo }}>
      <ScrollView contentContainerStyle={estilos.contenido}>
        <View style={{ gap: espacio.xs }}>
          <Text style={[tipo.pie, { color: c.textoSecundario }]}>{cur.codigo} · {cur.creditos} créditos</Text>
          <Text style={[tipo.titulo, { color: c.texto }]}>{cur.nombre}</Text>
          <View style={{ flexDirection: 'row', gap: espacio.s, marginTop: espacio.xs }}>
            <Insignia estado="info" texto={`Grupo ${turno.grupo}`} />
            <Insignia estado={semaforo(turno)} />
          </View>
        </View>

        <Tarjeta style={{ gap: espacio.m }}>
          {filas.map(([icono, etiqueta, valor]) => (
            <View key={etiqueta} style={estilos.fila}>
              <Ionicons name={icono as never} size={18} color={c.primario} />
              <Text style={[tipo.etiqueta, { color: c.textoSecundario, width: 96 }]}>{etiqueta}</Text>
              <Text style={[tipo.cuerpo, { color: c.texto, flex: 1 }]}>{valor}</Text>
            </View>
          ))}
        </Tarjeta>

        <Tarjeta style={{ gap: espacio.m }}>
          <View style={estilos.filaEntre}>
            <Text style={[tipo.subtitulo, { color: c.texto }]}>Puestos del laboratorio</Text>
            <Text style={[tipo.etiqueta, { color: libres ? c.exito : c.peligro }]}>{libres} libres</Text>
          </View>
          <View style={estilos.mapa} accessibilityLabel={`${turno.cuposOcupados} puestos ocupados de ${turno.cuposTotales}`}>
            {Array.from({ length: turno.cuposTotales }, (_, i) => {
              const ocupado = i < turno.cuposOcupados;
              return (
                <View key={i} style={[estilos.pc, { backgroundColor: ocupado ? c.peligroSuave : c.exitoSuave, borderColor: ocupado ? c.peligro : c.exito }]}>
                  <Ionicons name="desktop-outline" size={14} color={ocupado ? c.peligro : c.exito} />
                  <Text style={[estilos.numeroPc, { color: ocupado ? c.peligro : c.exito }]}>{i + 1}</Text>
                </View>
              );
            })}
          </View>
          <View style={estilos.leyenda}>
            <View style={[estilos.cuadro, { backgroundColor: c.exitoSuave, borderColor: c.exito }]} />
            <Text style={[tipo.pie, { color: c.textoSecundario }]}>Libre</Text>
            <View style={[estilos.cuadro, { backgroundColor: c.peligroSuave, borderColor: c.peligro }]} />
            <Text style={[tipo.pie, { color: c.textoSecundario }]}>Ocupado</Text>
          </View>
        </Tarjeta>

        {!validacion.ok && (
          <View style={[estilos.aviso, { backgroundColor: c.peligroSuave }]} accessibilityLiveRegion="polite">
            <Ionicons name={validacion.motivo === 'CRUCE' ? 'git-compare-outline' : 'alert-circle-outline'} size={22} color={c.peligro} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[tipo.etiqueta, { color: c.peligro }]}>{validacion.motivo === 'CRUCE' ? 'Cruce de horario (RN-02)' : 'No se puede matricular'}</Text>
              <Text style={[tipo.cuerpo, { color: c.peligro }]}>{validacion.detalle}</Text>
            </View>
          </View>
        )}
        {validacion.ok && (
          <View style={[estilos.aviso, { backgroundColor: c.exitoSuave }]}>
            <Ionicons name="shield-checkmark-outline" size={22} color={c.exito} />
            <Text style={[tipo.cuerpo, { color: c.exito, flex: 1 }]}>Sin cruces con tu horario. Al confirmar se reserva tu puesto de inmediato.</Text>
          </View>
        )}
      </ScrollView>

      <View style={[estilos.pie, { backgroundColor: c.superficie, borderTopColor: c.borde }]}>
        {procesando ? (
          <View style={estilos.procesando}>
            <ActivityIndicator color={c.marca} />
            <Text style={[tipo.cuerpo, { color: c.textoSecundario }]}>Reservando tu puesto…</Text>
          </View>
        ) : (
          <Boton titulo="Confirmar matrícula" icono="checkmark-circle-outline" variante="marca" deshabilitado={!validacion.ok} onPress={confirmar} accessibilityLabel="Confirmar matrícula" />
        )}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: espacio.l, gap: espacio.l, paddingBottom: espacio.xxl },
  fila: { flexDirection: 'row', alignItems: 'flex-start', gap: espacio.m },
  filaEntre: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mapa: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pc: { width: 46, height: 40, borderRadius: radio.s, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  numeroPc: { fontSize: 10, fontWeight: '700' },
  leyenda: { flexDirection: 'row', alignItems: 'center', gap: espacio.s },
  cuadro: { width: 14, height: 14, borderRadius: 3, borderWidth: 1 },
  aviso: { flexDirection: 'row', gap: espacio.m, padding: espacio.l, borderRadius: radio.m, alignItems: 'flex-start' },
  pie: { padding: espacio.l, borderTopWidth: StyleSheet.hairlineWidth },
  procesando: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: espacio.m, minHeight: 48 },
});
