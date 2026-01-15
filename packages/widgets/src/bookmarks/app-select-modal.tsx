"use client";

import { memo, useState } from "react";
import type { SelectProps } from "@mantine/core";
import { Button, Group, Loader, Select, Stack } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";

import type { RouterOutputs } from "@homarr/api";
import { clientApi } from "@homarr/api/client";
import { useForm } from "@homarr/form";
import { createModal } from "@homarr/modals";
import { useI18n } from "@homarr/translation/client";

interface InnerProps {
  presentAppIds: string[];
  onSelect: (props: RouterOutputs["app"]["selectable"][number]) => void | Promise<void>;
  confirmLabel?: string;
}

interface AppSelectFormType {
  id: string;
}

export const AppSelectModal = createModal<InnerProps>(({ actions, innerProps }) => {
  const t = useI18n();
  const { data: apps, isPending } = clientApi.app.selectable.useQuery();
  const [loading, setLoading] = useState(false);
  const form = useForm<AppSelectFormType>();
  const handleSubmitAsync = async (values: AppSelectFormType) => {
    const currentApp = apps?.find((app) => app.id === values.id);
    if (!currentApp) return;
    setLoading(true);
    await innerProps.onSelect(currentApp);

    setLoading(false);
    actions.closeModal();
  };

  const confirmLabel = innerProps.confirmLabel ?? t("common.action.add");
  const currentApp = apps?.find((app) => app.id === form.values.id);

  return (
    <form onSubmit={form.onSubmit((values) => void handleSubmitAsync(values))}>
      <Stack>
        <Select
          {...form.getInputProps("id")}
          label={t("app.action.select.label")}
          searchable
          clearable
          leftSection={<MemoizedLeftSection isPending={isPending} currentApp={currentApp} />}
          nothingFoundMessage={t("app.action.select.notFound")}
          renderOption={renderSelectOption}
          limit={5}
          data={
            apps
              ?.filter((app) => !innerProps.presentAppIds.includes(app.id))
              .map((app) => ({
                label: app.name,
                value: app.id,
                iconUrl: app.iconUrl,
              })) ?? []
          }
        />
        <Group justify="end">
          <Button variant="default" onClick={actions.closeModal}>
            {t("common.action.cancel")}
          </Button>
          <Button type="submit" loading={loading}>
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}).withOptions({
  defaultTitle: (t) => t("app.action.select.label"),
});

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
