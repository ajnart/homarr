import {
  ActionIcon,
  Anchor,
  Button,
  Card,
  Center,
  Flex,
  Group,
  Loader,
  Modal,
  NumberInput,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAlertTriangle, IconClick, IconListSearch } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { InfoCard } from '~/components/InfoCard/InfoCard';
import { City } from '~/server/api/routers/weather';
import { api } from '~/utils/api';

import { IntegrationOptionsValueType } from '../WidgetsEditModal';

type LocationSelectionProps = {
  widgetId: string;
  propName: string;
  value: any;
  handleChange: (key: string, value: IntegrationOptionsValueType) => void;
  info?: boolean;
  infoLink?: string;
};

export const LocationSelection = ({
  widgetId,
  propName: key,
  value,
  handleChange,
  info,
  infoLink,
}: LocationSelectionProps) => {
  const { t } = useTranslation('widgets/location');
  const [query, setQuery] = useState(value.name ?? '');
  const [opened, { open, close }] = useDisclosure(false);
  const selectionEnabled = query.length > 1;
  const emptyLocation = t('form.empty');

  const onCitySelected = (city: City) => {
    close();
    handleChange(key, {
      name: city.name,
      latitude: city.latitude,
      longitude: city.longitude,
    });
    setQuery(city.name);
  };

  return (
    <>
      <Card>
        <Stack spacing="xs">
          <Flex direction="row" justify="space-between" wrap="nowrap">
            <Title order={5}>{t(`modules/${widgetId}:descriptor.settings.${key}.label`)}</Title>
            {info && (
              <InfoCard
                message={t(`modules/${widgetId}:descriptor.settings.${key}.info`)}
                link={infoLink}
              />
            )}
          </Flex>

          <Group noWrap align="end">
            <TextInput
              w="100%"
              label={t('form.field.query')}
              value={query}
              onChange={(ev) => {
                setQuery(ev.currentTarget.value);
                handleChange(key, {
                  name: ev.currentTarget.value,
                  longitude: '',
                  latitude: '',
                });
              }}
            />
            <Tooltip hidden={selectionEnabled} label={t('form.button.search.disabledTooltip')}>
              <div>
                <Button
                  disabled={!selectionEnabled}
                  onClick={() => {
                    if (selectionEnabled) open();
                  }}
                  variant="light"
                  leftIcon={<IconListSearch size={16} />}
                >
                  {t('form.button.search.label')}
                </Button>
              </div>
            </Tooltip>
          </Group>

          <Group grow>
            <NumberInput
              value={value.latitude}
              onChange={(inputValue) => {
                if (typeof inputValue !== 'number') return;
                handleChange(key, {
                  ...value,
                  name: emptyLocation,
                  latitude: inputValue,
                });
                setQuery(emptyLocation);
              }}
              precision={5}
              label={t('form.field.latitude')}
              hideControls
            />
            <NumberInput
              value={value.longitude}
              onChange={(inputValue) => {
                if (typeof inputValue !== 'number') return;
                handleChange(key, {
                  ...value,
                  name: emptyLocation,
                  longitude: inputValue,
                });
                setQuery(emptyLocation);
              }}
              precision={5}
              label={t('form.field.longitude')}
              hideControls
            />
          </Group>
        </Stack>
      </Card>
      <CitySelectModal
        opened={opened}
        closeModal={close}
        query={query}
        onCitySelected={onCitySelected}
      />
    </>
  );
};

type CitySelectModalProps = {
  opened: boolean;
  closeModal: () => void;
  query: string;
  onCitySelected: (location: City) => void;
};

const CitySelectModal = ({ opened, closeModal, query, onCitySelected }: CitySelectModalProps) => {
  const { t } = useTranslation('widgets/location');
  const { isLoading, data, isError } = api.weather.findCity.useQuery(
    { query },
    {
      retry: false,
      enabled: opened,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );

  if (isError === true)
    return (
      <Modal
        title={t('modal.title') + ' - ' + query}
        size="xl"
        opened={opened}
        onClose={closeModal}
        zIndex={250}
      >
        <Center>
          <Stack align="center">
            <IconAlertTriangle />
            <Title order={6}>{t('modal.table.nothingFound.title')}</Title>
            <Text>{t('modal.table.nothingFound.description')}</Text>
          </Stack>
        </Center>
      </Modal>
    );

  const formatter = Intl.NumberFormat('en', { notation: 'compact' });

  return (
    <Modal
      title={t('modal.title') + ' - ' + query}
      size="xl"
      opened={opened}
      onClose={closeModal}
      zIndex={250}
    >
      <Stack>
        <Table striped>
          <thead>
            <tr>
              <th style={{ width: '70%' }}>{t('modal.table.header.city')}</th>
              <th style={{ width: '50%' }}>{t('modal.table.header.country')}</th>
              <th>{t('modal.table.header.coordinates')}</th>
              <th>{t('modal.table.header.population')}</th>
              <th style={{ width: 40 }} />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5}>
                  <Group position="center">
                    <Loader />
                  </Group>
                </td>
              </tr>
            )}
            {data?.results.map((city) => (
              <tr key={city.id}>
                <td>
                  <Text style={{ whiteSpace: 'nowrap' }}>{city.name}</Text>
                </td>
                <td>
                  <Text style={{ whiteSpace: 'nowrap' }}>{city.country}</Text>
                </td>
                <td>
                  <Anchor
                    target="_blank"
                    href={`https://www.google.com/maps/place/${city.latitude},${city.longitude}`}
                  >
                    <Text style={{ whiteSpace: 'nowrap' }}>
                      {city.latitude}, {city.longitude}
                    </Text>
                  </Anchor>
                </td>
                <td>
                  {city.population ? (
                    <Text style={{ whiteSpace: 'nowrap' }}>
                      {formatter.format(city.population)}
                    </Text>
                  ) : (
                    <Text color="dimmed"> {t('modal.table.population.fallback')}</Text>
                  )}
                </td>
                <td>
                  <Tooltip
                    label={t('modal.table.action.select', {
                      city: city.name,
                      countryCode: city.country_code,
                    })}
                  >
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => {
                        onCitySelected(city);
                      }}
                    >
                      <IconClick size={16} />
                    </ActionIcon>
                  </Tooltip>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Group position="right">
          <Button variant="light" onClick={() => closeModal()}>
            {t('common:cancel')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
