import {
  Button,
  Card,
  Group,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";

import {
  getTenantsControllerFindAllQueryKey,
  useTenantsControllerFindAll,
  useTenantsControllerResume,
  useTenantsControllerSuspend,
} from "~/shared/api/endpoints/tenants/tenants";
import type { TenantWithCountResponseDto } from "~/shared/api/model";
import { LoadingState } from "~/shared/components/data-state";
import { DataTable } from "~/shared/components/data-table";
import { PageLayout } from "~/shared/components/page-layout";
import { StatusBadge } from "~/shared/components/status-badge";
import { formatDateTime } from "~/shared/lib/format";

export default function SystemTenantsRoute() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string | null>(null);
  const tenantsQuery = useTenantsControllerFindAll({
    page,
    limit: 10,
    status: status || undefined,
  });
  const suspendMutation = useTenantsControllerSuspend({
    mutation: {
      onSuccess: async () => {
        notifications.show({
          color: "green",
          title: "更新完了",
          message: "テナントを停止しました。",
        });
        await queryClient.invalidateQueries({
          queryKey: getTenantsControllerFindAllQueryKey(),
        });
      },
    },
  });
  const resumeMutation = useTenantsControllerResume({
    mutation: {
      onSuccess: async () => {
        notifications.show({
          color: "green",
          title: "更新完了",
          message: "テナントを再開しました。",
        });
        await queryClient.invalidateQueries({
          queryKey: getTenantsControllerFindAllQueryKey(),
        });
      },
    },
  });

  const columns = useMemo<ColumnDef<TenantWithCountResponseDto>[]>(
    () => [
      {
        header: "テナント名",
        accessorKey: "name",
        cell: ({ row }) => (
          <Stack gap={2}>
            <Text
              component={Link}
              to={`/system/tenants/${row.original.id}`}
              fw={600}
              c="blue.6"
            >
              {row.original.name}
            </Text>
            <Text size="xs" c="dimmed">
              {row.original.id}
            </Text>
          </Stack>
        ),
      },
      {
        header: "状態",
        accessorKey: "status",
        cell: ({ row }) => <StatusBadge value={row.original.status} />,
      },
      {
        header: "ユーザー数",
        cell: ({ row }) => `${row.original._count.users}名`,
      },
      {
        header: "作成日時",
        cell: ({ row }) => formatDateTime(row.original.createdAt),
      },
      {
        header: "",
        cell: ({ row }) =>
          row.original.status === "active" ? (
            <Button
              variant="light"
              color="red"
              loading={suspendMutation.isPending}
              onClick={() => suspendMutation.mutate({ id: row.original.id })}
            >
              停止
            </Button>
          ) : (
            <Button
              variant="light"
              color="green"
              loading={resumeMutation.isPending}
              onClick={() => resumeMutation.mutate({ id: row.original.id })}
            >
              再開
            </Button>
          ),
      },
    ],
    [resumeMutation, suspendMutation],
  );

  if (tenantsQuery.isLoading) {
    return <LoadingState />;
  }

  const data = tenantsQuery.data;

  return (
    <PageLayout
      title="テナント一覧"
      actions={
        <Button
          component={Link}
          to="/system/tenants/new"
          leftSection={<IconPlus size={16} />}
        >
          新規テナント
        </Button>
      }
      filters={
        <div className="table-toolbar">
          <Select
            placeholder="ステータスで絞り込み"
            data={[
              { label: "すべて", value: "" },
              { label: "稼働中", value: "active" },
              { label: "停止中", value: "suspended" },
            ]}
            value={status ?? ""}
            onChange={(value) => {
              setStatus(value || null);
              setPage(1);
            }}
            w={240}
          />
        </div>
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
