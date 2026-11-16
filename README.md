# FitBite Mobile

Aplicación móvil desarrollada en **React Native con Expo** (Programación en Nuevas Tecnologías II - ORT 2°C 2026).

## Funcionalidades

- **Navegación con Expo Router:** Rutas protegidas con `<Stack.Protected>` para separar el flujo de autenticación (`login`, `register`) de la app principal (`(tabs)` y ruta dinámica `receta/[id]`).
- **Estado Global y Persistencia:** `AuthProvider` y `FavoritesProvider` con Context API y guardado automático en `@react-native-async-storage/async-storage` (usuarios, sesión, avatar y favoritos aislados por email).
- **API Externa y Caché Offline:** Consumo de recetas reales desde **TheMealDB REST API** (`fetch`) con almacenamiento en caché en `AsyncStorage`.
- **APIs Nativas:** Cámara frontal en Perfil (`expo-camera`), compartir receta (`Share.share`), feedback háptico (`Vibration.vibrate`) y detección de conectividad (`@react-native-community/netinfo`).

## Cómo correr el proyecto

```bash
npm install
npx expo start
```

Escaneá el código QR con **Expo Go** en tu celular o presioná `w` para abrir en el navegador.
