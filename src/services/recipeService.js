import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_RECIPES } from '../data/mockRecipes';

const MEALDB_URL = 'https://www.themealdb.com/api/json/v1/1';
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
const RECIPES_CACHE_KEY = '@fitbite_recipes_cache';

// Formatea el objeto crudo de TheMealDB a la estructura de FitBite
function formatMeal(meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ing && ing.trim()) {
      ingredients.push(measure && measure.trim() ? `${measure.trim()} ${ing.trim()}` : ing.trim());
    }
  }

  return {
    id: String(meal.idMeal),
    title: meal.strMeal,
    category: meal.strCategory || 'General',
    image: meal.strMealThumb,
    calories: 320 + (Number(String(meal.idMeal).slice(-2)) % 240),
    timeMinutes: 15 + (Number(String(meal.idMeal).slice(-1)) * 2),
    ingredients: ingredients.length > 0 ? ingredients : ['Ingredientes frescos a gusto'],
    instructions: meal.strInstructions || 'Mezclar y cocinar según indicaciones de la receta.',
  };
}

function formatBackendRecipe(recipe) {
  return {
    id: String(recipe._id || recipe.id),
    title: recipe.title || recipe.name || 'Receta Fit',
    category: recipe.category || 'General',
    image: recipe.image || MOCK_RECIPES[0].image,
    calories: recipe.calories || 380,
    timeMinutes: recipe.timeMinutes || 20,
    ingredients: Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0
      ? recipe.ingredients
      : ['Ingredientes naturales'],
    instructions: recipe.instructions || 'Preparar siguiendo las indicaciones.',
  };
}

async function fetchFromBackend(searchQuery) {
  const query = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1800);

  try {
    const res = await fetch(`${API_URL}/api/recipes${query}`, { signal: controller.signal });
    if (!res.ok) return null;
    const data = await res.json();
    const list = Array.isArray(data) ? data : data.recipes;
    if (!Array.isArray(list) || list.length === 0) return null;
    return list.map(formatBackendRecipe);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export const getCachedRecipes = async () => {
  try {
    const cached = await AsyncStorage.getItem(RECIPES_CACHE_KEY);
    return cached ? JSON.parse(cached) : MOCK_RECIPES;
  } catch {
    return MOCK_RECIPES;
  }
};

export const getRecipes = async (searchQuery = '') => {
  // 1. Intentar primero contra el backend propio de TP2
  const fromBackend = await fetchFromBackend(searchQuery);
  if (fromBackend && fromBackend.length > 0) {
    if (!searchQuery) {
      AsyncStorage.setItem(RECIPES_CACHE_KEY, JSON.stringify(fromBackend)).catch(() => {});
    }
    return fromBackend;
  }

  // 2. Fallback a API pública TheMealDB
  try {
    const endpoint = searchQuery
      ? `${MEALDB_URL}/search.php?s=${encodeURIComponent(searchQuery)}`
      : `${MEALDB_URL}/search.php?s=`;

    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.meals || data.meals.length === 0) {
      return [];
    }

    const formatted = data.meals.map(formatMeal);
    if (!searchQuery) {
      AsyncStorage.setItem(RECIPES_CACHE_KEY, JSON.stringify(formatted)).catch(() => {});
    }
    return formatted;
  } catch (error) {
    console.warn('Sin conexión o error de red, usando caché local:', error);
    const cached = await getCachedRecipes();
    if (!searchQuery) return cached;
    const q = searchQuery.toLowerCase();
    return cached.filter((r) => r.title.toLowerCase().includes(q) || r.category.toLowerCase().includes(q));
  }
};

export const getRecipeById = async (id) => {
  const idStr = String(id);
  const cached = await getCachedRecipes();
  const localMatch = cached.find((r) => String(r.id) === idStr);
  if (localMatch) return localMatch;

  try {
    const response = await fetch(`${MEALDB_URL}/lookup.php?i=${encodeURIComponent(idStr)}`);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.meals && data.meals[0]) {
      return formatMeal(data.meals[0]);
    }
  } catch {
    // Silencioso si no hay conexión
  }
  return MOCK_RECIPES.find((r) => String(r.id) === idStr) || null;
};
