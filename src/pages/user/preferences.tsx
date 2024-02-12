import { Button, Container, Group, LoadingOverlay, Paper, Select, Stack, Text, Title } from '@mantine/core';
import { createFormContext } from '@mantine/form';
import { IconArrowLeft } from '@tabler/icons-react';
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { forwardRef } from 'react';
import { z } from 'zod';
import { AccessibilitySettings } from '~/components/User/Preferences/AccessibilitySettings';
import { SearchEngineSettings } from '~/components/User/Preferences/SearchEngineSelector';
import { MainLayout } from '~/components/layout/Templates/MainLayout';
import { createTrpcServersideHelpers } from '~/server/api/helper';
import { getServerAuthSession } from '~/server/auth';
import { languages } from '~/tools/language';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { api, RouterOutputs } from '~/utils/api';
import { useI18nZodResolver } from '~/utils/i18n-zod-resolver';
import { updateSettingsValidationSchema } from '~/validations/user';

const PreferencesPage = () => {
  const { data } = api.user.withSettings.useQuery();
  const { data: boardsData } = api.boards.all.useQuery();
  const { t } = useTranslation('user/preferences');
  const headTitle = `${t('metaTitle')} • Homarr`;

  return (
    <MainLayout
      showExperimental
      contentComponents={
        <Button component="a" href="/board/" variant="light" leftIcon={<IconArrowLeft size={16} />}>
          {t('common:back')}
        </Button>
      }
    >
      <Container>
        <Paper p="xl" mih="100%" withBorder>
          <Head>
            <title>{headTitle}</title>
          </Head>
          <Title mb="xl">{t('pageTitle')}</Title>

          {data && boardsData && (
            <SettingsComponent settings={data.settings} boardsData={boardsData} />
          )}
        </Paper>
      </Container>
    </MainLayout>
  );
};

export const [FormProvider, useUserPreferencesFormContext, useForm] =
  createFormContext<z.infer<typeof updateSettingsValidationSchema>>();

const SettingsComponent = ({
  settings,
  boardsData,
}: {
  settings: RouterOutputs['user']['withSettings']['settings'];
  boardsData: RouterOutputs['boards']['all'];
}) => {
  const languagesData = languages.map((language) => ({
    label: language.originalName,
    description: language.translatedName,
    value: language.shortName,
    country: language.country,
  }));

  const { t, i18n } = useTranslation(['user/preferences', 'common']);

  const { i18nZodResolver } = useI18nZodResolver();
  const { pathname, query, asPath, push } = useRouter();

  const form = useForm({
    initialValues: {
      defaultBoard: settings.defaultBoard,
      language: settings.language,
      firstDayOfWeek: settings.firstDayOfWeek,
      disablePingPulse: settings.disablePingPulse,
      replaceDotsWithIcons: settings.replacePingWithIcons,
      searchTemplate: settings.searchTemplate,
      openSearchInNewTab: settings.openSearchInNewTab,
      autoFocusSearch: settings.autoFocusSearch,
    },
    validate: i18nZodResolver(updateSettingsValidationSchema),
    validateInputOnBlur: true,
    validateInputOnChange: true,
  });

  const context = api.useContext();
  const { mutate, isLoading } = api.user.updateSettings.useMutation({
    onSettled: () => {
      void context.boards.all.invalidate();
      void context.user.withSettings.invalidate();
    },
  });

  const handleSubmit = (values: z.infer<typeof updateSettingsValidationSchema>) => {
    mutate(values, {
      onSuccess: () => {
        if (values.language !== settings.language) {
          i18n.changeLanguage(values.language).then(() => {
            push(
              {
                pathname,
                query,
              },
              asPath,
              { locale: values.language }
            );
          });
        }
      },
    });
  };

  return (
    <FormProvider form={form}>
      <form style={{ position: 'relative' }} onSubmit={form.onSubmit(handleSubmit)}>
        <LoadingOverlay visible={isLoading} overlayBlur={2} />
        <Stack spacing={5}>
          <Select
            label={t('boards.defaultBoard.label')}
            data={boardsData.map((board) => board.name)}
            searchable
            maxDropdownHeight={400}
            filter={(value, item) => item.label!.toLowerCase().includes(value.toLowerCase().trim())}
            withAsterisk
            {...form.getInputProps('defaultBoard')}
          />

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
            withAsterisk
            data={firstDayOfWeekOptions.map((day) => ({
              label: t(`localization.firstDayOfWeek.options.${day}`) as string,
              value: day,
            }))}
            {...form.getInputProps('firstDayOfWeek')}
          />

          <Title order={2} size="lg" mt="lg" mb="md">
            {t('accessibility.title')}
          </Title>

          <AccessibilitySettings />

          <Title order={2} size="lg" mt="lg" mb="md">
            {t('searchEngine.title')}
          </Title>

          <SearchEngineSettings />

          <Button type="submit" fullWidth mt="md">
            {t('common:save')}
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
        {country !== 'CROWDIN' && <span className={`fi fi-${country?.toLowerCase()}`}></span>}
        {country === 'CROWDIN' && <img src={'https://support.crowdin.com/assets/logos/crowdin-dark-symbol.png'} alt={label} width={16} height={16} />}
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

const firstDayOfWeekOptions = ['monday', 'sunday', 'saturday'] as const;

export const getServerSideProps: GetServerSideProps = async ({ req, res, locale }) => {
  const session = await getServerAuthSession({ req, res });
  if (!session) {
    return {
      notFound: true,
    };
  }

  const helpers = await createTrpcServersideHelpers({ req, res });

  await helpers.user.withSettings.prefetch();
  await helpers.boards.all.prefetch();

  const translations = await getServerSideTranslations(['user/preferences'], locale, req, res);
  return {
    props: {
      ...translations,
      locale: locale,
      trpcState: helpers.dehydrate(),
    },
  };
};

export default PreferencesPage;
