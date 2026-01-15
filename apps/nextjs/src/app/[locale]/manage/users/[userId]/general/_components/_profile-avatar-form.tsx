"use client";

import { useCallback } from "react";
import { Box, Button, FileButton, Menu, UnstyledButton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPencil, IconPhotoEdit, IconPhotoX } from "@tabler/icons-react";

import type { RouterOutputs } from "@homarr/api";
import { clientApi } from "@homarr/api/client";
import { revalidatePathActionAsync } from "@homarr/common/client";
import { useConfirmModal } from "@homarr/modals";
import { showErrorNotification, showSuccessNotification } from "@homarr/notifications";
import { useI18n, useScopedI18n } from "@homarr/translation/client";
import { UserAvatar } from "@homarr/ui";

interface UserProfileAvatarForm {
  user: RouterOutputs["user"]["getById"];
}

export const UserProfileAvatarForm = ({ user }: UserProfileAvatarForm) => {
  const { mutate } = clientApi.user.setProfileImage.useMutation({
    async onSuccess() {
      // Revalidate all as the avatar is used in multiple places
      await revalidatePathActionAsync("/");
    },
  });
  const [opened, { toggle }] = useDisclosure(false);
  const { openConfirmModal } = useConfirmModal();
  const t = useI18n();
  const tManageAvatar = useScopedI18n("user.action.manageAvatar");

  const handleAvatarChange = useCallback(
    async (file: File | null) => {
      if (!file) {
        return;
      }

      const base64Url = await fileToBase64Async(file);

      mutate(
        {
          userId: user.id,
          image: base64Url,
        },
        {
          onSuccess() {
            showSuccessNotification({
              message: tManageAvatar("changeImage.notification.success.message"),
            });
          },
          onError(error) {
            if (error.shape?.data.code === "BAD_REQUEST") {
              showErrorNotification({
                title: tManageAvatar("changeImage.notification.toLarge.title"),
                message: tManageAvatar("changeImage.notification.toLarge.message", { size: "256KB" }),
              });
            } else {
              showErrorNotification({
                message: tManageAvatar("changeImage.notification.error.message"),
              });
            }
          },
        },
      );
    },
    [mutate, user.id, tManageAvatar],
  );

  const handleRemoveAvatar = useCallback(() => {
    openConfirmModal({
      title: tManageAvatar("removeImage.label"),
      children: tManageAvatar("removeImage.confirm"),
      onConfirm() {
        mutate(
          {
            userId: user.id,
            image: null,
          },
          {
            onSuccess() {
              showSuccessNotification({
                message: tManageAvatar("removeImage.notification.success.message"),
              });
            },
            onError() {
              showErrorNotification({
                message: tManageAvatar("removeImage.notification.error.message"),
              });
            },
          },
        );
      },
    });
  }, [mutate, user.id, openConfirmModal, tManageAvatar]);

  return (
    <Box pos="relative">
      <Menu opened={opened} keepMounted onChange={toggle} position="bottom-start" withArrow>
        <Menu.Target>
          <UnstyledButton onClick={toggle}>
            <UserAvatar user={user} size={200} />
            <Button
              component="div"
              pos="absolute"
              bottom={0}
              left={0}
              size="compact-md"
              fw="normal"
              variant="default"
              leftSection={<IconPencil size={18} stroke={1.5} />}
            >
              {t("common.action.edit")}
            </Button>
          </UnstyledButton>
        </Menu.Target>
        <Menu.Dropdown>
          <FileButton onChange={handleAvatarChange} accept="image/png,image/jpeg,image/webp,image/gif">
            {(props) => (
              <Menu.Item {...props} leftSection={<IconPhotoEdit size={16} stroke={1.5} />}>
                {tManageAvatar("changeImage.label")}
              </Menu.Item>
            )}
          </FileButton>
          {user.image && (
            <Menu.Item onClick={handleRemoveAvatar} leftSection={<IconPhotoX size={16} stroke={1.5} />}>
              {tManageAvatar("removeImage.label")}
            </Menu.Item>
          )}
        </Menu.Dropdown>
      </Menu>
    </Box>
  );
};

const fileToBase64Async = async (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    // The functionality below works as expected and doesn't result in [object Object].
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    reader.onload = () => resolve(reader.result?.toString() ?? "");
    reader.onerror = reject;
  });
