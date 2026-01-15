import { Anchor, Button, Stack, Text } from "@mantine/core";

import type { stringOrTranslation } from "@homarr/translation";
import { translateIfNecessary } from "@homarr/translation";
import { useI18n } from "@homarr/translation/client";
import { Link } from "@homarr/ui";
import type { TablerIcon } from "@homarr/ui";

export interface BaseWidgetErrorProps {
  icon: TablerIcon;
  message: stringOrTranslation;
  showLogsLink?: boolean;
  onRetry: () => void;
}

export const BaseWidgetError = (props: BaseWidgetErrorProps) => {
  const t = useI18n();

  return (
    <Stack h="100%" align="center" justify="center" gap="md">
      <props.icon size={40} />
      <Stack gap={0}>
        <Text ta="center">{translateIfNecessary(t, props.message)}</Text>
        {props.showLogsLink && (
          <Anchor component={Link} href="/manage/tools/logs" target="_blank" ta="center" size="sm">
            {t("common.action.checkLogs")}
          </Anchor>
        )}
      </Stack>

      <Button onClick={props.onRetry} size="sm" variant="light">
        {t("common.action.tryAgain")}
      </Button>
    </Stack>
  );
};
