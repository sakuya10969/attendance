import {
  Alert,
  Box,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconBrandGoogle,
  IconClock,
  IconShieldCheck,
} from "@tabler/icons-react";
import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";

import { roleHomeMap } from "~/shared/session/model/role";
import { useAuth } from "~/shared/session/model/use-auth";

export function LoginPanel() {
  const navigate = useNavigate();
  const location = useLocation();
  const { appUser, isAuthenticated, isInitializing, signInWithGoogle } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isInitializing) {
    return (
      <Center mih="100vh">
        <Loader color="blue" />
      </Center>
    );
  }

  if (isAuthenticated && appUser) {
    return <Navigate to={roleHomeMap[appUser.role]} replace />;
  }

  async function handleGoogleSignIn() {
    setSubmitting(true);
    setError(null);

    try {
      await signInWithGoogle();
      navigate(
        typeof location.state?.from === "string" ? location.state.from : "/",
        { replace: true },
      );
    } catch {
      setError("Google ログインに失敗しました。アカウント設定を確認してください。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Center mih="100vh" px="md" bg="gray.0">
      <Card w="100%" maw={480} p="xl" radius="lg" withBorder>
        <Stack gap="xl">
          <Stack gap="sm">
            <Group justify="center">
              <ThemeIcon size={56} radius="xl" variant="light" color="blue">
                <IconClock size={28} />
              </ThemeIcon>
            </Group>
            <Stack gap={6} ta="center">
              <Title order={1} fz="h2">
                勤怠管理システム
              </Title>
              <Text c="dimmed">
                Google アカウントでサインインして勤怠情報にアクセスします。
              </Text>
            </Stack>
          </Stack>

          {error ? (
            <Alert color="red" title="ログインエラー">
              {error}
            </Alert>
          ) : null}

          <Button
            size="md"
            leftSection={<IconBrandGoogle size={18} />}
            loading={submitting}
            loaderProps={{ type: "dots" }}
            onClick={handleGoogleSignIn}
          >
            Google でログイン
          </Button>

          <Box>
            <Group align="flex-start" wrap="nowrap">
              <ThemeIcon size="lg" radius="xl" variant="light" color="blue">
                <IconShieldCheck size={18} />
              </ThemeIcon>
              <Stack gap={2}>
                <Text fw={600}>セキュア認証</Text>
                <Text size="sm" c="dimmed">
                  認証後にユーザー情報を確認し、権限に応じた画面へ自動で遷移します。
                </Text>
              </Stack>
            </Group>
          </Box>
        </Stack>
      </Card>
    </Center>
  );
}
