import Axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { getAuth } from 'firebase/auth';

const apiClient = Axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
});

// Firebase IDトークンを自動付与
apiClient.interceptors.request.use(async (config) => {
  const user = getAuth().currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Orval custom mutator
 * Orvalが生成するAPIクライアントはこの関数を経由してリクエストを送る
 */
export const customAxios = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const { data } = await apiClient(config);
  return data;
};

export default apiClient;
