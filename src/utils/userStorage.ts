import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_KEY = '@sapjuice_user';

export type StoredUser = {
  name: string;
  email: string;
  phone: string;
};

export async function getStoredUser(): Promise<StoredUser | null> {
  try {
    const json = await AsyncStorage.getItem(USER_KEY);
    return json ? (JSON.parse(json) as StoredUser) : null;
  } catch {
    return null;
  }
}

export async function setStoredUser(user: StoredUser): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function clearStoredUser(): Promise<void> {
  await AsyncStorage.removeItem(USER_KEY);
}
