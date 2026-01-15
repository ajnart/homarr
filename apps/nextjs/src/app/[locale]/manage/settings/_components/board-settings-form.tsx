"use client";

import { Switch, Text } from "@mantine/core";

import { clientApi } from "@homarr/api/client";
import type { ServerSettings } from "@homarr/server-settings";
import { useScopedI18n } from "@homarr/translation/client";

import { BoardSelect } from "~/components/board/board-select";
import { CommonSettingsForm } from "./common-form";

export const BoardSettingsForm = ({ defaultValues }: { defaultValues: ServerSettings["board"] }) => {
  const tBoard = useScopedI18n("management.page.settings.section.board");
  const [selectableBoards] = clientApi.board.getPublicBoards.useSuspenseQuery();

  return (
    <CommonSettingsForm settingKey="board" defaultValues={defaultValues}>
      {(form) => (
        <>
          <BoardSelect
            label={tBoard("homeBoard.label")}
            description={tBoard("homeBoard.description")}
            clearable
            boards={selectableBoards}
            {...form.getInputProps("homeBoardId")}
          />

          <BoardSelect
            label={tBoard("homeBoard.mobileLabel")}
            description={tBoard("homeBoard.description")}
            clearable
            boards={selectableBoards}
            {...form.getInputProps("mobileHomeBoardId")}
          />

          <Text fw={500}>{tBoard("status.title")}</Text>
          <Switch
            {...form.getInputProps("enableStatusByDefault", { type: "checkbox" })}
            label={tBoard("status.enableStatusByDefault.label")}
            description={tBoard("status.enableStatusByDefault.description")}
          />
          <Switch
            {...form.getInputProps("forceDisableStatus", { type: "checkbox" })}
            label={tBoard("status.forceDisableStatus.label")}
            description={tBoard("status.forceDisableStatus.description")}
          />
        </>
      )}
    </CommonSettingsForm>
  );
};
