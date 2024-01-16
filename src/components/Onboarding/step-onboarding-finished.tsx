import { Divider, NavLink, Stack, Text, Title, createStyles } from '@mantine/core';
import {
  IconChevronRight,
  IconDashboard,
  IconExternalLink,
  IconFileText,
  IconManualGearbox,
} from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';

import { OnboardingStepWrapper } from './common-wrapper';

export const StepOnboardingFinished = () => {
  const { classes } = useStyles();
  return (
    <OnboardingStepWrapper>
      <Stack align="center">
        <Image src="/imgs/logo/logo.svg" alt="" width={50} height={50} />
        <Title order={2} align="center">
          Congratulations, you've set Homarr up!
        </Title>
        <Text>Awesome! What do you want to do next?</Text>

        <Stack>
          <Text>
            We <b>highly recommend you</b> to take a look at the documentation before starting to
            use Homarr if you've never used it before.
          </Text>
          <NavLink
            component={Link}
            href="https://homarr.dev/docs/getting-started/after-the-installation"
            target="_blank"
            rightSection={<IconExternalLink size="0.8rem" stroke={1.5} />}
            className={classes.link}
            icon={<IconFileText />}
            label="Check out the documentation"
            variant="light"
            active
          />
          <Divider />
          <NavLink
            component={Link}
            href="/b"
            rightSection={<IconChevronRight size="0.8rem" stroke={1.5} />}
            className={classes.link}
            icon={<IconDashboard />}
            label="Go to your board"
            variant="light"
            active
          />
          <NavLink
            component={Link}
            href="/manage"
            rightSection={<IconChevronRight size="0.8rem" stroke={1.5} />}
            className={classes.link}
            icon={<IconManualGearbox />}
            label="Go to the management dashboard"
            variant="light"
            active
          />
        </Stack>
      </Stack>
    </OnboardingStepWrapper>
  );
};

const useStyles = createStyles((theme) => ({
  link: {
    borderRadius: '0.4rem',
  },
}));
