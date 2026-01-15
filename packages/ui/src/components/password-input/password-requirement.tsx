import { rem, Text } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";

export function PasswordRequirement({ meets, label }: { meets: boolean; label: string }) {
  return (
    <Text c={meets ? "teal" : "red"} display="flex" style={{ alignItems: "center" }} size="sm">
      {meets ? (
        <IconCheck style={{ width: rem(14), height: rem(14) }} />
      ) : (
        <IconX style={{ width: rem(14), height: rem(14) }} />
      )}
      <Text span ml={10}>
        {label}
      </Text>
    </Text>
  );
}
