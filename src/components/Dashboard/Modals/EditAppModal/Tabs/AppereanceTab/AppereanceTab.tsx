import { Autocomplete, createStyles, Flex, Tabs, TextInput } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'next-i18next';
import { AppType } from '../../../../../../types/app';
import { DebouncedAppIcon } from '../Shared/DebouncedAppIcon';
import { IconSelector } from './IconSelector/IconSelector';

interface AppearanceTabProps {
  form: UseFormReturnType<AppType, (values: AppType) => AppType>;
  disallowAppNameProgagation: () => void;
  allowAppNamePropagation: boolean;
}

export const AppearanceTab = ({
  form,
  disallowAppNameProgagation,
  allowAppNamePropagation,
}: AppearanceTabProps) => {
  const { t } = useTranslation('layout/modals/add-app');
  const { classes } = useStyles();
  const { isLoading, error, data } = useQuery({
    queryKey: ['autocompleteLocale'],
    queryFn: () => fetch('/api/getLocalImages').then((res) => res.json()),
  });

  return (
    <Tabs.Panel value="appearance" pt="lg">
      <Flex gap={5}>
        <Autocomplete
          className={classes.textInput}
          icon={<DebouncedAppIcon form={form} width={20} height={20} />}
          label={t('appearance.icon.label')}
          description={t('appearance.icon.description')}
          variant="default"
          data={data.files ?? []}
          withAsterisk
          required
          {...form.getInputProps('appearance.iconUrl')}
        />
        <IconSelector
          onChange={(item) => {
            form.setValues({
              appearance: {
                iconUrl: item.url,
              },
            });
            disallowAppNameProgagation();
          }}
          allowAppNamePropagation={allowAppNamePropagation}
          form={form}
        />
      </Flex>
    </Tabs.Panel>
  );
};

const useStyles = createStyles(() => ({
  textInput: {
    flexGrow: 1,
  },
}));
