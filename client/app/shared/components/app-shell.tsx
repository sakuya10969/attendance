import {
  AppShell,
  Avatar,
  Burger,
  Button,
  Group,
  NavLink,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconBuilding,
  IconClock,
  IconLogout,
  IconReceipt2,
  IconUsers,
} from "@tabler/icons-react";
import { Link, Outlet, useLocation } from "react-router";

import { useAuth } from "../auth/use-auth";
import { roleHomeMap } from "../auth/role";

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

export function AuthenticatedAppShell() {
  const [opened, { toggle }] = useDisclosure();
  const location = useLocation();
  const { appUser, signOut } = useAuth();

  if (!appUser) {
    return null;
  }

  const items = navItems[appUser.role];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 240,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header className="app-header">
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm">
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Link to={roleHomeMap[appUser.role]} className="brand-link">
              attendance
            </Link>
          </Group>
          <Group gap="md">
            <div className="header-meta">
              <Text size="sm" fw={600}>
                {appUser.name}
              </Text>
              <Text size="xs" c="dimmed">
                {appUser.email}
              </Text>
            </div>
            <Avatar color="blue" radius="xl">
              {appUser.name.slice(0, 1).toUpperCase()}
            </Avatar>
            <Button variant="subtle" color="gray" onClick={() => void signOut()}>
              <IconLogout size={16} />
            </Button>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar className="app-navbar">
        <AppShell.Section grow component={ScrollArea} px="sm" py="md">
          <Stack gap={6}>
            {items.map((item) => (
              <NavLink
                key={item.to}
                component={Link}
                to={item.to}
                label={item.label}
                leftSection={<item.icon size={16} />}
                active={location.pathname.startsWith(item.to)}
                variant="subtle"
              />
            ))}
          </Stack>
        </AppShell.Section>
      </AppShell.Navbar>
      <AppShell.Main className="app-main">
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
