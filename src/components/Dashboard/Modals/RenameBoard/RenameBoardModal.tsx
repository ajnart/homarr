import { modals } from '@mantine/modals';
import { Alert, Button, TextInput } from '@mantine/core';
import { api } from '~/utils/api';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { configNameSchema } from '~/validations/boards';

type RenameBoardModalProps = {
  boardName: string;
  configNames: string[];
  onClose: () => void;
}

export const RenameBoardModal = ({ boardName, configNames, onClose }: RenameBoardModalProps) => {
  const { t } = useTranslation(['manage/boards', 'common']);

  const utils = api.useUtils();
  const { mutateAsync: mutateRenameBoardAsync, isLoading, isError, error } = api.boards.renameBoard.useMutation({
    onSettled: () => {
      void utils.boards.all.invalidate();
    }
  });

  const form = useForm({
    initialValues: {
      newName: '',
    },
    validate: zodResolver(z.object({
      newName: configNameSchema.refine(value => !configNames.includes(value)),
    })),
    validateInputOnBlur: true,
    validateInputOnChange: true,
  });

  const handleSubmit = () => {
    mutateRenameBoardAsync({
      oldName: boardName,
      newName: form.values.newName,
    }).then(() => {
      onClose();
    });
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      {isError && error && (
        <Alert icon={<IconAlertCircle size={"1rem"} />} mb={"md"}>
          {error.message}
        </Alert>
      )}
      <TextInput
        label={t('cards.menu.rename.modal.fields.name.label')}
        placeholder={t('cards.menu.rename.modal.fields.name.placeholder') as string}
        data-autofocus
        {...form.getInputProps('newName')} />
      <Button
        loading={isLoading}
        fullWidth
        mt="md"
        type={'submit'}
        variant={"light"}>
        {t('common:confirm')}
      </Button>
    </form>
  );
};
