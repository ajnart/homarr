import { Group, Space, Stack, Text, UnstyledButton } from '@mantine/core';
import { closeModal } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { IconBox, IconBoxAlignTop, IconStack } from '@tabler/icons';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useConfigContext } from '../../../../../../config/provider';
import { useConfigStore } from '../../../../../../config/store';
import { openContextModalGeneric } from '../../../../../../tools/mantineModalManagerExtensions';
import { AppType } from '../../../../../../types/app';
import { appTileDefinition } from '../../../../Tiles/Apps/AppTile';
import { CategoryEditModalInnerProps } from '../../../../Wrappers/Category/CategoryEditModal';
import { useStyles } from '../Shared/styles';

interface AvailableElementTypesProps {
  modalId: string;
  onOpenIntegrations: () => void;
  onOpenStaticElements: () => void;
}

export const AvailableElementTypes = ({
  modalId,
  onOpenIntegrations: onOpenWidgets,
  onOpenStaticElements,
}: AvailableElementTypesProps) => {
  const { t } = useTranslation('layout/element-selector/selector');
  const { config, name: configName } = useConfigContext();
  const { updateConfig } = useConfigStore();
  const getLowestWrapper = () => config?.wrappers.sort((a, b) => a.position - b.position)[0];

  const onClickCreateCategory = async () => {
    openContextModalGeneric<CategoryEditModalInnerProps>({
      modal: 'categoryEditModal',
      title: 'Name of new category',
      withCloseButton: false,
      innerProps: {
        category: {
          id: uuidv4(),
          name: 'New category',
          position: 0,
        },
        onSuccess: async (category) => {
          if (!configName) return;

          await updateConfig(configName, (previousConfig) => ({
            ...previousConfig,
            wrappers:
              previousConfig.wrappers.length <= previousConfig.categories.length
                ? [
                    ...previousConfig.wrappers,
                    {
                      id: uuidv4(),
                      position: previousConfig.categories.length,
                    },
                  ]
                : previousConfig.wrappers,
            categories: [
              ...previousConfig.categories,
              {
                id: uuidv4(),
                name: category.name,
                position: previousConfig.categories.length,
              },
            ],
          })).then(() => {
            closeModal(modalId);
            showNotification({
              title: 'Category created',
              message: `The category ${category.name} has been created`,
              color: 'teal',
            });
          });
        },
      },
    });
  };

  return (
    <>
      <Text color="dimmed">{t('modal.text')}</Text>
      <Space h="lg" />
      <Group spacing="md" grow>
        <ElementItem
          name="Apps"
          icon={<IconBox size={40} strokeWidth={1.3} />}
          onClick={() => {
            openContextModalGeneric<{ app: AppType; allowAppNamePropagation: boolean }>({
              modal: 'editApp',
              innerProps: {
                app: {
                  id: uuidv4(),
                  name: 'Your app',
                  url: 'https://homarr.dev',
                  appearance: {
                    iconUrl: '/imgs/logo/logo.png',
                  },
                  network: {
                    enabledStatusChecker: true,
                    okStatus: [200],
                  },
                  behaviour: {
                    isOpeningNewTab: true,
                    externalUrl: '',
                  },

                  area: {
                    type: 'wrapper',
                    properties: {
                      id: getLowestWrapper()?.id ?? 'default',
                    },
                  },
                  shape: {},
                  integration: {
                    type: null,
                    properties: [],
                  },
                },
                allowAppNamePropagation: true,
              },
              size: 'xl',
            });
          }}
        />
        <ElementItem
          name="Widgets"
          icon={<IconStack size={40} strokeWidth={1.3} />}
          onClick={onOpenWidgets}
        />
        <ElementItem
          name="Category"
          icon={<IconBoxAlignTop size={40} strokeWidth={1.3} />}
          onClick={onClickCreateCategory}
        />
        {/*<ElementItem
          name="Static Element"
          icon={<IconTextResize size={40} strokeWidth={1.3} />}
          onClick={onOpenStaticElements}
        />*/}
      </Group>
    </>
  );
};

interface ElementItemProps {
  icon: ReactNode;
  name: string;
  onClick: () => void;
}

const ElementItem = ({ name, icon, onClick }: ElementItemProps) => {
  const { classes, cx } = useStyles();
  return (
    <UnstyledButton
      className={cx(classes.elementButton, classes.styledButton)}
      onClick={onClick}
      py="md"
    >
      <Stack className={classes.elementStack} align="center" spacing={5}>
        <motion.div
          // On hover zoom in
          whileHover={{ scale: 1.2 }}
        >
          {icon}
        </motion.div>
        <Text className={classes.elementName} weight={500} size="sm">
          {name}
        </Text>
      </Stack>
    </UnstyledButton>
  );
};
