import {
  Avatar,
  Badge,
  Box,
  Burger,
  Group,
  Menu,
  NavLink,
  ScrollArea,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconBuilding,
  IconChevronDown,
  IconClock,
  IconLogout,
  IconReceipt2,
  IconUsers,
} from "@tabler/icons-react";
import { Link, Outlet, useLocation } from "react-router";

import { roleHomeMap } from "~/shared/session/model/role";
import { useAuth } from "~/shared/session/model/use-auth";

const navItems = {
  system_admin: [
    { label: "テナント一覧", to: "/system/tenants", icon: IconBuilding },
  ],
  tenant_admin: [
    { label: "ユーザー一覧", to: "/admin/users", icon: IconUsers },
  ],
  tenant_user: [
    { label: "打刻", to: "/app/clock", icon: IconClock },
    { label: "勤怠一覧", to: "/app/attendance", icon: IconReceipt2 },
  ],
} as const;

const roleLabelMap = {
  system_admin: "System Admin",
  tenant_admin: "Tenant Admin",
  tenant_user: "Tenant User",
} as const;

function formatTenantLabel(tenantId: unknown) {
  return typeof tenantId === "string" && tenantId.length > 0
    ? tenantId
    : "System";
}

export function AuthenticatedAppShell() {
  const [opened, { toggle }] = useDisclosure();
  const location = useLocation();
  const { appUser, signOut } = useAuth();

  if (!appUser) {
    return null;
  }

  const items = navItems[appUser.role];

  return (
    <div className="app-shell">
      <header
        className="app-shell__header"
        style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}
      >
        <Group h="100%" px="md" justify="space-between">
          <Group gap="md">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Text
              component={Link}
              to={roleHomeMap[appUser.role]}
              fw={700}
              fz="md"
              style={{ letterSpacing: "-0.01em" }}
            >
              attendance
            </Text>
            <Badge variant="light" color="blue" visibleFrom="sm">
              {roleLabelMap[appUser.role]}
            </Badge>
          </Group>
          <Group gap="sm">
            <Box
              visibleFrom="sm"
              px="sm"
              py={6}
              bg="var(--mantine-color-gray-0)"
              style={{ borderRadius: 999, border: "1px solid var(--mantine-color-gray-3)" }}
            >
              <Text size="sm" fw={500}>{formatTenantLabel(appUser.tenantId)}</Text>
            </Box>
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <UnstyledButton>
                  <Group gap="xs" wrap="nowrap">
                    <Avatar color="blue" radius="xl" size={32}>
                      {appUser.name.slice(0, 1).toUpperCase()}
                    </Avatar>
                    <Box visibleFrom="sm">
                      <Text size="sm" fw={600} lh={1.2}>{appUser.name}</Text>
                      <Text size="xs" c="dimmed" lh={1.2}>{appUser.email}</Text>
                    </Box>
                    <IconChevronDown size={14} color="var(--mantine-color-gray-5)" />
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  color="red"
                  leftSection={<IconLogout size={16} />}
                  onClick={() => void signOut()}
                >
                  ログアウト
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </header>

      <div className="app-shell__body">
        <aside
          className={`app-shell__sidebar${opened ? " app-shell__sidebar--opened" : ""}`}
          style={{
            background: "var(--mantine-color-gray-0)",
            borderRight: "1px solid var(--mantine-color-gray-3)",
          }}
        >
          <ScrollArea className="app-shell__sidebar-scroll" px="sm" py="md">
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" px="sm" mb="xs" style={{ letterSpacing: "0.1em" }}>
            メニュー
          </Text>
          <Stack gap={4}>
            {items.map((item) => (
              <NavLink
                key={item.to}
                component={Link}
                to={item.to}
                label={item.label}
                leftSection={<item.icon size={18} stroke={1.5} />}
                active={location.pathname.startsWith(item.to)}
                variant="light"
              />
            ))}
          </Stack>
          </ScrollArea>
        </aside>

        <main className="app-shell__main">
          <Outlet />
        </main>
      </div>
      {opened ? <button className="app-shell__overlay" onClick={toggle} aria-label="Close navigation" /> : null}
    </div>
  );
}
