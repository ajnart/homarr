import { TextInput, Button, Stack, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'next-i18next';
import { useConfig } from '../../tools/state';
import { ColorSelector } from './ColorSelector';
import { OpacitySelector } from './OpacitySelector';
import { AppCardWidthSelector } from './AppCardWidthSelector';
import { ShadeSelector } from './ShadeSelector';
import { GrowthSelector } from './GrowthSelector';

export default function TitleChanger() {
  const { config, setConfig } = useConfig();
  const { t } = useTranslation('settings/customization/page-appearance');

  const form = useForm({
    initialValues: {
      title: config.settings.title,
      logo: config.settings.logo,
      favicon: config.settings.favicon,
      background: config.settings.background,
      customCSS: config.settings.customCSS,
    },
  });

  const saveChanges = (values: {
    title?: string;
    logo?: string;
    favicon?: string;
    background?: string;
    customCSS?: string;
  }) => {
    setConfig({
      ...config,
      settings: {
        ...config.settings,
        title: values.title,
        logo: values.logo,
        favicon: values.favicon,
        background: values.background,
        customCSS: values.customCSS,
      },
    });
  };

  return (
    <Stack mb="md" mr="sm" mt="xs">
      <form onSubmit={form.onSubmit((values) => saveChanges(values))}>
        <Stack>
          <TextInput
            label={t('pageTitle.label')}
            placeholder="Homarr 🦞"
            {...form.getInputProps('title')}
          />
          <TextInput
            label={t('logo.label')}
            placeholder="/imgs/logo.png"
            {...form.getInputProps('logo')}
          />
          <TextInput
            label={t('favicon.label')}
            placeholder="/imgs/favicon/favicon.png"
            {...form.getInputProps('favicon')}
          />
          <TextInput
            label={t('background.label')}
            placeholder="/img/background.png"
            {...form.getInputProps('background')}
          />
          <Textarea
            minRows={5}
            label={t('customCSS.label')}
            placeholder={t('customCSS.placeholder')}
            {...form.getInputProps('customCSS')}
          />
          <Button type="submit">{t('buttons.submit')}</Button>
        </Stack>
      </form>
      <GrowthSelector />
      <ColorSelector type="primary" />
      <ColorSelector type="secondary" />
      <ShadeSelector />
      <OpacitySelector />
      <AppCardWidthSelector />
    </Stack>
  );
}
