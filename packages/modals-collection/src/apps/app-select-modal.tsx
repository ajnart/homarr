import { useMemo, useState } from "react";
import { Button, Card, Center, Grid, Input, Stack, Text } from "@mantine/core";
import { IconPlus, IconSearch } from "@tabler/icons-react";

import type { RouterOutputs } from "@homarr/api";
import { clientApi } from "@homarr/api/client";
import { createModal, useModalAction } from "@homarr/modals";
import { useI18n } from "@homarr/translation/client";

import { QuickAddAppModal } from "./quick-add-app/quick-add-app-modal";

interface AppSelectModalProps {
  onSelect?: (app: RouterOutputs["app"]["selectable"][number]) => void;
  withCreate: boolean;
}

export const AppSelectModal = createModal<AppSelectModalProps>(({ actions, innerProps }) => {
  const [search, setSearch] = useState("");
  const t = useI18n();
  const { data: apps = [], isPending } = clientApi.app.selectable.useQuery();
  const { openModal: openQuickAddAppModal } = useModalAction(QuickAddAppModal);

  const filteredApps = useMemo(
    () =>
      apps
        .filter((app) => app.name.toLowerCase().includes(search.toLowerCase()))
        .sort((appA, appB) => appA.name.localeCompare(appB.name)),
    [apps, search],
  );

  const handleSelect = (app: RouterOutputs["app"]["selectable"][number]) => {
    if (innerProps.onSelect) {
      innerProps.onSelect(app);
    }
    actions.closeModal();
  };

  const handleAddNewApp = () => {
    openQuickAddAppModal({
      onClose(app) {
        if (innerProps.onSelect) {
          innerProps.onSelect(app);
        }
        actions.closeModal();
      },
    });
  };

  return (
    <Stack>
      <Input
        value={search}
        onChange={(event) => setSearch(event.currentTarget.value)}
        leftSection={<IconSearch />}
        placeholder={`${t("app.action.select.search")}...`}
        data-autofocus
        onKeyDown={(event) => {
          if (event.key === "Enter" && filteredApps.length === 1 && filteredApps[0]) {
            handleSelect(filteredApps[0]);
          }
        }}
      />

      <Grid>
        {innerProps.withCreate && (
          <Grid.Col span={{ xs: 12, sm: 4, md: 3 }}>
            <Card h="100%">
              <Stack justify="space-between" h="100%">
                <Stack gap="xs">
                  <Center>
                    <IconPlus size={24} />
                  </Center>
                  <Text lh={1.2} style={{ whiteSpace: "normal" }} ta="center">
                    {t("app.action.create.title")}
                  </Text>
                  <Text lh={1.2} style={{ whiteSpace: "normal" }} size="xs" ta="center" c="dimmed">
                    {t("app.action.create.description")}
                  </Text>
                </Stack>
                <Button onClick={handleAddNewApp} variant="light" size="xs" mt="auto" radius="md" fullWidth>
                  {t("app.action.create.action")}
                </Button>
              </Stack>
            </Card>
          </Grid.Col>
        )}

        {filteredApps.map((app) => (
          <Grid.Col key={app.id} span={{ xs: 12, sm: 4, md: 3 }}>
            <Card h="100%">
              <Stack justify="space-between" h="100%">
                <Stack gap="xs">
                  <Center>
                    <img src={app.iconUrl} alt={app.name} width={24} height={24} />
                  </Center>
                  <Text lh={1.2} style={{ whiteSpace: "normal" }} ta="center">
                    {app.name}
                  </Text>
                  <Text lh={1.2} style={{ whiteSpace: "normal" }} size="xs" ta="center" c="dimmed">
                    {app.description ?? ""}
                  </Text>
                </Stack>
                <Button onClick={() => handleSelect(app)} variant="light" size="xs" mt="auto" radius="md" fullWidth>
                  {t("app.action.select.action", { app: app.name })}
                </Button>
              </Stack>
            </Card>
          </Grid.Col>
        ))}

        {filteredApps.length === 0 && !isPending && (
          <Grid.Col span={12}>
            <Center p="xl">
              <Text c="dimmed">{t("app.action.select.noResults")}</Text>
            </Center>
          </Grid.Col>
        )}
      </Grid>
    </Stack>
  );
}).withOptions({
  defaultTitle: (t) => t("app.action.select.title"),
  size: "xl",
});
