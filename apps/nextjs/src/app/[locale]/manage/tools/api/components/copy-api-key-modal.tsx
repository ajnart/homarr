import { Button, CopyButton, PasswordInput, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { createModal } from "@homarr/modals";
import { useScopedI18n } from "@homarr/translation/client";

export const CopyApiKeyModal = createModal<{ apiKey: string }>(({ actions, innerProps }) => {
  const t = useScopedI18n("management.page.tool.api.modal.createApiToken");
  const [visible, { toggle }] = useDisclosure(false);
  return (
    <Stack>
      <Text>{t("description")}</Text>
      <PasswordInput value={innerProps.apiKey} visible={visible} onVisibilityChange={toggle} readOnly />
      <CopyButton value={innerProps.apiKey}>
        {({ copy }) => (
          <Button
            onClick={() => {
              copy();
              actions.closeModal();
            }}
            variant="default"
            fullWidth
          >
            {t("button")}
          </Button>
        )}
      </CopyButton>
    </Stack>
  );
}).withOptions({
  defaultTitle(t) {
    return t("management.page.tool.api.modal.createApiToken.title");
  },
});
