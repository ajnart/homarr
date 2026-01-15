import type { ChangeEvent } from "react";
import { Anchor, Card, Checkbox, Group, Stack, Text } from "@mantine/core";

import { useI18n, useScopedI18n } from "@homarr/translation/client";

export type BoardSelectionMap = Map<string, boolean>;

interface BoardSelectionCardProps {
  selections: BoardSelectionMap;
  updateSelections: (callback: (selections: BoardSelectionMap) => BoardSelectionMap) => void;
}

const allChecked = (map: BoardSelectionMap) => {
  return [...map.values()].every((selection) => selection);
};

export const BoardSelectionCard = ({ selections, updateSelections }: BoardSelectionCardProps) => {
  const tBoardSelection = useScopedI18n("init.step.import.boardSelection");
  const t = useI18n();
  const areAllChecked = allChecked(selections);

  const handleToggleAll = () => {
    updateSelections((selections) => {
      return new Map([...selections.keys()].map((name) => [name, !areAllChecked] as const));
    });
  };

  const registerToggle = (name: string) => (event: ChangeEvent<HTMLInputElement>) => {
    updateSelections((selections) => {
      const updated = new Map(selections);
      updated.set(name, event.target.checked);
      return updated;
    });
  };

  if (selections.size === 0) {
    return null;
  }

  return (
    <Card w={64 * 12 + 8} maw="90vw">
      <Stack gap="sm">
        <Stack gap={0}>
          <Group justify="space-between" align="center">
            <Text fw={500}>{tBoardSelection("title", { count: String(selections.size) })}</Text>
            <Anchor component="button" onClick={handleToggleAll}>
              {areAllChecked ? tBoardSelection("action.unselectAll") : tBoardSelection("action.selectAll")}
            </Anchor>
          </Group>
          <Text size="sm" c="gray.6">
            {tBoardSelection("description")}
          </Text>
          <Text size="xs" c="gray.6">
            {t("board.action.oldImport.form.screenSize.description")}
          </Text>
        </Stack>

        <Stack gap="sm">
          {[...selections.entries()].map(([name, selected]) => (
            <Card key={name} withBorder>
              <Checkbox
                checked={selected}
                onChange={registerToggle(name)}
                label={
                  <Text fw={500} size="sm">
                    {name}
                  </Text>
                }
              />
            </Card>
          ))}
        </Stack>
      </Stack>
    </Card>
  );
};
