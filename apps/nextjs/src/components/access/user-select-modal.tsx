import { useState } from "react";
import type { SelectProps } from "@mantine/core";
import { Button, Group, Loader, Select, Stack } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";

import type { RouterOutputs } from "@homarr/api";
import { clientApi } from "@homarr/api/client";
import { useForm } from "@homarr/form";
import { createModal } from "@homarr/modals";
import { useI18n } from "@homarr/translation/client";
import { UserAvatar } from "@homarr/ui";

interface InnerProps {
  presentUserIds: string[];
  excludeExternalProviders?: boolean;
  onSelect: (props: { id: string; name: string; image: string; email: string | null }) => void | Promise<void>;
  confirmLabel?: string;
}

interface UserSelectFormType {
  userId: string;
}

export const UserSelectModal = createModal<InnerProps>(({ actions, innerProps }) => {
  const t = useI18n();
  const { data: users, isPending } = clientApi.user.selectable.useQuery({
    excludeExternalProviders: innerProps.excludeExternalProviders,
  });
  const [loading, setLoading] = useState(false);
  const form = useForm<UserSelectFormType>();
  const handleSubmitAsync = async (values: UserSelectFormType) => {
    const currentUser = users?.find((user) => user.id === values.userId);
    if (!currentUser) return;
    setLoading(true);
    await innerProps.onSelect({
      id: currentUser.id,
      name: currentUser.name ?? "",
      image: currentUser.image ?? "",
      email: currentUser.email ?? null,
    });

    setLoading(false);
    actions.closeModal();
  };

  const confirmLabel = innerProps.confirmLabel ?? t("common.action.add");
  const currentUser = users?.find((user) => user.id === form.values.userId);

  return (
    <form onSubmit={form.onSubmit((values) => void handleSubmitAsync(values))}>
      <Stack>
        <Select
          {...form.getInputProps("userId")}
          label={t("user.action.select.label")}
          searchable
          clearable
          leftSection={
            isPending ? <Loader size="xs" /> : currentUser ? <UserAvatar user={currentUser} size="xs" /> : undefined
          }
          nothingFoundMessage={t("user.action.select.notFound")}
          renderOption={createRenderOption(users ?? [])}
          limit={5}
          data={users
            ?.filter((user) => !innerProps.presentUserIds.includes(user.id))
            .map((user) => ({ value: user.id, label: user.name ?? "" }))}
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
  defaultTitle: (t) => t("permission.userSelect.title"),
});

const iconProps = {
  stroke: 1.5,
  color: "currentColor",
  opacity: 0.6,
  size: "1rem",
};

const createRenderOption = (users: RouterOutputs["user"]["selectable"]): SelectProps["renderOption"] =>
  function InnerRenderRoot({ option, checked }) {
    const user = users.find((user) => user.id === option.value);
    if (!user) return null;

    return (
      <Group flex="1" gap="xs">
        <UserAvatar user={user} size="xs" />
        {option.label}
        {checked && <IconCheck style={{ marginInlineStart: "auto" }} {...iconProps} />}
      </Group>
    );
  };
