/**
 * Interfaz 9 · Escáner de pases QR para el registro de asistencia (RF-08).
 * Layout: la vista de cámara ocupa el fondo y la guía de encuadre se superpone con
 * StyleSheet.absoluteFill; las esquinas del marco son Views con position: 'absolute'.
 * Si la cámara no está disponible, el docente puede digitar el código de verificación.
 */
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Boton, Tarjeta } from '../../components/ui';
import { NOMBRE_DIA, rango, verificarQR } from '../../domain/reglas';
import type { Matricula } from '../../domain/types';
import { codigoVerificacion, curso, useApp, usuario } from '../../state/AppStore';
import { useTema } from '../../theme/ThemeContext';
import { espacio, radio, tipo } from '../../theme/tokens';

type Resultado = { ok: true; matricula: Matricula; hora: string } | { ok: false; mensaje: string };

export default function EscanerScreen() {
  const { c } = useTema();
  const { estado, dispatch } = useApp();
  const [permiso, pedirPermiso] = useCameraPermissions();
  const [codigo, setCodigo] = useState('');
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const bloqueado = useRef(false);

  const registrar = (m: Matricula | undefined) => {
    if (!m || m.estado !== 'confirmada') {
      setResultado({ ok: false, mensaje: 'El pase no corresponde a una matrícula vigente.' });
      return;
    }
    const turno = estado.turnos.find((t) => t.id === m.turnoId)!;
    if (turno.docenteId !== estado.usuario?.id) {
      setResultado({ ok: false, mensaje: `El pase es de ${curso(turno.cursoId).nombre} grupo ${turno.grupo}, que no está a tu cargo.` });
      return;
    }
    const hora = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    dispatch({ tipo: 'MARCAR_ASISTENCIA', filaId: m.id, hora });
    setResultado({ ok: true, matricula: m, hora });
  };

  const alLeer = ({ data }: { data: string }) => {
    if (bloqueado.current) return;
    bloqueado.current = true;
    const v = verificarQR(data);
    registrar(v.valido ? estado.matriculas.find((m) => m.id === v.matriculaId) : undefined);
    setTimeout(() => (bloqueado.current = false), 2500);
  };

  const validarCodigo = () => {
    const limpio = codigo.trim().toUpperCase();
    registrar(estado.matriculas.find((m) => codigoVerificacion(m) === limpio));
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.fondo }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
        <View style={estilos.visor}>
          {permiso?.granted ? (
            <CameraView style={StyleSheet.absoluteFill} facing="back" barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={alLeer} />
          ) : (
            <View style={[StyleSheet.absoluteFill, estilos.sinPermiso]}>
              <Ionicons name="camera-outline" size={40} color="#FFFFFF" />
              <Text style={[tipo.cuerpo, { color: '#FFFFFF', textAlign: 'center' }]}>Se necesita la cámara para leer los pases QR.</Text>
              <Boton titulo="Permitir cámara" icono="lock-open-outline" variante="marca" onPress={pedirPermiso} />
            </View>
          )}
          <View style={[StyleSheet.absoluteFill, estilos.capa]} pointerEvents="none">
            <View style={estilos.marco}>
              {(['si', 'sd', 'ii', 'id'] as const).map((p) => (
                <View key={p} style={[estilos.esquina, estilos[p]]} />
              ))}
            </View>
            <Text style={estilos.ayuda}>Encuadra el código QR del pase</Text>
          </View>
        </View>

        {resultado && (
          <Tarjeta style={[estilos.resultado, { borderColor: resultado.ok ? c.exito : c.peligro, backgroundColor: resultado.ok ? c.exitoSuave : c.peligroSuave }]}>
            <Ionicons name={resultado.ok ? 'checkmark-circle' : 'close-circle'} size={32} color={resultado.ok ? c.exito : c.peligro} />
            <View style={{ flex: 1, gap: 2 }}>
              {resultado.ok ? (
                (() => {
                  const t = estado.turnos.find((x) => x.id === resultado.matricula.turnoId)!;
                  return (
                    <>
                      <Text style={[tipo.etiqueta, { color: c.exito }]}>Asistencia registrada · {resultado.hora}</Text>
                      <Text style={[tipo.cuerpo, { color: c.texto, fontWeight: '700' }]}>{usuario(resultado.matricula.estudianteId)?.nombre}</Text>
                      <Text style={[tipo.pie, { color: c.textoSecundario }]}>{curso(t.cursoId).nombre} · Grupo {t.grupo} · {NOMBRE_DIA[t.dia]} {rango(t)}</Text>
                    </>
                  );
                })()
              ) : (
                <>
                  <Text style={[tipo.etiqueta, { color: c.peligro }]}>Pase rechazado</Text>
                  <Text style={[tipo.cuerpo, { color: c.texto }]}>{resultado.mensaje}</Text>
                </>
              )}
            </View>
          </Tarjeta>
        )}

        <Tarjeta style={{ gap: espacio.m }}>
          <Text style={[tipo.subtitulo, { color: c.texto }]}>Ingreso manual</Text>
          <Text style={[tipo.cuerpo, { color: c.textoSecundario }]}>Si la cámara falla, digita el código de verificación de 8 caracteres que aparece bajo el QR del estudiante.</Text>
          <TextInput
            value={codigo}
            onChangeText={(v) => setCodigo(v.toUpperCase().replace(/[^0-9A-F]/g, '').slice(0, 8))}
            placeholder="Ej. 3FA92C1B"
            placeholderTextColor={c.textoTenue}
            autoCapitalize="none"
            autoCorrect={false}
            style={[estilos.input, { color: c.texto, borderColor: c.borde, backgroundColor: c.fondo }]}
            accessibilityLabel="Código de verificación"
            onSubmitEditing={validarCodigo}
          />
          <Boton titulo="Validar código" icono="shield-checkmark-outline" onPress={validarCodigo} deshabilitado={codigo.trim().length !== 8} />
        </Tarjeta>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const LADO = 220;
const estilos = StyleSheet.create({
  contenido: { padding: espacio.l, gap: espacio.l, paddingBottom: espacio.xxl },
  visor: { height: 340, borderRadius: radio.l + 4, overflow: 'hidden', backgroundColor: '#0B1118' },
  sinPermiso: { alignItems: 'center', justifyContent: 'center', gap: espacio.m, padding: espacio.xl },
  capa: { alignItems: 'center', justifyContent: 'center', gap: espacio.l },
  marco: { width: LADO, height: LADO },
  esquina: { position: 'absolute', width: 36, height: 36, borderColor: '#FFFFFF' },
  si: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 12 },
  sd: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 12 },
  ii: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 12 },
  id: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 12 },
  ayuda: { color: '#FFFFFF', fontWeight: '600', backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: espacio.m, paddingVertical: 6, borderRadius: radio.pill, overflow: 'hidden' },
  resultado: { flexDirection: 'row', alignItems: 'center', gap: espacio.m, borderWidth: 1.5 },
  input: { borderWidth: 1, borderRadius: radio.m, paddingHorizontal: espacio.m, minHeight: 48, fontSize: 20, letterSpacing: 4, fontWeight: '700', textAlign: 'center' },
});
