// Clave estándar para persistir la sesión en AsyncStorage
export const AUTH_DATA_KEY = '@fitbite_auth_data';

// Cambiar localhost por la IP local de la PC al probar en Expo Go físico
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

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
      throw new Error(data.error || data.message || 'Credenciales inválidas');
    }

    return {
      accessToken: data.token,
      user: data.user || { name: cleanEmail.split('@')[0], email: cleanEmail },
      source: 'backend',
    };
  } catch (error) {
    // Si el servidor local no está levantado o expiró el timeout, usamos sesión local
    const isNetwork =
      error.name === 'AbortError' ||
      (error.message && /network|fetch|failed/i.test(error.message));
    if (!isNetwork) {
      throw error;
    }
    return {
      accessToken: `local-token-${Date.now()}`,
      user: { name: cleanEmail.split('@')[0], email: cleanEmail },
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
      throw new Error(data.error || data.message || 'No se pudo completar el registro');
    }

    return await loginRequest(cleanEmail, password);
  } catch (error) {
    const isNetwork =
      error.name === 'AbortError' ||
      (error.message && /network|fetch|failed/i.test(error.message));
    if (!isNetwork) {
      throw error;
    }
    return {
      accessToken: `local-token-${Date.now()}`,
      user: { name: cleanName || cleanEmail.split('@')[0], email: cleanEmail },
      source: 'local',
    };
  }
};
