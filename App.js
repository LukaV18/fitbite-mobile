import React, { useState } from 'react';
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
} from 'react-native';
import { MOCK_RECIPES } from './src/data/mockRecipes';
import RecipeCard from './src/components/RecipeCard';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const categories = ['Todos', 'Desayunos', 'Almuerzos', 'Snacks'];

  // Filtramos la lista según la categoría seleccionada
  const filteredRecipes =
    selectedCategory === 'Todos'
      ? MOCK_RECIPES
      : MOCK_RECIPES.filter((r) => r.category === selectedCategory);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header de la App */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🥗 FitBite</Text>
        <Text style={styles.headerSubtitle}>Recetas saludables y nutrición fit</Text>
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

      {/* Listado de recetas con FlatList virtualizada */}
      <FlatList
        data={filteredRecipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RecipeCard recipe={item} onPress={() => setSelectedRecipe(item)} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Vista de Detalle (Modal simple sin librerías externas) */}
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
                Categoría: {selectedRecipe.category} | {selectedRecipe.calories} kcal | {selectedRecipe.timeMinutes} min
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
    paddingVertical: 12,
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
