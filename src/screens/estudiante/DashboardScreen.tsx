/**
 * Interfaz 2 · Panel del estudiante.
 * Layout: ScrollView con RefreshControl; fila de KPI con flexWrap (dos columnas que se reacomodan
 * según el ancho) y tarjetas con una franja de color posicionada con flexDirection: 'row'.
 */
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar, Boton, Insignia, Kpi, Tarjeta, TituloSeccion, Vacio } from '../../components/ui';
import { NOMBRE_DIA, cuposLibres, ordenarBloques, rango, ventanaAbierta } from '../../domain/reglas';
import type { PantallaEstudiante } from '../../navigation/tipos';
import { curso, laboratorio, matriculasActivas, useApp } from '../../state/AppStore';
import { useTema } from '../../theme/ThemeContext';
import { espacio, radio, tipo } from '../../theme/tokens';

export default function DashboardScreen({ navigation }: PantallaEstudiante<'Inicio'>) {
  const { c } = useTema();
  const { estado, dispatch } = useApp();
  const [refrescando, setRefrescando] = useState(false);

  const activas = matriculasActivas(estado);
  const turnosPropios = ordenarBloques(activas.map((m) => ({ ...estado.turnos.find((t) => t.id === m.turnoId)!, matriculaId: m.id })));
  const abierta = ventanaAbierta(estado.config, new Date());
  const creditos = turnosPropios.reduce((s, t) => s + curso(t.cursoId).creditos, 0);
  const libres = estado.turnos.reduce((s, t) => s + cuposLibres(t), 0);
  const cierre = new Date(estado.config.fin);

  const refrescar = useCallback(() => {
    setRefrescando(true);
    setTimeout(() => setRefrescando(false), 700);
  }, []);

  const anular = (matriculaId: string, nombre: string) =>
    Alert.alert('Anular matrícula', `¿Liberar tu cupo en ${nombre}? El cupo quedará disponible para otro estudiante.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Anular', style: 'destructive', onPress: () => dispatch({ tipo: 'ANULAR', matriculaId }) },
    ]);

  return (
    <ScrollView
      style={{ backgroundColor: c.fondo }}
      contentContainerStyle={estilos.contenido}
      refreshControl={<RefreshControl refreshing={refrescando} onRefresh={refrescar} colors={[c.marca]} tintColor={c.marca} />}
    >
      <View style={estilos.saludo}>
        <Avatar nombre={estado.usuario?.nombre ?? 'Estudiante'} tamano={52} />
        <View style={{ flex: 1 }}>
          <Text style={[tipo.pie, { color: c.textoSecundario }]}>Semestre 2026-B · CUI {estado.usuario?.cui}</Text>
          <Text style={[tipo.subtitulo, { color: c.texto }]} numberOfLines={1}>Hola, {estado.usuario?.nombre.split(', ')[1]?.split(' ')[0]}</Text>
        </View>
        <Ionicons name="notifications-outline" size={24} color={c.textoSecundario} accessibilityLabel="Notificaciones" />
      </View>

      <Tarjeta style={[estilos.ventana, { backgroundColor: abierta ? c.primario : c.peligroSuave, borderColor: 'transparent' }]}>
        <View style={{ flex: 1, gap: espacio.xs }}>
          <Text style={[tipo.etiqueta, { color: abierta ? c.sobrePrimario : c.peligro, opacity: 0.9 }]}>{abierta ? 'MATRÍCULA ABIERTA' : 'MATRÍCULA CERRADA'}</Text>
          <Text style={[tipo.subtitulo, { color: abierta ? c.sobrePrimario : c.peligro }]}>
            {abierta ? `Cierra el ${cierre.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}` : 'Consulta la nueva fecha con coordinación'}
          </Text>
        </View>
        <Ionicons name={abierta ? 'time-outline' : 'lock-closed'} size={32} color={abierta ? c.sobrePrimario : c.peligro} />
      </Tarjeta>

      <View style={estilos.kpis}>
        <Kpi valor={String(activas.length)} etiqueta="Laboratorios matriculados" icono="flask-outline" />
        <Kpi valor={String(creditos)} etiqueta="Créditos con laboratorio" icono="ribbon-outline" color={c.marca} />
        <Kpi valor={String(libres)} etiqueta="Vacantes libres en la oferta" icono="desktop-outline" color={c.exito} />
        <Kpi valor={String(estado.config.maxLaboratoriosPorEstudiante - activas.length)} etiqueta="Laboratorios que aún puedes tomar" icono="add-circle-outline" color={c.alerta} />
      </View>

      <TituloSeccion titulo="Mis laboratorios" accion="Ver catálogo" onAccion={() => navigation.navigate('Catalogo')} />
      {turnosPropios.length === 0 ? (
        <Vacio icono="flask-outline" titulo="Aún no tienes laboratorios" detalle="Elige un grupo en el catálogo; el sistema valida cruces de horario por ti." />
      ) : (
        <View style={{ gap: espacio.m }}>
          {turnosPropios.map((t) => {
            const cur = curso(t.cursoId);
            const lab = laboratorio(estado, t.laboratorioId);
            return (
              <Tarjeta key={t.id} style={estilos.matricula}>
                <View style={[estilos.franja, { backgroundColor: cur.color }]} />
                <View style={{ flex: 1, gap: espacio.s }}>
                  <View style={estilos.filaEntre}>
                    <Text style={[tipo.cuerpo, { color: c.texto, fontWeight: '700', flex: 1 }]} numberOfLines={2}>{cur.nombre}</Text>
                    <Insignia estado="info" texto={`Grupo ${t.grupo}`} />
                  </View>
                  <View style={estilos.meta}>
                    <Ionicons name="calendar-outline" size={14} color={c.textoSecundario} />
                    <Text style={[tipo.pie, { color: c.textoSecundario }]}>{NOMBRE_DIA[t.dia]} · {rango(t)}</Text>
                    <Ionicons name="location-outline" size={14} color={c.textoSecundario} />
                    <Text style={[tipo.pie, { color: c.textoSecundario }]}>{lab.nombre}</Text>
                  </View>
                  <View style={estilos.acciones}>
                    <Boton titulo="Ver pase QR" icono="qr-code-outline" onPress={() => navigation.navigate('FichaQR', { matriculaId: t.matriculaId })} style={{ flex: 1 }} accessibilityLabel={`Pase ${cur.nombre}`} />
                    {estado.config.permitirAnulacion && (
                      <Boton titulo="Anular" variante="fantasma" icono="close-circle-outline" onPress={() => anular(t.matriculaId, cur.nombre)} accessibilityLabel={`Anular ${cur.nombre}`} />
                    )}
                  </View>
                </View>
              </Tarjeta>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: espacio.l, paddingBottom: espacio.xxl },
  saludo: { flexDirection: 'row', alignItems: 'center', gap: espacio.m, marginBottom: espacio.l },
  ventana: { flexDirection: 'row', alignItems: 'center', gap: espacio.m },
  kpis: { flexDirection: 'row', flexWrap: 'wrap', gap: espacio.m, marginTop: espacio.l },
  matricula: { flexDirection: 'row', gap: espacio.m, paddingLeft: espacio.m },
  franja: { width: 5, borderRadius: radio.pill },
  filaEntre: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: espacio.s },
  meta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  acciones: { flexDirection: 'row', gap: espacio.s, marginTop: espacio.xs },
});
