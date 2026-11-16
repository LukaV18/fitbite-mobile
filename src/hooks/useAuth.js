import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_DATA_KEY, loginRequest, registerRequest, updateUserAvatar } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [isReady, setIsReady] = useState(false);

  // Recuperar sesión persistida al abrir la aplicación
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const stored = await AsyncStorage.getItem(AUTH_DATA_KEY);
        if (stored) {
          setAuth(JSON.parse(stored));
        }
      } catch (error) {
        console.warn('No se pudo leer la sesión guardada:', error);
      } finally {
        setIsReady(true);
      }
    };

    loadStoredAuth();
  }, []);

  // Persistir o limpiar sesión automáticamente cuando cambia el estado global
  useEffect(() => {
    if (!isReady) return;

    const syncAuthStorage = async () => {
      try {
        if (auth) {
          await AsyncStorage.setItem(AUTH_DATA_KEY, JSON.stringify(auth));
        } else {
          await AsyncStorage.removeItem(AUTH_DATA_KEY);
        }
      } catch (error) {
        console.warn('Error sincronizando AsyncStorage:', error);
      }
    };

    syncAuthStorage();
  }, [auth, isReady]);

  const login = async (email, password) => {
    const session = await loginRequest(email, password);
    setAuth(session);
    return session;
  };

  const register = async (name, email, password) => {
    const session = await registerRequest(name, email, password);
    setAuth(session);
    return session;
  };

  const logout = () => {
    setAuth(null);
  };

  const updateAvatar = (avatarUri) => {
    if (!auth) return;
    updateUserAvatar(auth.user.email, avatarUri);
    setAuth({ ...auth, user: { ...auth.user, avatarUri } });
  };

  return (
    <AuthContext.Provider value={{ auth, isReady, login, register, logout, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
