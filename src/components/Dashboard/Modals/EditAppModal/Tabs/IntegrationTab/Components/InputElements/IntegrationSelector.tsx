/* eslint-disable @next/next/no-img-element */
import { Group, Image, Select, SelectItem, Text } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { useTranslation } from 'next-i18next';
import { forwardRef } from 'react';
import {
  AppIntegrationPropertyType,
  AppIntegrationType,
  AppType,
  IntegrationField,
  integrationFieldDefinitions,
  integrationFieldProperties,
} from '~/types/app';

interface IntegrationSelectorProps {
  form: UseFormReturnType<AppType, (item: AppType) => AppType>;
}

export const IntegrationSelector = ({ form }: IntegrationSelectorProps) => {
  const { t } = useTranslation('layout/modals/add-app');

  const data = availableIntegrations.filter((x) =>
    Object.keys(integrationFieldProperties).includes(x.value)
  );

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

export const availableIntegrations = [
  {
    value: 'sabnzbd',
    image: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/sabnzbd.png',
    label: 'SABnzbd',
  },
  {
    value: 'nzbGet',
    image: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/nzbget.png',
    label: 'NZBGet',
  },
  {
    value: 'deluge',
    image: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/deluge.png',
    label: 'Deluge',
  },
  {
    value: 'transmission',
    image: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/transmission.png',
    label: 'Transmission',
  },
  {
    value: 'qBittorrent',
    image: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/qbittorrent.png',
    label: 'qBittorrent',
  },
  {
    value: 'jellyseerr',
    image: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/jellyseerr.png',
    label: 'Jellyseerr',
  },
  {
    value: 'overseerr',
    image: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/overseerr.png',
    label: 'Overseerr',
  },
  {
    value: 'sonarr',
    image: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/sonarr.png',
    label: 'Sonarr',
  },
  {
    value: 'radarr',
    image: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/radarr.png',
    label: 'Radarr',
  },
  {
    value: 'lidarr',
    image: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/lidarr.png',
    label: 'Lidarr',
  },
  {
    value: 'readarr',
    image: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/readarr.png',
    label: 'Readarr',
  },
  {
    value: 'prowlarr',
    image: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/prowlarr.png',
    label: 'Prowlarr',
  },
  {
    value: 'jellyfin',
    image: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/jellyfin.png',
    label: 'Jellyfin (and Emby)',
  },
  {
    value: 'plex',
    image: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/plex.png',
    label: 'Plex',
  },
  {
    value: 'pihole',
    image: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/pi-hole.png',
    label: 'PiHole',
  },
  {
    value: 'adGuardHome',
    image: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/adguard-home.png',
    label: 'AdGuard Home',
  },
  {
    value: 'homeAssistant',
    image: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/home-assistant.png',
    label: 'Home Assistant',
  },
  {
    value: 'openmediavault',
    image: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/openmediavault.png',
    label: 'OpenMediaVault',
  },
  {
    value: 'proxmox',
    image: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@master/png/proxmox.png',
    label: 'Proxmox',
  },
  {
    value: 'tdarr',
    image: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/tdarr.png',
    label: 'Tdarr',
  }
] as const satisfies Readonly<SelectItem[]>;
