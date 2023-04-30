import { Flex, Tabs } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { useDebouncedValue } from '@mantine/hooks';
import { useEffect } from 'react';
import { AppType } from '../../../../../../types/app';
import { IconSelector } from './IconSelector';

import { api } from '~/utils/api';

interface AppearanceTabProps {
  form: UseFormReturnType<AppType, (values: AppType) => AppType>;
  disallowAppNameProgagation: () => void;
  allowAppNamePropagation: boolean;
}

export const AppearanceTab = ({
  form,
  disallowAppNameProgagation,
  allowAppNamePropagation,
}: AppearanceTabProps) => {
  const { data, isLoading } = useGetDashboardIcons();

  const [debouncedValue] = useDebouncedValue(form.values.name, 500);

  useEffect(() => {
    if (allowAppNamePropagation !== true) {
      return;
    }

    const matchingDebouncedIcon = data
      ?.flatMap((x) => x.entries)
      .find((x) => replaceCharacters(x.name.split('.')[0]) === replaceCharacters(debouncedValue));

    if (!matchingDebouncedIcon) {
      return;
    }

    form.setFieldValue('appearance.iconUrl', matchingDebouncedIcon.url);
  }, [debouncedValue]);

  return (
    <Tabs.Panel value="appearance" pt="lg">
      <Flex gap={5}>
        <IconSelector
          form={form}
          data={data}
          isLoading={isLoading}
          allowAppNamePropagation={allowAppNamePropagation}
          disallowAppNameProgagation={disallowAppNameProgagation}
        />
      </Flex>
    </Tabs.Panel>
  );
};

const replaceCharacters = (value: string) => value.toLowerCase().replaceAll('', '-');

export const useGetDashboardIcons = () =>
  api.icon.all.useQuery(undefined, {
    refetchOnMount: true,
    staleTime: 10 * 60 * 1000, // When opening the modal the data is only refetched every 10 minutes.
    refetchOnWindowFocus: false,
  });
