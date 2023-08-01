import { Button, Group, LoadingOverlay, Select, Stack, Text, Title } from '@mantine/core';
import { createFormContext } from '@mantine/form';
import type { InferGetServerSidePropsType } from 'next';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { AccessibilitySettings } from '~/components/User/Preferences/AccessibilitySettings';
import { ManageLayout } from '~/components/layout/Templates/ManageLayout';
import { sleep } from '~/tools/client/time';
import { languages } from '~/tools/language';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { manageNamespaces } from '~/tools/server/translation-namespaces';
import { RouterOutputs, api } from '~/utils/api';
import { useI18nZodResolver } from '~/utils/i18n-zod-resolver';
import { updateSettingsValidationSchema } from '~/validations/user';

const PreferencesPage = ({ locale }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { data } = api.user.withSettings.useQuery();
  const { data: boardsData } = api.boards.all.useQuery();

  return (
    <ManageLayout>
      <Head>
        <title>Preferences • Homarr</title>
      </Head>
      <Title mb="xl">Preferences</Title>

      {data && boardsData && <SettingsComponent settings={data.settings} boardsData={boardsData} />}
    </ManageLayout>
  );
};

export const [FormProvider, useFormContext, useForm] =
  createFormContext<z.infer<typeof updateSettingsValidationSchema>>();

const SettingsComponent = ({
  settings,
  boardsData,
}: {
  settings: RouterOutputs['user']['withSettings']['settings'];
  boardsData: RouterOutputs['boards']['all'];
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
      defaultBoard: settings.defaultBoard,
    },
    validate: i18nZodResolver(updateSettingsValidationSchema),
    validateInputOnBlur: true,
    validateInputOnChange: true,
  });

  const context = api.useContext();
  const { mutate, isLoading } = api.user.updateSettings.useMutation({
    onSettled: () => {
      void context.boards.all.invalidate();
    }
  });

  const handleSubmit = () => {
    sleep(500).then(() => {
      mutate(form.values);
    });
  };

  return (
    <FormProvider form={form}>
      <form style={{ position: 'relative' }} onSubmit={form.onSubmit(handleSubmit)}>
        <LoadingOverlay visible={isLoading} overlayBlur={2} />
        <Stack spacing={5}>
          <Title order={2} size="lg">
            {t('boards.title')}
          </Title>

          <Select
            label={t('boards.defaultBoard.label')}
            data={boardsData.map((board) => board.name)}
            searchable
            maxDropdownHeight={400}
            filter={(value, item) => item.label!.toLowerCase().includes(value.toLowerCase().trim())}
            withAsterisk
            mb="xs"
            {...form.getInputProps('defaultBoard')}
          />

          <Title order={2} size="lg" mt="lg">
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
            //TODO: Make it use the configured value
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
  const translations = await getServerSideTranslations(
    manageNamespaces,
    locale,
    undefined,
    undefined
  );
  return {
    props: {
      ...translations,
      locale: locale,
    },
  };
}

export default PreferencesPage;
