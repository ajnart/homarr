import { Grid, NumberInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { ContextModalProps } from '@mantine/modals';
import { TileBaseType } from '../../../../types/tile';

export const ChangePositionModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<{ type: 'service' | 'type'; tile: TileBaseType }>) => {
  const form = useForm({
    initialValues: {
      area: innerProps.tile.area,
      shape: innerProps.tile.shape,
    },
  });

  return (
    <>
      <Grid>
        <Grid.Col xs={12} md={6}>
          <NumberInput label="X Position" {...form.getInputProps('area.tile.shape.location.x')} />
        </Grid.Col>

        <Grid.Col xs={12} md={6}>
          <NumberInput label="Y Position" {...form.getInputProps('area.tile.shape.location.y')} />
        </Grid.Col>
      </Grid>
    </>
  );
};
