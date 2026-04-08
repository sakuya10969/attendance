import { Card, SimpleGrid, Text } from "@mantine/core";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";

import {
  useAttendanceControllerFindMine,
  useAttendanceControllerGetMySummary,
} from "~/shared/api/endpoints/attendance/attendance";
import type { AttendanceListItemResponseDto } from "~/shared/api/model";
import { LoadingState } from "~/shared/components/data-state";
import { DataTable } from "~/shared/components/data-table";
import { PageLayout } from "~/shared/components/page-layout";
import { StatusBadge } from "~/shared/components/status-badge";
import {
  formatDate,
  formatMinutes,
  formatTime,
} from "~/shared/lib/format";

const today = new Date();

function breakMinutes(records: AttendanceListItemResponseDto["breakRecords"]) {
  return records.reduce((sum, record) => {
    if (
      typeof record.startTime !== "string" ||
      typeof record.endTime !== "string"
    ) {
      return sum;
    }

    return (
      sum +
      Math.floor(
        (new Date(record.endTime).getTime() -
          new Date(record.startTime).getTime()) /
          60000,
      )
    );
  }, 0);
}

export default function AppAttendanceRoute() {
  const [page, setPage] = useState(1);
  const params = {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
  };
  const listQuery = useAttendanceControllerFindMine({
    ...params,
    page,
    limit: 20,
  });
  const summaryQuery = useAttendanceControllerGetMySummary(params);

  const columns = useMemo<ColumnDef<AttendanceListItemResponseDto>[]>(
    () => [
      {
        header: "日付",
        cell: ({ row }) => formatDate(row.original.date),
      },
      {
        header: "出勤",
        cell: ({ row }) => <span className="mono">{formatTime(row.original.clockIn)}</span>,
      },
      {
        header: "退勤",
        cell: ({ row }) => <span className="mono">{formatTime(row.original.clockOut)}</span>,
      },
      {
        header: "休憩",
        cell: ({ row }) => `${breakMinutes(row.original.breakRecords)}分`,
      },
      {
        header: "状態",
        cell: ({ row }) => <StatusBadge value={row.original.status} />,
      },
    ],
    [],
  );

  if (listQuery.isLoading || summaryQuery.isLoading) {
    return <LoadingState />;
  }

  const list = listQuery.data;
  const summary = summaryQuery.data;

  return (
    <PageLayout title="勤怠一覧">
      {summary ? (
        <SimpleGrid cols={{ base: 2, md: 5 }}>
          <Card className="kpi-card">
            <Text size="xs" tt="uppercase" fw={700} c="dimmed">
              総勤務
            </Text>
            <Text fw={700} mt="xs">
              {formatMinutes(summary.totalWorkMinutes)}
            </Text>
          </Card>
          <Card className="kpi-card">
            <Text size="xs" tt="uppercase" fw={700} c="dimmed">
              総休憩
            </Text>
            <Text fw={700} mt="xs">
              {formatMinutes(summary.totalBreakMinutes)}
            </Text>
          </Card>
          <Card className="kpi-card">
            <Text size="xs" tt="uppercase" fw={700} c="dimmed">
              残業
            </Text>
            <Text fw={700} mt="xs">
              {formatMinutes(summary.totalOvertimeMinutes)}
            </Text>
          </Card>
          <Card className="kpi-card">
            <Text size="xs" tt="uppercase" fw={700} c="dimmed">
              深夜
            </Text>
            <Text fw={700} mt="xs">
              {formatMinutes(summary.totalNightMinutes)}
            </Text>
          </Card>
          <Card className="kpi-card">
            <Text size="xs" tt="uppercase" fw={700} c="dimmed">
              出勤日数
            </Text>
            <Text fw={700} mt="xs">
              {summary.presentDays}日
            </Text>
          </Card>
        </SimpleGrid>
      ) : null}

      <Card className="page-card">
        {list ? (
          <DataTable
            data={list.data}
            columns={columns}
            page={list.page}
            total={list.total}
            limit={list.limit}
            onPageChange={setPage}
          />
        ) : (
          <Text size="sm">データがありません。</Text>
        )}
      </Card>
    </PageLayout>
  );
}
