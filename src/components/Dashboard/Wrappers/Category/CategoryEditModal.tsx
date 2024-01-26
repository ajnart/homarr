import { Button, Group, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { ContextModalProps } from '@mantine/modals';
import { useTranslation } from 'next-i18next';
import { useConfigContext } from '~/config/provider';
import { useConfigStore } from '~/config/store';
import { CategoryType } from '~/types/category';

export type CategoryEditModalInnerProps = {
  category: CategoryType;
  onSuccess: (category: CategoryType) => Promise<void>;
};

export const CategoryEditModal = ({
  context,
  innerProps,
  id,
}: ContextModalProps<CategoryEditModalInnerProps>) => {
  const { name: configName } = useConfigContext();
  const updateConfig = useConfigStore((x) => x.updateConfig);
  const form = useForm<FormType>({
    initialValues: {
      name: innerProps.category.name,
    },
    validate: {
      name: (val: string) => (!val || val.trim().length === 0 ? 'Name is required' : null),
    },
  });

  const handleSubmit = async (values: FormType) => {
    await innerProps.onSuccess({ ...innerProps.category, name: values.name });
    context.closeModal(id);
  };

  const { t } = useTranslation('common');

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <TextInput data-autoFocus {...form.getInputProps('name')} autoFocus />

      <Group mt="md" grow>
        <Button onClick={() => context.closeModal(id)} variant="filled" color="gray">
          {t('cancel')}
        </Button>
        <Button type="submit">{t('save')}</Button>
      </Group>
    </form>
  );
};

type FormType = {
  name: string;
};
