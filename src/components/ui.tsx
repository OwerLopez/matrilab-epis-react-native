/**
 * Componentes de interfaz reutilizables construidos solo con primitivas de React Native
 * (View, Text, Pressable, Image). Ninguno usa librerías de UI externas.
 */
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import type { Semaforo } from '../domain/types';
import { useTema } from '../theme/ThemeContext';
import { espacio, radio, tipo } from '../theme/tokens';

type Icono = ComponentProps<typeof Ionicons>['name'];

export function Tarjeta({ children, style, onPress, accessibilityLabel }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; accessibilityLabel?: string }) {
  const { c } = useTema();
  const base = [estilos.tarjeta, { backgroundColor: c.superficie, borderColor: c.borde }, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      android_ripple={{ color: c.primarioSuave }}
      style={({ pressed }) => [base, pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] }]}
    >
      {children}
    </Pressable>
  );
}

type VarianteBoton = 'primario' | 'marca' | 'secundario' | 'fantasma';

export function Boton({ titulo, onPress, variante = 'primario', icono, deshabilitado, cargando, accessibilityLabel, style }: {
  titulo: string; onPress: () => void; variante?: VarianteBoton; icono?: Icono; deshabilitado?: boolean; cargando?: boolean; accessibilityLabel?: string; style?: StyleProp<ViewStyle>;
}) {
  const { c } = useTema();
  const fondo = { primario: c.primario, marca: c.marca, secundario: c.primarioSuave, fantasma: 'transparent' }[variante];
  const color = variante === 'primario' || variante === 'marca' ? c.sobrePrimario : c.primario;
  return (
    <Pressable
      onPress={onPress}
      disabled={deshabilitado || cargando}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? titulo}
      accessibilityState={{ disabled: Boolean(deshabilitado), busy: Boolean(cargando) }}
      android_ripple={{ color: 'rgba(255,255,255,0.25)' }}
      style={({ pressed }) => [
        estilos.boton,
        { backgroundColor: fondo, borderColor: variante === 'fantasma' ? c.borde : fondo, opacity: deshabilitado ? 0.45 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {icono && <Ionicons name={icono} size={18} color={color} />}
      <Text style={[tipo.etiqueta, { color, fontSize: 15 }]}>{cargando ? 'Procesando…' : titulo}</Text>
    </Pressable>
  );
}

export function Chip({ texto, activo, onPress, icono }: { texto: string; activo?: boolean; onPress?: () => void; icono?: Icono }) {
  const { c } = useTema();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: Boolean(activo) }}
      accessibilityLabel={texto}
      style={[estilos.chip, { backgroundColor: activo ? c.primario : c.superficie, borderColor: activo ? c.primario : c.borde }]}
    >
      {icono && <Ionicons name={icono} size={14} color={activo ? c.sobrePrimario : c.textoSecundario} />}
      <Text style={[tipo.etiqueta, { color: activo ? c.sobrePrimario : c.textoSecundario }]}>{texto}</Text>
    </Pressable>
  );
}

const ETIQUETA_SEMAFORO: Record<Semaforo, string> = { verde: 'Disponible', ambar: 'Últimos cupos', rojo: 'Agotado' };

export function Insignia({ estado, texto }: { estado: Semaforo | 'info'; texto?: string }) {
  const { c } = useTema();
  const [fondo, color] = {
    verde: [c.exitoSuave, c.exito], ambar: [c.alertaSuave, c.alerta], rojo: [c.peligroSuave, c.peligro], info: [c.primarioSuave, c.primario],
  }[estado];
  return (
    <View style={[estilos.insignia, { backgroundColor: fondo }]} accessibilityLabel={texto ?? ETIQUETA_SEMAFORO[estado as Semaforo]}>
      {estado !== 'info' && <View style={[estilos.punto, { backgroundColor: color }]} />}
      <Text style={[tipo.pie, { color, fontWeight: '700' }]}>{texto ?? ETIQUETA_SEMAFORO[estado as Semaforo]}</Text>
    </View>
  );
}

/** Barra de ocupación: el ancho del relleno es un porcentaje del contenedor (layout relativo). */
export function BarraProgreso({ valor, total, color }: { valor: number; total: number; color?: string }) {
  const { c } = useTema();
  const pct = total === 0 ? 0 : Math.min(100, Math.round((valor / total) * 100));
  return (
    <View style={[estilos.barra, { backgroundColor: c.superficieAlta }]} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: total, now: valor }}>
      <View style={{ width: `${pct}%`, height: '100%', borderRadius: radio.pill, backgroundColor: color ?? c.primario }} />
    </View>
  );
}

export function Kpi({ valor, etiqueta, icono, color }: { valor: string; etiqueta: string; icono: Icono; color?: string }) {
  const { c } = useTema();
  const tono = color ?? c.primario;
  return (
    <Tarjeta style={estilos.kpi}>
      <View style={[estilos.kpiIcono, { backgroundColor: c.superficieAlta }]}>
        <Ionicons name={icono} size={18} color={tono} />
      </View>
      <Text style={[tipo.cifra, { color: c.texto }]}>{valor}</Text>
      <Text style={[tipo.pie, { color: c.textoSecundario }]} numberOfLines={2}>{etiqueta}</Text>
    </Tarjeta>
  );
}

export function TituloSeccion({ titulo, accion, onAccion }: { titulo: string; accion?: string; onAccion?: () => void }) {
  const { c } = useTema();
  return (
    <View style={estilos.tituloSeccion}>
      <Text style={[tipo.subtitulo, { color: c.texto }]} accessibilityRole="header">{titulo}</Text>
      {accion && (
        <Pressable onPress={onAccion} hitSlop={8} accessibilityRole="button">
          <Text style={[tipo.etiqueta, { color: c.primario }]}>{accion}</Text>
        </Pressable>
      )}
    </View>
  );
}

export function FilaAjuste({ icono, titulo, detalle, derecha, onPress }: { icono: Icono; titulo: string; detalle?: string; derecha?: ReactNode; onPress?: () => void }) {
  const { c } = useTema();
  return (
    <Pressable onPress={onPress} disabled={!onPress} accessibilityRole={onPress ? 'button' : undefined} style={[estilos.fila, { borderBottomColor: c.borde }]}>
      <View style={[estilos.filaIcono, { backgroundColor: c.primarioSuave }]}>
        <Ionicons name={icono} size={18} color={c.primario} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[tipo.cuerpo, { color: c.texto, fontWeight: '600' }]}>{titulo}</Text>
        {detalle && <Text style={[tipo.pie, { color: c.textoSecundario }]}>{detalle}</Text>}
      </View>
      {derecha ?? (onPress && <Ionicons name="chevron-forward" size={18} color={c.textoTenue} />)}
    </Pressable>
  );
}

export function Avatar({ nombre, tamano = 44 }: { nombre: string; tamano?: number }) {
  const { c } = useTema();
  const iniciales = nombre.replace(/^(Mg\.|Ing\.|Dr\.|Dra\.)\s*/, '').split(/[ ,]+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
  return (
    <View style={{ width: tamano, height: tamano, borderRadius: tamano / 2, backgroundColor: c.primario, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: c.sobrePrimario, fontWeight: '700', fontSize: tamano * 0.36 }}>{iniciales}</Text>
    </View>
  );
}

export function Vacio({ icono, titulo, detalle }: { icono: Icono; titulo: string; detalle: string }) {
  const { c } = useTema();
  return (
    <View style={estilos.vacio}>
      <Ionicons name={icono} size={40} color={c.textoTenue} />
      <Text style={[tipo.subtitulo, { color: c.texto, textAlign: 'center' }]}>{titulo}</Text>
      <Text style={[tipo.cuerpo, { color: c.textoSecundario, textAlign: 'center' }]}>{detalle}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: { borderRadius: radio.l, borderWidth: StyleSheet.hairlineWidth, padding: espacio.l, boxShadow: '0 1px 3px rgba(16, 32, 48, 0.08)' },
  boton: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: espacio.s, paddingHorizontal: espacio.l, borderRadius: radio.m, borderWidth: 1, overflow: 'hidden' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: espacio.xs, paddingHorizontal: espacio.m, paddingVertical: 7, borderRadius: radio.pill, borderWidth: 1 },
  insignia: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radio.pill },
  punto: { width: 8, height: 8, borderRadius: 4 },
  barra: { height: 8, borderRadius: radio.pill, overflow: 'hidden' },
  kpi: { flexBasis: '47%', flexGrow: 1, gap: espacio.xs },
  kpiIcono: { width: 32, height: 32, borderRadius: radio.s, alignItems: 'center', justifyContent: 'center', marginBottom: espacio.xs },
  tituloSeccion: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: espacio.xl, marginBottom: espacio.m },
  fila: { flexDirection: 'row', alignItems: 'center', gap: espacio.m, paddingVertical: espacio.m, borderBottomWidth: StyleSheet.hairlineWidth },
  filaIcono: { width: 36, height: 36, borderRadius: radio.s, alignItems: 'center', justifyContent: 'center' },
  vacio: { alignItems: 'center', gap: espacio.s, paddingVertical: espacio.xxl, paddingHorizontal: espacio.xl },
});
