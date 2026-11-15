import { useEffect, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import RecipeCard from '../../src/components/RecipeCard';
import { useFavorites } from '../../src/hooks/useFavorites';
import { getCachedRecipes, getRecipeById } from '../../src/services/recipeService';
import { COLORS } from '../../src/theme/colors';

export default function FavoritesScreen() {
  const router = useRouter();
  const { favorites, isFavorite, toggleFavorite, clearFavorites } = useFavorites();
  const [favRecipes, setFavRecipes] = useState([]);

  useEffect(() => {
    let active = true;
    const loadFavoritesList = async () => {
      if (favorites.length === 0) {
        if (active) setFavRecipes([]);
        return;
      }

      const cached = await getCachedRecipes();
      const byId = new Map(cached.map((r) => [String(r.id), r]));

      const resolved = await Promise.all(
        favorites.map(async (favId) => {
          const idStr = String(favId);
          if (byId.has(idStr)) return byId.get(idStr);
          return await getRecipeById(idStr);
        })
      );

      if (active) {
        setFavRecipes(resolved.filter(Boolean));
      }
    };

    loadFavoritesList();
    return () => {
      active = false;
    };
  }, [favorites]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>❤️ Mis Favoritos</Text>
          <Text style={styles.subtitle}>{favorites.length} guardadas offline</Text>
        </View>
        {favorites.length > 0 && (
          <TouchableOpacity onPress={clearFavorites} style={styles.clearBtn}>
            <Text style={styles.clearText}>Vaciar</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={favRecipes}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            isFavorite={isFavorite(item.id)}
            onToggleFavorite={() => toggleFavorite(item.id)}
            onPress={() => router.push(`/receta/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>Todavía no guardaste recetas</Text>
            <Text style={styles.emptySub}>Tocá el corazón en cualquier receta del catálogo para verla acá incluso sin internet.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#ffe3e3',
  },
  clearText: {
    color: '#c92a2a',
    fontWeight: '600',
    fontSize: 12,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
  },
});
