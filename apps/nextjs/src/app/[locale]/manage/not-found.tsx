import { Center, Stack, Text, Title } from "@mantine/core";

import { getScopedI18n } from "@homarr/translation/server";

export default async function NotFound() {
  const t = await getScopedI18n("management.notFound");
  return (
    <Center h="100%">
      <Stack align="center">
        <Title order={1} tt="uppercase">
          {t("title")}
        </Title>
        <Text>{t("text")}</Text>
      </Stack>
    </Center>
  );
}
