import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../src/hooks/useAuth';
import { FavoritesProvider } from '../src/hooks/useFavorites';
import { COLORS } from '../src/theme/colors';

function RootNavigator() {
  const { auth, isReady } = useAuth();
  const isAuthenticated = auth !== null;

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="receta/[id]"
          options={{
            title: 'Detalle de receta',
            headerTintColor: COLORS.primary,
            headerStyle: { backgroundColor: COLORS.card },
          }}
        />
      </Stack.Protected>

      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ title: 'Crear cuenta', headerTintColor: COLORS.primary }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <RootNavigator />
      </FavoritesProvider>
    </AuthProvider>
  );
}
