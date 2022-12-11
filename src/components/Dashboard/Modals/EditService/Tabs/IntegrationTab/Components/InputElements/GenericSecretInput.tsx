import {
  ActionIcon,
  Button,
  Card,
  createStyles,
  Flex,
  Grid,
  Group,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { IconDeviceFloppy, TablerIcon } from '@tabler/icons';
import { ReactNode, useState } from 'react';

interface GenericSecretInputProps {
  label: string;
  value: string;
  secretIsPresent: boolean;
  unsetIcon: TablerIcon;
  setIcon: TablerIcon;
}

export const GenericSecretInput = ({
  label,
  value,
  secretIsPresent,
  setIcon,
  unsetIcon,
}: GenericSecretInputProps) => {
  const { classes } = useStyles();
  const [dirty, setDirty] = useState(false);

  const IconComponent = secretIsPresent ? setIcon : unsetIcon;

  return (
    <Card withBorder>
      <Grid>
        <Grid.Col className={classes.alignSelfCenter} xs={12} md={6}>
          <Group spacing="sm">
            <ThemeIcon color={secretIsPresent ? 'green' : 'red'} variant="light">
              <IconComponent size={16} />
            </ThemeIcon>
            <Stack spacing={0}>
              <Title className={classes.subtitle} order={6}>
                {label}
              </Title>
              <Text size="xs" color="dimmed">
                {secretIsPresent
                  ? 'Secret is defined in the configuration'
                  : 'Secret has not been defined'}
              </Text>
            </Stack>
          </Group>
        </Grid.Col>
        <Grid.Col xs={12} md={6}>
          <Flex gap={10} justify="end" align="end">
            {secretIsPresent ? (
              <>
                <Button variant="subtle" color="gray" px="xl">
                  Clear Secret
                </Button>
                <TextInput
                  type="password"
                  placeholder="Leave empty"
                  description={`Update secret${dirty ? ' (unsaved)' : ''}`}
                  rightSection={
                    <ActionIcon disabled={!dirty}>
                      <IconDeviceFloppy size={18} />
                    </ActionIcon>
                  }
                  defaultValue={value}
                  onChange={() => setDirty(true)}
                  withAsterisk
                />
              </>
            ) : (
              <Button variant="light" px="xl">
                Define secret
              </Button>
            )}
          </Flex>
        </Grid.Col>
      </Grid>
    </Card>
  );
};

const useStyles = createStyles(() => ({
  subtitle: {
    lineHeight: 1.1,
  },
  alignSelfCenter: {
    alignSelf: 'center',
  },
}));
