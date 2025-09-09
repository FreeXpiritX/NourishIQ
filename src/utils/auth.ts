import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'nourishiq_token';

export const tokenStore = {
  async get(){ return await SecureStore.getItemAsync(TOKEN_KEY); },
  async set(t: string){ await SecureStore.setItemAsync(TOKEN_KEY, t); },
  async clear(){ await SecureStore.deleteItemAsync(TOKEN_KEY); }
};

export async function authedFetch(path: string, init: RequestInit = {}){
  const token = await tokenStore.get();
  const API = process.env.EXPO_PUBLIC_API_URL || '';
  const headers = Object.assign({}, init.headers||{}, token ? { Authorization: `Bearer ${token}` } : {});
  return fetch(`${API}${path}`, { ...init, headers });
}
