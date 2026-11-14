// Clave estándar para persistir la sesión en AsyncStorage
export const AUTH_DATA_KEY = '@fitbite_auth_data';

// Cambiar localhost por la IP local de la PC al probar en Expo Go físico
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const loginRequest = async (email, password) => {
  const cleanEmail = email.trim().toLowerCase();

  try {
    const response = await fetch(`${API_URL}/api/users/login`, {
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
    // Si el servidor local no está levantado, permitimos acceso local en modo demo
    if (error.message && !error.message.toLowerCase().includes('network') && !error.message.toLowerCase().includes('fetch')) {
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
    const response = await fetch(`${API_URL}/api/users/register`, {
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
    if (error.message && !error.message.toLowerCase().includes('network') && !error.message.toLowerCase().includes('fetch')) {
      throw error;
    }
    return {
      accessToken: `local-token-${Date.now()}`,
      user: { name: cleanName || cleanEmail.split('@')[0], email: cleanEmail },
      source: 'local',
    };
  }
};
