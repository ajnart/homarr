/* eslint-disable @next/next/no-img-element */
import {
  Alert,
  Card,
  Group,
  PasswordInput,
  Select,
  SelectItem,
  Space,
  Text,
  TextInput,
} from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { IconKey, IconUser } from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import { forwardRef, useState } from 'react';
import { ServiceType } from '../../../../../../../../../types/service';
import { TextExplanation } from '../TextExplanation/TextExplanation';

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
  ];

  const [selectedItem, setSelectedItem] = useState<SelectItem>();

  return (
    <>
      <TextExplanation />
      <Space h="sm" />

      <Select
        label="Configure this service for the following integration"
        placeholder="Select your desired configuration"
        itemComponent={SelectItemComponent}
        data={data}
        maxDropdownHeight={400}
        clearable
        onSelect={(e) => {
          const item = data.find((x) => x.label === e.currentTarget.value);

          if (item === undefined) {
            setSelectedItem(undefined);
            return;
          }

          setSelectedItem(item);
        }}
        variant="default"
        mb="md"
        icon={selectedItem && <img src={selectedItem.image} alt="test" width={20} height={20} />}
      />

      {/*
      {selectedItem && (
        <Card p="md" pt="sm" radius="sm">
          <Text weight={500} mb="lg">
            Integration Configuration
          </Text>

          <Group grow>
            <TextInput
              icon={<IconUser size={16} />}
              label="Username"
              description="Optional"
              placeholder="deluge"
              variant="default"
              {...form.getInputProps('username')}
            />

            <PasswordInput
              icon={<IconKey />}
              label="Password"
              description="Optional, never share this with anybody else"
              variant="default"
              {...form.getInputProps('password')}
            />
          </Group>
        </Card>
      )}
      */}
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
