import { Box, Text } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { minPasswordLength } from '~/validations/user';

export const PasswordRequirement = ({ meets, label }: { meets: boolean; label: string }) => {
  const { t } = useTranslation('password-requirements');

  return (
    <Text
      color={meets ? 'teal' : 'red'}
      sx={{ display: 'flex', alignItems: 'center' }}
      mt={7}
      size="sm"
    >
      {meets ? <IconCheck size="0.9rem" /> : <IconX size="0.9rem" />}
      <Box ml={10}>
        {t(`${label}`, {
          count: minPasswordLength,
        })}
      </Box>
    </Text>
  );
};
