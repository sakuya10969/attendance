import {
  Button,
  Card,
  Stack,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { useNavigate } from "react-router";

import { useTenantsControllerCreate } from "~/shared/api/endpoints/tenants/tenants";
import { PageLayout } from "~/shared/ui/layout/page-layout";

export default function SystemTenantsNewRoute() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminName, setAdminName] = useState("");
  const createTenant = useTenantsControllerCreate({
    mutation: {
      onSuccess(response) {
        notifications.show({
          color: "green",
          title: "作成完了",
          message: "テナントと初期管理者を作成しました。",
        });
        navigate(`/system/tenants/${response.tenant.id}`, { replace: true });
      },
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createTenant.mutate({
      data: {
        name,
        adminEmail,
        adminName,
      },
    });
  }

  return (
    <PageLayout
      title="テナント作成"
      description="テナント情報と初期管理者をまとめて登録します。"
    >
      <Card className="page-card" maw={720}>
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="テナント名"
              value={name}
              onChange={(event) => setName(event.currentTarget.value)}
              required
            />
            <TextInput
              label="初期管理者メールアドレス"
              type="email"
              value={adminEmail}
              onChange={(event) => setAdminEmail(event.currentTarget.value)}
              required
            />
            <TextInput
              label="初期管理者名"
              value={adminName}
              onChange={(event) => setAdminName(event.currentTarget.value)}
              required
            />
            <Button type="submit" loading={createTenant.isPending} ml="auto">
              作成する
            </Button>
          </Stack>
        </form>
      </Card>
    </PageLayout>
  );
}
