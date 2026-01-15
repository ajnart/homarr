import type { JSX } from "react";
import { Box, Center, Stack, Text, Title } from "@mantine/core";

import { api } from "@homarr/api/server";
import type { MaybePromise } from "@homarr/common/types";
import type { OnboardingStep } from "@homarr/definitions";
import { getScopedI18n } from "@homarr/translation/server";

import { CurrentColorSchemeCombobox } from "~/components/color-scheme/current-color-scheme-combobox";
import { CurrentLanguageCombobox } from "~/components/language/current-language-combobox";
import { HomarrLogoWithTitle } from "~/components/layout/logo/homarr-logo";
import { BackToStart } from "./_steps/back";
import { InitFinish } from "./_steps/finish/init-finish";
import { InitGroup } from "./_steps/group/init-group";
import { InitImport } from "./_steps/import/init-import";
import { InitSettings } from "./_steps/settings/init-settings";
import { InitStart } from "./_steps/start/init-start";
import { InitUser } from "./_steps/user/init-user";

const stepComponents: Record<OnboardingStep, null | (() => MaybePromise<JSX.Element>)> = {
  start: InitStart,
  import: InitImport,
  user: InitUser,
  group: InitGroup,
  settings: InitSettings,
  finish: InitFinish,
};

export default async function InitPage() {
  const t = await getScopedI18n("init.step");
  const currentStep = await api.onboard.currentStep();

  const CurrentComponent = stepComponents[currentStep.current];

  return (
    <Box mih="100dvh">
      <Center>
        <Stack align="center" mt="xl">
          <HomarrLogoWithTitle size="lg" />
          <Stack gap={6} align="center">
            <Title order={3} fw={400} ta="center">
              {t(`${currentStep.current}.title`)}
            </Title>
            <Text size="sm" c="gray.5" ta="center">
              {t(`${currentStep.current}.subtitle`)}
            </Text>
          </Stack>
          <CurrentLanguageCombobox width="100%" />
          <CurrentColorSchemeCombobox w="100%" />
          {CurrentComponent && <CurrentComponent />}
          {currentStep.previous === "start" && <BackToStart />}
        </Stack>
      </Center>
    </Box>
  );
}
