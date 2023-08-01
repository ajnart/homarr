import { Button, Group, Select, Stack, Text, Title } from '@mantine/core';
import { createFormContext } from '@mantine/form';
import type { InferGetServerSidePropsType } from 'next';
import { GetServerSidePropsContext } from 'next';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { AccessibilitySettings } from '~/components/Settings/Customization/Accessibility/AccessibilitySettings';
import { ManageLayout } from '~/components/layout/Templates/ManageLayout';
import { CommonHeader } from '~/components/layout/common-header';
import { languages } from '~/tools/language';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { manageNamespaces } from '~/tools/server/translation-namespaces';
import { RouterOutputs, api } from '~/utils/api';
import { useI18nZodResolver } from '~/utils/i18n-zod-resolver';
import { updateSettingsValidationSchema } from '~/validations/user';

const PreferencesPage = ({ locale }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { data } = api.user.getWithSettings.useQuery();

  return (
    <ManageLayout>
      <CommonHeader>
        <title>Preferences • Homarr</title>
      </CommonHeader>
      <Title mb="xl">Preferences</Title>

      {data && <SettingsComponent settings={data.settings} />}
    </ManageLayout>
  );
};

export const [FormProvider, useFormContext, useForm] =
  createFormContext<z.infer<typeof updateSettingsValidationSchema>>();

const SettingsComponent = ({
  settings,
}: {
  settings: RouterOutputs['user']['getWithSettings']['settings'];
}) => {
  const languagesData = languages.map((language) => ({
    image: 'https://img.icons8.com/clouds/256/000000/futurama-bender.png',
    label: language.originalName,
    description: language.translatedName,
    value: language.shortName,
    country: language.country,
  }));

  const { t } = useTranslation('user/preferences');

  const { i18nZodResolver } = useI18nZodResolver();

  const form = useForm({
    initialValues: {
      disablePingPulse: settings.disablePingPulse,
      replaceDotsWithIcons: settings.replacePingWithIcons,
      language: settings.language,
    },
    validate: i18nZodResolver(updateSettingsValidationSchema),
    validateInputOnBlur: true,
    validateInputOnChange: true,
  });

  const { mutate } = api.user.updateSettings.useMutation();

  const handleSubmit = () => {
    mutate(form.values);
  };

  return (
    <FormProvider form={form}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack spacing={5}>
          <Title order={2} size="lg">
            {t('localization.language.label')}
          </Title>

          <Select
            label="Language"
            itemComponent={SelectItem}
            data={languagesData}
            searchable
            maxDropdownHeight={400}
            filter={(value, item) =>
              item.label!.toLowerCase().includes(value.toLowerCase().trim()) ||
              item.description.toLowerCase().includes(value.toLowerCase().trim())
            }
            defaultValue={settings.language}
            withAsterisk
            mb="xs"
            {...form.getInputProps('language')}
          />

          <Select
            label={t('localization.firstDayOfWeek.label')}
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

          <Button type="submit" fullWidth mt="md">
            Save
          </Button>
        </Stack>
      </form>
    </FormProvider>
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

export async function getServerSideProps({ req, res, locale }: GetServerSidePropsContext) {
  const translations = await getServerSideTranslations(manageNamespaces, locale, undefined, undefined);
  return {
    props: {
      ...translations,
      locale: locale,
    },
  };
}

export default PreferencesPage;
