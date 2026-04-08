import dayjs from "dayjs";

function normalizeDateInput(value?: unknown) {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    value instanceof Date
  ) {
    return value;
  }

  return null;
}

export function formatDate(value?: unknown, format = "YYYY/MM/DD") {
  const normalized = normalizeDateInput(value);

  if (!normalized) {
    return "-";
  }

  return dayjs(normalized).format(format);
}

export function formatDateTime(value?: unknown) {
  const normalized = normalizeDateInput(value);

  if (!normalized) {
    return "-";
  }

  return dayjs(normalized).format("YYYY/MM/DD HH:mm");
}

export function formatTime(value?: unknown) {
  const normalized = normalizeDateInput(value);

  if (!value) {
    return "-";
  }

  if (!normalized) {
    return "-";
  }

  return dayjs(normalized).format("HH:mm");
}

export function formatMinutes(minutes?: number | null) {
  if (minutes == null) {
    return "-";
  }

  const hour = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${hour}時間${rest}分`;
}
