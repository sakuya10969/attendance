import { Group, Stack, Text, Title } from "@mantine/core";

interface PageLayoutProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  filters?: React.ReactNode;
  children: React.ReactNode;
}

export function PageLayout({
  title,
  description,
  actions,
  filters,
  children,
}: PageLayoutProps) {
  return (
    <Stack gap="lg" maw={1200} mx="auto">
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={2} fz={22} fw={700} style={{ letterSpacing: "-0.02em" }}>
            {title}
          </Title>
          {description && (
            <Text size="sm" c="dimmed" mt={4}>
              {description}
            </Text>
          )}
        </div>
        {actions && <Group gap="sm">{actions}</Group>}
      </Group>

      {filters && (
        <Group gap="sm" p="sm" bg="var(--mantine-color-gray-0)" style={{ borderRadius: "var(--mantine-radius-sm)" }}>
          {filters}
        </Group>
      )}

      <Stack gap="md">{children}</Stack>
    </Stack>
  );
}
