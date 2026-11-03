import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Modal,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Image,
} from 'react-native';
import { getRecipes } from './src/services/recipeService';
import RecipeCard from './src/components/RecipeCard';

export default function App() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [favorites, setFavorites] = useState([]);

  // Categorías fijas populares para filtrar
  const categories = ['Todos', 'Favoritos', 'Chicken', 'Vegetarian', 'Beef', 'Dessert'];

  // Carga inicial de datos desde la API
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

  // Alternar favorito por ID
  const toggleFavorite = (recipeId) => {
    setFavorites((prev) =>
      prev.includes(recipeId) ? prev.filter((id) => id !== recipeId) : [...prev, recipeId]
    );
  };

  // Filtrado por categoría en memoria (o favoritos)
  const filteredRecipes =
    selectedCategory === 'Favoritos'
      ? recipes.filter((r) => favorites.includes(r.id))
      : selectedCategory === 'Todos'
      ? recipes
      : recipes.filter((r) => r.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header de la App */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🥗 FitBite</Text>
          <Text style={styles.headerSubtitle}>Explorá recetas saludables y nutrición</Text>
        </View>
        {favorites.length > 0 && (
          <View style={styles.favBadgeHeader}>
            <Text style={styles.favBadgeText}>❤️ {favorites.length}</Text>
          </View>
        )}
      </View>

      {/* Buscador de recetas */}
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

      {/* Selector horizontal de categorías */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat && styles.categoryTextActive,
                ]}
              >
                {cat === 'Favoritos' ? `❤️ ${cat} (${favorites.length})` : cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Spinner de carga o Listado */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2d6a4f" />
          <Text style={styles.loadingText}>Cargando recetas desde TheMealDB...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRecipes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RecipeCard
              recipe={item}
              onPress={() => setSelectedRecipe(item)}
              isFavorite={favorites.includes(item.id)}
              onToggleFavorite={toggleFavorite}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>{selectedCategory === 'Favoritos' ? '🤍' : '🍽️'}</Text>
              <Text style={styles.emptyText}>
                {selectedCategory === 'Favoritos'
                  ? 'No tenés recetas guardadas en favoritos todavía.'
                  : 'No se encontraron recetas con ese criterio.'}
              </Text>
              {selectedCategory === 'Favoritos' && (
                <Text style={styles.emptySubtext}>
                  Tocá el ícono del corazón en cualquier tarjeta para guardarla acá.
                </Text>
              )}
            </View>
          }
        />
      )}

      {/* Vista de Detalle (Modal con foto e ingredientes) */}
      <Modal
        visible={!!selectedRecipe}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setSelectedRecipe(null)}
      >
        {selectedRecipe && (
          <SafeAreaView style={styles.modalContainer}>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedRecipe(null)}
              >
                <Text style={styles.closeButtonText}>← Volver al catálogo</Text>
              </TouchableOpacity>

              <Image
                source={{ uri: selectedRecipe.image }}
                style={styles.modalImage}
                resizeMode="cover"
              />

              <View style={styles.modalTagRow}>
                <View style={styles.modalTag}>
                  <Text style={styles.modalTagText}>{selectedRecipe.category}</Text>
                </View>
                <Text style={styles.modalMeta}>
                  ⏱️ {selectedRecipe.timeMinutes} min | 🔥 ~{selectedRecipe.calories} kcal
                </Text>
              </View>

              <Text style={styles.modalTitle}>{selectedRecipe.title}</Text>

              {/* Botón de favorito dentro del modal */}
              <TouchableOpacity
                style={[
                  styles.modalFavButton,
                  favorites.includes(selectedRecipe.id) && styles.modalFavButtonActive,
                ]}
                activeOpacity={0.8}
                onPress={() => toggleFavorite(selectedRecipe.id)}
              >
                <Text
                  style={[
                    styles.modalFavButtonText,
                    favorites.includes(selectedRecipe.id) && styles.modalFavButtonTextActive,
                  ]}
                >
                  {favorites.includes(selectedRecipe.id)
                    ? '❤️ Quitar de mis favoritos'
                    : '🤍 Guardar en mis favoritos'}
                </Text>
              </TouchableOpacity>

              <Text style={styles.sectionHeader}>Ingredientes:</Text>
              <View style={styles.ingredientsBox}>
                {selectedRecipe.ingredients.map((ing, idx) => (
                  <Text key={idx} style={styles.bulletItem}>
                    • {ing}
                  </Text>
                ))}
              </View>

              <Text style={styles.sectionHeader}>Preparación:</Text>
              <Text style={styles.instructionsText}>
                {selectedRecipe.instructions}
              </Text>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8f7',
    paddingTop: StatusBar.currentHeight || 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1b4332',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  favBadgeHeader: {
    backgroundColor: '#ffebee',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  favBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#c62828',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 14,
    color: '#1a1a1a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryChipActive: {
    backgroundColor: '#2d6a4f',
    borderColor: '#2d6a4f',
  },
  categoryText: {
    fontSize: 13,
    color: '#495057',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  emptyContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyText: {
    color: '#333333',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#888888',
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalScroll: {
    padding: 20,
    paddingBottom: 40,
  },
  closeButton: {
    marginBottom: 14,
    paddingVertical: 6,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#2d6a4f',
    fontWeight: '700',
  },
  modalImage: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    marginBottom: 16,
  },
  modalTagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTag: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  modalTagText: {
    color: '#2e7d32',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  modalMeta: {
    fontSize: 13,
    color: '#6c757d',
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 14,
    lineHeight: 30,
  },
  modalFavButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  modalFavButtonActive: {
    backgroundColor: '#ffebee',
    borderColor: '#ffcdd2',
  },
  modalFavButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#495057',
  },
  modalFavButtonTextActive: {
    color: '#c62828',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1b4332',
    marginTop: 14,
    marginBottom: 8,
  },
  ingredientsBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  bulletItem: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 22,
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 15,
    color: '#444444',
    lineHeight: 24,
  },
});
