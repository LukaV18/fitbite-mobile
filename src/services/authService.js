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
    if (error.isHttpError) {
      throw error;
    }
    const isNetwork =
      error.name === 'AbortError' ||
      error.name === 'TypeError' ||
      (error.message && /network request failed|failed to fetch|load failed/i.test(error.message));
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
      const regError = new Error(data.error || data.message || 'No se pudo completar el registro');
      regError.isHttpError = true;
      throw regError;
    }

    return await loginRequest(cleanEmail, password);
  } catch (error) {
    if (error.isHttpError) {
      throw error;
    }
    const isNetwork =
      error.name === 'AbortError' ||
      error.name === 'TypeError' ||
      (error.message && /network request failed|failed to fetch|load failed/i.test(error.message));
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
