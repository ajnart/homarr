import { Button, Flex, Grid, NumberInput, Select, SelectItem } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'next-i18next';
import { useConfigContext } from '~/config/provider';

interface ChangePositionModalProps {
  initialX?: number;
  initialY?: number;
  initialWidth?: number;
  initialHeight?: number;
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
      x: initialX ?? null,
      y: initialY ?? null,
      width: initialWidth?.toString() ?? '',
      height: initialHeight?.toString() ?? '',
    },
    validateInputOnChange: true,
    validateInputOnBlur: true,
  });

  const handleSubmit = () => {
    if (!configName) {
      return;
    }

    const width = parseInt(form.values.width, 10);
    const height = parseInt(form.values.height, 10);

    if (
      form.values.x === null ||
      form.values.y === null ||
      Number.isNaN(width) ||
      Number.isNaN(height)
    ) {
      return;
    }

    onSubmit(form.values.x, form.values.y, width, height);
  };

  const { t } = useTranslation(['layout/modals/change-position', 'common']);

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Grid>
        <Grid.Col xs={12} md={6}>
          <NumberInput
            max={99}
            min={0}
            label={t('xPosition')}
            description={t('layout/modals/change-position:zeroOrHigher')}
            {...form.getInputProps('x')}
          />
        </Grid.Col>

        <Grid.Col xs={12} md={6}>
          <NumberInput
            max={99}
            min={0}
            label={t('layout/modals/change-position:yPosition')}
            description={t('layout/modals/change-position:zeroOrHigher')}
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
            label={t('common:attributes.width')}
            description={t('layout/modals/change-position:betweenXandY', {
              min: widthData.at(0)?.label,
              max: widthData.at(-1)?.label,
            })}
            withinPortal
            {...form.getInputProps('width')}
          />
        </Grid.Col>

        <Grid.Col xs={12} md={6}>
          <Select
            data={heightData}
            max={24}
            min={1}
            label={t('common:attributes.height')}
            description={t('layout/modals/change-position:betweenXandY', {
              min: heightData.at(0)?.label,
              max: heightData.at(-1)?.label,
            })}
            withinPortal
            {...form.getInputProps('height')}
          />
        </Grid.Col>
      </Grid>

      <Flex justify="end" gap="sm" mt="md">
        <Button onClick={() => onCancel()} variant="light" color="gray">
          {t('common:cancel')}
        </Button>
        <Button type="submit">{t('common:save')}</Button>
      </Flex>
    </form>
  );
};

type FormType = {
  x: number | null;
  y: number | null;
  width: string;
  height: string;
};
