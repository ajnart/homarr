import { Tabs, TextInput, createStyles } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { IconPhoto } from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import { ServiceType } from '../../../../../../types/service';

interface AppearanceTabProps {
  form: UseFormReturnType<ServiceType, (values: ServiceType) => ServiceType>;
}

export const AppearanceTab = ({ form }: AppearanceTabProps) => {
  const { t } = useTranslation('');
  const { classes } = useStyles();

  const Image = () => {
    if (form.values.appearance.iconUrl !== undefined) {
      // disabled due to too many dynamic targets for next image cache
      // eslint-disable-next-line @next/next/no-img-element
      return <img className={classes.iconImage} src={form.values.appearance.iconUrl} alt="jife" />;
    }

    return <IconPhoto />;
  };

  return (
    <Tabs.Panel value="appearance" pt="lg">
      <TextInput
        icon={<Image />}
        label="Service Icon"
        variant="default"
        defaultValue={form.values.appearance.iconUrl}
        {...form.getInputProps('appearance.iconUrl')}
        withAsterisk
        required
      />
    </Tabs.Panel>
  );
};

const useStyles = createStyles(() => ({
  iconImage: {
    objectFit: 'contain',
    width: 20,
    height: 20,
  },
}));
