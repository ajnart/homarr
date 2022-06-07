import { TextInput, Group, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useConfig } from '../../tools/state';

export default function TitleChanger() {
  const { config, setConfig } = useConfig();

  const form = useForm({
    initialValues: {
      title: config.settings.title,
      logo: config.settings.logo,
      favicon: config.settings.favicon,
    },
  });

  const saveChanges = (values: { title?: string; logo?: string; favicon?: string }) => {
    setConfig({
      ...config,
      settings: {
        ...config.settings,
        title: values.title,
        logo: values.logo,
        favicon: values.favicon,
      },
    });
  };

  return (
    <Group direction="column" grow>
      <form onSubmit={form.onSubmit((values) => saveChanges(values))}>
        <Group grow direction="column">
          <TextInput label="Page title" placeholder="'Homarr 🦞" {...form.getInputProps('title')} />
          <TextInput label="Logo" placeholder="/img/logo.png" {...form.getInputProps('logo')} />
          <TextInput
            label="Favicon"
            placeholder="/favicon.svg"
            {...form.getInputProps('favicon')}
          />
          <Button type="submit">Save</Button>
        </Group>
      </form>
    </Group>
  );
}
