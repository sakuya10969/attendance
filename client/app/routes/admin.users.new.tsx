import {
  Button,
  Card,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router";

import {
  getUsersControllerFindAllQueryKey,
  useUsersControllerCreate,
} from "~/shared/api/endpoints/users/users";
import { CreateUserDtoRole } from "~/shared/api/model";
import { PageLayout } from "~/shared/ui/layout/page-layout";

export default function AdminUsersNewRoute() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<string>(CreateUserDtoRole.tenant_user);
  const createUser = useUsersControllerCreate({
    mutation: {
      onSuccess: async () => {
        notifications.show({
          color: "green",
          title: "作成完了",
          message: "ユーザーを作成しました。",
        });
        await queryClient.invalidateQueries({
          queryKey: getUsersControllerFindAllQueryKey(),
        });
        navigate("/admin/users", { replace: true });
      },
    },
  });

  return (
    <PageLayout
      title="ユーザー作成"
      description="メールアドレス、氏名、ロールを指定して追加します。"
    >
      <Card className="page-card" maw={720}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            createUser.mutate({
              data: {
                email,
                name,
                role:
                  role === CreateUserDtoRole.tenant_admin
                    ? CreateUserDtoRole.tenant_admin
                    : CreateUserDtoRole.tenant_user,
              },
            });
          }}
        >
          <Stack gap="md">
            <TextInput
              label="メールアドレス"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
              required
            />
            <TextInput
              label="氏名"
              value={name}
              onChange={(event) => setName(event.currentTarget.value)}
              required
            />
            <Select
              label="ロール"
              data={[
                { label: "一般", value: CreateUserDtoRole.tenant_user },
                { label: "管理者", value: CreateUserDtoRole.tenant_admin },
              ]}
              value={role}
              onChange={(value) => setRole(value ?? CreateUserDtoRole.tenant_user)}
            />
            <Button type="submit" loading={createUser.isPending} ml="auto">
              作成する
            </Button>
          </Stack>
        </form>
      </Card>
    </PageLayout>
  );
}
