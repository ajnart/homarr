import { Stack, Text } from "@mantine/core";

export const StatRow = ({ label, value }: { label: string; value: string | number }) => {
  return (
    <Stack gap={0}>
      <Text size={"2xl"} fw={900} lh={1}>
        {value}
      </Text>
      <Text size={"md"} c={"dimmed"}>
        {label}
      </Text>
    </Stack>
  );
};
