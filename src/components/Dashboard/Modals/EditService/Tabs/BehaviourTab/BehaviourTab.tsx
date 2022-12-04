import { Tabs, TextInput, Switch, Text } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { IconClick } from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import { ServiceType } from '../../../../../../types/service';

interface BehaviourTabProps {
  form: UseFormReturnType<ServiceType, (values: ServiceType) => ServiceType>;
}

export const BehaviourTab = ({ form }: BehaviourTabProps) => {
  const { t } = useTranslation('');
  return (
    <Tabs.Panel value="behaviour" pt="xs">
      <TextInput
        icon={<IconClick size={16} />}
        label="On click url"
        placeholder="Override the default service url when clicking on the service"
        variant="default"
        mb="md"
        {...form.getInputProps('onClickUrl')}
      />

      <Switch
        value="disable_handle"
        label="Disable direct moving in edit modus"
        description={
          <Text color="dimmed" size="sm">
            Disables the direct movement of the tile
          </Text>
        }
        mb="md"
        {...form.getInputProps('isEditModeMovingDisabled')}
      />
      <Switch
        value="freze"
        label="Freeze tile within edit modus"
        description={
          <Text color="dimmed" size="sm">
            Disables the movement of the tile when moving others
          </Text>
        }
        {...form.getInputProps('isEditModeTileFreezed')}
      />
    </Tabs.Panel>
  );
};
