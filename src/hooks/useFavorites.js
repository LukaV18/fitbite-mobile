import { createContext, useContext, useEffect, useState } from 'react';
import { Vibration } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './useAuth';

const FAVORITES_KEY = '@fitbite_favorites';
const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const { auth } = useAuth();
  const [favorites, setFavorites] = useState([]);

  // Clave separada por email para no mezclar favoritos entre usuarios
  const userEmail = auth?.user?.email?.trim().toLowerCase();
  const storageKey = userEmail ? `${FAVORITES_KEY}_${userEmail}` : null;

  // Cargamos los favoritos cuando cambia el usuario logueado
  useEffect(() => {
    const loadFavorites = async () => {
      if (!storageKey) {
        setFavorites([]);
        return;
      }
      const stored = await AsyncStorage.getItem(storageKey);
      setFavorites(stored ? JSON.parse(stored) : []);
    };
    loadFavorites();
  }, [storageKey]);

  const saveFavorites = async (next) => {
    setFavorites(next);
    if (storageKey) {
      await AsyncStorage.setItem(storageKey, JSON.stringify(next));
    }
  };

  // Si no estaba en favoritos vibramos y lo agregamos, si estaba lo quitamos
  const toggleFavorite = (recipeId) => {
    const idStr = String(recipeId);
    const exists = favorites.includes(idStr);
    if (!exists) Vibration.vibrate(50);

    const next = exists ? favorites.filter((id) => id !== idStr) : [...favorites, idStr];
    saveFavorites(next);
  };

  const isFavorite = (recipeId) => favorites.includes(String(recipeId));
  const clearFavorites = () => saveFavorites([]);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, clearFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites debe ser usado dentro de un FavoritesProvider');
  return context;
};
