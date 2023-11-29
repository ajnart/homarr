import {
  Avatar,
  Box,
  CloseButton,
  Group,
  MultiSelect,
  MultiSelectValueProps,
  Stack,
  Text,
  rem,
} from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { forwardRef } from 'react';
import { IntegrationType, integrationTypes } from '~/server/db/items';
import { Integration } from '~/server/db/schema';
import { RouterOutputs } from '~/utils/api';

import { useBoardCustomizationFormContext } from '../form';

interface IntegrationCustomizationProps {
  allMediaIntegrations: RouterOutputs['integration']['allMedia'];
}

export const SearchCustomization = ({ allMediaIntegrations }: IntegrationCustomizationProps) => {
  const { t } = useTranslation('settings/customization/search');
  const form = useBoardCustomizationFormContext();

  return (
    <Stack spacing="sm">
      <MultiSelect
        {...form.getInputProps('search.mediaIntegrations')}
        label={t('mediaIntegrations.label')}
        description={t('mediaIntegrations.description')}
        searchable
        valueComponent={IntegrationSelectValue(allMediaIntegrations)}
        itemComponent={IntegrationSelectItem}
        data={allMediaIntegrations.map((x) => ({
          value: x.id,
          label: x.name,
          sort: x.sort,
        }))}
      />
    </Stack>
  );
};

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  sort: IntegrationType;
  label: string;
}

const IntegrationSelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ label, sort, ...others }: ItemProps, ref) => {
    return (
      <div ref={ref} {...others}>
        <Group noWrap>
          <Avatar size={20} src={integrationTypes[sort].iconUrl} />

          <Text>{label}</Text>
        </Group>
      </div>
    );
  }
);

const IntegrationSelectValue =
  (integrations: Integration[]) =>
  ({
    value,
    label,
    onRemove,
    classNames,
    ...others
  }: MultiSelectValueProps & { value: string }) => {
    const current = integrations.find((x) => x.id === value);
    return (
      <div {...others}>
        <Box
          sx={(theme) => ({
            display: 'flex',
            cursor: 'default',
            alignItems: 'center',
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
            border: `${rem(1)} solid ${
              theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[4]
            }`,
            paddingLeft: theme.spacing.xs,
            borderRadius: theme.radius.sm,
          })}
        >
          <Box mr={10}>
            <Avatar size="xs" src={integrationTypes[current!.sort].iconUrl} />
          </Box>
          <Box sx={{ lineHeight: 1, fontSize: rem(12) }}>{label}</Box>
          <CloseButton
            onMouseDown={onRemove}
            variant="transparent"
            size={22}
            iconSize={14}
            tabIndex={-1}
          />
        </Box>
      </div>
    );
  };
