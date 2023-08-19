import { Button, Card, Stack, Title } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';

export const StepDockerImport = ({ next }: { next: () => void }) => {
  return (
    <Card>
      <Title order={2} align="center" mb="lg">
        Automatic container import
      </Title>

      <Stack align="center">
        <Button onClick={next} rightIcon={<IconArrowRight size="1rem" />}>
          Next
        </Button>
      </Stack>
    </Card>
  );
};
