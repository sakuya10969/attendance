import type { AppRole } from "./types";

export const roleHomeMap: Record<AppRole, string> = {
  system_admin: "/system/tenants",
  tenant_admin: "/admin/users",
  tenant_user: "/app/clock",
};

export function canAccessPath(role: AppRole, pathname: string) {
  if (pathname.startsWith("/system")) {
    return role === "system_admin";
  }

  if (pathname.startsWith("/admin")) {
    return role === "tenant_admin";
  }

  if (pathname.startsWith("/app")) {
    return role === "tenant_user";
  }

  return true;
}
