/**
 * Interfaz 1 · Inicio de sesión institucional (RF-01).
 * Layout: KeyboardAvoidingView + ScrollView para que el formulario no quede bajo el teclado,
 * y una columna flex centrada con ancho máximo para tabletas y web.
 */
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Boton } from '../components/ui';
import { USUARIOS } from '../domain/datos';
import type { Rol, Usuario } from '../domain/types';
import type { PantallaRaiz } from '../navigation/tipos';
import { useApp, usuarioDemo } from '../state/AppStore';
import { useTema } from '../theme/ThemeContext';
import { espacio, radio, tipo } from '../theme/tokens';

const CLAVE_DEMO = 'unsa2026';
const DESTINO: Record<Rol, 'Estudiante' | 'Docente' | 'Admin'> = { estudiante: 'Estudiante', docente: 'Docente', admin: 'Admin' };

export default function LoginScreen({ navigation }: PantallaRaiz<'Login'>) {
  const { c } = useTema();
  const { dispatch } = useApp();
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [verClave, setVerClave] = useState(false);
  const [recordar, setRecordar] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const entrar = (u: Usuario) => {
    dispatch({ tipo: 'INICIAR_SESION', usuario: u });
    navigation.reset({ index: 0, routes: [{ name: DESTINO[u.rol] }] });
  };

  const validar = () => {
    const limpio = correo.trim().toLowerCase();
    if (!/^[a-z0-9._-]+@unsa\.edu\.pe$/.test(limpio)) return setError('Usa tu correo institucional @unsa.edu.pe.');
    if (clave.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.');
    const u = USUARIOS.find((x) => x.correo === limpio);
    if (!u || clave !== CLAVE_DEMO) return setError('Correo o contraseña incorrectos.');
    setError(null);
    entrar(u);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.primario }} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={estilos.scroll} keyboardShouldPersistTaps="handled">
          <View style={estilos.cabecera}>
            <Text style={[estilos.marca, { color: c.sobrePrimario }]}>MatriLab</Text>
            <Text style={{ color: c.sobrePrimario, opacity: 0.85, fontSize: 15 }}>Matrícula de laboratorios · EPIS-UNSA</Text>
          </View>

          <View style={[estilos.tarjeta, { backgroundColor: c.superficie }]}>
            <View style={estilos.logoCaja}>
              <Image source={require('../../assets/img/logo_episunsa.png')} style={estilos.logo} resizeMode="contain" accessibilityLabel="Logo EPIS-UNSA" />
            </View>
            <Text style={[tipo.titulo, { color: c.texto }]}>Iniciar sesión</Text>
            <Text style={[tipo.cuerpo, { color: c.textoSecundario, marginBottom: espacio.l }]}>Ingresa con tu cuenta institucional.</Text>

            <Text style={[tipo.etiqueta, { color: c.textoSecundario }]}>Correo institucional</Text>
            <View style={[estilos.campo, { borderColor: c.borde, backgroundColor: c.fondo }]}>
              <Ionicons name="mail-outline" size={18} color={c.textoTenue} />
              <TextInput
                value={correo}
                onChangeText={setCorreo}
                placeholder="usuario@unsa.edu.pe"
                placeholderTextColor={c.textoTenue}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
                accessibilityLabel="Correo institucional"
                style={[estilos.input, { color: c.texto }]}
              />
            </View>

            <Text style={[tipo.etiqueta, { color: c.textoSecundario, marginTop: espacio.m }]}>Contraseña</Text>
            <View style={[estilos.campo, { borderColor: c.borde, backgroundColor: c.fondo }]}>
              <Ionicons name="lock-closed-outline" size={18} color={c.textoTenue} />
              <TextInput
                value={clave}
                onChangeText={setClave}
                placeholder="••••••••"
                placeholderTextColor={c.textoTenue}
                secureTextEntry={!verClave}
                textContentType="password"
                onSubmitEditing={validar}
                accessibilityLabel="Contraseña"
                style={[estilos.input, { color: c.texto }]}
              />
              <Pressable onPress={() => setVerClave((v) => !v)} hitSlop={10} accessibilityLabel={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                <Ionicons name={verClave ? 'eye-off-outline' : 'eye-outline'} size={20} color={c.textoTenue} />
              </Pressable>
            </View>

            <View style={estilos.recordar}>
              <Text style={[tipo.cuerpo, { color: c.textoSecundario }]}>Mantener la sesión iniciada</Text>
              <Switch value={recordar} onValueChange={setRecordar} trackColor={{ true: c.primario, false: c.borde }} accessibilityLabel="Mantener la sesión iniciada" />
            </View>

            {error && (
              <View style={[estilos.error, { backgroundColor: c.peligroSuave }]} accessibilityLiveRegion="polite">
                <Ionicons name="alert-circle" size={18} color={c.peligro} />
                <Text style={[tipo.etiqueta, { color: c.peligro, flex: 1 }]}>{error}</Text>
              </View>
            )}

            <Boton titulo="Ingresar" icono="log-in-outline" onPress={validar} variante="marca" accessibilityLabel="Ingresar" />

            <View style={estilos.separador}>
              <View style={[estilos.linea, { backgroundColor: c.borde }]} />
              <Text style={[tipo.pie, { color: c.textoTenue }]}>Acceso de demostración</Text>
              <View style={[estilos.linea, { backgroundColor: c.borde }]} />
            </View>
            <View style={estilos.demos}>
              {(['estudiante', 'docente', 'admin'] as Rol[]).map((rol) => (
                <Boton
                  key={rol}
                  variante="secundario"
                  titulo={{ estudiante: 'Estudiante', docente: 'Docente', admin: 'Admin' }[rol]}
                  icono={{ estudiante: 'school-outline', docente: 'easel-outline', admin: 'settings-outline' }[rol] as never}
                  onPress={() => entrar(usuarioDemo(rol))}
                  accessibilityLabel={`Demo ${rol}`}
                  style={{ flex: 1, paddingHorizontal: espacio.s }}
                />
              ))}
            </View>
          </View>

          <Text style={[tipo.pie, estilos.legal, { color: c.sobrePrimario }]}>
            Tus datos se tratan conforme a la Ley N.° 29733 de Protección de Datos Personales.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', padding: espacio.xl, gap: espacio.xl },
  cabecera: { alignItems: 'center', gap: espacio.xs },
  marca: { fontSize: 36, fontWeight: '800', letterSpacing: 0.5 },
  tarjeta: { borderRadius: radio.l + 4, padding: espacio.xl, width: '100%', maxWidth: 440, alignSelf: 'center', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)' },
  logoCaja: { alignItems: 'center', marginBottom: espacio.l },
  logo: { width: 180, height: 54 },
  campo: { flexDirection: 'row', alignItems: 'center', gap: espacio.s, borderWidth: 1, borderRadius: radio.m, paddingHorizontal: espacio.m, minHeight: 48, marginTop: espacio.xs },
  input: { flex: 1, fontSize: 16, paddingVertical: espacio.s },
  recordar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: espacio.l },
  error: { flexDirection: 'row', gap: espacio.s, alignItems: 'center', padding: espacio.m, borderRadius: radio.m, marginBottom: espacio.m },
  separador: { flexDirection: 'row', alignItems: 'center', gap: espacio.s, marginVertical: espacio.l },
  linea: { flex: 1, height: StyleSheet.hairlineWidth },
  demos: { flexDirection: 'row', gap: espacio.s },
  legal: { textAlign: 'center', opacity: 0.8, paddingHorizontal: espacio.l },
});
