import type { AppRole } from "./types";

export const roleHomeMap: Record<AppRole, string> = {
  system_admin: "/system/tenants",
  tenant_admin: "/admin/users",
  tenant_user: "/app/clock",
};

export function canAccessPath(role: AppRole, pathname: string) {
  if (role === "system_admin") {
    return pathname.startsWith("/system/");
  }

  if (role === "tenant_admin") {
    return pathname.startsWith("/admin/");
  }

  return pathname.startsWith("/app/");
}
