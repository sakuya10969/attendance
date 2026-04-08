import { index, layout, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  route("login", "routes/login.tsx"),
  layout("routes/protected-layout.tsx", [
    route("system/tenants", "routes/system.tenants.tsx"),
    route("system/tenants/new", "routes/system.tenants.new.tsx"),
    route("system/tenants/:id", "routes/system.tenants.$id.tsx"),
    route("admin/users", "routes/admin.users.tsx"),
    route("admin/users/new", "routes/admin.users.new.tsx"),
    route("app/clock", "routes/app.clock.tsx"),
    route("app/attendance", "routes/app.attendance.tsx"),
  ]),
] satisfies RouteConfig;
