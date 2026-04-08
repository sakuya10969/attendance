import {
  Alert,
  Button,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import axios from "axios";

import { roleHomeMap } from "~/shared/auth/role";
import { useAuth } from "~/shared/auth/use-auth";

export default function LoginRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const { appUser, isAuthenticated, isInitializing, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isInitializing && isAuthenticated && appUser) {
    return <Navigate to={roleHomeMap[appUser.role]} replace />;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await signIn(email, password);
      navigate(
        typeof location.state?.from === "string" ? location.state.from : "/",
        { replace: true },
      );
    } catch (submitError) {
      if (axios.isAxiosError(submitError)) {
        setError("ログインに失敗しました。メールアドレスまたはパスワードを確認してください。");
      } else {
        setError("ログインに失敗しました。");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-card-header">
          <Text size="xs" tt="uppercase" fw={700} c="dimmed">
            Attendance SaaS
          </Text>
          <Title order={2} mt={8}>
            サインイン
          </Title>
          <Text size="sm" c="dimmed" mt={8}>
            Firebase 認証でログインし、権限に応じた画面へ遷移します。
          </Text>
        </div>
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            {error ? (
              <Alert color="red" variant="light">
                {error}
              </Alert>
            ) : null}
            <TextInput
              label="メールアドレス"
              placeholder="admin@example.com"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
              required
            />
            <PasswordInput
              label="パスワード"
              placeholder="********"
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
              required
            />
            <Button type="submit" loading={submitting} fullWidth>
              ログイン
            </Button>
          </Stack>
        </form>
      </section>
    </main>
  );
}
