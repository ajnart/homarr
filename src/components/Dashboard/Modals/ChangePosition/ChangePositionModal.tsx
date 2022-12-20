import { Button, Flex, Grid, NumberInput, Select, SelectItem } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'next-i18next';
import { useConfigContext } from '../../../../config/provider';

interface ChangePositionModalProps {
  initialX: number;
  initialY: number;
  initialWidth: number;
  initialHeight: number;
  widthData: SelectItem[];
  heightData: SelectItem[];
  onSubmit: (x: number, y: number, width: number, height: number) => void;
  onCancel: () => void;
}

export const ChangePositionModal = ({
  initialX,
  initialY,
  initialWidth,
  initialHeight,
  widthData,
  heightData,
  onCancel,
  onSubmit,
}: ChangePositionModalProps) => {
  const { name: configName } = useConfigContext();

  const form = useForm<FormType>({
    initialValues: {
      x: initialX,
      y: initialY,
      width: initialWidth,
      height: initialHeight,
    },
    validateInputOnChange: true,
    validateInputOnBlur: true,
  });

  const handleSubmit = () => {
    if (!configName) {
      return;
    }

    onSubmit(form.values.x, form.values.y, form.values.width, form.values.height);
  };

  const { t } = useTranslation('common');

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Grid>
        <Grid.Col xs={12} md={6}>
          <NumberInput
            max={99}
            min={0}
            label="X Position"
            description="0 or higher"
            {...form.getInputProps('x')}
          />
        </Grid.Col>

        <Grid.Col xs={12} md={6}>
          <NumberInput
            max={99}
            min={0}
            label="Y Position"
            description="0 or higher"
            {...form.getInputProps('y')}
          />
        </Grid.Col>
      </Grid>

      <Grid>
        <Grid.Col xs={12} md={6}>
          <Select
            data={widthData}
            max={24}
            min={1}
            label="Width"
            description={`Between ${widthData.at(0)?.label} and ${widthData.at(-1)?.label}`}
            {...form.getInputProps('width')}
          />
        </Grid.Col>

        <Grid.Col xs={12} md={6}>
          <Select
            data={heightData}
            max={24}
            min={1}
            label="Height"
            description={`Between ${heightData.at(0)?.label} and ${heightData.at(-1)?.label}`}
            {...form.getInputProps('height')}
          />
        </Grid.Col>
      </Grid>

      <Flex justify="end" gap="sm" mt="md">
        <Button onClick={() => onCancel()} variant="light" color="gray">
          {t('cancel')}
        </Button>
        <Button type="submit">{t('save')}</Button>
      </Flex>
    </form>
  );
};

type FormType = {
  x: number;
  y: number;
  width: number;
  height: number;
};
