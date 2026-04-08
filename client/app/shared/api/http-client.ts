import Axios from "axios";
import type { AxiosRequestConfig } from "axios";

import { auth } from "~/lib/firebase";

const apiClient = Axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
});

apiClient.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await auth.signOut().catch(() => undefined);
    }
    return Promise.reject(error);
  },
);

export const httpRequest = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const { data } = await apiClient(config);
  return data;
};

export default apiClient;
