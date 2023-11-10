import { Card } from '@mantine/core';
import { ReactNode } from 'react';

export const OnboardingStepWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <Card shadow="lg" maw={800} w="100%" mx="auto" display="block" withBorder>
      {children}
    </Card>
  );
};
