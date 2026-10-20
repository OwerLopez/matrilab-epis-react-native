/**
 * Tokens de diseño. Los colores institucionales (#C3141E, #19375A) se mantienen desde el LAB 01;
 * cada token tiene su variante clara y oscura para respetar el tema del sistema operativo.
 */
export interface Paleta {
  fondo: string;
  superficie: string;
  superficieAlta: string;
  borde: string;
  texto: string;
  textoSecundario: string;
  textoTenue: string;
  primario: string;
  primarioSuave: string;
  marca: string;
  marcaSuave: string;
  exito: string;
  exitoSuave: string;
  alerta: string;
  alertaSuave: string;
  peligro: string;
  peligroSuave: string;
  sobrePrimario: string;
}

export const CLARO: Paleta = {
  fondo: '#F4F6F9',
  superficie: '#FFFFFF',
  superficieAlta: '#EEF2F7',
  borde: '#DCE2EA',
  texto: '#14202E',
  textoSecundario: '#4A5868',
  textoTenue: '#7A8796',
  primario: '#19375A',
  primarioSuave: '#E3EAF3',
  marca: '#C3141E',
  marcaSuave: '#FBE5E6',
  exito: '#1E7B45',
  exitoSuave: '#DFF2E7',
  alerta: '#A35F00',
  alertaSuave: '#FBEFD9',
  peligro: '#B3261E',
  peligroSuave: '#F9E0DE',
  sobrePrimario: '#FFFFFF',
};

export const OSCURO: Paleta = {
  fondo: '#0E151D',
  superficie: '#16202B',
  superficieAlta: '#1E2A37',
  borde: '#2B3948',
  texto: '#E7EDF4',
  textoSecundario: '#B3C0CD',
  textoTenue: '#8796A6',
  primario: '#7FA8D8',
  primarioSuave: '#1D3049',
  marca: '#F0626A',
  marcaSuave: '#3A1C20',
  exito: '#5CC98A',
  exitoSuave: '#173323',
  alerta: '#F0B65A',
  alertaSuave: '#35290F',
  peligro: '#FF8A80',
  peligroSuave: '#3A1D1B',
  sobrePrimario: '#0E151D',
};

/** Escala de espaciado de 4 pt: todas las separaciones del layout salen de aquí. */
export const espacio = { xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32 } as const;
export const radio = { s: 8, m: 12, l: 16, pill: 999 } as const;
export const tipo = {
  titulo: { fontSize: 24, fontWeight: '700' as const, letterSpacing: 0.2 },
  subtitulo: { fontSize: 18, fontWeight: '600' as const },
  cuerpo: { fontSize: 15, fontWeight: '400' as const },
  etiqueta: { fontSize: 13, fontWeight: '600' as const },
  pie: { fontSize: 12, fontWeight: '400' as const },
  cifra: { fontSize: 28, fontWeight: '700' as const },
};
