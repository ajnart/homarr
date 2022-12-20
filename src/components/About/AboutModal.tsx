import {
  ActionIcon,
  Anchor,
  Badge,
  Button,
  createStyles,
  Group,
  HoverCard,
  Modal,
  Table,
  Text,
  Title,
} from '@mantine/core';
import {
  IconBrandDiscord,
  IconBrandGithub,
  IconLanguage,
  IconVersions,
  IconVocabulary,
  IconWorldWww,
} from '@tabler/icons';
import { motion } from 'framer-motion';
import { InitOptions } from 'i18next';
import { i18n } from 'next-i18next';
import Image from 'next/image';
import { ReactNode } from 'react';
import { CURRENT_VERSION } from '../../../data/constants';
import { usePrimaryGradient } from '../layout/useGradient';

interface AboutModalProps {
  opened: boolean;
  closeModal: () => void;
  newVersionAvailable?: string;
}

export const AboutModal = ({ opened, closeModal, newVersionAvailable }: AboutModalProps) => {
  const { classes } = useStyles();
  const colorGradiant = usePrimaryGradient();
  const informations = useInformationTableItems(newVersionAvailable);

  return (
    <Modal
      onClose={() => closeModal()}
      opened={opened}
      title={
        <Group spacing="sm">
          <Image src="/imgs/logo/logo.png" width={30} height={30} objectFit="contain" />
          <Title order={3} variant="gradient" gradient={colorGradiant}>
            About Homarr
          </Title>
        </Group>
      }
      size="xl"
    >
      <Text mb="lg">
        Homarr is a simple and modern homepage for your server that helps you access all of your
        apps in one place. It integrates with the apps you use to display useful information or
        control them. It&apos;s easy to install and supports many different devices.
      </Text>

      <Title order={6} mb="xs" align="center">
        Version information:
      </Title>

      <Table mb="lg" striped highlightOnHover withBorder>
        <tbody>
          {informations.map((item, index) => (
            <tr key={index}>
              <td>
                <Group spacing="xs">
                  <ActionIcon className={classes.informationIcon} variant="default">
                    {item.icon}
                  </ActionIcon>
                  {item.label}
                </Group>
              </td>
              <td className={classes.informationTableColumn}>{item.content}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Title order={6} mb="xs" align="center">
        Having trouble or questions? Connect with us!
      </Title>

      <Group grow>
        <Button
          component="a"
          href="https://github.com/ajnart/homarr"
          target="_blank"
          leftIcon={<IconBrandGithub size={20} />}
          variant="default"
        >
          GitHub
        </Button>
        <Button
          component="a"
          href="https://homarr.dev/"
          target="_blank"
          leftIcon={<IconWorldWww size={20} />}
          variant="default"
        >
          Website
        </Button>
        <Button
          component="a"
          href="https://discord.gg/aCsmEV5RgA"
          target="_blank"
          leftIcon={<IconBrandDiscord size={20} />}
          variant="default"
        >
          Discord
        </Button>
      </Group>
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
  // TODO: Fix this to not request. Pass it as a prop.
  const colorGradiant = usePrimaryGradient();

  let items: InformationTableItem[] = [];

  if (i18n !== null) {
    const usedI18nNamespaces = i18n.reportNamespaces.getUsedNamespaces();
    const initOptions = i18n.options as ExtendedInitOptions;

    items = [
      ...items,
      {
        icon: <IconLanguage size={20} />,
        label: 'Loaded I18n translation namespaces',
        content: (
          <Badge variant="gradient" gradient={colorGradiant}>
            {usedI18nNamespaces.length}
          </Badge>
        ),
      },
      {
        icon: <IconVocabulary size={20} />,
        label: 'Configured I18n locales',
        content: (
          <Badge variant="gradient" gradient={colorGradiant}>
            {initOptions.locales.length}
          </Badge>
        ),
      },
    ];
  }

  items = [
    ...items,
    {
      icon: <IconVersions size={20} />,
      label: 'Homarr version',
      content: (
        <Group position="right">
          <Badge variant="gradient" gradient={colorGradiant}>
            {CURRENT_VERSION}
          </Badge>
          {newVersionAvailable && (
            <HoverCard shadow="md" position="top" withArrow>
              <HoverCard.Target>
                <motion.div
                  initial={{ scale: 1.2 }}
                  animate={{
                    scale: [0.8, 1.10, 1],
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
                is available ! Current version: {CURRENT_VERSION}
              </HoverCard.Dropdown>
            </HoverCard>
          )}
        </Group>
      ),
    },
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
