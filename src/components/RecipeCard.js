import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export default function RecipeCard({ recipe, onPress }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      <Image source={{ uri: recipe.image }} style={styles.image} resizeMode="cover" />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{recipe.category}</Text>
          </View>
          <Text style={styles.metaTime}>⏱️ {recipe.timeMinutes} min</Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {recipe.title}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaCalories}>🔥 ~{recipe.calories} kcal</Text>
          <Text style={styles.viewMoreText}>Ver receta →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: 180,
  },
  content: {
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    color: '#2e7d32',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metaTime: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    lineHeight: 22,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
    paddingTop: 8,
  },
  metaCalories: {
    fontSize: 13,
    color: '#e65100',
    fontWeight: '600',
  },
  viewMoreText: {
    fontSize: 13,
    color: '#2d6a4f',
    fontWeight: '700',
  },
});
