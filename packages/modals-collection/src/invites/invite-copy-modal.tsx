import { usePathname } from "next/navigation";
import { Button, CopyButton, Mark, Stack, Text } from "@mantine/core";

import type { RouterOutputs } from "@homarr/api";
import { createModal } from "@homarr/modals";
import { useScopedI18n } from "@homarr/translation/client";
import { Link } from "@homarr/ui";

export const InviteCopyModal = createModal<RouterOutputs["invite"]["createInvite"]>(({ actions, innerProps }) => {
  const t = useScopedI18n("management.page.user.invite");
  const inviteUrl = useInviteUrl(innerProps);

  return (
    <Stack>
      <Text>
        {t.rich("action.copy.description", {
          b: (children) => <b>{children}</b>,
        })}
      </Text>
      <Link href={createPath(innerProps)}>{t("action.copy.link")}</Link>
      <Stack gap="xs">
        <Text fw="bold">{t("field.id.label")}:</Text>
        <Mark style={{ borderRadius: 4 }} color="gray" px={5}>
          {innerProps.id}
        </Mark>

        <Text fw="bold">{t("field.token.label")}:</Text>
        <Mark style={{ borderRadius: 4 }} color="gray" px={5}>
          {innerProps.token}
        </Mark>
      </Stack>
      <CopyButton value={inviteUrl}>
        {({ copy }) => (
          <Button
            onClick={() => {
              copy();
              actions.closeModal();
            }}
            variant="default"
            fullWidth
          >
            {t("action.copy.button")}
          </Button>
        )}
      </CopyButton>
    </Stack>
  );
}).withOptions({
  defaultTitle(t) {
    return t("management.page.user.invite.action.copy.title");
  },
});

const createPath = ({ id, token }: RouterOutputs["invite"]["createInvite"]) => `/auth/invite/${id}?token=${token}`;

const useInviteUrl = ({ id, token }: RouterOutputs["invite"]["createInvite"]) => {
  const pathname = usePathname();

  return window.location.href.replace(pathname, createPath({ id, token }));
};
