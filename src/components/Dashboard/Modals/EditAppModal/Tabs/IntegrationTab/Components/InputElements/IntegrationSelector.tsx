/* eslint-disable @next/next/no-img-element */
import { Group, Select, SelectItem, Text } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { useTranslation } from 'next-i18next';
import { forwardRef } from 'react';
import {
  IntegrationField,
  integrationFieldDefinitions,
  integrationFieldProperties,
  AppIntegrationPropertyType,
  AppIntegrationType,
  AppType,
} from '../../../../../../../../types/app';

interface IntegrationSelectorProps {
  form: UseFormReturnType<AppType, (item: AppType) => AppType>;
}

export const IntegrationSelector = ({ form }: IntegrationSelectorProps) => {
  const { t } = useTranslation('layout/modals/add-app');

  const data: SelectItem[] = [
    {
      value: 'sabnzbd',
      image: 'https://cdn.jsdelivr.net/gh/walkxhub/dashboard-icons/png/sabnzbd.png',
      label: 'SABnzbd',
    },
    {
      value: 'deluge',
      image: 'https://cdn.jsdelivr.net/gh/walkxhub/dashboard-icons/png/deluge.png',
      label: 'Deluge',
    },
    {
      value: 'transmission',
      image: 'https://cdn.jsdelivr.net/gh/walkxhub/dashboard-icons/png/transmission.png',
      label: 'Transmission',
    },
    {
      value: 'qBittorrent',
      image: 'https://cdn.jsdelivr.net/gh/walkxhub/dashboard-icons/png/qbittorrent.png',
      label: 'qBittorrent',
    },
    {
      value: 'jellyseerr',
      image: 'https://cdn.jsdelivr.net/gh/walkxhub/dashboard-icons/png/jellyseerr.png',
      label: 'Jellyseerr',
    },
    {
      value: 'overseerr',
      image: 'https://cdn.jsdelivr.net/gh/walkxhub/dashboard-icons/png/overseerr.png',
      label: 'Overseerr',
    },
    {
      value: 'sonarr',
      image: 'https://cdn.jsdelivr.net/gh/walkxhub/dashboard-icons/png/sonarr.png',
      label: 'Sonarr',
    },
    {
      value: 'radarr',
      image: 'https://cdn.jsdelivr.net/gh/walkxhub/dashboard-icons/png/radarr.png',
      label: 'Radarr',
    },
    {
      value: 'lidarr',
      image: 'https://cdn.jsdelivr.net/gh/walkxhub/dashboard-icons/png/lidarr.png',
      label: 'Lidarr',
    },
    {
      value: 'readarr',
      image: 'https://cdn.jsdelivr.net/gh/walkxhub/dashboard-icons/png/readarr.png',
      label: 'Readarr',
    },
  ].filter((x) => Object.keys(integrationFieldProperties).includes(x.value));

  const getNewProperties = (value: string | null): AppIntegrationPropertyType[] => {
    if (!value) return [];
    const integrationType = value as Exclude<AppIntegrationType['type'], null>;
    if (integrationType === null) {
      return [];
    }

    const requiredProperties = Object.entries(integrationFieldDefinitions).filter(([k, v]) => {
      const val = integrationFieldProperties[integrationType];
      return val.includes(k as IntegrationField);
    })!;
    return requiredProperties.map(([k, value]) => ({
      type: value.type,
      field: k as IntegrationField,
      value: undefined,
      isDefined: false,
    }));
  };

  const inputProps = form.getInputProps('integration.type');

  return (
    <Select
      label={t('integration.type.label')}
      description={t('integration.type.description')}
      placeholder={t('integration.type.placeholder')}
      itemComponent={SelectItemComponent}
      data={data}
      maxDropdownHeight={250}
      dropdownPosition="bottom"
      clearable
      variant="default"
      searchable
      filter={(value, item) =>
        item.label?.toLowerCase().includes(value.toLowerCase().trim()) ||
        item.description?.toLowerCase().includes(value.toLowerCase().trim())
      }
      icon={
        form.values.integration?.type && (
          <img
            src={data.find((x) => x.value === form.values.integration?.type)?.image}
            alt="integration"
            width={20}
            height={20}
          />
        )
      }
      onChange={(value) => {
        form.setFieldValue('integration.properties', getNewProperties(value));
        inputProps.onChange(value);
      }}
      withinPortal
      {...inputProps}
    />
  );
};

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  image: string;
  description: string;
  label: string;
}

const SelectItemComponent = forwardRef<HTMLDivElement, ItemProps>(
  ({ image, label, description, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <img src={image} alt="integration icon" width={20} height={20} />

        <div>
          <Text size="sm">{label}</Text>
          {description && (
            <Text size="xs" color="dimmed">
              {description}
            </Text>
          )}
        </div>
      </Group>
    </div>
  )
);
