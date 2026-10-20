/**
 * Interfaz 8 · Nómina del grupo con registro manual de asistencia y exportación (RF-07, RF-10).
 * Layout: FlatList virtualizada con un resumen fijo arriba (stickyHeaderIndices sobre el encabezado)
 * y filas de altura uniforme (ALTO_FILA) para que la lista se desplace sin saltos.
 */
import { Ionicons } from '@expo/vector-icons';
import { useLayoutEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { BarraProgreso, Boton } from '../../components/ui';
import { NOMBRE_DIA, nominaCSV, rango } from '../../domain/reglas';
import type { PantallaRaiz } from '../../navigation/tipos';
import { curso, nomina, useApp } from '../../state/AppStore';
import { useTema } from '../../theme/ThemeContext';
import { espacio, radio, tipo } from '../../theme/tokens';

const ALTO_FILA = 68;

export default function NominaScreen({ route, navigation }: PantallaRaiz<'Nomina'>) {
  const { c } = useTema();
  const { estado, dispatch } = useApp();
  const [q, setQ] = useState('');
  const turno = estado.turnos.find((t) => t.id === route.params.turnoId)!;
  const cur = curso(turno.cursoId);
  const filas = useMemo(() => nomina(estado, turno.id), [estado, turno.id]);
  const visibles = filas.filter((f) => `${f.nombre} ${f.cui}`.toLowerCase().includes(q.trim().toLowerCase()));
  const presentes = filas.filter((f) => estado.asistencias[f.id]).length;

  useLayoutEffect(() => {
    navigation.setOptions({ title: `${cur.codigo.split('-')[0]} · Grupo ${turno.grupo}` });
  }, [navigation, cur.codigo, turno.grupo]);

  const exportar = () =>
    Share.share({
      title: `Nómina ${cur.nombre} ${turno.grupo}`,
      message: nominaCSV(filas.map((f) => ({ cui: f.cui, nombre: f.nombre, correo: f.correo, asistio: Boolean(estado.asistencias[f.id]) }))),
    });

  const marcar = (id: string) =>
    dispatch({ tipo: 'MARCAR_ASISTENCIA', filaId: id, hora: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) });

  return (
    <View style={{ flex: 1, backgroundColor: c.fondo }}>
      <FlatList
        data={visibles}
        keyExtractor={(f) => f.id}
        stickyHeaderIndices={[0]}
        ListHeaderComponent={
          <View style={[estilos.resumen, { backgroundColor: c.superficie, borderBottomColor: c.borde }]}>
            <Text style={[tipo.etiqueta, { color: c.textoSecundario }]}>{NOMBRE_DIA[turno.dia]} {rango(turno)} · {cur.nombre}</Text>
            <View style={estilos.cifras}>
              <Text style={[tipo.cifra, { color: c.texto }]}>{presentes}<Text style={[tipo.subtitulo, { color: c.textoTenue }]}> / {filas.length}</Text></Text>
              <Text style={[tipo.pie, { color: c.textoSecundario }]}>presentes en la sesión de hoy</Text>
            </View>
            <BarraProgreso valor={presentes} total={filas.length} color={c.exito} />
            <View style={[estilos.campo, { backgroundColor: c.fondo, borderColor: c.borde }]}>
              <Ionicons name="search" size={16} color={c.textoTenue} />
              <TextInput value={q} onChangeText={setQ} placeholder="Buscar por nombre o CUI" placeholderTextColor={c.textoTenue} style={[estilos.input, { color: c.texto }]} accessibilityLabel="Buscar en la nómina" />
            </View>
          </View>
        }
        renderItem={({ item, index }) => {
          const hora = estado.asistencias[item.id];
          return (
            <Pressable
              onPress={() => marcar(item.id)}
              disabled={Boolean(hora)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: Boolean(hora) }}
              accessibilityLabel={`Asistencia de ${item.nombre}`}
              android_ripple={{ color: c.primarioSuave }}
              style={[estilos.fila, { borderBottomColor: c.borde, backgroundColor: c.fondo }]}
            >
              <Text style={[estilos.numero, { color: c.textoTenue }]}>{String(index + 1).padStart(2, '0')}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[tipo.cuerpo, { color: c.texto, fontWeight: '600' }]} numberOfLines={1}>{item.nombre}</Text>
                <Text style={[tipo.pie, { color: c.textoSecundario }]}>CUI {item.cui}{item.matriculaId ? ' · matriculado en la app' : ''}</Text>
              </View>
              {hora ? (
                <View style={[estilos.estado, { backgroundColor: c.exitoSuave }]}>
                  <Ionicons name="checkmark" size={14} color={c.exito} />
                  <Text style={[tipo.pie, { color: c.exito, fontWeight: '700' }]}>{hora}</Text>
                </View>
              ) : (
                <View style={[estilos.estado, { borderColor: c.borde, borderWidth: 1 }]}>
                  <Text style={[tipo.pie, { color: c.textoTenue }]}>Pendiente</Text>
                </View>
              )}
            </Pressable>
          );
        }}
      />
      <View style={[estilos.pie, { backgroundColor: c.superficie, borderTopColor: c.borde }]}>
        <Boton titulo="Exportar CSV" icono="download-outline" variante="secundario" onPress={exportar} style={{ flex: 1 }} />
        <Boton titulo="Escanear" icono="scan-outline" onPress={() => navigation.navigate('Docente', { screen: 'Escaner' })} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  resumen: { padding: espacio.l, gap: espacio.s, borderBottomWidth: StyleSheet.hairlineWidth },
  cifras: { flexDirection: 'row', alignItems: 'baseline', gap: espacio.s },
  campo: { flexDirection: 'row', alignItems: 'center', gap: espacio.s, borderWidth: 1, borderRadius: radio.m, paddingHorizontal: espacio.m, minHeight: 40, marginTop: espacio.xs },
  input: { flex: 1, fontSize: 14, paddingVertical: 6 },
  fila: { height: ALTO_FILA, flexDirection: 'row', alignItems: 'center', gap: espacio.m, paddingHorizontal: espacio.l, borderBottomWidth: StyleSheet.hairlineWidth },
  numero: { width: 22, fontSize: 12, fontWeight: '700', fontVariant: ['tabular-nums'] },
  estado: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radio.pill },
  pie: { flexDirection: 'row', gap: espacio.s, padding: espacio.l, borderTopWidth: StyleSheet.hairlineWidth },
});
