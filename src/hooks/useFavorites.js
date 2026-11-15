import { createContext, useContext, useEffect, useState } from 'react';
import { Vibration } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './useAuth';

const FAVORITES_KEY = '@fitbite_favorites';
const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const { auth } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const userEmail = auth?.user?.email ? auth.user.email.trim().toLowerCase() : null;
  const storageKey = userEmail ? `${FAVORITES_KEY}_${userEmail}` : FAVORITES_KEY;

  useEffect(() => {
    setLoaded(false);
    const loadFavorites = async () => {
      if (!userEmail) {
        setFavorites([]);
        setLoaded(true);
        return;
      }
      try {
        const stored = await AsyncStorage.getItem(storageKey);
        setFavorites(stored ? JSON.parse(stored) : []);
      } catch (error) {
        console.warn('Error cargando favoritos:', error);
        setFavorites([]);
      } finally {
        setLoaded(true);
      }
    };

    loadFavorites();
  }, [storageKey, userEmail]);

  useEffect(() => {
    if (!loaded || !userEmail) return;

    const saveFavorites = async () => {
      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify(favorites));
      } catch (error) {
        console.warn('Error guardando favoritos:', error);
      }
    };

    saveFavorites();
  }, [favorites, loaded, storageKey, userEmail]);

  const toggleFavorite = (recipeId) => {
    const idStr = String(recipeId);
    setFavorites((prev) => {
      const exists = prev.includes(idStr);
      if (!exists) {
        Vibration.vibrate(50);
        return [...prev, idStr];
      }
      return prev.filter((id) => id !== idStr);
    });
  };

  const isFavorite = (recipeId) => favorites.includes(String(recipeId));

  const clearFavorites = () => setFavorites([]);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, clearFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites debe ser usado dentro de un FavoritesProvider');
  }
  return context;
};
