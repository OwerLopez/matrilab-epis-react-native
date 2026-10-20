/**
 * Interfaz 12 · Perfil y ajustes (común a los tres roles).
 * Layout: lista de ajustes con filas icono / texto / control a la derecha; la sección de
 * dispositivo muestra Platform y useWindowDimensions para evidenciar el entorno de ejecución.
 */
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Switch, Text, View, useWindowDimensions } from 'react-native';
import { Avatar, Boton, Chip, FilaAjuste, Tarjeta, TituloSeccion } from '../components/ui';
import { useApp } from '../state/AppStore';
import { useTema } from '../theme/ThemeContext';
import { espacio, tipo } from '../theme/tokens';

const ROL = { estudiante: 'Estudiante', docente: 'Docente / Jefe de prácticas', admin: 'Administración de laboratorios' };

export default function PerfilScreen() {
  const { c, preferencia, setPreferencia } = useTema();
  const { estado, dispatch } = useApp();
  const navigation = useNavigation();
  const { width, height, fontScale } = useWindowDimensions();
  const [avisos, setAvisos] = useState(true);
  const [recordatorios, setRecordatorios] = useState(true);
  const u = estado.usuario;

  const salir = () => {
    dispatch({ tipo: 'CERRAR_SESION' });
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] }));
  };

  const interruptor = (valor: boolean, set: (v: boolean) => void, etiqueta: string) => (
    <Switch value={valor} onValueChange={set} trackColor={{ true: c.primario, false: c.borde }} accessibilityLabel={etiqueta} />
  );

  return (
    <ScrollView style={{ backgroundColor: c.fondo }} contentContainerStyle={estilos.contenido}>
      <Tarjeta style={estilos.cabecera}>
        <Avatar nombre={u?.nombre ?? '?'} tamano={64} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[tipo.subtitulo, { color: c.texto }]}>{u?.nombre}</Text>
          <Text style={[tipo.pie, { color: c.textoSecundario }]}>{u?.correo}</Text>
          <Text style={[tipo.etiqueta, { color: c.marca }]}>{u ? ROL[u.rol] : ''}{u?.cui ? ` · CUI ${u.cui}` : ''}</Text>
        </View>
      </Tarjeta>

      <TituloSeccion titulo="Apariencia" />
      <Tarjeta style={{ gap: espacio.m }}>
        <Text style={[tipo.cuerpo, { color: c.textoSecundario }]}>Tema de la aplicación</Text>
        <View style={estilos.chips}>
          <Chip texto="Sistema" icono="phone-portrait-outline" activo={preferencia === 'sistema'} onPress={() => setPreferencia('sistema')} />
          <Chip texto="Claro" icono="sunny-outline" activo={preferencia === 'claro'} onPress={() => setPreferencia('claro')} />
          <Chip texto="Oscuro" icono="moon-outline" activo={preferencia === 'oscuro'} onPress={() => setPreferencia('oscuro')} />
        </View>
      </Tarjeta>

      <TituloSeccion titulo="Notificaciones" />
      <Tarjeta style={{ paddingVertical: 0 }}>
        <FilaAjuste icono="notifications-outline" titulo="Cambios de vacantes" detalle="Aviso cuando se libera un cupo" derecha={interruptor(avisos, setAvisos, 'Cambios de vacantes')} />
        <FilaAjuste icono="alarm-outline" titulo="Recordatorio de sesión" detalle="30 minutos antes del laboratorio" derecha={interruptor(recordatorios, setRecordatorios, 'Recordatorio de sesión')} />
      </Tarjeta>

      <TituloSeccion titulo="Dispositivo" />
      <Tarjeta style={{ paddingVertical: 0 }}>
        <FilaAjuste icono="hardware-chip-outline" titulo="Plataforma" detalle={`${Platform.OS} · versión ${String(Platform.Version)}`} />
        <FilaAjuste icono="resize-outline" titulo="Ventana" detalle={`${Math.round(width)} × ${Math.round(height)} dp · escala de texto ${fontScale.toFixed(2)}`} />
        <FilaAjuste icono="information-circle-outline" titulo="Acerca de MatriLab" detalle="Versión 1.0.0 · React Native + Expo SDK 58" />
      </Tarjeta>

      <Boton titulo="Cerrar sesión" icono="log-out-outline" variante="fantasma" onPress={salir} style={{ marginTop: espacio.xl }} accessibilityLabel="Cerrar sesión" />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: espacio.l, paddingBottom: espacio.xxl },
  cabecera: { flexDirection: 'row', alignItems: 'center', gap: espacio.l },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: espacio.s },
});
