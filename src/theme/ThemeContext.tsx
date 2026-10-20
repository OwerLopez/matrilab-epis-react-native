import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { CLARO, OSCURO, type Paleta } from './tokens';

type Preferencia = 'sistema' | 'claro' | 'oscuro';

interface ValorTema {
  c: Paleta;
  oscuro: boolean;
  preferencia: Preferencia;
  setPreferencia: (p: Preferencia) => void;
}

const Contexto = createContext<ValorTema | null>(null);

/** El tema sigue al sistema (useColorScheme) salvo que el usuario fije uno desde Perfil. */
export function ProveedorTema({ children }: { children: ReactNode }) {
  const sistema = useColorScheme();
  const [preferencia, setPreferencia] = useState<Preferencia>('sistema');
  const oscuro = preferencia === 'oscuro' || (preferencia === 'sistema' && sistema === 'dark');
  const valor = useMemo(() => ({ c: oscuro ? OSCURO : CLARO, oscuro, preferencia, setPreferencia }), [oscuro, preferencia]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useTema(): ValorTema {
  const v = useContext(Contexto);
  if (!v) throw new Error('useTema debe usarse dentro de ProveedorTema');
  return v;
}
