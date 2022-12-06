import { createStyles, Flex, Tabs, TextInput } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { IconPhoto } from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import { ServiceType } from '../../../../../../types/service';
import { IconSelector } from './IconSelector/IconSelector';

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
      <Flex gap={5}>
        <TextInput
          defaultValue={form.values.appearance.iconUrl}
          className={classes.textInput}
          icon={<Image />}
          label="Service Icon"
          description="Logo of your service displayed in your dashboard. Must return a body content containg an image"
          variant="default"
          withAsterisk
          required
          {...form.getInputProps('appearance.iconUrl')}
        />
        <IconSelector
          onChange={(item) =>
            form.setValues({
              appearance: {
                iconUrl: item.url,
              },
            })
          }
        />
      </Flex>
    </Tabs.Panel>
  );
};

const useStyles = createStyles(() => ({
  textInput: {
    flexGrow: 1,
  },
  iconImage: {
    objectFit: 'contain',
    width: 20,
    height: 20,
  },
}));
