import { Alert, Center, Loader, Text } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";

export function LoadingState() {
  return (
    <Center mih={240}>
      <Loader color="blue" />
    </Center>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <Alert icon={<IconInfoCircle size={16} />} color="gray" variant="light">
      <Text size="sm">{message}</Text>
    </Alert>
  );
}
