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
        {...form.getInputProps('behaviour.onClickUrl')}
      />

      <Switch label="Open in new tab" {...form.getInputProps('behaviour.isOpeningNewTab')} />
    </Tabs.Panel>
  );
};
