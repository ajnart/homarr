import { Group, Space, Stack, Text, UnstyledButton } from '@mantine/core';
import { closeModal } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { IconBox, IconBoxAlignTop, IconStack } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useConfigContext } from '~/config/provider';
import { useConfigStore } from '~/config/store';
import { openContextModalGeneric } from '~/tools/mantineModalManagerExtensions';
import { generateDefaultApp } from '~/tools/shared/app';
import { AppType } from '~/types/app';

import { CategoryEditModalInnerProps } from '../../../../Wrappers/Category/CategoryEditModal';
import { useStyles } from '../Shared/styles';
import { getLowestWrapper } from '~/tools/config/wrapper-finder';
import { ConfigType } from '~/types/config';

interface AvailableElementTypesProps {
  modalId: string;
  onOpenIntegrations: () => void;
}

export const AvailableElementTypes = ({
  modalId,
  onOpenIntegrations: onOpenWidgets,
}: AvailableElementTypesProps) => {
  const { t } = useTranslation('layout/element-selector/selector');
  const { config, name: configName } = useConfigContext();
  const { updateConfig } = useConfigStore();
  const { data } = useSession();

  const onClickCreateCategory = async () => {
    openContextModalGeneric<CategoryEditModalInnerProps>({
      modal: 'categoryEditModal',
      title: t('category.newName'),
      withCloseButton: false,
      innerProps: {
        category: {
          id: uuidv4(),
          name: t('category.defaultName'),
          position: 0, // doesn't matter, is being overwritten
        },
        onSuccess: async (category) => {
          if (!configName) return;

          await updateConfig(configName, (previousConfig) => ({
            ...previousConfig,
            wrappers: [
              ...previousConfig.wrappers,
              {
                id: uuidv4(),
                // Thank you ChatGPT ;)
                position: previousConfig.categories.length + 1,
              },
            ],
            categories: [
              ...previousConfig.categories,
              {
                id: uuidv4(),
                name: category.name,
                position: previousConfig.categories.length + 1,
              },
            ],
          })).then(() => {
            closeModal(modalId);
            showNotification({
              title: t('category.created.title'),
              message: t('category.created.message', { name: category.name }),
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
          name={t('apps')}
          icon={<IconBox size={40} strokeWidth={1.3} />}
          onClick={() => {
            openContextModalGeneric<{ app: AppType; allowAppNamePropagation: boolean }>({
              modal: 'editApp',
              innerProps: {
                app: generateDefaultApp(getLowestWrapper(config as ConfigType)?.id ?? 'default'),
                allowAppNamePropagation: true,
              },
              size: 'xl',
            });
          }}
        />
        <ElementItem
          name={t('widgets')}
          icon={<IconStack size={40} strokeWidth={1.3} />}
          onClick={onOpenWidgets}
        />
        <ElementItem
          name={t('categories')}
          icon={<IconBoxAlignTop size={40} strokeWidth={1.3} />}
          onClick={onClickCreateCategory}
        />
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
