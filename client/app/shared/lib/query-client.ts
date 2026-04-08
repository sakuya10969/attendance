import { QueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import axios from "axios";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry(failureCount, error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return false;
        }

        return failureCount < 1;
      },
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError(error) {
        const message =
          axios.isAxiosError(error) &&
          typeof error.response?.data?.message === "string"
            ? error.response.data.message
            : "処理に失敗しました。";

        notifications.show({
          color: "red",
          title: "エラー",
          message,
        });
      },
    },
  },
});
