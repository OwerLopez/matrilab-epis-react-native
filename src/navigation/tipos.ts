import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type TabsEstudiante = { Inicio: undefined; Catalogo: undefined; Horario: undefined; PerfilEstudiante: undefined };
export type TabsDocente = { Panel: undefined; Escaner: undefined; PerfilDocente: undefined };
export type TabsAdmin = { Laboratorios: undefined; Matricula: undefined; PerfilAdmin: undefined };

export type PilaRaiz = {
  Login: undefined;
  Estudiante: NavigatorScreenParams<TabsEstudiante>;
  Docente: NavigatorScreenParams<TabsDocente>;
  Admin: NavigatorScreenParams<TabsAdmin>;
  DetalleTurno: { turnoId: string };
  FichaQR: { matriculaId: string };
  Nomina: { turnoId: string };
};

export type PantallaRaiz<K extends keyof PilaRaiz> = NativeStackScreenProps<PilaRaiz, K>;
export type PantallaEstudiante<K extends keyof TabsEstudiante> = CompositeScreenProps<BottomTabScreenProps<TabsEstudiante, K>, NativeStackScreenProps<PilaRaiz>>;
export type PantallaDocente<K extends keyof TabsDocente> = CompositeScreenProps<BottomTabScreenProps<TabsDocente, K>, NativeStackScreenProps<PilaRaiz>>;
export type PantallaAdmin<K extends keyof TabsAdmin> = CompositeScreenProps<BottomTabScreenProps<TabsAdmin, K>, NativeStackScreenProps<PilaRaiz>>;
