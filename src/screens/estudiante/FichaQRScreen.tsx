/**
 * Interfaz 5 · Ficha de matrícula con pase QR (RF-06).
 * Layout: la tarjeta del pase tiene dos zonas separadas por perforaciones dibujadas con
 * position: 'absolute', y el sello "Confirmada" se superpone en la esquina con absolute + top/right.
 */
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Share, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Boton } from '../../components/ui';
import { NOMBRE_DIA, payloadQR, rango } from '../../domain/reglas';
import type { PantallaRaiz } from '../../navigation/tipos';
import { codigoVerificacion, curso, laboratorio, useApp, usuario } from '../../state/AppStore';
import { useTema } from '../../theme/ThemeContext';
import { espacio, radio, tipo } from '../../theme/tokens';

export default function FichaQRScreen({ route }: PantallaRaiz<'FichaQR'>) {
  const { c } = useTema();
  const { estado } = useApp();
  const { width } = useWindowDimensions();
  const m = estado.matriculas.find((x) => x.id === route.params.matriculaId);
  if (!m) return null;
  const turno = estado.turnos.find((t) => t.id === m.turnoId)!;
  const cur = curso(turno.cursoId);
  const lab = laboratorio(estado, turno.laboratorioId);
  const est = usuario(m.estudianteId)!;
  const ladoQR = Math.min(220, width - 140);
  const codigo = codigoVerificacion(m);

  const compartir = () =>
    Share.share({ message: `Pase MatriLab ${m.id} · ${cur.nombre} grupo ${turno.grupo} · ${NOMBRE_DIA[turno.dia]} ${rango(turno)} · ${lab.nombre} · Código ${codigo}` });

  return (
    <ScrollView style={{ backgroundColor: c.fondo }} contentContainerStyle={estilos.contenido}>
      <View style={[estilos.pase, { backgroundColor: c.superficie, borderColor: c.borde }]}>
        <View style={[estilos.superior, { backgroundColor: c.primario }]}>
          <Text style={[tipo.pie, { color: c.sobrePrimario, opacity: 0.85 }]}>PASE DE LABORATORIO · 2026-B</Text>
          <Text style={[tipo.subtitulo, { color: c.sobrePrimario }]}>{cur.nombre}</Text>
          <Text style={[tipo.cuerpo, { color: c.sobrePrimario, opacity: 0.9 }]}>Grupo {turno.grupo} · {NOMBRE_DIA[turno.dia]} {rango(turno)}</Text>
          <View style={[estilos.sello, { backgroundColor: c.exito }]}>
            <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
            <Text style={estilos.textoSello}>{m.estado === 'confirmada' ? 'Confirmada' : 'Anulada'}</Text>
          </View>
        </View>

        <View style={estilos.perforacion}>
          <View style={[estilos.muesca, { left: -12, backgroundColor: c.fondo }]} />
          <View style={[estilos.guiones, { borderColor: c.borde }]} />
          <View style={[estilos.muesca, { right: -12, backgroundColor: c.fondo }]} />
        </View>

        <View style={estilos.inferior}>
          <View style={[estilos.marcoQR, { borderColor: c.borde }]} accessibilityLabel="Código QR del pase">
            <QRCode value={payloadQR(m)} size={ladoQR} color="#14202E" backgroundColor="#FFFFFF" />
          </View>
          <Text style={[tipo.pie, { color: c.textoSecundario }]}>Código de verificación</Text>
          <Text style={[estilos.codigo, { color: c.texto }]} selectable>{codigo}</Text>
          <View style={estilos.datos}>
            {[
              ['Estudiante', est.nombre],
              ['CUI', est.cui ?? ''],
              ['Ambiente', `${lab.nombre} · ${lab.pabellon}`],
              ['Matrícula', `${m.id} · ${new Date(m.fecha).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' })}`],
            ].map(([k, v]) => (
              <View key={k} style={estilos.dato}>
                <Text style={[tipo.pie, { color: c.textoTenue }]}>{k}</Text>
                <Text style={[tipo.etiqueta, { color: c.texto }]}>{v}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <Text style={[tipo.pie, { color: c.textoSecundario, textAlign: 'center' }]}>Muestra este código al docente en la puerta del laboratorio para registrar tu asistencia.</Text>
      <Boton titulo="Compartir pase" icono="share-social-outline" variante="secundario" onPress={compartir} />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: espacio.l, gap: espacio.l, paddingBottom: espacio.xxl },
  pase: { borderRadius: radio.l + 4, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden', boxShadow: '0 6px 18px rgba(16, 32, 48, 0.12)' },
  superior: { padding: espacio.xl, gap: espacio.xs, paddingRight: 120 },
  sello: { position: 'absolute', top: espacio.l, right: espacio.l, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radio.pill },
  textoSello: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  perforacion: { height: 24, justifyContent: 'center' },
  muesca: { position: 'absolute', width: 24, height: 24, borderRadius: 12 },
  guiones: { marginHorizontal: espacio.xl, borderTopWidth: 2, borderStyle: 'dashed' },
  inferior: { alignItems: 'center', padding: espacio.xl, paddingTop: espacio.s, gap: espacio.s },
  marcoQR: { padding: espacio.m, backgroundColor: '#FFFFFF', borderRadius: radio.m, borderWidth: 1 },
  codigo: { fontSize: 22, fontWeight: '800', letterSpacing: 4, fontVariant: ['tabular-nums'] },
  datos: { alignSelf: 'stretch', flexDirection: 'row', flexWrap: 'wrap', rowGap: espacio.m, marginTop: espacio.m },
  dato: { width: '50%', paddingRight: espacio.s, gap: 2 },
});
