import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { ProveedorApp } from './src/state/AppStore';
import { ProveedorTema, useTema } from './src/theme/ThemeContext';

function BarraEstado() {
  const { oscuro } = useTema();
  return <StatusBar style={oscuro ? 'light' : 'dark'} />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ProveedorTema>
        <ProveedorApp>
          <BarraEstado />
          <RootNavigator />
        </ProveedorApp>
      </ProveedorTema>
    </SafeAreaProvider>
  );
}
