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
    <Stack gap="lg" maw={1200} mx="auto" w="100%">
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
        <Stack gap={4}>
          <Title order={2} fz={22} fw={700} style={{ letterSpacing: "-0.02em" }}>
            {title}
          </Title>
          {description && (
            <Text size="sm" c="dimmed">
              {description}
            </Text>
          )}
        </Stack>
        {actions && <Group gap="sm">{actions}</Group>}
      </Group>

      {filters && (
        <Group
          gap="sm"
          p="sm"
          bg="rgba(255, 255, 255, 0.72)"
          style={{
            borderRadius: "var(--mantine-radius-md)",
            border: "1px solid rgba(177, 189, 204, 0.3)",
          }}
        >
          {filters}
        </Group>
      )}

      <Stack gap="md">{children}</Stack>
    </Stack>
  );
}
