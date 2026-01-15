"use client";

import { useCallback } from "react";
import {
  ActionIcon,
  Alert,
  Anchor,
  Button,
  Fieldset,
  Group,
  Loader,
  NumberInput,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { IconClick, IconListSearch } from "@tabler/icons-react";

import type { RouterOutputs } from "@homarr/api";
import { clientApi } from "@homarr/api/client";
import { createModal, useModalAction } from "@homarr/modals";
import { useScopedI18n } from "@homarr/translation/client";

import type { OptionLocation } from "../options";
import type { CommonWidgetInputProps } from "./common";
import { useWidgetInputTranslation } from "./common";
import { useFormContext } from "./form";

export const WidgetLocationInput = ({ property, kind }: CommonWidgetInputProps<"location">) => {
  const t = useWidgetInputTranslation(kind, property);
  const tLocation = useScopedI18n("widget.common.location");
  const form = useFormContext();
  const { openModal } = useModalAction(LocationSearchModal);
  const inputProps = form.getInputProps(`options.${property}`);
  const value = inputProps.value as OptionLocation;
  const selectionEnabled = value.name.length > 1;

  const handleChange = inputProps.onChange as LocationOnChange;
  const unknownLocation = tLocation("unknownLocation");

  const onLocationSelect = useCallback(
    (location: OptionLocation) => {
      handleChange(location);
      form.clearFieldError(`options.${property}.latitude`);
      form.clearFieldError(`options.${property}.longitude`);
    },
    [form, handleChange, property],
  );

  const onSearch = useCallback(() => {
    if (!selectionEnabled) return;

    openModal({
      query: value.name,
      onLocationSelect,
    });
  }, [selectionEnabled, value.name, onLocationSelect, openModal]);

  form.watch(`options.${property}.latitude`, ({ value }) => {
    if (typeof value !== "number") return;
    form.setFieldValue(`options.${property}.name`, unknownLocation);
  });

  form.watch(`options.${property}.longitude`, ({ value }) => {
    if (typeof value !== "number") return;
    form.setFieldValue(`options.${property}.name`, unknownLocation);
  });

  return (
    <Fieldset legend={t("label")}>
      <Stack gap="xs">
        <Group wrap="nowrap" align="end">
          <TextInput w="100%" label={tLocation("query")} {...form.getInputProps(`options.${property}.name`)} />
          <Tooltip hidden={selectionEnabled} label={tLocation("disabledTooltip")}>
            <div>
              <Button
                disabled={!selectionEnabled}
                onClick={onSearch}
                variant="light"
                leftSection={<IconListSearch size={16} />}
              >
                {tLocation("search")}
              </Button>
            </div>
          </Tooltip>
        </Group>

        <Group grow>
          <NumberInput
            decimalScale={5}
            label={tLocation("latitude")}
            hideControls
            {...form.getInputProps(`options.${property}.latitude`)}
          />
          <NumberInput
            decimalScale={5}
            label={tLocation("longitude")}
            hideControls
            {...form.getInputProps(`options.${property}.longitude`)}
          />
        </Group>
      </Stack>
    </Fieldset>
  );
};

type LocationOnChange = (
  location: Pick<OptionLocation, "name"> & {
    latitude: OptionLocation["latitude"] | "";
    longitude: OptionLocation["longitude"] | "";
  },
) => void;

interface LocationSearchInnerProps {
  query: string;
  onLocationSelect: (location: OptionLocation) => void;
}

const LocationSearchModal = createModal<LocationSearchInnerProps>(({ actions, innerProps }) => {
  const t = useScopedI18n("widget.common.location.table");
  const tCommon = useScopedI18n("common");
  const { data, isPending, error } = clientApi.location.searchCity.useQuery({
    query: innerProps.query,
  });

  if (error) {
    return (
      <Alert title={tCommon("error")} color="red">
        {error.message}
      </Alert>
    );
  }

  return (
    <Stack>
      <Table striped>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ width: "70%" }}>{t("header.city")}</Table.Th>
            <Table.Th style={{ width: "50%" }}>{t("header.country")}</Table.Th>
            <Table.Th>{t("header.coordinates")}</Table.Th>
            <Table.Th>{t("header.population")}</Table.Th>
            <Table.Th style={{ width: 40 }} />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {isPending && (
            <Table.Tr>
              <Table.Td colSpan={5}>
                <Group justify="center">
                  <Loader />
                </Group>
              </Table.Td>
            </Table.Tr>
          )}
          {data?.results.map((city) => (
            <LocationSelectTableRow
              key={city.id}
              city={city}
              onLocationSelect={innerProps.onLocationSelect}
              closeModal={actions.closeModal}
            />
          ))}
        </Table.Tbody>
      </Table>
      <Group justify="right">
        <Button variant="light" onClick={actions.closeModal}>
          {tCommon("action.cancel")}
        </Button>
      </Group>
    </Stack>
  );
}).withOptions({
  defaultTitle(t) {
    return t("widget.common.location.search");
  },
  size: "xl",
});

interface LocationSearchTableRowProps {
  city: RouterOutputs["location"]["searchCity"]["results"][number];
  onLocationSelect: (location: OptionLocation) => void;
  closeModal: () => void;
}

const LocationSelectTableRow = ({ city, onLocationSelect, closeModal }: LocationSearchTableRowProps) => {
  const t = useScopedI18n("widget.common.location.table");
  const onSelect = useCallback(() => {
    onLocationSelect({
      name: city.name,
      latitude: city.latitude,
      longitude: city.longitude,
    });
    closeModal();
  }, [city, onLocationSelect, closeModal]);

  const formatter = Intl.NumberFormat("en", { notation: "compact" });

  return (
    <Table.Tr>
      <Table.Td>
        <Text style={{ whiteSpace: "nowrap" }}>{city.name}</Text>
      </Table.Td>
      <Table.Td>
        <Text style={{ whiteSpace: "nowrap" }}>{city.country}</Text>
      </Table.Td>
      <Table.Td>
        <Anchor target="_blank" href={`https://www.google.com/maps/place/${city.latitude},${city.longitude}`}>
          <Text style={{ whiteSpace: "nowrap" }}>
            {city.latitude}, {city.longitude}
          </Text>
        </Anchor>
      </Table.Td>
      <Table.Td>
        {city.population ? (
          <Text style={{ whiteSpace: "nowrap" }}>{formatter.format(city.population)}</Text>
        ) : (
          <Text c="gray"> {t("population.fallback")}</Text>
        )}
      </Table.Td>
      <Table.Td>
        <Tooltip
          label={t("action.select", {
            city: city.name,
            countryCode: city.country_code ?? "??",
          })}
        >
          <ActionIcon color="red" variant="subtle" onClick={onSelect}>
            <IconClick size={16} />
          </ActionIcon>
        </Tooltip>
      </Table.Td>
    </Table.Tr>
  );
};
