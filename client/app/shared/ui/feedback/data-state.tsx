import { Card, Center, Loader, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconInbox } from "@tabler/icons-react";

export function LoadingState() {
  return (
    <Center mih={200}>
      <Loader color="blue" />
    </Center>
  );
}

export function EmptyState({ message = "データがありません" }: { message?: string }) {
  return (
    <Card withBorder shadow="none">
      <Center mih={200}>
        <Stack align="center" gap="xs">
          <ThemeIcon size={48} radius="xl" variant="light" color="gray">
            <IconInbox size={24} />
          </ThemeIcon>
          <Text size="sm" c="dimmed">
            {message}
          </Text>
        </Stack>
      </Center>
    </Card>
  );
}
