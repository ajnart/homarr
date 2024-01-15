import {
  Accordion,
  ActionIcon,
  Anchor,
  Badge,
  createStyles,
  Divider,
  Group,
  HoverCard,
  Kbd,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import { IconAnchor, IconKey, IconLanguage, IconSchema, IconVersions, IconVocabulary } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { InitOptions } from 'i18next';
import { GetServerSidePropsContext } from 'next';
import { i18n, Trans, useTranslation } from 'next-i18next';
import Head from 'next/head';
import { ReactNode } from 'react';
import { ManageLayout } from '~/components/layout/Templates/ManageLayout';
import { Contributors, ContributorsTable } from '~/components/layout/header/About/Contributors';
import Credits from '~/components/layout/header/About/Credits';
import Tip from '~/components/layout/header/About/Tip';
import { TranslatorsTable } from '~/components/layout/header/About/Translators';
import { useConfigContext } from '~/config/provider';
import { usePackageAttributesStore } from '~/tools/client/zustands/usePackageAttributesStore';
import { useColorTheme } from '~/tools/color';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';

import { REPO_URL } from '../../../data/constants';

interface InformationTableItem {
  icon: ReactNode;
  label: string;
  content: ReactNode;
}

interface ExtendedInitOptions extends InitOptions {
  locales: string[];
}

const useInformationTableItems = (newVersionAvailable?: string): InformationTableItem[] => {
  const { attributes } = usePackageAttributesStore();
  const { primaryColor } = useColorTheme();
  const { t } = useTranslation(['layout/modals/about']);

  const { configVersion } = useConfigContext();

  let items: InformationTableItem[] = [];

  if (i18n?.reportNamespaces) {
    const usedI18nNamespaces = i18n.reportNamespaces.getUsedNamespaces();
    const initOptions = i18n.options as ExtendedInitOptions;

    items = [
      ...items,
      {
        icon: <IconLanguage size={20} />,
        label: 'i18n',
        content: (
          <Badge variant="light" color={primaryColor}>
            {usedI18nNamespaces.length}
          </Badge>
        ),
      },
      {
        icon: <IconVocabulary size={20} />,
        label: 'locales',
        content: (
          <Badge variant="light" color={primaryColor}>
            {initOptions.locales.length}
          </Badge>
        ),
      },
    ];
  }

  items = [
    {
      icon: <IconSchema size={20} />,
      label: 'configurationSchemaVersion',
      content: (
        <Badge variant="light" color={primaryColor}>
          {configVersion}
        </Badge>
      ),
    },
    {
      icon: <IconVersions size={20} />,
      label: 'version',
      content: (
        <Group position="right">
          <Badge variant="light" color={primaryColor}>
            {attributes.packageVersion ?? 'Unknown'}
          </Badge>
          {newVersionAvailable && (
            <HoverCard shadow="md" position="top" withArrow>
              <HoverCard.Target>
                <Badge color="teal" variant="light">
                  {t('version.new', { newVersion: newVersionAvailable })}
                </Badge>
              </HoverCard.Target>
              <HoverCard.Dropdown>
                <Text>
                  {
                    t('version.dropdown', { currentVersion: attributes.packageVersion }).split(
                      '{{newVersion}}'
                    )[0]
                  }
                  <b>
                    <Anchor
                      target="_blank"
                      href={`https://github.com/ajnart/homarr/releases/tag/${newVersionAvailable}`}
                    >
                      {newVersionAvailable}
                    </Anchor>
                  </b>
                  {
                    t('version.dropdown', { currentVersion: attributes.packageVersion }).split(
                      '{{newVersion}}'
                    )[1]
                  }
                </Text>
              </HoverCard.Dropdown>
            </HoverCard>
          )}
        </Group>
      ),
    },
    {
      icon: <IconAnchor size={20} />,
      label: 'nodeEnvironment',
      content: (
        <Badge variant="light" color={primaryColor}>
          {attributes.environment}
        </Badge>
      ),
    },
    ...items,
  ];

  return items;
};

const useStyles = createStyles(() => ({
  informationTableColumn: {
    textAlign: 'right',
  },
  informationIcon: {
    cursor: 'default',
  },
}));

export const Page = ({ contributors }: { contributors: Contributors[] }) => {
  const { data } = useQuery({
    queryKey: ['github/latest'],
    cacheTime: 1000 * 60 * 60 * 24,
    staleTime: 1000 * 60 * 60 * 5,
    queryFn: () =>
      fetch(`https://api.github.com/repos/${REPO_URL}/releases/latest`, {
        cache: 'force-cache',
      }).then((res) => res.json()),
  });
  const { attributes } = usePackageAttributesStore();
  if (!i18n) {
    return;
  }
  const initOptions = i18n.options as ExtendedInitOptions;

  const newVersionAvailable =
    data?.tag_name > `v${attributes.packageVersion}` ? data?.tag_name : undefined;
  const informations = useInformationTableItems(newVersionAvailable);
  const { t } = useTranslation(['layout/modals/about']);
  const { classes } = useStyles();

  const keybinds = [
    { key: 'Mod + J', shortcut: t('layout/modals/about:actions.toggleTheme') },
    { key: 'Mod + K', shortcut: t('layout/modals/about:actions.focusSearchBar') },
    { key: 'Mod + B', shortcut: t('layout/modals/about:actions.openDocker') },
    { key: 'Mod + E', shortcut: t('layout/modals/about:actions.toggleEdit') },
  ];
  const rows = keybinds.map((element) => (
    <tr key={element.key}>
      <td>
        <Kbd>{element.key}</Kbd>
      </td>
      <td>
        <Text>{element.shortcut}</Text>
      </td>
    </tr>
  ));

  return (
    <ManageLayout>
      <Head>
        <title>About • Homarr</title>
      </Head>
      <Stack>
        <Text>
          <Trans i18nKey="layout/modals/about:description" />
        </Text>

        <Table withBorder>
          <tbody>
            {informations.map((item, index) => (
              <tr key={index}>
                <td>
                  <Group spacing="xs">
                    <ActionIcon className={classes.informationIcon} variant="default">
                      {item.icon}
                    </ActionIcon>
                    <Text>
                      <Trans
                        i18nKey={`layout/modals/about:metrics.${item.label}`}
                        components={{ b: <b /> }}
                      />
                    </Text>
                  </Group>
                </td>
                <td className={classes.informationTableColumn} style={{ maxWidth: 200 }}>
                  {item.content}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Accordion mb={5} variant="contained" radius="md">
          <Accordion.Item value="keybinds">
            <Accordion.Control icon={<IconKey size={20} />}>
              {t('layout/modals/about:keybinds')}
            </Accordion.Control>
            <Accordion.Panel>
              <Table mb={5}>
                <thead>
                  <tr>
                    <th>{t('layout/modals/about:key')}</th>
                    <th>{t('layout/modals/about:action')}</th>
                  </tr>
                </thead>
                <tbody>{rows}</tbody>
              </Table>
              <Tip>{t('layout/modals/about:tip')}</Tip>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

        <TranslatorsTable loadedLanguages={initOptions.locales.length} />
        <Divider />
        <ContributorsTable contributors={contributors} />
        <Credits />
      </Stack>
    </ManageLayout>
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const contributors = (await fetch(
    `https://api.github.com/repos/${REPO_URL}/contributors?per_page=100`,
    {
      cache: 'force-cache',
    }
  ).then((res) => res.json())) as Contributors[];
  return {
    props: {
      contributors,
      ...(await getServerSideTranslations(
        ['layout/manage', 'manage/index'],
        ctx.locale,
        ctx.req,
        ctx.res
      )),
    },
  };
}

export default Page;
