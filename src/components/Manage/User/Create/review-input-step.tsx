import { Alert, Button, Card, Group, Table, Text, Title } from '@mantine/core';
import {
	IconAlertTriangleFilled,
	IconArrowLeft,
	IconCheck,
	IconInfoCircle,
	IconKey,
	IconMail,
	IconUser
} from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { CreateAccountSchema } from '~/pages/manage/users/create';
import { api } from '~/utils/api';

type ReviewInputStepProps = {
  values: CreateAccountSchema;
  prevStep: () => void;
  nextStep: () => void;
};

export const ReviewInputStep = ({ values, prevStep, nextStep }: ReviewInputStepProps) => {
  const { t } = useTranslation('manage/users/create');

  const utils = api.useContext();
  const {
    mutateAsync: createAsync,
    isLoading,
    isError,
    error,
  } = api.user.create.useMutation({
    onSettled: () => {
      void utils.user.all.invalidate();
    },
    onSuccess: () => {
      nextStep();
    },
  });

  return (
    <Card mih={400}>
      <Title order={5}>{t('steps.finish.card.title')}</Title>
      <Text mb="xl">{t('steps.finish.card.text')}</Text>

      <Table mb="lg" withBorder highlightOnHover>
        <thead>
          <tr>
            <th>{t('steps.finish.table.header.property')}</th>
            <th>{t('steps.finish.table.header.value')}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <Group gap="xs">
                <IconUser size="1rem" />
                <Text>{t('steps.finish.table.header.username')}</Text>
              </Group>
            </td>
            <td>{values.account.username}</td>
          </tr>
          <tr>
            <td>
              <Group gap="xs">
                <IconMail size="1rem" />
                <Text>{t('steps.finish.table.header.email')}</Text>
              </Group>
            </td>
            <td>
              {values.account.eMail ? (
                <Text>{values.account.eMail}</Text>
              ) : (
                <Group gap="xs">
                  <IconInfoCircle size="1rem" color="orange" />
                  <Text c="orange">{t('steps.finish.table.notSet')}</Text>
                </Group>
              )}
            </td>
          </tr>
          <tr>
            <td>
              <Group gap="xs">
                <IconKey size="1rem" />
                <Text>{t('steps.finish.table.header.password')}</Text>
              </Group>
            </td>
            <td>
              <Group gap="xs">
                <IconCheck size="1rem" color="green" />
                <Text c="green">{t('steps.finish.table.valid')}</Text>
              </Group>
            </td>
          </tr>
        </tbody>
      </Table>

      {isError && (
        <Alert color="red" icon={<IconAlertTriangleFilled size="0.9rem" />} mb="lg">
          <Text c="red">{t('steps.finish.failed', { error: error.message })}</Text>
        </Alert>
      )}

      <Group justify="apart" wrap="nowrap">
        <Button leftSection={<IconArrowLeft size="1rem" />} onClick={prevStep} variant="light" px="xl">
          {t('common:previous')}
        </Button>
        <Button
          onClick={async () => {
            await createAsync({
              username: values.account.username,
              password: values.security.password,
              email: values.account.eMail === '' ? undefined : values.account.eMail,
            });
            umami.track('Create user', { username: values.account.username});
          }}
          loading={isLoading}
          rightSection={<IconCheck size="1rem" />}
          variant="light"
          px="xl"
        >
          {t('common:confirm')}
        </Button>
      </Group>
    </Card>
  );
};
