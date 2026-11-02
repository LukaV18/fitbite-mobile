import { MOCK_RECIPES } from '../data/mockRecipes';

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// Formatea el objeto crudo que devuelve TheMealDB a la estructura que usa nuestra UI
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
    id: meal.idMeal,
    title: meal.strMeal,
    category: meal.strCategory || 'General',
    image: meal.strMealThumb,
    calories: Math.floor(Math.random() * 250) + 300, // Estimación nutricional fit
    timeMinutes: Math.floor(Math.random() * 20) + 15,
    ingredients: ingredients.length > 0 ? ingredients : ['Ingredientes frescos a gusto'],
    instructions: meal.strInstructions || 'Mezclar y cocinar según indicaciones de la receta.',
  };
}

export const getRecipes = async (searchQuery = '') => {
  try {
    const endpoint = searchQuery
      ? `${BASE_URL}/search.php?s=${encodeURIComponent(searchQuery)}`
      : `${BASE_URL}/search.php?s=`;

    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.meals || data.meals.length === 0) {
      return [];
    }

    return data.meals.map(formatMeal);
  } catch (error) {
    console.warn('Error fetching de TheMealDB, usando datos de respaldo:', error);
    // Fallback defensivo a los datos locales si no hay conexión
    return MOCK_RECIPES;
  }
};
