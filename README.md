# FitBite Mobile

Aplicación móvil desarrollada en **React Native con Expo** (Programación en Nuevas Tecnologías II - ORT 2°C 2026).

## Funcionalidades

- **Navegación con Expo Router:** Rutas protegidas con `<Stack.Protected>` para separar el flujo de autenticación (`login`, `register`) de la app principal (`(tabs)` y ruta dinámica `receta/[id]`).
- **Estado Global y Persistencia:** `AuthProvider` y `FavoritesProvider` con Context API y guardado automático en `@react-native-async-storage/async-storage`.
- **Integración con API:** Conecta con el backend de FitBite (`fitbite-backend`) y cuenta con respaldo automático en TheMealDB + caché local.
- **APIs Nativas:** Cámara frontal en Perfil (`expo-camera`), compartir receta (`Share.share`), feedback háptico (`Vibration.vibrate`) y detección de conectividad (`@react-native-community/netinfo`).

## Cómo correr el proyecto

```bash
npm install
npx expo start
```

Escaneá el código QR con **Expo Go** en tu celular o presioná `w` para abrir en el navegador.

> Para conectar con el backend local desde un celular físico, configurá `EXPO_PUBLIC_API_URL=http://<TU_IP_LOCAL>:3000`.
