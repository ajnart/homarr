import fs from 'fs';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React, { useEffect, useState } from 'react';

import {
  Alert,
  Anchor,
  AppShell,
  Badge,
  Box,
  Button,
  Container,
  createStyles,
  Group,
  Header,
  List,
  Loader,
  Paper,
  Progress,
  Space,
  Stack,
  Stepper,
  Switch,
  Text,
  ThemeIcon,
  Title,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconBrandDiscord,
  IconCheck,
  IconCircleCheck,
  IconMoonStars,
  IconSun,
} from '@tabler/icons';
import { motion } from 'framer-motion';
import { Logo } from '../components/layout/Logo';
import { usePrimaryGradient } from '../components/layout/useGradient';
import { backendMigrateConfig } from '../tools/config/backendMigrateConfig';
import axios from 'axios';

const useStyles = createStyles((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    backgroundColor: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).background,
  },

  label: {
    textAlign: 'center',
    color: theme.colors[theme.primaryColor][8],
    fontWeight: 900,
    fontSize: 110,
    lineHeight: 1,
    marginBottom: theme.spacing.xl * 1.5,

    [theme.fn.smallerThan('sm')]: {
      fontSize: 60,
    },
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    textAlign: 'center',
    fontWeight: 900,
    fontSize: 38,

    [theme.fn.smallerThan('sm')]: {
      fontSize: 32,
    },
  },

  card: {
    position: 'relative',
    overflow: 'visible',
    padding: theme.spacing.xl,
  },

  icon: {
    position: 'absolute',
    top: -ICON_SIZE / 3,
    left: `calc(50% - ${ICON_SIZE / 2}px)`,
  },

  description: {
    maxWidth: 700,
    margin: 'auto',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl * 1.5,
  },
}));

export default function ServerError({ configs }: { configs: any }) {
  const { classes } = useStyles();
  const [active, setActive] = React.useState(0);
  const gradient = usePrimaryGradient();
  const [progress, setProgress] = React.useState(0);
  const [isUpgrading, setIsUpgrading] = React.useState(false);
  const nextStep = () => setActive((current) => (current < 3 ? current + 1 : current));
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  return (
    <AppShell
      padding={0}
      header={
        <Header
          height={60}
          px="xs"
          styles={(theme) => ({
            main: {
              backgroundColor:
                theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
            },
          })}
        >
          <Group position="apart" align="start">
            <Box mt="xs">
              <Logo />
            </Box>
            <SwitchToggle />
          </Group>
          {/* Header content */}
        </Header>
      }
      styles={(theme) => ({
        main: {
          backgroundColor: theme.fn.variant({ variant: 'light', color: theme.primaryColor })
            .background,
        },
      })}
    >
      <div className={classes.root}>
        <Container>
          <Group noWrap>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              // Spring animation
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              style={{ cursor: 'pointer' }}
            >
              <Title variant="gradient" gradient={gradient} className={classes.label}>
                Homarr v0.11
              </Title>
            </motion.div>
          </Group>
          <Title mb="md" className={classes.title}>
            {active === 0 && "Good to see you back! Let's get started"}
            {active === 1 && progress !== 100 && 'Migrating your configs'}
            {active === 1 && progress === 100 && 'Migration complete!'}
          </Title>

          <Stepper active={active}>
            <Stepper.Step label="Step 1" description="Welcome back">
              <Text size="lg" align="center" className={classes.description}>
                <b>A few things have changed since the last time you used Homarr.</b> We&apos;ll
                help you migrate your old configuration to the new format. This process is automatic
                and should take less than a minute. Then, you&apos;ll be able to use the new
                features of Homarr!
              </Text>
              <Alert
                style={{ maxWidth: 700, margin: 'auto' }}
                icon={<IconAlertCircle size={16} />}
                title="Please make a backup of your configs!"
                color="red"
                radius="md"
                variant="outline"
              >
                Please make sure to have a backup of your configs in case something goes wrong.{' '}
                <b>Not all settings can be migrated</b>, so you&apos;ll have to re-do some
                configuration yourself.
              </Alert>
            </Stepper.Step>
            <Stepper.Step
              loading={progress < 100 && active === 1}
              icon={progress === 100 && <IconCheck />}
              label="Step 2"
              description="Migrating your configs"
            >
              <StatsCard configs={configs} progress={progress} setProgress={setProgress} />
            </Stepper.Step>
            <Stepper.Step label="Step 3" description="New features">
              <Text size="lg" align="center" className={classes.description}>
                <b>Homarr v0.11</b> brings a lot of new features, if you are interested in learning
                about them, please check out the{' '}
                <Anchor target="_blank" href="https://homarr.dev/">
                  documentation page
                </Anchor>
              </Text>
            </Stepper.Step>
            <Stepper.Completed>
              <Text size="lg" align="center" className={classes.description}>
                That&apos;s it ! We hope you enjoy the new flexibility v0.11 brings. If you spot any
                bugs make sure to report them as a{' '}
                <Anchor
                  target="_blank"
                  href="
                    https://github.com/ajnart/homarr/issues/new?assignees=&labels=%F0%9F%90%9B+Bug&template=bug.yml&title=New%20bug"
                >
                  <b>github issue</b>
                </Anchor>{' '}
                or directly on the
                <Anchor target="_blank" href="https://discord.gg/aCsmEV5RgA">
                  <b>
                    <IconBrandDiscord size={20} />
                    discord !
                  </b>
                </Anchor>
              </Text>
            </Stepper.Completed>
          </Stepper>
          <Group position="center" mt="xl">
            <Button
              leftIcon={active === 3 && <IconCheck size={20} stroke={1.5} />}
              onClick={active === 3 ? () => window.location.reload() : nextStep}
              variant="filled"
              disabled={active === 1 && progress < 100}
            >
              {active === 3 ? 'Finish' : 'Next'}
            </Button>
          </Group>
        </Container>
      </div>
    </AppShell>
  );
}

function SwitchToggle() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();

  return (
    <Switch
      checked={colorScheme === 'dark'}
      onChange={() => toggleColorScheme()}
      size="lg"
      onLabel={<IconSun color={theme.white} size={20} stroke={1.5} />}
      offLabel={<IconMoonStars color={theme.colors.gray[6]} size={20} stroke={1.5} />}
    />
  );
}

export async function getServerSideProps({ req, res, locale }: GetServerSidePropsContext) {
  // Get all the configs in the /data/configs folder
  // All the files that end in ".json"
  const configs = fs.readdirSync('./data/configs').filter((file) => file.endsWith('.json'));

  if (configs.length === 0) {
    res.writeHead(302, {
      Location: '/',
    });
    res.end();
    return { props: {} };
  }
  // If all the configs are migrated (contains a schemaVersion), redirect to the index
  if (
    configs.every(
      (config) => JSON.parse(fs.readFileSync(`./data/configs/${config}`, 'utf8')).schemaVersion
    )
  ) {
    res.writeHead(302, {
      Location: '/',
    });
    res.end();
    return {
      processed: true,
    };
  }
  return {
    props: {
      configs: configs.map(
        // Get all the file names in ./data/configs
        (config) => config.replace('.json', '')
      ),
      ...(await serverSideTranslations(locale!, [])),
      // Will be passed to the page component as props
    },
  };
}

const ICON_SIZE = 60;

export function StatsCard({
  configs,
  progress,
  setProgress,
}: {
  configs: string[];
  progress: number;
  setProgress: (progress: number) => void;
}) {
  const { classes } = useStyles();
  const numberOfConfigs = configs.length;
  // Update the progress every 100ms
  const [treatedConfigs, setTreatedConfigs] = useState<string[]>([]);
  // Stop the progress at 100%
  useEffect(() => {
    const data = axios.post('/api/migrate').then((response) => {
      setProgress(100);
    });

    const interval = setInterval(() => {
      if (configs.length === 0) {
        clearInterval(interval);
        setProgress(100);
        return;
      }
      // Add last element of configs to the treatedConfigs array
      setTreatedConfigs((treatedConfigs) => [...treatedConfigs, configs[configs.length - 1]]);
      // Remove last element of configs
      configs.pop();
    }, 500);
    return () => clearInterval(interval);
  }, [configs]);

  return (
    <Paper radius="md" className={classes.card} mt={ICON_SIZE / 3}>
      <Group position="apart">
        <Text size="sm" color="dimmed">
          Progress
        </Text>
        <Text size="sm" color="dimmed">
          {(100 / (numberOfConfigs + 1)).toFixed(1)}%
        </Text>
      </Group>
      <Stack>
        <Progress animate={progress < 100} value={100 / (numberOfConfigs + 1)} mt={5} />
        <List
          spacing="xs"
          size="sm"
          center
          icon={
            <ThemeIcon color="teal" size={24} radius="xl">
              <IconCircleCheck size={16} />
            </ThemeIcon>
          }
        >
          {configs.map((config, index) => (
            <List.Item key={index + 10} icon={<Loader size={24} color="orange" />}>
              {config ?? 'Unknown'}
            </List.Item>
          ))}
          {treatedConfigs.map((config, index) => (
            <List.Item key={index}>{config ?? 'Unknown'}</List.Item>
          ))}
        </List>
      </Stack>

      <Group position="apart" mt="md">
        <Space />
        <Badge size="sm">{configs.length} configs left</Badge>
      </Group>
    </Paper>
  );
}
