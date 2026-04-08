import { Group, Stack, Title } from "@mantine/core";

interface PageLayoutProps {
  title: string;
  actions?: React.ReactNode;
  filters?: React.ReactNode;
  children: React.ReactNode;
}

export function PageLayout({
  title,
  actions,
  filters,
  children,
}: PageLayoutProps) {
  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Title order={2}>{title}</Title>
        {actions ? <Group>{actions}</Group> : null}
      </Group>
      {filters ? <Group>{filters}</Group> : null}
      {children}
    </Stack>
  );
}
