import {
  Badge,
  Button,
  Card,
  Flex,
  Grid,
  Group,
  PasswordInput,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
  createStyles,
} from '@mantine/core';
import { Icon } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { AppIntegrationPropertyAccessabilityType } from '~/types/app';

interface GenericSecretInputProps {
  label: string;
  value: string;
  setIcon: Icon;
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

  const [displayUpdateField, setDisplayUpdateField] = useState<boolean>(!secretIsPresent);
  const { t } = useTranslation(['layout/modals/add-app', 'common']);

  return (
    <Card p="xs" withBorder>
      <Grid>
        <Grid.Col className={classes.alignSelfCenter} xs={12} md={6}>
          <Group spacing="sm" noWrap>
            <ThemeIcon color={secretIsPresent ? 'green' : 'red'} variant="light" size="lg">
              <Icon size={18} />
            </ThemeIcon>
            <Flex justify="start" align="start" direction="column">
              <Group spacing="xs">
                <Title className={classes.subtitle} order={6}>
                  {t(label)}
                </Title>

                <Group spacing="xs">
                  <Badge
                    className={classes.textTransformUnset}
                    color={secretIsPresent ? 'green' : 'red'}
                    variant="dot"
                  >
                    {secretIsPresent
                      ? t('integration.type.defined')
                      : t('integration.type.undefined')}
                  </Badge>
                  {type === 'private' ? (
                    <Tooltip
                      label={t('integration.type.explanationPrivate')}
                      width={400}
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
                      width={400}
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
              <Text size="xs" color="dimmed" w={400}>
                {type === 'private'
                  ? 'Private: Once saved, you cannot read out this value again'
                  : 'Public: Can be read out repeatedly'}
              </Text>
            </Flex>
          </Group>
        </Grid.Col>
        <Grid.Col xs={12} md={6}>
          <Flex gap={10} justify="end" align="end">
            {displayUpdateField === true ? (
              <PasswordInput
                required
                defaultValue={value}
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
