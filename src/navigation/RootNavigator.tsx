/**
 * Navegación: una pila nativa (native-stack usa UINavigationController en iOS y Fragment en Android)
 * con tres juegos de pestañas inferiores, uno por rol. El detalle del grupo se presenta como modal nativo.
 */
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ComponentProps } from 'react';
import ConfiguracionScreen from '../screens/admin/ConfiguracionScreen';
import LaboratoriosScreen from '../screens/admin/LaboratoriosScreen';
import EscanerScreen from '../screens/docente/EscanerScreen';
import NominaScreen from '../screens/docente/NominaScreen';
import PanelDocenteScreen from '../screens/docente/PanelDocenteScreen';
import CatalogoScreen from '../screens/estudiante/CatalogoScreen';
import DashboardScreen from '../screens/estudiante/DashboardScreen';
import DetalleTurnoScreen from '../screens/estudiante/DetalleTurnoScreen';
import FichaQRScreen from '../screens/estudiante/FichaQRScreen';
import HorarioScreen from '../screens/estudiante/HorarioScreen';
import LoginScreen from '../screens/LoginScreen';
import PerfilScreen from '../screens/PerfilScreen';
import { useTema } from '../theme/ThemeContext';
import type { PilaRaiz, TabsAdmin, TabsDocente, TabsEstudiante } from './tipos';

type Icono = ComponentProps<typeof Ionicons>['name'];

const Pila = createNativeStackNavigator<PilaRaiz>();
const TabE = createBottomTabNavigator<TabsEstudiante>();
const TabD = createBottomTabNavigator<TabsDocente>();
const TabA = createBottomTabNavigator<TabsAdmin>();

function useOpcionesTabs(iconos: Record<string, [Icono, Icono]>) {
  const { c } = useTema();
  return ({ route }: { route: { name: string } }) => ({
    tabBarActiveTintColor: c.marca,
    tabBarInactiveTintColor: c.textoTenue,
    tabBarStyle: { backgroundColor: c.superficie, borderTopColor: c.borde },
    tabBarLabelStyle: { fontSize: 11, fontWeight: '600' as const },
    headerStyle: { backgroundColor: c.superficie },
    headerTitleStyle: { color: c.texto, fontWeight: '700' as const },
    headerShadowVisible: false,
    tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => (
      <Ionicons name={iconos[route.name][focused ? 0 : 1]} size={size} color={color} />
    ),
  });
}

function PestanasEstudiante() {
  const opciones = useOpcionesTabs({
    Inicio: ['home', 'home-outline'], Catalogo: ['albums', 'albums-outline'], Horario: ['calendar', 'calendar-outline'], PerfilEstudiante: ['person', 'person-outline'],
  });
  return (
    <TabE.Navigator screenOptions={opciones}>
      <TabE.Screen name="Inicio" component={DashboardScreen} options={{ title: 'MatriLab', tabBarLabel: 'Inicio' }} />
      <TabE.Screen name="Catalogo" component={CatalogoScreen} options={{ title: 'Catálogo de laboratorios', tabBarLabel: 'Catálogo' }} />
      <TabE.Screen name="Horario" component={HorarioScreen} options={{ title: 'Mi horario', tabBarLabel: 'Horario' }} />
      <TabE.Screen name="PerfilEstudiante" component={PerfilScreen} options={{ title: 'Perfil', tabBarLabel: 'Perfil' }} />
    </TabE.Navigator>
  );
}

function PestanasDocente() {
  const opciones = useOpcionesTabs({ Panel: ['grid', 'grid-outline'], Escaner: ['scan', 'scan-outline'], PerfilDocente: ['person', 'person-outline'] });
  return (
    <TabD.Navigator screenOptions={opciones}>
      <TabD.Screen name="Panel" component={PanelDocenteScreen} options={{ title: 'Panel docente', tabBarLabel: 'Panel' }} />
      <TabD.Screen name="Escaner" component={EscanerScreen} options={{ title: 'Registrar asistencia', tabBarLabel: 'Escáner' }} />
      <TabD.Screen name="PerfilDocente" component={PerfilScreen} options={{ title: 'Perfil', tabBarLabel: 'Perfil' }} />
    </TabD.Navigator>
  );
}

function PestanasAdmin() {
  const opciones = useOpcionesTabs({ Laboratorios: ['desktop', 'desktop-outline'], Matricula: ['options', 'options-outline'], PerfilAdmin: ['person', 'person-outline'] });
  return (
    <TabA.Navigator screenOptions={opciones}>
      <TabA.Screen name="Laboratorios" component={LaboratoriosScreen} options={{ title: 'Laboratorios', tabBarLabel: 'Laboratorios' }} />
      <TabA.Screen name="Matricula" component={ConfiguracionScreen} options={{ title: 'Configurar matrícula', tabBarLabel: 'Matrícula' }} />
      <TabA.Screen name="PerfilAdmin" component={PerfilScreen} options={{ title: 'Perfil', tabBarLabel: 'Perfil' }} />
    </TabA.Navigator>
  );
}

export default function RootNavigator() {
  const { c, oscuro } = useTema();
  const base = oscuro ? DarkTheme : DefaultTheme;
  const tema = { ...base, colors: { ...base.colors, primary: c.marca, background: c.fondo, card: c.superficie, text: c.texto, border: c.borde } };
  return (
    <NavigationContainer theme={tema}>
      <Pila.Navigator
        initialRouteName="Login"
        screenOptions={{ headerStyle: { backgroundColor: c.superficie }, headerTintColor: c.primario, headerTitleStyle: { color: c.texto }, headerBackButtonDisplayMode: 'minimal' }}
      >
        <Pila.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Pila.Screen name="Estudiante" component={PestanasEstudiante} options={{ headerShown: false }} />
        <Pila.Screen name="Docente" component={PestanasDocente} options={{ headerShown: false }} />
        <Pila.Screen name="Admin" component={PestanasAdmin} options={{ headerShown: false }} />
        <Pila.Screen name="DetalleTurno" component={DetalleTurnoScreen} options={{ title: 'Detalle del grupo', presentation: 'modal' }} />
        <Pila.Screen name="FichaQR" component={FichaQRScreen} options={{ title: 'Mi pase de laboratorio' }} />
        <Pila.Screen name="Nomina" component={NominaScreen} options={{ title: 'Nómina' }} />
      </Pila.Navigator>
    </NavigationContainer>
  );
}
