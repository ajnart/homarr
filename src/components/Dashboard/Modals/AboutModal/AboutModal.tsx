import {
  Accordion,
  ActionIcon,
  Anchor,
  Badge,
  Button,
  createStyles,
  Grid,
  Group,
  HoverCard,
  Kbd,
  Modal,
  Table,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import {
  IconAnchor,
  IconBrandDiscord,
  IconBrandGithub,
  IconFile,
  IconKey,
  IconLanguage,
  IconSchema,
  IconVersions,
  IconVocabulary,
  IconWorldWww,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { InitOptions } from 'i18next';
import { i18n, Trans, useTranslation } from 'next-i18next';
import Image from 'next/image';
import { ReactNode } from 'react';
import { useConfigContext } from '../../../../config/provider';
import { useConfigStore } from '../../../../config/store';
import { useEditModeInformationStore } from '../../../../hooks/useEditModeInformation';
import { usePackageAttributesStore } from '../../../../tools/client/zustands/usePackageAttributesStore';
import { useColorTheme } from '../../../../tools/color';
import Tip from '../../../layout/Tip';
import { usePrimaryGradient } from '../../../layout/useGradient';
import Credits from '../../../Settings/Common/Credits';

interface AboutModalProps {
  opened: boolean;
  closeModal: () => void;
  newVersionAvailable?: string;
}

export const AboutModal = ({ opened, closeModal, newVersionAvailable }: AboutModalProps) => {
  const { classes } = useStyles();
  const colorGradiant = usePrimaryGradient();
  const informations = useInformationTableItems(newVersionAvailable);
  const { t } = useTranslation(['common', 'layout/modals/about']);

  const keybinds = [
    { key: 'Mod + J', shortcut: 'Toggle light/dark mode' },
    { key: 'Mod + K', shortcut: 'Focus on search bar' },
    { key: 'Mod + B', shortcut: 'Open docker widget' },
    { key: 'Mod + E', shortcut: 'Toggle Edit mode' },
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
    <Modal
      onClose={() => closeModal()}
      opened={opened}
      title={
        <Group spacing="sm">
          <Image
            alt="Homarr logo"
            src="/imgs/logo/logo.png"
            width={30}
            height={30}
            style={{
              objectFit: 'contain',
            }}
          />
          <Title order={3} variant="gradient" gradient={colorGradiant}>
            {t('about')} Homarr
          </Title>
        </Group>
      }
      size="xl"
    >
      <Text mb="lg">
        <Trans i18nKey="layout/modals/about:description" />
      </Text>

      <Table mb="lg" highlightOnHover withBorder>
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

      <Title order={6} mb="xs" align="center">
        {t('layout/modals/about:contact')}
      </Title>

      <Grid grow>
        <Grid.Col md={4} xs={12}>
          <Button
            component="a"
            href="https://github.com/ajnart/homarr"
            target="_blank"
            leftIcon={<IconBrandGithub size={20} />}
            variant="default"
            fullWidth
          >
            GitHub
          </Button>
        </Grid.Col>
        <Grid.Col md={4} xs={12}>
          <Button
            component="a"
            href="https://homarr.dev/"
            target="_blank"
            leftIcon={<IconWorldWww size={20} />}
            variant="default"
            fullWidth
          >
            Documentation
          </Button>
        </Grid.Col>

        <Grid.Col md={4} xs={12}>
          <Button
            component="a"
            href="https://discord.gg/aCsmEV5RgA"
            target="_blank"
            leftIcon={<IconBrandDiscord size={20} />}
            variant="default"
            fullWidth
          >
            Discord
          </Button>
        </Grid.Col>
      </Grid>
      <Credits />
    </Modal>
  );
};

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
  const { editModeEnabled } = useEditModeInformationStore();
  const { primaryColor } = useColorTheme();

  const { configVersion } = useConfigContext();
  const { configs } = useConfigStore();

  let items: InformationTableItem[] = [];

  if (editModeEnabled) {
    items = [
      ...items,
      {
        icon: <IconKey size={20} />,
        label: 'experimental_disableEditMode',
        content: (
          <Tooltip
            color="red"
            withinPortal
            width={300}
            multiline
            withArrow
            label="This is an experimental feature, where the edit mode is disabled entirely - no config
            modifications are possbile anymore. All update requests for the config will be dropped
            on the API. This will be removed in future versions, as Homarr will receive a proper
            authentication system, which will make this obsolete."
          >
            <Badge color="red">WARNING</Badge>
          </Tooltip>
        ),
      },
    ];
  }

  if (i18n !== null) {
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
      icon: <IconFile size={20} />,
      label: 'configurationsCount',
      content: (
        <Badge variant="light" color={primaryColor}>
          {configs.length}
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
                <motion.div
                  initial={{ scale: 1.2 }}
                  animate={{
                    scale: [0.8, 1.1, 1],
                    rotate: [0, 10, 0],
                  }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                >
                  <Badge color="green" variant="filled">
                    new: {newVersionAvailable}
                  </Badge>
                </motion.div>
              </HoverCard.Target>
              <HoverCard.Dropdown>
                Version{' '}
                <b>
                  <Anchor
                    target="_blank"
                    href={`https://github.com/ajnart/homarr/releases/tag/${newVersionAvailable}`}
                  >
                    {newVersionAvailable}
                  </Anchor>
                </b>{' '}
                is available ! Current version: {attributes.packageVersion}
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
