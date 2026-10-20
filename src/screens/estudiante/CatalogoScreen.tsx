/**
 * Interfaz 3 · Catálogo de grupos con semáforo de vacantes (RF-02, RF-03).
 * Layout: SectionList agrupada por curso con encabezados fijos (stickySectionHeadersEnabled),
 * buscador y una fila de filtros en un ScrollView horizontal.
 */
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ScrollView, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';
import { BarraProgreso, Chip, Insignia, Tarjeta, Vacio } from '../../components/ui';
import { CURSOS } from '../../domain/datos';
import { NOMBRE_DIA, cuposLibres, haySolape, rango, semaforo } from '../../domain/reglas';
import type { Turno } from '../../domain/types';
import type { PantallaEstudiante } from '../../navigation/tipos';
import { laboratorio, matriculasActivas, teoriaDelEstudiante, useApp, usuario } from '../../state/AppStore';
import { useTema } from '../../theme/ThemeContext';
import { espacio, radio, tipo } from '../../theme/tokens';

type Filtro = 'todos' | 'cupo' | 'sinCruce';

export default function CatalogoScreen({ navigation }: PantallaEstudiante<'Catalogo'>) {
  const { c } = useTema();
  const { estado } = useApp();
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todos');

  const ocupados = useMemo(() => {
    const propios = matriculasActivas(estado).map((m) => estado.turnos.find((t) => t.id === m.turnoId)!);
    return [...propios, ...teoriaDelEstudiante()];
  }, [estado]);

  const secciones = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return CURSOS.map((cur) => ({
      curso: cur,
      data: estado.turnos.filter((t) => {
        if (t.cursoId !== cur.id) return false;
        if (q && !`${cur.nombre} ${t.grupo} ${NOMBRE_DIA[t.dia]}`.toLowerCase().includes(q)) return false;
        if (filtro === 'cupo' && cuposLibres(t) === 0) return false;
        if (filtro === 'sinCruce' && ocupados.some((o) => o !== undefined && 'id' in o && o.id !== t.id && haySolape(o, t))) return false;
        return true;
      }),
    })).filter((s) => s.data.length > 0);
  }, [estado.turnos, busqueda, filtro, ocupados]);

  const renderTurno = ({ item }: { item: Turno }) => {
    const libres = cuposLibres(item);
    const estadoSem = semaforo(item);
    const lab = laboratorio(estado, item.laboratorioId);
    const color = { verde: c.exito, ambar: c.alerta, rojo: c.peligro }[estadoSem];
    return (
      <Tarjeta style={estilos.item} onPress={() => navigation.navigate('DetalleTurno', { turnoId: item.id })} accessibilityLabel={`Grupo ${item.id}`}>
        <View style={estilos.cabeceraItem}>
          <View style={[estilos.grupo, { backgroundColor: c.primarioSuave }]}>
            <Text style={[tipo.subtitulo, { color: c.primario }]}>{item.grupo}</Text>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[tipo.cuerpo, { color: c.texto, fontWeight: '700' }]}>{NOMBRE_DIA[item.dia]} · {rango(item)}</Text>
            <Text style={[tipo.pie, { color: c.textoSecundario }]} numberOfLines={1}>{lab.nombre} · {usuario(item.docenteId)?.nombre}</Text>
          </View>
          <Insignia estado={estadoSem} />
        </View>
        <BarraProgreso valor={item.cuposOcupados} total={item.cuposTotales} color={color} />
        <Text style={[tipo.pie, { color: c.textoSecundario }]}>
          <Text style={{ color, fontWeight: '700' }}>{libres}</Text> de {item.cuposTotales} PC libres
        </Text>
      </Tarjeta>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.fondo }}>
      <View style={[estilos.barraBusqueda, { backgroundColor: c.superficie, borderBottomColor: c.borde }]}>
        <View style={[estilos.campo, { backgroundColor: c.fondo, borderColor: c.borde }]}>
          <Ionicons name="search" size={18} color={c.textoTenue} />
          <TextInput
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Buscar curso, grupo o día"
            placeholderTextColor={c.textoTenue}
            style={[estilos.input, { color: c.texto }]}
            accessibilityLabel="Buscar en el catálogo"
            clearButtonMode="while-editing"
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.chips}>
          <Chip texto="Todos" activo={filtro === 'todos'} onPress={() => setFiltro('todos')} icono="apps-outline" />
          <Chip texto="Con vacantes" activo={filtro === 'cupo'} onPress={() => setFiltro('cupo')} icono="checkmark-circle-outline" />
          <Chip texto="Sin cruce de horario" activo={filtro === 'sinCruce'} onPress={() => setFiltro('sinCruce')} icono="git-compare-outline" />
        </ScrollView>
      </View>

      <SectionList
        sections={secciones}
        keyExtractor={(t) => t.id}
        renderItem={renderTurno}
        stickySectionHeadersEnabled
        contentContainerStyle={estilos.lista}
        ItemSeparatorComponent={() => <View style={{ height: espacio.m }} />}
        SectionSeparatorComponent={() => <View style={{ height: espacio.s }} />}
        renderSectionHeader={({ section }) => (
          <View style={[estilos.seccion, { backgroundColor: c.fondo }]}>
            <View style={[estilos.puntoCurso, { backgroundColor: section.curso.color }]} />
            <Text style={[tipo.etiqueta, { color: c.texto, flex: 1 }]}>{section.curso.nombre}</Text>
            <Text style={[tipo.pie, { color: c.textoTenue }]}>{section.data.length} grupo(s)</Text>
          </View>
        )}
        ListEmptyComponent={<Vacio icono="search-outline" titulo="Sin resultados" detalle="Prueba con otro término o quita el filtro." />}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  barraBusqueda: { padding: espacio.l, paddingBottom: espacio.m, gap: espacio.m, borderBottomWidth: StyleSheet.hairlineWidth },
  campo: { flexDirection: 'row', alignItems: 'center', gap: espacio.s, borderWidth: 1, borderRadius: radio.m, paddingHorizontal: espacio.m, minHeight: 44 },
  input: { flex: 1, fontSize: 15, paddingVertical: espacio.s },
  chips: { gap: espacio.s, paddingRight: espacio.l },
  lista: { padding: espacio.l, paddingBottom: espacio.xxl },
  seccion: { flexDirection: 'row', alignItems: 'center', gap: espacio.s, paddingVertical: espacio.s },
  puntoCurso: { width: 10, height: 10, borderRadius: 5 },
  item: { gap: espacio.m },
  cabeceraItem: { flexDirection: 'row', alignItems: 'center', gap: espacio.m },
  grupo: { width: 44, height: 44, borderRadius: radio.m, alignItems: 'center', justifyContent: 'center' },
});
