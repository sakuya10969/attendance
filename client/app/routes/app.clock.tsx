import {
  Button,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import {
  getAttendanceControllerGetTodayQueryKey,
  useAttendanceControllerBreakEnd,
  useAttendanceControllerBreakStart,
  useAttendanceControllerClockIn,
  useAttendanceControllerClockOut,
  useAttendanceControllerGetToday,
} from "~/shared/api/endpoints/attendance/attendance";
import { AttendanceResponseDtoStatus } from "~/shared/api/model";
import { LoadingState } from "~/shared/components/data-state";
import { PageLayout } from "~/shared/components/page-layout";
import { StatusBadge } from "~/shared/components/status-badge";
import { formatDate, formatTime } from "~/shared/lib/format";

function asIsoString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function diffMinutes(start?: unknown, end?: unknown) {
  const normalizedStart = asIsoString(start);
  const normalizedEnd = asIsoString(end);

  if (!normalizedStart || !normalizedEnd) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(
      (new Date(normalizedEnd).getTime() - new Date(normalizedStart).getTime()) /
        60000,
    ),
  );
}

export default function AppClockRoute() {
  const queryClient = useQueryClient();
  const [now, setNow] = useState<Date | null>(null);
  const todayQuery = useAttendanceControllerGetToday();

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  async function invalidateToday() {
    await queryClient.invalidateQueries({
      queryKey: getAttendanceControllerGetTodayQueryKey(),
    });
  }

  const clockIn = useAttendanceControllerClockIn({
    mutation: {
      onSuccess: async () => {
        notifications.show({ color: "green", title: "出勤", message: "出勤打刻を登録しました。" });
        await invalidateToday();
      },
    },
  });
  const clockOut = useAttendanceControllerClockOut({
    mutation: {
      onSuccess: async () => {
        notifications.show({ color: "green", title: "退勤", message: "退勤打刻を登録しました。" });
        await invalidateToday();
      },
    },
  });
  const breakStart = useAttendanceControllerBreakStart({
    mutation: {
      onSuccess: async () => {
        notifications.show({ color: "green", title: "休憩開始", message: "休憩を開始しました。" });
        await invalidateToday();
      },
    },
  });
  const breakEnd = useAttendanceControllerBreakEnd({
    mutation: {
      onSuccess: async () => {
        notifications.show({ color: "green", title: "休憩終了", message: "休憩を終了しました。" });
        await invalidateToday();
      },
    },
  });

  const attendance = todayQuery.data;
  const activeBreak = attendance?.breakRecords.find((record) => !record.endTime);
  const totalBreakMinutes = useMemo(
    () =>
      attendance?.breakRecords.reduce((sum, record) => {
        const end = record.endTime ?? now?.toISOString();
        return sum + diffMinutes(record.startTime, end);
      }, 0) ?? 0,
    [attendance?.breakRecords, now],
  );
  const workMinutes = attendance?.clockIn
    ? diffMinutes(attendance.clockIn, attendance.clockOut ?? now?.toISOString()) -
      totalBreakMinutes
    : 0;

  if (todayQuery.isLoading) {
    return <LoadingState />;
  }

  return (
    <PageLayout title="打刻">
      <SimpleGrid cols={{ base: 1, md: 3 }}>
        <Card className="kpi-card">
          <Text size="xs" tt="uppercase" fw={700} c="dimmed">
            現在時刻
          </Text>
          <Title order={2} className="mono" mt="xs">
            {now ? now.toLocaleTimeString("ja-JP") : "--:--:--"}
          </Title>
          <Text size="sm" c="dimmed" mt={4}>
            {now ? formatDate(now.toISOString(), "YYYY/MM/DD") : "-"}
          </Text>
        </Card>
        <Card className="kpi-card">
          <Text size="xs" tt="uppercase" fw={700} c="dimmed">
            勤怠状態
          </Text>
          <Group mt="xs">
            <StatusBadge value={attendance?.status ?? "absent"} />
            {activeBreak ? <Text size="sm">休憩中</Text> : null}
          </Group>
        </Card>
        <Card className="kpi-card">
          <Text size="xs" tt="uppercase" fw={700} c="dimmed">
            本日の実績
          </Text>
          <Stack gap={4} mt="xs">
            <Text size="sm">勤務: <span className="mono">{Math.max(workMinutes, 0)}分</span></Text>
            <Text size="sm">休憩: <span className="mono">{totalBreakMinutes}分</span></Text>
          </Stack>
        </Card>
      </SimpleGrid>

      <Card className="page-card">
        <Stack gap="md">
          <Group justify="space-between" align="start">
            <div>
              <Text fw={600}>本日の記録</Text>
              <Text size="sm" c="dimmed">
                出勤 {formatTime(attendance?.clockIn)} / 退勤 {formatTime(attendance?.clockOut)}
              </Text>
            </div>
            <StatusBadge value={attendance?.status ?? "absent"} />
          </Group>
          <Group>
            {!attendance?.clockIn ? (
              <Button loading={clockIn.isPending} onClick={() => clockIn.mutate()}>
                出勤
              </Button>
            ) : null}
            {attendance?.clockIn &&
            attendance.status === AttendanceResponseDtoStatus.working &&
            !activeBreak ? (
              <Button
                variant="light"
                loading={breakStart.isPending}
                onClick={() => breakStart.mutate()}
              >
                休憩開始
              </Button>
            ) : null}
            {activeBreak ? (
              <Button
                variant="light"
                color="yellow"
                loading={breakEnd.isPending}
                onClick={() => breakEnd.mutate()}
              >
                休憩終了
              </Button>
            ) : null}
            {attendance?.clockIn &&
            attendance.status === AttendanceResponseDtoStatus.working &&
            !activeBreak ? (
              <Button
                color="dark"
                loading={clockOut.isPending}
                onClick={() => clockOut.mutate()}
              >
                退勤
              </Button>
            ) : null}
          </Group>
        </Stack>
      </Card>
    </PageLayout>
  );
}
