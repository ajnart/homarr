import { TextInput, Button, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useConfig } from '../../tools/state';
import { ColorSelector } from './ColorSelector';
import { OpacitySelector } from './OpacitySelector';
import { AppCardWidthSelector } from './AppCardWidthSelector';
import { ShadeSelector } from './ShadeSelector';
import { t } from 'i18next';

export default function TitleChanger() {
  const { config, setConfig } = useConfig();

  const form = useForm({
    initialValues: {
      title: config.settings.title,
      logo: config.settings.logo,
      favicon: config.settings.favicon,
      background: config.settings.background,
    },
  });

  const saveChanges = (values: {
    title?: string;
    logo?: string;
    favicon?: string;
    background?: string;
  }) => {
    setConfig({
      ...config,
      settings: {
        ...config.settings,
        title: values.title,
        logo: values.logo,
        favicon: values.favicon,
        background: values.background,
      },
    });
  };

  return (
    <Stack mb="md" mr="sm" mt="xs">
      <form onSubmit={form.onSubmit((values) => saveChanges(values))}>
        <Stack>
          <TextInput
            label={t('settings.tabs.customizations.settings.pageTitle.label')}
            placeholder={t('settings.tabs.customizations.settings.pageTitle.placeholder')}
            {...form.getInputProps('title')}
          />
          <TextInput
            label={t('settings.tabs.customizations.settings.logo.label')}
            placeholder={t('settings.tabs.customizations.settings.logo.placeholder')}
            {...form.getInputProps('logo')}
          />
          <TextInput
            label={t('settings.tabs.customizations.settings.favicon.label')}
            placeholder={t('settings.tabs.customizations.settings.favicon.placeholder')}
            {...form.getInputProps('favicon')}
          />
          <TextInput
            label={t('settings.tabs.customizations.settings.background.label')}
            placeholder={t('settings.tabs.customizations.settings.background.placeholder')}
            {...form.getInputProps('background')}
          />
          <Button type="submit">{t('settings.tabs.customizations.settings.buttons.submit')}</Button>
        </Stack>
      </form>
      <ColorSelector type="primary" />
      <ColorSelector type="secondary" />
      <ShadeSelector />
      <OpacitySelector />
      <AppCardWidthSelector />
    </Stack>
  );
}
