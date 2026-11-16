import AsyncStorage from '@react-native-async-storage/async-storage';

// Clave estándar para persistir la sesión en AsyncStorage
export const AUTH_DATA_KEY = '@fitbite_auth_data';
const LOCAL_USERS_KEY = '@fitbite_local_users';

// Cambiar localhost por la IP local de la PC al probar en Expo Go físico
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const isNetworkError = (error) =>
  error.name === 'AbortError' ||
  error.name === 'TypeError' ||
  (error.message && /network request failed|failed to fetch|load failed/i.test(error.message));

async function getLocalUsers() {
  const raw = await AsyncStorage.getItem(LOCAL_USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function fetchWithTimeout(url, options, ms = 2500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export const loginRequest = async (email, password) => {
  const cleanEmail = email.trim().toLowerCase();

  try {
    const response = await fetchWithTimeout(`${API_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      const authError = new Error(data.error || data.message || 'Credenciales inválidas');
      authError.isHttpError = true;
      throw authError;
    }

    return {
      accessToken: data.token,
      user: data.user || { name: cleanEmail.split('@')[0], email: cleanEmail },
      source: 'backend',
    };
  } catch (error) {
    // Si el servidor respondió un error HTTP real (ej. 401/400), no hacer fallback local
    if (error.isHttpError || !isNetworkError(error)) {
      throw error;
    }

    const users = await getLocalUsers();
    const found = users.find((u) => u.email === cleanEmail && u.password === password);
    if (!found) {
      throw new Error('Usuario no registrado o contraseña incorrecta');
    }

    return {
      accessToken: `local-token-${Date.now()}`,
      user: { name: found.name, email: found.email },
      source: 'local',
    };
  }
};

export const registerRequest = async (name, email, password) => {
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  try {
    const response = await fetchWithTimeout(`${API_URL}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: cleanName, email: cleanEmail, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      const regError = new Error(data.error || data.message || 'No se pudo completar el registro');
      regError.isHttpError = true;
      throw regError;
    }

    return await loginRequest(cleanEmail, password);
  } catch (error) {
    if (error.isHttpError || !isNetworkError(error)) {
      throw error;
    }

    const users = await getLocalUsers();
    if (users.some((u) => u.email === cleanEmail)) {
      throw new Error('Ya existe una cuenta registrada con ese email');
    }

    const newUser = {
      name: cleanName || cleanEmail.split('@')[0],
      email: cleanEmail,
      password,
    };
    await AsyncStorage.setItem(LOCAL_USERS_KEY, JSON.stringify([...users, newUser]));

    return {
      accessToken: `local-token-${Date.now()}`,
      user: { name: newUser.name, email: newUser.email },
      source: 'local',
    };
  }
};
