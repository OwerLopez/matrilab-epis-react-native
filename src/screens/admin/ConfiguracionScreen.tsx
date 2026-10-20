/**
 * Interfaz 11 · Configuración de la ventana de matrícula (RF-09).
 * Layout: formulario en ScrollView con filas label/valor alineadas con flexDirection: 'row'
 * y justifyContent: 'space-between'; los grupos agotados se listan con map dentro de una Tarjeta.
 */
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Boton, Insignia, Tarjeta, TituloSeccion } from '../../components/ui';
import { NOMBRE_DIA, rango, semaforo, ventanaAbierta } from '../../domain/reglas';
import { curso, useApp } from '../../state/AppStore';
import { useTema } from '../../theme/ThemeContext';
import { espacio, radio, tipo } from '../../theme/tokens';

const aTexto = (iso: string) => {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

/** "dd/mm/aaaa hh:mm" -> ISO, o null si no es una fecha válida. */
const aISO = (texto: string): string | null => {
  const m = texto.trim().match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/);
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]), Number(m[4]), Number(m[5]));
  return Number.isNaN(d.getTime()) || d.getDate() !== Number(m[1]) ? null : d.toISOString();
};

export default function ConfiguracionScreen() {
  const { c } = useTema();
  const { estado, dispatch } = useApp();
  const [inicio, setInicio] = useState(aTexto(estado.config.inicio));
  const [fin, setFin] = useState(aTexto(estado.config.fin));
  const [maximo, setMaximo] = useState(String(estado.config.maxLaboratoriosPorEstudiante));
  const [anulacion, setAnulacion] = useState(estado.config.permitirAnulacion);
  const [aviso, setAviso] = useState(estado.config.notificarAforoCompleto);
  const [error, setError] = useState<string | null>(null);

  const abierta = ventanaAbierta(estado.config, new Date());
  const agotados = estado.turnos.filter((t) => semaforo(t) === 'rojo');

  const guardar = () => {
    const i = aISO(inicio);
    const f = aISO(fin);
    const max = Number(maximo);
    if (!i || !f) return setError('Usa el formato dd/mm/aaaa hh:mm en ambas fechas.');
    if (new Date(f) <= new Date(i)) return setError('El cierre debe ser posterior a la apertura.');
    if (!Number.isInteger(max) || max < 1 || max > 6) return setError('El máximo de laboratorios debe estar entre 1 y 6.');
    setError(null);
    dispatch({ tipo: 'ACTUALIZAR_CONFIG', config: { inicio: i, fin: f, maxLaboratoriosPorEstudiante: max, permitirAnulacion: anulacion, notificarAforoCompleto: aviso } });
    Alert.alert('Configuración guardada', 'Los cambios se aplican de inmediato a todos los estudiantes.');
  };

  const campo = (etiqueta: string, valor: string, set: (v: string) => void, icono: 'calendar-outline' | 'calendar-clear-outline', ayuda: string) => (
    <View style={{ gap: espacio.xs }}>
      <Text style={[tipo.etiqueta, { color: c.textoSecundario }]}>{etiqueta}</Text>
      <View style={[estilos.campo, { borderColor: c.borde, backgroundColor: c.fondo }]}>
        <Ionicons name={icono} size={18} color={c.textoTenue} />
        <TextInput value={valor} onChangeText={set} style={[estilos.input, { color: c.texto }]} keyboardType="numbers-and-punctuation" accessibilityLabel={etiqueta} />
      </View>
      <Text style={[tipo.pie, { color: c.textoTenue }]}>{ayuda}</Text>
    </View>
  );

  return (
    <ScrollView style={{ backgroundColor: c.fondo }} contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
      <Tarjeta style={[estilos.estado, { backgroundColor: abierta ? c.exitoSuave : c.peligroSuave, borderColor: 'transparent' }]}>
        <Ionicons name={abierta ? 'lock-open-outline' : 'lock-closed-outline'} size={26} color={abierta ? c.exito : c.peligro} />
        <View style={{ flex: 1 }}>
          <Text style={[tipo.etiqueta, { color: abierta ? c.exito : c.peligro }]}>{abierta ? 'Ventana abierta ahora' : 'Ventana cerrada ahora'}</Text>
          <Text style={[tipo.pie, { color: c.textoSecundario }]}>{aTexto(estado.config.inicio)} → {aTexto(estado.config.fin)}</Text>
        </View>
      </Tarjeta>

      <TituloSeccion titulo="Ventana de matrícula" />
      <Tarjeta style={{ gap: espacio.l }}>
        {campo('Apertura', inicio, setInicio, 'calendar-outline', 'Formato dd/mm/aaaa hh:mm (hora de Lima).')}
        {campo('Cierre', fin, setFin, 'calendar-clear-outline', 'Pasada esta hora el botón Confirmar se desactiva.')}
        <View style={estilos.fila}>
          <View style={{ flex: 1 }}>
            <Text style={[tipo.cuerpo, { color: c.texto, fontWeight: '600' }]}>Máximo de laboratorios</Text>
            <Text style={[tipo.pie, { color: c.textoSecundario }]}>Por estudiante y semestre</Text>
          </View>
          <TextInput value={maximo} onChangeText={setMaximo} keyboardType="number-pad" maxLength={1} style={[estilos.numero, { color: c.texto, borderColor: c.borde, backgroundColor: c.fondo }]} accessibilityLabel="Máximo de laboratorios" />
        </View>
      </Tarjeta>

      <TituloSeccion titulo="Reglas" />
      <Tarjeta style={{ gap: espacio.l }}>
        <View style={estilos.fila}>
          <View style={{ flex: 1 }}>
            <Text style={[tipo.cuerpo, { color: c.texto, fontWeight: '600' }]}>Permitir anular matrícula</Text>
            <Text style={[tipo.pie, { color: c.textoSecundario }]}>El cupo vuelve a la oferta al instante</Text>
          </View>
          <Switch value={anulacion} onValueChange={setAnulacion} trackColor={{ true: c.primario, false: c.borde }} accessibilityLabel="Permitir anular matrícula" />
        </View>
        <View style={estilos.fila}>
          <View style={{ flex: 1 }}>
            <Text style={[tipo.cuerpo, { color: c.texto, fontWeight: '600' }]}>Avisar aforo completo</Text>
            <Text style={[tipo.pie, { color: c.textoSecundario }]}>Notifica a coordinación cuando un grupo llega a 0</Text>
          </View>
          <Switch value={aviso} onValueChange={setAviso} trackColor={{ true: c.primario, false: c.borde }} accessibilityLabel="Avisar aforo completo" />
        </View>
      </Tarjeta>

      {error && (
        <View style={[estilos.error, { backgroundColor: c.peligroSuave }]}>
          <Ionicons name="alert-circle" size={18} color={c.peligro} />
          <Text style={[tipo.etiqueta, { color: c.peligro, flex: 1 }]}>{error}</Text>
        </View>
      )}
      <Boton titulo="Guardar configuración" icono="save-outline" variante="marca" onPress={guardar} />

      <TituloSeccion titulo={`Grupos agotados (${agotados.length})`} />
      <Tarjeta style={{ gap: espacio.m }}>
        {agotados.length === 0 ? (
          <Text style={[tipo.cuerpo, { color: c.textoSecundario }]}>Todos los grupos tienen vacantes.</Text>
        ) : (
          agotados.map((t) => (
            <View key={t.id} style={estilos.fila}>
              <View style={{ flex: 1 }}>
                <Text style={[tipo.cuerpo, { color: c.texto, fontWeight: '600' }]}>{curso(t.cursoId).nombre} · {t.grupo}</Text>
                <Text style={[tipo.pie, { color: c.textoSecundario }]}>{NOMBRE_DIA[t.dia]} {rango(t)}</Text>
              </View>
              <Insignia estado="rojo" />
            </View>
          ))
        )}
        {agotados.length > 0 && (
          <Boton
            titulo="Evaluar grupo adicional"
            icono="add-circle-outline"
            variante="secundario"
            onPress={() => Alert.alert('Grupo adicional', 'Se registró la solicitud para evaluar la apertura de un grupo adicional con la dirección de escuela.')}
          />
        )}
      </Tarjeta>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: espacio.l, paddingBottom: espacio.xxl },
  estado: { flexDirection: 'row', alignItems: 'center', gap: espacio.m },
  campo: { flexDirection: 'row', alignItems: 'center', gap: espacio.s, borderWidth: 1, borderRadius: radio.m, paddingHorizontal: espacio.m, minHeight: 46 },
  input: { flex: 1, fontSize: 16, paddingVertical: espacio.s, fontVariant: ['tabular-nums'] },
  fila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: espacio.m },
  numero: { width: 56, height: 44, borderWidth: 1, borderRadius: radio.m, textAlign: 'center', fontSize: 18, fontWeight: '700' },
  error: { flexDirection: 'row', gap: espacio.s, alignItems: 'center', padding: espacio.m, borderRadius: radio.m, marginVertical: espacio.m },
});
