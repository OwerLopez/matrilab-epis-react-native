/**
 * Interfaz 7 · Panel del docente / jefe de prácticas (RF-07 monitoreo de aforo).
 * Layout: FlatList con ListHeaderComponent (saludo + KPI) para que todo el contenido haga
 * scroll en una sola lista virtualizada, sin anidar ScrollView dentro de ScrollView.
 */
import { Ionicons } from '@expo/vector-icons';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Avatar, BarraProgreso, Boton, Insignia, Kpi, Tarjeta, TituloSeccion } from '../../components/ui';
import { NOMBRE_DIA, cuposLibres, ordenarBloques, rango, semaforo } from '../../domain/reglas';
import type { PantallaDocente } from '../../navigation/tipos';
import { curso, laboratorio, useApp } from '../../state/AppStore';
import { useTema } from '../../theme/ThemeContext';
import { espacio, tipo } from '../../theme/tokens';

export default function PanelDocenteScreen({ navigation }: PantallaDocente<'Panel'>) {
  const { c } = useTema();
  const { estado } = useApp();
  const mios = ordenarBloques(estado.turnos.filter((t) => t.docenteId === estado.usuario?.id));
  const inscritos = mios.reduce((s, t) => s + t.cuposOcupados, 0);
  const capacidad = mios.reduce((s, t) => s + t.cuposTotales, 0);
  const presentes = Object.keys(estado.asistencias).filter((k) => mios.some((t) => k.startsWith(t.id) || estado.matriculas.find((m) => m.id === k)?.turnoId === t.id)).length;

  return (
    <FlatList
      style={{ backgroundColor: c.fondo }}
      contentContainerStyle={estilos.contenido}
      data={mios}
      keyExtractor={(t) => t.id}
      ItemSeparatorComponent={() => <View style={{ height: espacio.m }} />}
      ListHeaderComponent={
        <View>
          <View style={estilos.saludo}>
            <Avatar nombre={estado.usuario?.nombre ?? 'Docente'} tamano={52} />
            <View style={{ flex: 1 }}>
              <Text style={[tipo.pie, { color: c.textoSecundario }]}>Docente · Jefe de prácticas</Text>
              <Text style={[tipo.subtitulo, { color: c.texto }]} numberOfLines={1}>{estado.usuario?.nombre}</Text>
            </View>
          </View>
          <View style={estilos.kpis}>
            <Kpi valor={String(mios.length)} etiqueta="Grupos a cargo" icono="layers-outline" />
            <Kpi valor={`${inscritos}/${capacidad}`} etiqueta="Estudiantes inscritos" icono="people-outline" color={c.marca} />
            <Kpi valor={`${Math.round((inscritos / Math.max(1, capacidad)) * 100)} %`} etiqueta="Ocupación promedio" icono="pie-chart-outline" color={c.alerta} />
            <Kpi valor={String(presentes)} etiqueta="Asistencias registradas hoy" icono="checkmark-done-outline" color={c.exito} />
          </View>
          <Boton titulo="Escanear pase de un estudiante" icono="scan-outline" variante="marca" onPress={() => navigation.navigate('Escaner')} style={{ marginTop: espacio.l }} />
          <TituloSeccion titulo="Mis grupos de laboratorio" />
        </View>
      }
      renderItem={({ item }) => {
        const cur = curso(item.cursoId);
        const lab = laboratorio(estado, item.laboratorioId);
        return (
          <Tarjeta style={{ gap: espacio.m }}>
            <View style={estilos.cabecera}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[tipo.cuerpo, { color: c.texto, fontWeight: '700' }]}>{cur.nombre} · Grupo {item.grupo}</Text>
                <View style={estilos.meta}>
                  <Ionicons name="time-outline" size={14} color={c.textoSecundario} />
                  <Text style={[tipo.pie, { color: c.textoSecundario }]}>{NOMBRE_DIA[item.dia]} {rango(item)} · {lab.nombre}</Text>
                </View>
              </View>
              <Insignia estado={semaforo(item)} />
            </View>
            <BarraProgreso valor={item.cuposOcupados} total={item.cuposTotales} />
            <View style={estilos.cabecera}>
              <Text style={[tipo.pie, { color: c.textoSecundario }]}>{item.cuposOcupados} inscritos · {cuposLibres(item)} libres</Text>
              <Boton titulo="Nómina" icono="list-outline" variante="secundario" onPress={() => navigation.navigate('Nomina', { turnoId: item.id })} accessibilityLabel={`Nómina ${item.id}`} />
            </View>
          </Tarjeta>
        );
      }}
    />
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: espacio.l, paddingBottom: espacio.xxl },
  saludo: { flexDirection: 'row', alignItems: 'center', gap: espacio.m, marginBottom: espacio.l },
  kpis: { flexDirection: 'row', flexWrap: 'wrap', gap: espacio.m },
  cabecera: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: espacio.m },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
