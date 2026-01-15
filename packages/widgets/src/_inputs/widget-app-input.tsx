"use client";

import { memo, useMemo } from "react";
import type { SelectProps } from "@mantine/core";
import { Anchor, Button, Group, Loader, Select, SimpleGrid, Text } from "@mantine/core";
import { IconCheck, IconRocket } from "@tabler/icons-react";

import type { RouterOutputs } from "@homarr/api";
import { clientApi } from "@homarr/api/client";
import { useSession } from "@homarr/auth/client";
import { useModalAction } from "@homarr/modals";
import { QuickAddAppModal } from "@homarr/modals-collection";
import { useI18n } from "@homarr/translation/client";
import { Link } from "@homarr/ui";

import type { CommonWidgetInputProps } from "./common";
import { useWidgetInputTranslation } from "./common";
import { useFormContext } from "./form";

export const WidgetAppInput = ({ property, kind }: CommonWidgetInputProps<"app">) => {
  const t = useI18n();
  const tInput = useWidgetInputTranslation(kind, property);
  const form = useFormContext();
  const { data: apps, isPending, refetch } = clientApi.app.selectable.useQuery();
  const { data: session } = useSession();
  const canCreateApps = session?.user.permissions.includes("app-create") ?? false;

  const { openModal } = useModalAction(QuickAddAppModal);

  const currentApp = useMemo(
    () => apps?.find((app) => app.id === form.values.options.appId),
    [apps, form.values.options.appId],
  );

  return (
    <SimpleGrid cols={{ base: 1, md: canCreateApps ? 2 : 1 }} spacing={{ base: "md" }} style={{ alignItems: "center" }}>
      <Select
        label={tInput("label")}
        searchable
        leftSection={<MemoizedLeftSection isPending={isPending} currentApp={currentApp} />}
        nothingFoundMessage={t("widget.common.app.noData")}
        renderOption={renderSelectOption}
        data={
          apps?.map((app) => ({
            label: app.name,
            value: app.id,
            iconUrl: app.iconUrl,
          })) ?? []
        }
        inputWrapperOrder={["label", "input", "description", "error"]}
        description={
          <Text size="xs">
            {t.rich("widget.common.app.description", {
              here: () => (
                <Anchor size="xs" component={Link} target="_blank" href="/manage/apps/new">
                  {t("common.here")}
                </Anchor>
              ),
            })}
          </Text>
        }
        styles={{ root: { flex: "1" } }}
        {...form.getInputProps(`options.${property}`)}
      />
      {canCreateApps && (
        <Button
          mt={3}
          rightSection={<IconRocket size="1.5rem" />}
          variant="default"
          onClick={() =>
            openModal({
              onClose(createdAppId) {
                void refetch().then(() => {
                  form.setFieldValue(`options.${property}`, createdAppId);
                });
              },
            })
          }
        >
          {t("widget.common.app.quickCreate")}
        </Button>
      )}
    </SimpleGrid>
  );
};

const iconProps = {
  stroke: 1.5,
  color: "currentColor",
  opacity: 0.6,
  size: 18,
};

const renderSelectOption: SelectProps["renderOption"] = ({ option, checked }) => (
  <Group flex="1" gap="xs">
    {"iconUrl" in option && typeof option.iconUrl === "string" ? (
      <img width={20} height={20} src={option.iconUrl} alt={option.label} />
    ) : null}
    {option.label}
    {checked && <IconCheck style={{ marginInlineStart: "auto" }} {...iconProps} />}
  </Group>
);

interface LeftSectionProps {
  isPending: boolean;
  currentApp: RouterOutputs["app"]["selectable"][number] | undefined;
}

const size = 20;
const LeftSection = ({ isPending, currentApp }: LeftSectionProps) => {
  if (isPending) {
    return <Loader size={size} />;
  }

  if (currentApp) {
    return <img width={size} height={size} src={currentApp.iconUrl} alt={currentApp.name} />;
  }

  return null;
};

const MemoizedLeftSection = memo(LeftSection);
