import { Group, Space, Stack, Text, UnstyledButton } from '@mantine/core';
import { closeModal } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { IconBox, IconBoxAlignTop, IconStack } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CategoryEditModalInnerProps } from '~/components/Board/Sections/Category/CategoryEditModal';
import { openContextModalGeneric } from '~/tools/mantineModalManagerExtensions';
import { generateDefaultApp2 } from '~/tools/shared/app';

import { EditAppModalInnerProps } from '../../Items/App/EditAppModal';
import { useCategoryActions } from '../../Sections/Category/Actions/category-actions';
import { AppItem } from '../../context';
import { useStyles } from '../Shared/styles';

interface AvailableElementTypesProps {
  modalId: string;
  onOpenIntegrations: () => void;
}

export const AvailableElementTypes = ({
  modalId,
  onOpenIntegrations: onOpenWidgets,
}: AvailableElementTypesProps) => {
  const { t } = useTranslation('layout/element-selector/selector');
  const { addCategoryToEnd } = useCategoryActions();

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
          addCategoryToEnd({ name: category.name });
          closeModal(modalId);
          showNotification({
            title: t('category.created.title'),
            message: t('category.created.message', { name: category.name }),
            color: 'teal',
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
            openContextModalGeneric<EditAppModalInnerProps>({
              modal: 'editApp',
              innerProps: {
                app: generateDefaultApp2() as AppItem,
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
