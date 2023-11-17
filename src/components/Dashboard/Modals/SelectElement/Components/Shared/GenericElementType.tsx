import { Button, Card, Center, Grid, Stack, Text } from '@mantine/core';
import { Icon } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';

import { useStyles } from './styles';

interface GenericAvailableElementTypeProps {
  name: string;
  id: string;
  handleAddition: () => Promise<void>;
  description?: string;
  image: string | Icon;
  disabled?: boolean;
}

export const GenericAvailableElementType = ({
  name,
  id,
  description,
  image,
  disabled,
  handleAddition,
}: GenericAvailableElementTypeProps) => {
  const { classes } = useStyles();
  const { t } = useTranslation('layout/modals/about');

  const Icon =
    typeof image === 'string'
      ? () => <Image alt={name} src={image} width={24} height={24} />
      : image;

  return (
    <Grid.Col xs={12} sm={4} md={3}>
      <Card style={{ height: '100%' }}>
        <Stack justify="space-between" style={{ height: '100%' }}>
          <Stack gap="xs">
            <Center>
              <Icon />
            </Center>
            <Text className={classes.elementText} align="center">
              {name}
            </Text>
            {description && (
              <Text className={classes.elementText} size="xs" align="center" c="dimmed">
                {description}
              </Text>
            )}
          </Stack>
          <Button
            disabled={disabled}
            onClick={handleAddition}
            variant="light"
            size="xs"
            mt="auto"
            radius="md"
            fullWidth
          >
            {t('addToDashboard')}
          </Button>
        </Stack>
      </Card>
    </Grid.Col>
  );
};
