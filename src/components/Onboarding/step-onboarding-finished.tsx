import { Box, Card, NavLink, Stack, Text, Title, createStyles } from '@mantine/core';
import {
  IconChevronRight,
  IconDashboard,
  IconFileText,
  IconManualGearbox,
} from '@tabler/icons-react';
import Image from 'next/image';

export const StepOnboardingFinished = () => {
  const { classes } = useStyles();
  return (
    <Card>
      <Stack align="center">
        <Image src="/imgs/logo/logo.svg" alt="" width={50} height={50} />
        <Title order={2} align="center">
          Congratulations, you've set Homarr up!
        </Title>
        <Text>Awesome! What do you want to do next?</Text>

        <Stack>
          <NavLink
            rightSection={<IconChevronRight size="0.8rem" stroke={1.5} />}
            className={classes.link}
            icon={<IconDashboard />}
            label="Go to your board"
            variant="light"
            active
          />
          <NavLink
            rightSection={<IconChevronRight size="0.8rem" stroke={1.5} />}
            className={classes.link}
            icon={<IconManualGearbox />}
            label="Go to the management dashboard"
            variant="light"
            active
          />
          <NavLink
            rightSection={<IconChevronRight size="0.8rem" stroke={1.5} />}
            className={classes.link}
            icon={<IconFileText />}
            label="Check out the documentation"
            variant="light"
            active
          />
        </Stack>
      </Stack>
    </Card>
  );
};

const useStyles = createStyles((theme) => ({
  link: {
    borderRadius: '0.4rem',
  },
}));
