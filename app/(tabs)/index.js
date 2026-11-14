import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import OfflineBanner from '../../src/components/OfflineBanner';
import RecipeCard from '../../src/components/RecipeCard';
import { useFavorites } from '../../src/hooks/useFavorites';
import { getRecipes } from '../../src/services/recipeService';
import { COLORS } from '../../src/theme/colors';

const CATEGORIES = ['Todos', 'Chicken', 'Vegetarian', 'Beef', 'Seafood', 'Dessert'];

export default function HomeScreen() {
  const router = useRouter();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async (query = '') => {
    setLoading(true);
    const data = await getRecipes(query);
    setRecipes(data);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const data = await getRecipes(searchText);
    setRecipes(data);
    setRefreshing(false);
  };

  const handleSearch = (text) => {
    setSearchText(text);
    if (text.length > 2 || text.length === 0) {
      loadRecipes(text);
    }
  };

  const filteredRecipes =
    selectedCategory === 'Todos'
      ? recipes
      : recipes.filter((r) => r.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <OfflineBanner />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🥗 FitBite</Text>
          <Text style={styles.headerSubtitle}>Explorá recetas saludables y nutrición</Text>
        </View>
        {favorites.length > 0 && (
          <View style={styles.favBadge}>
            <Text style={styles.favBadgeText}>❤️ {favorites.length}</Text>
          </View>
        )}
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Buscar receta (ej. Salad, Chicken)..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={handleSearch}
          clearButtonMode="while-editing"
        />
      </View>

      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando recetas saludables...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRecipes}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <RecipeCard
              recipe={item}
              isFavorite={isFavorite(item.id)}
              onToggleFavorite={() => toggleFavorite(item.id)}
              onPress={() => router.push(`/receta/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyTitle}>No hay recetas para mostrar</Text>
              <Text style={styles.emptySubtitle}>Probá buscando otro término o categoría</Text>
            </View>
          }
        />
      )}
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
    paddingTop: 12,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  favBadge: {
    backgroundColor: '#ffe3e3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  favBadgeText: {
    color: '#c92a2a',
    fontWeight: 'bold',
    fontSize: 13,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoriesContainer: {
    paddingLeft: 16,
    marginBottom: 10,
  },
  categoryChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingTop: 6,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
