import AsyncStorage from '@react-native-async-storage/async-storage';

export const AUTH_DATA_KEY = '@fitbite_auth_data';
const USERS_KEY = '@fitbite_local_users';

const getUsers = async () => {
  const stored = await AsyncStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const loginRequest = async (email, password) => {
  const cleanEmail = email.trim().toLowerCase();
  const users = await getUsers();

  const found = users.find((u) => u.email === cleanEmail && u.password === password);
  if (!found) {
    throw new Error('Usuario no registrado o contraseña incorrecta');
  }

  return {
    accessToken: `token-${Date.now()}`,
    user: { name: found.name, email: found.email, avatarUri: found.avatarUri || null },
  };
};

export const updateUserAvatar = async (email, avatarUri) => {
  const cleanEmail = email.trim().toLowerCase();
  const users = await getUsers();
  const updated = users.map((u) => (u.email === cleanEmail ? { ...u, avatarUri } : u));
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updated));
};

export const registerRequest = async (name, email, password) => {
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  const users = await getUsers();

  if (users.some((u) => u.email === cleanEmail)) {
    throw new Error('Ya existe una cuenta registrada con ese email');
  }

  const newUser = {
    name: cleanName || cleanEmail.split('@')[0],
    email: cleanEmail,
    password,
  };
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));

  return {
    accessToken: `token-${Date.now()}`,
    user: { name: newUser.name, email: newUser.email },
  };
};
