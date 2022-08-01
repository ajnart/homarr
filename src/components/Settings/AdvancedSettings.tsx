import { TextInput, Button, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useConfig } from '../../tools/state';
import { ColorSelector } from './ColorSelector';
import { OpacitySelector } from './OpacitySelector';
import { AppCardWidthSelector } from './AppCardWidthSelector';
import { ShadeSelector } from './ShadeSelector';

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
    <Stack mb="lg">
      <form onSubmit={form.onSubmit((values) => saveChanges(values))}>
        <Stack>
          <TextInput label="Page title" placeholder="Homarr 🦞" {...form.getInputProps('title')} />
          <TextInput label="Logo" placeholder="/img/logo.png" {...form.getInputProps('logo')} />
          <TextInput
            label="Favicon"
            placeholder="/favicon.svg"
            {...form.getInputProps('favicon')}
          />
          <TextInput
            label="Background"
            placeholder="/img/background.png"
            {...form.getInputProps('background')}
          />
          <Button type="submit">Save</Button>
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
