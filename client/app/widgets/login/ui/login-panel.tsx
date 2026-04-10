import {
  Alert,
  Box,
  Button,
  Card,
  Center,
  Divider,
  Group,
  Loader,
  PasswordInput,
  Stack,
  Text,
  TextInput,
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

import { isAuthEmulatorEnabled } from "~/lib/firebase";
import { roleHomeMap } from "~/shared/session/model/role";
import { useAuth } from "~/shared/session/model/use-auth";

export function LoginPanel() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    appUser,
    isAuthenticated,
    isInitializing,
    signInWithGoogle,
    signInWithPassword,
  } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("member1@example.com");
  const [password, setPassword] = useState("");

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

  async function handlePasswordSignIn() {
    setSubmitting(true);
    setError(null);

    try {
      await signInWithPassword(email, password);
      navigate(
        typeof location.state?.from === "string" ? location.state.from : "/",
        { replace: true },
      );
    } catch {
      setError("メールアドレスまたはパスワードでのログインに失敗しました。");
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
                {isAuthEmulatorEnabled
                  ? "開発環境では Firebase Auth Emulator を使ってメールアドレスでサインインします。"
                  : "Google アカウントでサインインして勤怠情報にアクセスします。"}
              </Text>
            </Stack>
          </Stack>

          {error ? (
            <Alert color="red" title="ログインエラー">
              {error}
            </Alert>
          ) : null}

          {isAuthEmulatorEnabled ? (
            <Stack gap="md">
              <Alert color="blue" title="開発用ログイン">
                seed-auth で投入した Email/Password ユーザーでログインします。
              </Alert>
              <TextInput
                label="メールアドレス"
                placeholder="member1@example.com"
                value={email}
                onChange={(event) => setEmail(event.currentTarget.value)}
              />
              <PasswordInput
                label="パスワード"
                placeholder="開発用パスワード"
                value={password}
                onChange={(event) => setPassword(event.currentTarget.value)}
              />
              <Button
                size="md"
                loading={submitting}
                loaderProps={{ type: "dots" }}
                onClick={handlePasswordSignIn}
              >
                Email / Password でログイン
              </Button>
              <Divider label="production flow" labelPosition="center" />
              <Text size="sm" c="dimmed">
                本番環境では Google ログインのみを利用します。
              </Text>
            </Stack>
          ) : (
            <Button
              size="md"
              leftSection={<IconBrandGoogle size={18} />}
              loading={submitting}
              loaderProps={{ type: "dots" }}
              onClick={handleGoogleSignIn}
            >
              Google でログイン
            </Button>
          )}

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
