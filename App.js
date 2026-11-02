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
} from 'react-native';
import { getRecipes } from './src/services/recipeService';
import RecipeCard from './src/components/RecipeCard';

export default function App() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [searchText, setSearchText] = useState('');

  // Categorías fijas populares para filtrar
  const categories = ['Todos', 'Chicken', 'Vegetarian', 'Beef', 'Dessert'];

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

  const handleSearch = (text) => {
    setSearchText(text);
    if (text.length > 2 || text.length === 0) {
      loadRecipes(text);
    }
  };

  // Filtrado por categoría en memoria
  const filteredRecipes =
    selectedCategory === 'Todos'
      ? recipes
      : recipes.filter((r) => r.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header de la App */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🥗 FitBite</Text>
        <Text style={styles.headerSubtitle}>Recetas saludables y nutrición fit</Text>
      </View>

      {/* Buscador de recetas */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar receta (ej. Salad, Chicken)..."
          placeholderTextColor="#888"
          value={searchText}
          onChangeText={handleSearch}
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
                {cat}
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
            <RecipeCard recipe={item} onPress={() => setSelectedRecipe(item)} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No se encontraron recetas con ese criterio.</Text>
            </View>
          }
        />
      )}

      {/* Vista de Detalle (Modal) */}
      <Modal visible={!!selectedRecipe} animationType="slide" transparent={false}>
        {selectedRecipe && (
          <SafeAreaView style={styles.modalContainer}>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedRecipe(null)}
              >
                <Text style={styles.closeButtonText}>← Volver al catálogo</Text>
              </TouchableOpacity>

              <Text style={styles.modalTitle}>{selectedRecipe.title}</Text>
              <Text style={styles.modalMeta}>
                Categoría: {selectedRecipe.category} | ~{selectedRecipe.calories} kcal | {selectedRecipe.timeMinutes} min
              </Text>

              <Text style={styles.sectionHeader}>Ingredientes:</Text>
              {selectedRecipe.ingredients.map((ing, idx) => (
                <Text key={idx} style={styles.bulletItem}>
                  • {ing}
                </Text>
              ))}

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
    backgroundColor: '#f8f9fa',
    paddingTop: StatusBar.currentHeight || 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1b4332',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
    fontSize: 14,
    color: '#333',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#2d6a4f',
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
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6c757d',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 15,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalScroll: {
    padding: 20,
  },
  closeButton: {
    marginBottom: 16,
    paddingVertical: 6,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#2d6a4f',
    fontWeight: '700',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  modalMeta: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d6a4f',
    marginTop: 14,
    marginBottom: 8,
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
    lineHeight: 22,
  },
});
