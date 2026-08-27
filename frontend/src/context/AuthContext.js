// Solo el objeto de contexto — sin componentes ni hooks acá, para que
// Fast Refresh de Vite pueda tratar este archivo sin ambigüedad
// (regla react-refresh/only-export-components).
import { createContext } from 'react';

export const AuthContext = createContext(null);