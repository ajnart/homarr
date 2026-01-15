import { Group, Stack, Text } from "@mantine/core";
import { IconNetwork } from "@tabler/icons-react";

import { useScopedI18n } from "@homarr/translation/client";

import { StatRow } from "./stat-row";

export const WiredVariant = ({ countGuests, countUsers }: { countUsers: number; countGuests: number }) => {
  const t = useScopedI18n("widget.networkControllerStatus.card");
  return (
    <>
      <Group gap={"xs"} wrap={"nowrap"} mb={"md"}>
        <IconNetwork size={24} />
        <Text size={"md"} fw={"bold"}>
          {t("variants.wired.name")}
        </Text>
      </Group>
      <Stack gap={"lg"}>
        <StatRow label={t("users.label")} value={countUsers} />
        <StatRow label={t("guests.label")} value={countGuests} />
      </Stack>
    </>
  );
};
