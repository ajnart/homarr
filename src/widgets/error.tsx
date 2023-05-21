import { useState } from 'react';
import { Button, Code, Stack, Text, Title } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { queryClient } from '../tools/server/configurations/tanstack/queryClient.tool';

interface GenericWidgetErrorProps {
  queryKeys: string[];
  error?: unknown | string[];
}

export const GenericWidgetError = ({ queryKeys, error }: GenericWidgetErrorProps) => {
  const { t } = useTranslation('widgets/error');
  const [isInvalidating, setIsInvalidating] = useState(false);
  const invalidateAllKeys = async () => {
    setIsInvalidating(true);
    const promises = queryKeys.map((key) =>
      queryClient.invalidateQueries({
        queryKey: [key],
      })
    );

    await Promise.all(promises);
    setIsInvalidating(false);
  };
  return (
    <Stack align="center">
      <IconAlertTriangle />
      <Stack spacing={0} align="center">
        <Title order={4}>{t('title')}</Title>
        <Text mb="sm">{t('text')}</Text>
        {error && <ErrorDisplay error={error} />}
      </Stack>
      <Button onClick={invalidateAllKeys} loading={isInvalidating} variant="light" fullWidth>
        {t('retry')}
      </Button>
    </Stack>
  );
};

const ErrorDisplay = ({ error }: { error: any }) => {
  if (Array.isArray(error)) {
    return (
      <Code w="100%" block>
        {error.join('\n')}
      </Code>
    );
  }

  return (
    <Code w="100%" block>
      {error}
    </Code>
  );
};
