import { Flex, Tabs } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { useGetDashboardIcons } from '../../../../../../hooks/icons/useGetDashboardIcons';
import { AppType } from '../../../../../../types/app';
import { IconSelector } from './IconSelector';

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
  const { data } = useGetDashboardIcons();

  if (!data) {
    return null;
  }

  return (
    <Tabs.Panel value="appearance" pt="lg">
      <Flex gap={5}>
        <IconSelector form={form} data={data} />
      </Flex>
    </Tabs.Panel>
  );
};
