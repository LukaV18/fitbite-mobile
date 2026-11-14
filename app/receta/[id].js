import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useFavorites } from '../../src/hooks/useFavorites';
import { getRecipeById } from '../../src/services/recipeService';
import { COLORS } from '../../src/theme/colors';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      const item = await getRecipeById(id);
      setRecipe(item);
      setLoading(false);
    };

    if (id) fetchDetail();
  }, [id]);

  const handleShare = async () => {
    if (!recipe) return;
    try {
      await Share.share({
        message: `🥗 Mirá esta receta en FitBite: ${recipe.title} (${recipe.calories} kcal · ${recipe.timeMinutes} min).`,
      });
    } catch (error) {
      console.warn('Error al compartir receta:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>No encontramos esta receta.</Text>
      </View>
    );
  }

  const fav = isFavorite(recipe.id);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image source={{ uri: recipe.image }} style={styles.image} />

      <View style={styles.body}>
        <View style={styles.rowBetween}>
          <Text style={styles.category}>{recipe.category}</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => toggleFavorite(recipe.id)}>
              <Text style={styles.actionText}>{fav ? '❤️ Guardada' : '🤍 Guardar'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Text style={styles.shareText}>Compartir</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.title}>{recipe.title}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaBadge}>🔥 {recipe.calories} kcal</Text>
          <Text style={styles.metaBadge}>⏱️ {recipe.timeMinutes} min</Text>
        </View>

        <Text style={styles.sectionTitle}>Ingredientes</Text>
        <View style={styles.box}>
          {recipe.ingredients.map((ing, idx) => (
            <Text key={idx} style={styles.ingredientItem}>• {ing}</Text>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Preparación</Text>
        <Text style={styles.instructions}>{recipe.instructions}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  notFound: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  image: {
    width: '100%',
    height: 250,
    backgroundColor: COLORS.border,
  },
  body: {
    padding: 18,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  category: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    textTransform: 'uppercase',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  shareBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  shareText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  metaBadge: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    color: COLORS.text,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginTop: 22,
    marginBottom: 8,
  },
  box: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 6,
  },
  ingredientItem: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  instructions: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 23,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
});
