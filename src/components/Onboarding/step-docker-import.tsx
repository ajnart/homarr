import { Button, Stack, Title } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';

import { OnboardingStepWrapper } from './common-wrapper';

export const StepDockerImport = ({ next }: { next: () => void }) => {
  return (
    <OnboardingStepWrapper>
      <Title order={2} align="center" mb="lg">
        Automatic container import
      </Title>

      <Stack align="center">
        <Button onClick={next} rightIcon={<IconArrowRight size="1rem" />} fullWidth>
          Next
        </Button>
      </Stack>
    </OnboardingStepWrapper>
  );
};
