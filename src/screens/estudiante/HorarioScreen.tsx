/**
 * Interfaz 6 · Horario semanal consolidado (RF-07).
 * Layout: cuadrícula calculada con useWindowDimensions. Cada columna es un día y cada bloque se
 * coloca con position: 'absolute' (top = hora de inicio, height = duración). Si la pantalla es
 * angosta, la cuadrícula pasa a un ScrollView horizontal con columnas de ancho mínimo.
 */
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Chip, Insignia, Tarjeta, TituloSeccion } from '../../components/ui';
import { DIAS, NOMBRE_DIA, aHora, ordenarBloques, rango } from '../../domain/reglas';
import type { Bloque } from '../../domain/types';
import { curso, laboratorio, matriculasActivas, teoriaDelEstudiante, useApp } from '../../state/AppStore';
import { useTema } from '../../theme/ThemeContext';
import { espacio, radio, tipo } from '../../theme/tokens';

const INICIO = 7 * 60;
const FIN = 17 * 60;
const ALTO_HORA = 58;
const CANAL_HORAS = 44;
const DIAS_VISIBLES = DIAS.slice(0, 5);

interface Evento extends Bloque { id: string; cursoId: string; tipo: 'lab' | 'teoria'; lugar: string; grupo?: string }

export default function HorarioScreen() {
  const { c } = useTema();
  const { estado } = useApp();
  const { width } = useWindowDimensions();
  const [vista, setVista] = useState<'semana' | 'lista'>('semana');

  const labs: Evento[] = matriculasActivas(estado).map((m) => {
    const t = estado.turnos.find((x) => x.id === m.turnoId)!;
    return { ...t, tipo: 'lab', lugar: laboratorio(estado, t.laboratorioId).nombre };
  });
  const teoria: Evento[] = teoriaDelEstudiante().map((t) => ({ ...t, tipo: 'teoria', lugar: t.aula }));
  const eventos = ordenarBloques([...labs, ...teoria]);

  const disponible = width - espacio.l * 2 - CANAL_HORAS;
  const anchoDia = Math.max(64, disponible / DIAS_VISIBLES.length);
  const desborda = anchoDia * DIAS_VISIBLES.length > disponible + 1;
  const horas = Array.from({ length: (FIN - INICIO) / 60 + 1 }, (_, i) => INICIO + i * 60);

  const cuadricula = (
    <View style={{ flexDirection: 'row' }}>
      <View style={{ width: CANAL_HORAS, height: (FIN - INICIO) / 60 * ALTO_HORA + 28 }}>
        {horas.map((h) => (
          <Text key={h} style={[estilos.hora, { top: (h - INICIO) / 60 * ALTO_HORA + 28 - 7, color: c.textoTenue }]}>{aHora(h)}</Text>
        ))}
      </View>
      {DIAS_VISIBLES.map((dia) => (
        <View key={dia} style={{ width: anchoDia }}>
          <View style={estilos.cabeceraDia}>
            <Text style={[tipo.etiqueta, { color: c.textoSecundario }]}>{NOMBRE_DIA[dia].slice(0, 3)}</Text>
          </View>
          <View style={{ height: (FIN - INICIO) / 60 * ALTO_HORA, borderLeftWidth: StyleSheet.hairlineWidth, borderColor: c.borde }}>
            {horas.map((h) => (
              <View key={h} style={[estilos.lineaHora, { top: (h - INICIO) / 60 * ALTO_HORA, borderColor: c.borde }]} />
            ))}
            {eventos.filter((e) => e.dia === dia).map((e) => {
              const cur = curso(e.cursoId);
              const lab = e.tipo === 'lab';
              return (
                <View
                  key={e.id}
                  accessibilityLabel={`${cur.nombre}, ${lab ? 'laboratorio' : 'teoría'}, ${NOMBRE_DIA[e.dia]} ${rango(e)}`}
                  style={[
                    estilos.bloque,
                    {
                      top: (e.inicio - INICIO) / 60 * ALTO_HORA + 1,
                      height: (e.fin - e.inicio) / 60 * ALTO_HORA - 2,
                      backgroundColor: lab ? cur.color : c.superficie,
                      borderColor: cur.color,
                      borderStyle: lab ? 'solid' : 'dashed',
                    },
                  ]}
                >
                  <Text style={[estilos.textoBloque, { color: lab ? '#FFFFFF' : cur.color }]} numberOfLines={3}>{cur.codigo.split('-')[0]}{lab ? ` · ${e.grupo}` : ''}</Text>
                  <Text style={[estilos.lugar, { color: lab ? '#FFFFFF' : c.textoSecundario }]} numberOfLines={1}>{e.lugar}</Text>
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView style={{ backgroundColor: c.fondo }} contentContainerStyle={estilos.contenido}>
      <View style={estilos.selector}>
        <Chip texto="Semana" activo={vista === 'semana'} onPress={() => setVista('semana')} icono="grid-outline" />
        <Chip texto="Lista" activo={vista === 'lista'} onPress={() => setVista('lista')} icono="list-outline" />
      </View>

      {vista === 'semana' ? (
        <Tarjeta style={{ paddingHorizontal: espacio.s }}>
          {desborda ? <ScrollView horizontal showsHorizontalScrollIndicator>{cuadricula}</ScrollView> : cuadricula}
          <View style={estilos.leyenda}>
            <View style={[estilos.muestra, { backgroundColor: c.primario }]} />
            <Text style={[tipo.pie, { color: c.textoSecundario }]}>Laboratorio matriculado</Text>
            <View style={[estilos.muestra, { borderWidth: 1, borderStyle: 'dashed', borderColor: c.primario }]} />
            <Text style={[tipo.pie, { color: c.textoSecundario }]}>Teoría</Text>
          </View>
        </Tarjeta>
      ) : (
        DIAS_VISIBLES.map((dia) => {
          const del = eventos.filter((e) => e.dia === dia);
          if (!del.length) return null;
          return (
            <View key={dia}>
              <TituloSeccion titulo={NOMBRE_DIA[dia]} />
              <View style={{ gap: espacio.s }}>
                {del.map((e) => (
                  <Tarjeta key={e.id} style={estilos.itemLista}>
                    <Text style={[tipo.etiqueta, { color: c.texto, width: 92 }]}>{rango(e)}</Text>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={[tipo.cuerpo, { color: c.texto, fontWeight: '600' }]}>{curso(e.cursoId).nombre}</Text>
                      <Text style={[tipo.pie, { color: c.textoSecundario }]}>{e.lugar}</Text>
                    </View>
                    <Insignia estado="info" texto={e.tipo === 'lab' ? `Lab ${e.grupo}` : 'Teoría'} />
                  </Tarjeta>
                ))}
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: espacio.l, paddingBottom: espacio.xxl, gap: espacio.m },
  selector: { flexDirection: 'row', gap: espacio.s },
  hora: { position: 'absolute', fontSize: 10, fontVariant: ['tabular-nums'] },
  cabeceraDia: { height: 28, alignItems: 'center', justifyContent: 'center' },
  lineaHora: { position: 'absolute', left: 0, right: 0, borderTopWidth: StyleSheet.hairlineWidth },
  bloque: { position: 'absolute', left: 3, right: 3, borderRadius: radio.s, borderWidth: 1.5, padding: 4, overflow: 'hidden' },
  textoBloque: { fontSize: 11, fontWeight: '800' },
  lugar: { fontSize: 9, opacity: 0.9 },
  leyenda: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: espacio.s, marginTop: espacio.m, paddingHorizontal: espacio.s },
  muestra: { width: 16, height: 12, borderRadius: 3 },
  itemLista: { flexDirection: 'row', alignItems: 'center', gap: espacio.m },
});
