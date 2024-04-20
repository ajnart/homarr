import { Button, Group, Select, Stack, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { ContextModalProps, modals } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { ContainerInfo } from 'dockerode';
import { Trans, useTranslation } from 'next-i18next';
import { z } from 'zod';
import { useConfigContext } from '~/config/provider';
import { useConfigStore } from '~/config/store';
import { generateDefaultApp } from '~/tools/shared/app';
import { api } from '~/utils/api';
import { useI18nZodResolver } from '~/utils/i18n-zod-resolver';

const dockerSelectBoardSchema = z.object({
  board: z.string().nonempty(),
});

type InnerProps = {
  containers: (ContainerInfo & { icon?: string })[];
};
type FormType = z.infer<typeof dockerSelectBoardSchema>;

export const DockerSelectBoardModal = ({ id, innerProps }: ContextModalProps<InnerProps>) => {
  const { t } = useTranslation('tools/docker');
  const { mutateAsync, isLoading } = api.boards.addAppsForContainers.useMutation();
  const { i18nZodResolver } = useI18nZodResolver();
  const { name: configName } = useConfigContext();

  const updateConfig = useConfigStore((store) => store.updateConfig);
  const handleSubmit = async (values: FormType) => {
    const newApps = innerProps.containers.map((container) => ({
      name: (container.Names.at(0) ?? 'App').replace('/', ''),
      port: container.Ports.at(0)?.PublicPort,
      icon: container.icon,
    }));
    await mutateAsync(
      {
        apps: newApps,
        boardName: values.board,
      },
      {
        onSuccess: () => {
          showNotification({
            title: t('notifications.selectBoard.success.title'),
            message: t('notifications.selectBoard.success.message'),
            icon: <IconCheck />,
            color: 'green',
          });
          updateConfig(configName!, (config) => {
            const lowestWrapper = config?.wrappers.sort((a, b) => a.position - b.position)[0];
            const defaultApp = generateDefaultApp(lowestWrapper.id);
            return {
              ...config,
              apps: [
                ...config.apps,
                ...newApps.map((app) => ({
                  ...defaultApp,
                  ...app,
                  wrapperId: lowestWrapper.id,
                })),
              ],
            };
          });
          modals.close(id);
        },
        onError: () => {
          showNotification({
            title: t('notifications.selectBoard.error.title'),
            message: t('notifications.selectBoard.error.message'),
            icon: <IconX />,
            color: 'red',
          });
        },
      }
    );
  };

  const form = useForm<FormType>({
    initialValues: {
      board: '',
    },
    validate: i18nZodResolver(dockerSelectBoardSchema),
  });

  const { data: boards } = api.boards.all.useQuery();

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <Text>{t('modals.selectBoard.text')}</Text>

        <Select
          label={t('modals.selectBoard.form.board.label')}
          withAsterisk
          withinPortal
          data={
            boards?.map((board) => ({
              value: board.name,
              label: board.name,
            })) ?? []
          }
          {...form.getInputProps('board')}
        />

        <Group grow>
          <Button
            onClick={() => {
              modals.close(id);
            }}
            variant="light"
            color="gray"
            type="button"
          >
            {t('common:cancel')}
          </Button>
          <Button
            type="submit"
            onClick={async () => {}}
            disabled={isLoading}
            variant="light"
            color="green"
          >
            {t('modals.selectBoard.form.submit')}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export const openDockerSelectBoardModal = (innerProps: InnerProps) => {
  modals.openContextModal({
    modal: 'dockerSelectBoardModal',
    title: <Trans i18nKey="tools/docker:modals.selectBoard.title" />,
    innerProps,
  });
  umami.track('Add to homarr modal');
};
