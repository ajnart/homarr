import {
  ActionIcon,
  Button,
  Card,
  createStyles,
  Flex,
  Grid,
  Group,
  Stack,
  TextInput,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconDeviceFloppy, TablerIcon } from '@tabler/icons';
import { useState } from 'react';

interface GenericSecretInputProps {
  label: string;
  value: string;
  setIcon: TablerIcon;
  onClickUpdateButton: (value: string | undefined) => void;
}

export const GenericSecretInput = ({
  label,
  value,
  setIcon,
  onClickUpdateButton,
}: GenericSecretInputProps) => {
  const { classes } = useStyles();

  const Icon = setIcon;

  const [fieldValue, setFieldValue] = useState<string>(value);

  return (
    <Card withBorder>
      <Grid>
        <Grid.Col className={classes.alignSelfCenter} xs={12} md={6}>
          <Group spacing="sm">
            <ThemeIcon color="green" variant="light">
              <Icon size={18} />
            </ThemeIcon>
            <Stack spacing={0}>
              <Title className={classes.subtitle} order={6}>
                {label}
              </Title>
            </Stack>
          </Group>
        </Grid.Col>
        <Grid.Col xs={12} md={6}>
          <Flex gap={10} justify="end" align="end">
            <Button
              onClick={() => {
                setFieldValue('');
                onClickUpdateButton(undefined);
              }}
              variant="subtle"
              color="gray"
              px="xl"
            >
              Clear Secret
            </Button>
            <TextInput
              onChange={(event) => setFieldValue(event.currentTarget.value)}
              rightSection={
                <Tooltip label="Update this secret" withinPortal>
                  <ActionIcon onClick={() => onClickUpdateButton(fieldValue)}>
                    <IconDeviceFloppy width={20} strokeWidth={1.2} />
                  </ActionIcon>
                </Tooltip>
              }
              value={fieldValue}
              type="password"
              placeholder="no value is set"
              withAsterisk
            />
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
