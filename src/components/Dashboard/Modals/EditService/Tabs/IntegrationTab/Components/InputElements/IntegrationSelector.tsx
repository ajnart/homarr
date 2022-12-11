/* eslint-disable @next/next/no-img-element */
import { Group, Select, SelectItem, Text } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { useTranslation } from 'next-i18next';
import { forwardRef } from 'react';
import { IntegrationsType } from '../../../../../../../../types/integration';
import {
  IntegrationField,
  integrationFieldDefinitions,
  integrationFieldProperties,
  ServiceIntegrationPropertyType,
  ServiceIntegrationType,
  ServiceType,
} from '../../../../../../../../types/service';

interface IntegrationSelectorProps {
  form: UseFormReturnType<ServiceType, (item: ServiceType) => ServiceType>;
}

export const IntegrationSelector = ({ form }: IntegrationSelectorProps) => {
  const { t } = useTranslation('');

  // TODO: read this out from integrations dynamically.
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
      value: 'qbittorrent',
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
  ].filter((x) => Object.keys(integrationFieldProperties).includes(x.value));

  const inputProps = form.getInputProps('integration.type');

  const getNewProperties = (value: string | null): ServiceIntegrationPropertyType[] => {
    if (!value) return [];
    const requiredProperties = Object.entries(integrationFieldDefinitions).filter(([k, v]) => {
      const val = integrationFieldProperties[value as ServiceIntegrationType['type']];
      return val.includes(k as IntegrationField);
    })!;
    return requiredProperties.map(([k, value]) => ({
      type: value.type,
      field: k as IntegrationField,
      value: undefined,
      isDefined: false,
    }));
  };

  return (
    <>
      <Select
        label="Integration configuration"
        description="Treats this service as the selected integration and provides you with per-service configuration"
        placeholder="Select your desired configuration"
        itemComponent={SelectItemComponent}
        data={data}
        maxDropdownHeight={400}
        clearable
        variant="default"
        mb="md"
        icon={
          form.values.integration?.type && (
            <img
              src={data.find((x) => x.value === form.values.integration?.type)?.image}
              alt="test"
              width={20}
              height={20}
            />
          )
        }
        {...inputProps}
        onChange={(value) => {
          form.setFieldValue('integration.properties', getNewProperties(value));
          console.log(`changed to value ${value}`);
          inputProps.onChange(value);
        }}
      />
    </>
  );
};

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  image: string;
  label: string;
}

const SelectItemComponent = forwardRef<HTMLDivElement, ItemProps>(
  ({ image, label, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <img src={image} alt="integration icon" width={20} height={20} />

        <div>
          <Text size="sm">{label}</Text>
        </div>
      </Group>
    </div>
  )
);
