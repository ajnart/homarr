import {
  Card,
  Stack,
  Text,
  Title,
  Group,
  TextInput,
  Button,
  NumberInput,
  Modal,
  Table,
  Tooltip,
  ActionIcon,
  Loader,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconListSearch, IconClick } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IntegrationOptionsValueType } from '../WidgetsEditModal';
import { City } from '~/server/api/routers/weather';
import { api } from '~/utils/api';

type LocationSelectionProps = {
  widgetId: string;
  propName: string;
  value: any;
  handleChange: (key: string, value: IntegrationOptionsValueType) => void;
};

export const LocationSelection = ({
  widgetId,
  propName: key,
  value,
  handleChange,
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
          <Title order={5}>{t(`modules/${widgetId}:descriptor.settings.${key}.label`)}</Title>

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
  const { isLoading, data } = api.weather.findCity.useQuery(
    { query },
    {
      enabled: opened,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );

  return (
    <Modal
      title={
        <Title order={4}>
          {t('modal.title')} - {query}
        </Title>
      }
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
                  <Text style={{ whiteSpace: 'nowrap' }}>
                    {city.latitude}, {city.longitude}
                  </Text>
                </td>
                <td>
                  {city.population ? (
                    <Text style={{ whiteSpace: 'nowrap' }}>{city.population}</Text>
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
