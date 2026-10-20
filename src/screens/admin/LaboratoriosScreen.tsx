/**
 * Interfaz 10 · Gestión de laboratorios (RF-09).
 * Layout: FlatList con numColumns calculado con useWindowDimensions (1 columna en teléfonos,
 * 2 en tabletas pequeñas o teléfonos en horizontal y 3 en tabletas grandes). Al cambiar el número de columnas la lista
 * debe montarse de nuevo, por eso la prop key depende de él. La edición usa el Modal nativo.
 */
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Switch, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { BarraProgreso, Boton, Insignia, Tarjeta } from '../../components/ui';
import type { Laboratorio } from '../../domain/types';
import { useApp } from '../../state/AppStore';
import { useTema } from '../../theme/ThemeContext';
import { espacio, radio, tipo } from '../../theme/tokens';

function Stepper({ valor, onCambiar, min, max }: { valor: number; onCambiar: (v: number) => void; min: number; max: number }) {
  const { c } = useTema();
  const boton = (icono: 'remove' | 'add', delta: number) => (
    <Pressable
      onPress={() => onCambiar(Math.min(max, Math.max(min, valor + delta)))}
      accessibilityRole="button"
      accessibilityLabel={delta > 0 ? 'Aumentar capacidad' : 'Disminuir capacidad'}
      style={[estilos.paso, { borderColor: c.borde, backgroundColor: c.fondo }]}
    >
      <Ionicons name={icono} size={16} color={c.primario} />
    </Pressable>
  );
  return (
    <View style={estilos.stepper}>
      {boton('remove', -1)}
      <Text style={[tipo.subtitulo, { color: c.texto, minWidth: 28, textAlign: 'center' }]}>{valor}</Text>
      {boton('add', 1)}
    </View>
  );
}

export default function LaboratoriosScreen() {
  const { c } = useTema();
  const { estado, dispatch } = useApp();
  const { width } = useWindowDimensions();
  const [edicion, setEdicion] = useState<Laboratorio | null>(null);
  const columnas = width < 600 ? 1 : width < 960 ? 2 : 3;

  const guardar = (l: Laboratorio) => dispatch({ tipo: 'ACTUALIZAR_LABORATORIO', laboratorio: l });
  const asignados = (id: string) => estado.turnos.filter((t) => t.laboratorioId === id);
  const totalPcs = estado.laboratorios.filter((l) => l.operativo).reduce((s, l) => s + l.capacidadPcs, 0);

  return (
    <View style={{ flex: 1, backgroundColor: c.fondo }}>
      <FlatList
        key={columnas}
        data={estado.laboratorios}
        numColumns={columnas}
        keyExtractor={(l) => l.id}
        contentContainerStyle={estilos.contenido}
        columnWrapperStyle={columnas > 1 ? { gap: espacio.m } : undefined}
        ItemSeparatorComponent={() => <View style={{ height: espacio.m }} />}
        ListHeaderComponent={
          <View style={[estilos.resumen, { backgroundColor: c.primario }]}>
            <Ionicons name="desktop-outline" size={28} color={c.sobrePrimario} />
            <View style={{ flex: 1 }}>
              <Text style={[tipo.cifra, { color: c.sobrePrimario }]}>{totalPcs} PC</Text>
              <Text style={[tipo.pie, { color: c.sobrePrimario, opacity: 0.85 }]}>operativas en {estado.laboratorios.filter((l) => l.operativo).length} de {estado.laboratorios.length} ambientes</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const turnos = asignados(item.id);
          const ocupadas = turnos.reduce((s, t) => s + t.cuposOcupados, 0);
          const ofertadas = turnos.reduce((s, t) => s + t.cuposTotales, 0);
          return (
            <Tarjeta style={[estilos.tarjeta, !item.operativo && { opacity: 0.75 }]}>
              <View style={estilos.cabecera}>
                <Text style={[tipo.cuerpo, { color: c.texto, fontWeight: '700', flex: 1 }]} numberOfLines={1}>{item.nombre}</Text>
                <Insignia estado={item.operativo ? 'verde' : 'rojo'} texto={item.operativo ? 'Operativo' : 'Inhabilitado'} />
              </View>
              <Text style={[tipo.pie, { color: c.textoSecundario }]} numberOfLines={2}>{item.pabellon}</Text>
              <Text style={[tipo.pie, { color: c.textoTenue }]} numberOfLines={2}>{item.equipamiento}</Text>
              <View style={estilos.cabecera}>
                <Text style={[tipo.etiqueta, { color: c.textoSecundario }]}>Capacidad (PC)</Text>
                <Stepper valor={item.capacidadPcs} min={10} max={40} onCambiar={(v) => guardar({ ...item, capacidadPcs: v })} />
              </View>
              <BarraProgreso valor={ocupadas} total={Math.max(1, ofertadas)} />
              <Text style={[tipo.pie, { color: c.textoSecundario }]}>{turnos.length} grupo(s) · {ocupadas}/{ofertadas} puestos reservados</Text>
              <View style={estilos.cabecera}>
                <Text style={[tipo.etiqueta, { color: c.textoSecundario }]}>Habilitado para matrícula</Text>
                <Switch value={item.operativo} onValueChange={(v) => guardar({ ...item, operativo: v })} trackColor={{ true: c.primario, false: c.borde }} accessibilityLabel={`Habilitar ${item.nombre}`} />
              </View>
              <Boton titulo="Editar datos" icono="create-outline" variante="secundario" onPress={() => setEdicion(item)} accessibilityLabel={`Editar ${item.nombre}`} />
            </Tarjeta>
          );
        }}
      />

      <Modal visible={edicion !== null} animationType="slide" transparent onRequestClose={() => setEdicion(null)}>
        <Pressable style={estilos.velo} onPress={() => setEdicion(null)} accessibilityLabel="Cerrar edición" />
        {edicion && (
          <View style={[estilos.hoja, { backgroundColor: c.superficie }]}>
            <View style={[estilos.asa, { backgroundColor: c.borde }]} />
            <Text style={[tipo.subtitulo, { color: c.texto }]}>Editar {edicion.nombre}</Text>
            {([['nombre', 'Nombre'], ['pabellon', 'Ubicación'], ['equipamiento', 'Equipamiento']] as const).map(([campo, etiqueta]) => (
              <View key={campo} style={{ gap: espacio.xs }}>
                <Text style={[tipo.etiqueta, { color: c.textoSecundario }]}>{etiqueta}</Text>
                <TextInput
                  value={edicion[campo]}
                  onChangeText={(v) => setEdicion({ ...edicion, [campo]: v })}
                  style={[estilos.input, { color: c.texto, borderColor: c.borde, backgroundColor: c.fondo }]}
                  accessibilityLabel={etiqueta}
                />
              </View>
            ))}
            <View style={{ flexDirection: 'row', gap: espacio.s }}>
              <Boton titulo="Cancelar" variante="fantasma" onPress={() => setEdicion(null)} style={{ flex: 1 }} />
              <Boton titulo="Guardar" icono="save-outline" onPress={() => { guardar(edicion); setEdicion(null); }} style={{ flex: 1 }} />
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: espacio.l, paddingBottom: espacio.xxl },
  resumen: { flexDirection: 'row', alignItems: 'center', gap: espacio.l, padding: espacio.l, borderRadius: radio.l, marginBottom: espacio.l },
  tarjeta: { flex: 1, gap: espacio.s },
  cabecera: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: espacio.s },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: espacio.s },
  paso: { width: 32, height: 32, borderRadius: radio.s, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  velo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  hoja: { padding: espacio.xl, gap: espacio.m, borderTopLeftRadius: radio.l + 8, borderTopRightRadius: radio.l + 8 },
  asa: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2 },
  input: { borderWidth: 1, borderRadius: radio.m, paddingHorizontal: espacio.m, minHeight: 44, fontSize: 15 },
});
