import { Group, Select, Stack, Text, Title } from '@mantine/core';
import Head from 'next/head';
import { forwardRef } from 'react';
import { AccessibilitySettings } from '~/components/Settings/Customization/Accessibility/AccessibilitySettings';
import { MainLayout } from '~/components/layout/admin/main-admin.layout';
import { languages } from '~/tools/language';

const PreferencesPage = () => {
  const data = languages.map((language) => ({
    image: 'https://img.icons8.com/clouds/256/000000/futurama-bender.png',
    label: language.originalName,
    description: language.translatedName,
    value: language.shortName,
    country: language.country,
  }));
  return (
    <MainLayout>
      <Head>
        <title>Preferences • Homarr</title>
      </Head>
      <Title mb="xl">Preferences</Title>

      <Stack spacing={5}>
        <Title order={2} size="lg">
          Localization
        </Title>

        <Select
          label="Language"
          itemComponent={SelectItem}
          data={data}
          searchable
          maxDropdownHeight={400}
          filter={(value, item) =>
            item.label.toLowerCase().includes(value.toLowerCase().trim()) ||
            item.description.toLowerCase().includes(value.toLowerCase().trim())
          }
          withAsterisk
        />

        <Select
          label="First day of the week"
          data={[
            { value: 'monday', label: 'Monday' },
            { value: 'sunday', label: 'Sunday' },
            { value: 'saturday', label: 'Saturday' },
          ]}
        />

        <Title order={2} size="lg" mt="lg" mb="md">
          Accessibility
        </Title>

        <AccessibilitySettings />
      </Stack>
    </MainLayout>
  );
};

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  image: string;
  label: string;
  description: string;
  country: string;
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ image, label, description, country, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <span className={`fi fi-${country?.toLowerCase()}`}></span>

        <div>
          <Text size="sm">{label}</Text>
          <Text size="xs" opacity={0.65}>
            {description}
          </Text>
        </div>
      </Group>
    </div>
  )
);

export default PreferencesPage;
