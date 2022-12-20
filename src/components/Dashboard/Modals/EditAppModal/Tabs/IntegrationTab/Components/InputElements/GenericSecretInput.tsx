import {
  Button,
  Card,
  createStyles,
  Flex,
  Grid,
  Group,
  PasswordInput,
  Stack,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { TablerIcon } from '@tabler/icons';
import { useTranslation } from 'next-i18next';
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
  ...props
}: GenericSecretInputProps) => {
  const { classes } = useStyles();

  const Icon = setIcon;

  const [displayUpdateField, setDisplayUpdateField] = useState<boolean>(false);
  const { t } = useTranslation(['layout/modals/add-app', 'common']);

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
                {t(label)}
              </Title>
            </Stack>
          </Group>
        </Grid.Col>
        <Grid.Col xs={12} md={6}>
          <Flex gap={10} justify="end" align="end">
            <Button variant="subtle" color="gray" px="xl">
              {t('integration.secrets.clear')}
            </Button>
            {displayUpdateField === true ? (
              <PasswordInput placeholder="new secret" width={200} {...props} />
            ) : (
              <Button onClick={() => setDisplayUpdateField(true)} variant="light">
                {t('integration.secrets.update')}
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
