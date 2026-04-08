import { Badge } from "@mantine/core";

const colorMap: Record<string, string> = {
  active: "teal",
  suspended: "red",
  approved: "teal",
  pending: "yellow",
  rejected: "red",
  working: "blue",
  completed: "teal",
  holiday: "grape",
  absent: "gray",
  closed: "teal",
  tenant_admin: "blue",
  tenant_user: "gray",
  system_admin: "dark",
  true: "teal",
  false: "gray",
};

const labelMap: Record<string, string> = {
  active: "稼働中",
  suspended: "停止中",
  approved: "承認済み",
  pending: "申請中",
  rejected: "差し戻し",
  working: "勤務中",
  completed: "退勤済み",
  holiday: "休暇",
  absent: "欠勤",
  closed: "締め済み",
  tenant_admin: "管理者",
  tenant_user: "一般",
  system_admin: "システム管理者",
  true: "有効",
  false: "無効",
};

export function StatusBadge({
  value,
}: {
  value: string | boolean | null | undefined;
}) {
  const normalized = String(value);

  return (
    <Badge variant="light" color={colorMap[normalized] ?? "gray"}>
      {labelMap[normalized] ?? normalized}
    </Badge>
  );
}
