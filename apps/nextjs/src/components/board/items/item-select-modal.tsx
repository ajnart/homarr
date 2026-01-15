import { useMemo, useState } from "react";
import { Button, Card, Center, Grid, Input, Stack, Text } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";

import { objectEntries } from "@homarr/common";
import type { WidgetKind } from "@homarr/definitions";
import { createModal } from "@homarr/modals";
import { useI18n } from "@homarr/translation/client";
import type { TablerIcon } from "@homarr/ui";
import { widgetImports } from "@homarr/widgets";

import { useItemActions } from "./item-actions";

export const ItemSelectModal = createModal<void>(({ actions }) => {
  const [search, setSearch] = useState("");
  const t = useI18n();
  const { createItem } = useItemActions();

  const items = useMemo(
    () =>
      objectEntries(widgetImports)
        .map(([kind, value]) => ({
          kind,
          icon: value.definition.icon,
          name: t(`widget.${kind}.name`),
          description: t(`widget.${kind}.description`),
        }))
        .sort((itemA, itemB) => itemA.name.localeCompare(itemB.name)),
    [t],
  );

  const filteredItems = useMemo(
    () => items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())),
    [items, search],
  );

  const handleAdd = (kind: WidgetKind) => {
    createItem({ kind });
    actions.closeModal();
  };

  return (
    <Stack>
      <Input
        value={search}
        onChange={(event) => setSearch(event.currentTarget.value)}
        leftSection={<IconSearch />}
        placeholder={`${t("item.create.search")}...`}
        data-autofocus
        onKeyDown={(event) => {
          // Add item if there is only one item in the list and user presses Enter
          if (event.key === "Enter" && filteredItems.length === 1) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            handleAdd(filteredItems[0]!.kind);
          }
        }}
      />

      <Grid>
        {filteredItems.map((item) => (
          <WidgetItem key={item.kind} item={item} onSelect={() => handleAdd(item.kind)} />
        ))}
      </Grid>
    </Stack>
  );
}).withOptions({
  defaultTitle: (t) => t("item.create.title"),
  size: "xl",
});

const WidgetItem = ({
  item,
  onSelect,
}: {
  item: {
    kind: WidgetKind;
    name: string;
    description: string;
    icon: TablerIcon;
  };
  onSelect: () => void;
}) => {
  const t = useI18n();

  return (
    <Grid.Col span={{ xs: 12, sm: 4, md: 3 }}>
      <Card h="100%">
        <Stack justify="space-between" h="100%">
          <Stack gap="xs">
            <Center>
              <item.icon />
            </Center>
            <Text lh={1.2} style={{ whiteSpace: "normal" }} ta="center">
              {item.name}
            </Text>
            <Text lh={1.2} style={{ whiteSpace: "normal" }} size="xs" ta="center" c="dimmed">
              {item.description}
            </Text>
          </Stack>
          <Button onClick={onSelect} variant="light" size="xs" mt="auto" radius="md" fullWidth>
            {t(`item.create.addToBoard`)}
          </Button>
        </Stack>
      </Card>
    </Grid.Col>
  );
};
