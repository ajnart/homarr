import { Group, Space, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconBox, IconPlug, IconTextResize } from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import { ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { openContextModalGeneric } from '../../../../../../tools/mantineModalManagerExtensions';
import { ServiceType } from '../../../../../../types/service';
import { useStyles } from '../Shared/styles';

interface AvailableElementTypesProps {
  onOpenIntegrations: () => void;
  onOpenStaticElements: () => void;
}

export const AvailableElementTypes = ({
  onOpenIntegrations,
  onOpenStaticElements,
}: AvailableElementTypesProps) => {
  const { t } = useTranslation('layout/element-selector/selector');

  return (
    <>
      <Text color="dimmed">{t('modal.text')}</Text>
      <Space h="lg" />
      <Group spacing="md" grow>
        <ElementItem
          name="Service"
          icon={<IconBox size={40} strokeWidth={1.3} />}
          onClick={() => {
            openContextModalGeneric<{ service: ServiceType }>({
              modal: 'editService',
              innerProps: {
                service: {
                  id: uuidv4(),
                  name: 'Your service',
                  url: 'https://homarr.dev',
                  appearance: {
                    iconUrl: '/imgs/logo/logo.png',
                  },
                  network: {
                    enabledStatusChecker: false,
                    okStatus: [],
                  },
                  integration: {
                    type: 'deluge',
                    properties: {},
                  },
                },
              },
              size: 'xl',
            });
          }}
        />
        <ElementItem
          name="Integration"
          icon={<IconPlug size={40} strokeWidth={1.3} />}
          onClick={onOpenIntegrations}
        />
        <ElementItem
          name="Static Element"
          icon={<IconTextResize size={40} strokeWidth={1.3} />}
          onClick={onOpenStaticElements}
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
        {icon}
        <Text className={classes.elementName} weight={500} size="sm">
          {name}
        </Text>
      </Stack>
    </UnstyledButton>
  );
};
