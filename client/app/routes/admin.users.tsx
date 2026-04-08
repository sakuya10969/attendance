import {
  Button,
  Card,
  Group,
  Menu,
  Stack,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { IconChevronDown, IconPlus } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { Link } from "react-router";

import {
  getUsersControllerFindAllQueryKey,
  useUsersControllerDeactivate,
  useUsersControllerFindAll,
  useUsersControllerUpdateRole,
} from "~/shared/api/endpoints/users/users";
import {
  UpdateRoleDtoRole,
  type UserSummaryResponseDto,
} from "~/shared/api/model";
import { LoadingState } from "~/shared/components/data-state";
import { DataTable } from "~/shared/components/data-table";
import { PageLayout } from "~/shared/components/page-layout";
import { StatusBadge } from "~/shared/components/status-badge";
import { formatDateTime } from "~/shared/lib/format";

export default function AdminUsersRoute() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const usersQuery = useUsersControllerFindAll({ page, limit: 10 });
  const updateRole = useUsersControllerUpdateRole({
    mutation: {
      onSuccess: async () => {
        notifications.show({
          color: "green",
          title: "更新完了",
          message: "ロールを変更しました。",
        });
        await queryClient.invalidateQueries({
          queryKey: getUsersControllerFindAllQueryKey(),
        });
      },
    },
  });
  const deactivateUser = useUsersControllerDeactivate({
    mutation: {
      onSuccess: async () => {
        notifications.show({
          color: "green",
          title: "更新完了",
          message: "ユーザーを無効化しました。",
        });
        await queryClient.invalidateQueries({
          queryKey: getUsersControllerFindAllQueryKey(),
        });
      },
    },
  });

  const columns = useMemo<ColumnDef<UserSummaryResponseDto>[]>(
    () => [
      {
        header: "ユーザー",
        cell: ({ row }) => (
          <Stack gap={2}>
            <Text fw={600}>{row.original.name}</Text>
            <Text size="xs" c="dimmed">
              {row.original.email}
            </Text>
          </Stack>
        ),
      },
      {
        header: "ロール",
        cell: ({ row }) => <StatusBadge value={row.original.role} />,
      },
      {
        header: "状態",
        cell: ({ row }) => <StatusBadge value={row.original.isActive} />,
      },
      {
        header: "作成日時",
        cell: ({ row }) => formatDateTime(row.original.createdAt),
      },
      {
        header: "",
        cell: ({ row }) => (
          <Menu shadow="md" width={180}>
            <Menu.Target>
              <Button variant="light" rightSection={<IconChevronDown size={16} />}>
                操作
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                onClick={() =>
                  updateRole.mutate({
                    id: row.original.id,
                    data: {
                      role:
                        row.original.role === UpdateRoleDtoRole.tenant_admin
                          ? UpdateRoleDtoRole.tenant_user
                          : UpdateRoleDtoRole.tenant_admin,
                    },
                  })
                }
              >
                ロール切替
              </Menu.Item>
              <Menu.Item
                color="red"
                disabled={!row.original.isActive}
                onClick={() => deactivateUser.mutate({ id: row.original.id })}
              >
                無効化
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        ),
      },
    ],
    [deactivateUser, updateRole],
  );

  if (usersQuery.isLoading) {
    return <LoadingState />;
  }

  const data = usersQuery.data;

  return (
    <PageLayout
      title="ユーザー一覧"
      actions={
        <Button
          component={Link}
          to="/admin/users/new"
          leftSection={<IconPlus size={16} />}
        >
          新規ユーザー
        </Button>
      }
    >
      <Card className="page-card">
        {data ? (
          <DataTable
            data={data.data}
            columns={columns}
            page={data.page}
            total={data.total}
            limit={data.limit}
            onPageChange={setPage}
          />
        ) : (
          <Text size="sm">データがありません。</Text>
        )}
      </Card>
    </PageLayout>
  );
}
