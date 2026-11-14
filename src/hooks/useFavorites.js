import { createContext, useContext, useEffect, useState } from 'react';
import { Vibration } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@fitbite_favorites';
const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const stored = await AsyncStorage.getItem(FAVORITES_KEY);
        if (stored) {
          setFavorites(JSON.parse(stored));
        }
      } catch (error) {
        console.warn('Error cargando favoritos:', error);
      } finally {
        setLoaded(true);
      }
    };

    loadFavorites();
  }, []);

  useEffect(() => {
    if (!loaded) return;

    const saveFavorites = async () => {
      try {
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      } catch (error) {
        console.warn('Error guardando favoritos:', error);
      }
    };

    saveFavorites();
  }, [favorites, loaded]);

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
