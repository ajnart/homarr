import { Button, Card, Group } from "@mantine/core";
import { IconArrowBackUp, IconArrowLeft, IconArrowRight, IconRotate } from "@tabler/icons-react";

import { useI18n } from "@homarr/translation/client";
import { Link } from "@homarr/ui";

interface StepperNavigationComponentProps {
  hasPrevious: boolean;
  hasNext: boolean;
  isComplete: boolean;
  isLoadingNextStep: boolean;
  prevStep: () => void;
  nextStep: () => void;
  reset: () => void;
}

export const StepperNavigationComponent = ({
  hasNext,
  hasPrevious,
  isComplete,
  isLoadingNextStep,
  nextStep,
  prevStep,
  reset,
}: StepperNavigationComponentProps) => {
  const t = useI18n();
  return (
    <Card shadow="md" withBorder>
      {!isComplete ? (
        <Group justify="space-between" wrap="nowrap">
          <Button
            leftSection={<IconArrowLeft size="1rem" />}
            disabled={!hasPrevious || isLoadingNextStep}
            onClick={prevStep}
          >
            {t("common.action.previous")}
          </Button>
          <Button
            rightSection={<IconArrowRight size="1rem" />}
            disabled={!hasNext || isLoadingNextStep}
            loading={isLoadingNextStep}
            onClick={nextStep}
          >
            {t("common.action.next")}
          </Button>
        </Group>
      ) : (
        <Group justify="end" wrap="nowrap">
          <Button variant="light" leftSection={<IconRotate size="1rem" />} onClick={reset}>
            {t("management.page.user.create.action.createAnother")}
          </Button>
          <Button leftSection={<IconArrowBackUp size="1rem" />} component={Link} href="/manage/users">
            {t("management.page.user.create.action.back")}
          </Button>
        </Group>
      )}
    </Card>
  );
};
