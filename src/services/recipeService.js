import AsyncStorage from '@react-native-async-storage/async-storage';

const MEALDB_URL = 'https://www.themealdb.com/api/json/v1/1';
const RECIPES_CACHE_KEY = '@fitbite_recipes_cache';

function formatMeal(meal) {
  // Armamos la lista de ingredientes del 1 al 20
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ing && ing.trim()) {
      ingredients.push(measure?.trim() ? `${measure.trim()} ${ing.trim()}` : ing.trim());
    }
  }

  return {
    id: String(meal.idMeal),
    title: meal.strMeal,
    category: meal.strCategory || 'General',
    area: meal.strArea || 'Internacional',
    image: meal.strMealThumb,
    ingredients: ingredients.length > 0 ? ingredients : ['Ingredientes frescos a gusto'],
    instructions: meal.strInstructions || 'Mezclar y cocinar según indicaciones de la receta.',
  };
}

export const getCachedRecipes = async () => {
  const cached = await AsyncStorage.getItem(RECIPES_CACHE_KEY);
  return cached ? JSON.parse(cached) : [];
};

async function saveToCache(items) {
  const raw = await AsyncStorage.getItem(RECIPES_CACHE_KEY);
  const existing = raw ? JSON.parse(raw) : [];
  const nuevos = items.filter((item) => !existing.some((r) => r.id === item.id));
  await AsyncStorage.setItem(RECIPES_CACHE_KEY, JSON.stringify([...existing, ...nuevos]));
}

export const getRecipes = async (searchQuery = '') => {
  try {
    const response = await fetch(`${MEALDB_URL}/search.php?s=${encodeURIComponent(searchQuery)}`);
    const data = await response.json();
    if (!data.meals) return [];

    const recipes = data.meals.map(formatMeal);
    await saveToCache(recipes);
    return recipes;
  } catch {
    // Si no hay internet usamos el cache local
    const cached = await getCachedRecipes();
    if (!searchQuery) return cached;
    return cached.filter((r) => r.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }
};

export const getRecipeById = async (id) => {
  const cached = await getCachedRecipes();
  const localMatch = cached.find((r) => r.id === String(id));
  if (localMatch) return localMatch;

  try {
    const response = await fetch(`${MEALDB_URL}/lookup.php?i=${encodeURIComponent(id)}`);
    const data = await response.json();
    if (data.meals?.[0]) {
      const recipe = formatMeal(data.meals[0]);
      await saveToCache([recipe]);
      return recipe;
    }
  } catch {
    // Sin conexión y no estaba en caché
  }
  return null;
};
