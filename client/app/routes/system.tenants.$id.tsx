import {
  Button,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router";

import {
  getTenantsControllerFindOneQueryKey,
  useTenantsControllerFindOne,
  useTenantsControllerUpdate,
} from "~/shared/api/endpoints/tenants/tenants";
import { LoadingState } from "~/shared/components/data-state";
import { PageLayout } from "~/shared/components/page-layout";
import { StatusBadge } from "~/shared/components/status-badge";
import { formatDateTime } from "~/shared/lib/format";

export default function SystemTenantDetailRoute() {
  const { id = "" } = useParams();
  const queryClient = useQueryClient();
  const tenantQuery = useTenantsControllerFindOne(id);
  const [name, setName] = useState("");
  const updateTenant = useTenantsControllerUpdate({
    mutation: {
      onSuccess: async () => {
        notifications.show({
          color: "green",
          title: "更新完了",
          message: "テナント名を更新しました。",
        });
        await queryClient.invalidateQueries({
          queryKey: getTenantsControllerFindOneQueryKey(id),
        });
      },
    },
  });

  if (tenantQuery.isLoading) {
    return <LoadingState />;
  }

  const tenant = tenantQuery.data;

  if (!tenant) {
    return null;
  }

  const currentName = name || tenant.name;

  return (
    <PageLayout title="テナント詳細">
      <SimpleGrid cols={{ base: 1, md: 3 }}>
        <Card className="page-card">
          <Stack gap="xs">
            <Text size="xs" tt="uppercase" fw={700} c="dimmed">
              Status
            </Text>
            <StatusBadge value={tenant.status} />
          </Stack>
        </Card>
        <Card className="page-card">
          <Stack gap="xs">
            <Text size="xs" tt="uppercase" fw={700} c="dimmed">
              Users
            </Text>
            <Text fw={700} size="xl">
              {tenant._count.users}
            </Text>
          </Stack>
        </Card>
        <Card className="page-card">
          <Stack gap="xs">
            <Text size="xs" tt="uppercase" fw={700} c="dimmed">
              Created
            </Text>
            <Text fw={600}>{formatDateTime(tenant.createdAt)}</Text>
          </Stack>
        </Card>
      </SimpleGrid>

      <Card className="page-card" maw={720}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            updateTenant.mutate({ id, data: { name: currentName } });
          }}
        >
          <Stack gap="md">
            <TextInput
              label="テナント名"
              defaultValue={tenant.name}
              onChange={(event) => setName(event.currentTarget.value)}
            />
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                更新日時: {formatDateTime(tenant.updatedAt)}
              </Text>
              <Button type="submit" loading={updateTenant.isPending}>
                保存
              </Button>
            </Group>
          </Stack>
        </form>
      </Card>
    </PageLayout>
  );
}
