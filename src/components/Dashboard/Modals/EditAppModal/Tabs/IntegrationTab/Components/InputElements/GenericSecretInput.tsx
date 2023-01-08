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
  Text,
  Badge,
  Tooltip,
} from '@mantine/core';
import { TablerIcon } from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { AppIntegrationPropertyAccessabilityType } from '../../../../../../../../types/app';

interface GenericSecretInputProps {
  label: string;
  value: string;
  setIcon: TablerIcon;
  secretIsPresent: boolean;
  type: AppIntegrationPropertyAccessabilityType;
  onClickUpdateButton: (value: string | undefined) => void;
}

export const GenericSecretInput = ({
  label,
  value,
  setIcon,
  secretIsPresent,
  type,
  onClickUpdateButton,
  ...props
}: GenericSecretInputProps) => {
  const { classes } = useStyles();

  const Icon = setIcon;

  const [displayUpdateField, setDisplayUpdateField] = useState<boolean>(false);
  const { t } = useTranslation(['layout/modals/add-app', 'common']);

  return (
    <Card p="xs" withBorder>
      <Grid>
        <Grid.Col className={classes.alignSelfCenter} xs={12} md={6}>
          <Group spacing="sm" noWrap>
            <ThemeIcon color={secretIsPresent ? 'green' : 'red'} variant="light" size="lg">
              <Icon size={18} />
            </ThemeIcon>
            <Stack spacing={0}>
              <Group spacing="xs">
                <Title className={classes.subtitle} order={6}>
                  {t(label)}
                </Title>

                <Group spacing="xs">
                  {secretIsPresent ? (
                    <Badge className={classes.textTransformUnset} color="green" variant="dot">
                      {t('integration.type.defined')}
                    </Badge>
                  ) : (
                    <Badge className={classes.textTransformUnset} color="red" variant="dot">
                      {t('integration.type.undefined')}
                    </Badge>
                  )}
                  {type === 'private' ? (
                    <Tooltip
                      label={t('integration.type.explanationPrivate')}
                      width={200}
                      multiline
                      withinPortal
                      withArrow
                    >
                      <Badge className={classes.textTransformUnset} color="orange" variant="dot">
                        {t('integration.type.private')}
                      </Badge>
                    </Tooltip>
                  ) : (
                    <Tooltip
                      label={t('integration.type.explanationPublic')}
                      width={200}
                      multiline
                      withinPortal
                      withArrow
                    >
                      <Badge className={classes.textTransformUnset} color="red" variant="dot">
                        {t('integration.type.public')}
                      </Badge>
                    </Tooltip>
                  )}
                </Group>
              </Group>
              <Text size="xs" color="dimmed">
                {type === 'private'
                  ? 'Private: Once saved, you cannot read out this value again'
                  : 'Public: Can be read out repeatedly'}
              </Text>
            </Stack>
          </Group>
        </Grid.Col>
        <Grid.Col xs={12} md={6}>
          <Flex gap={10} justify="end" align="end">
            <Button variant="subtle" color="gray" px="xl">
              {t('integration.secrets.clear')}
            </Button>
            {displayUpdateField === true ? (
              <PasswordInput
                placeholder="new secret"
                styles={{ root: { width: 200 } }}
                {...props}
              />
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
  textTransformUnset: {
    textTransform: 'inherit',
  },
}));
