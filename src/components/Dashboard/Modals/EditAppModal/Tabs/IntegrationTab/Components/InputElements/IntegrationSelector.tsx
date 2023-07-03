/* eslint-disable @next/next/no-img-element */
import { Group, Image, Select, SelectItem, Text } from '@mantine/core';
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

export const integrationsList = [
  {
    value: 'sabnzbd',
    image: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/svg/sabnzbd.svg',
    label: 'SABnzbd',
  },
  {
    value: 'nzbGet',
    image: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/nzbget.png',
    label: 'NZBGet',
  },
  {
    value: 'deluge',
    image: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/svg/deluge.svg',
    label: 'Deluge',
  },
  {
    value: 'transmission',
    image: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/svg/transmission.svg',
    label: 'Transmission',
  },
  {
    value: 'qBittorrent',
    image: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/svg/qbittorrent.svg',
    label: 'qBittorrent',
  },
  {
    value: 'jellyseerr',
    image: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/svg/jellyseerr.svg',
    label: 'Jellyseerr',
  },
  {
    value: 'overseerr',
    image: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/svg/overseerr.svg',
    label: 'Overseerr',
  },
  {
    value: 'sonarr',
    image: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/svg/sonarr.svg',
    label: 'Sonarr',
  },
  {
    value: 'radarr',
    image: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/svg/radarr.svg',
    label: 'Radarr',
  },
  {
    value: 'lidarr',
    image: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/svg/lidarr.svg',
    label: 'Lidarr',
  },
  {
    value: 'readarr',
    image: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/svg/readarr.svg',
    label: 'Readarr',
  },
  {
    value: 'jellyfin',
    image: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/svg/jellyfin.svg',
    label: 'Jellyfin',
  },
  {
    value: 'plex',
    image: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/svg/plex.svg',
    label: 'Plex',
  },
  {
    value: 'pihole',
    image: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/svg/pi-hole.svg',
    label: 'PiHole',
  },
  {
    value: 'adGuardHome',
    image: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/svg/adguard-home.svg',
    label: 'AdGuard Home',
  },
];

export const IntegrationSelector = ({ form }: IntegrationSelectorProps) => {
  const { t } = useTranslation('layout/modals/add-app');

  const data = integrationsList.filter((x) => Object.keys(integrationFieldProperties).includes(x.value));

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
      placeholder={t('integration.type.placeholder') ?? undefined}
      itemComponent={SelectItemComponent}
      data={data}
      maxDropdownHeight={250}
      dropdownPosition="bottom"
      clearable
      variant="default"
      searchable
      zIndex={203}
      withinPortal
      filter={(value, item) =>
        item.label?.toLowerCase().includes(value.toLowerCase().trim()) ||
        item.description?.toLowerCase().includes(value.toLowerCase().trim())
      }
      icon={
        form.values.integration?.type && (
          <Image
            src={data.find((x) => x.value === form.values.integration?.type)?.image}
            alt="integration"
            width={20}
            height={20}
            fit="contain"
          />
        )
      }
      {...inputProps}
      onChange={(value) => {
        form.setFieldValue('integration.properties', getNewProperties(value));
        inputProps.onChange(value);
      }}
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
        <Image src={image} alt="integration icon" width={20} height={20} fit="contain" />

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
