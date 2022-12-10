import { Button, Flex, Grid, NumberInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { closeModal, ContextModalProps } from '@mantine/modals';
import { useConfigContext } from '../../../../config/provider';
import { useConfigStore } from '../../../../config/store';
import { ServiceType } from '../../../../types/service';
import { TileBaseType } from '../../../../types/tile';

export const ChangePositionModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<{ type: 'service' | 'type'; tile: TileBaseType }>) => {
  const updateConfig = useConfigStore((x) => x.updateConfig);
  const { name: configName } = useConfigContext();

  const form = useForm({
    initialValues: {
      tile: innerProps.tile,
    },
    validateInputOnChange: true,
    validateInputOnBlur: true,
  });

  const onSubmit = () => {
    if (!configName) {
      return;
    }

    const tileAsService = form.values.tile as ServiceType;

    updateConfig(configName, (previous) => ({
      ...previous,
      services: [...previous.services.filter((x) => x.id === tileAsService.id), tileAsService],
    }));

    closeModal(id);
  };

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Grid>
        <Grid.Col xs={12} md={6}>
          <NumberInput
            max={99}
            min={0}
            label="X Position"
            description="0 or higher"
            {...form.getInputProps('tile.shape.location.x')}
          />
        </Grid.Col>

        <Grid.Col xs={12} md={6}>
          <NumberInput
            max={99}
            min={0}
            label="Y Position"
            description="0 or higher"
            {...form.getInputProps('tile.shape.location.y')}
          />
        </Grid.Col>
      </Grid>

      <Grid>
        <Grid.Col xs={12} md={6}>
          <NumberInput
            max={24}
            min={1}
            label="Width"
            description="Between 1 and 24"
            {...form.getInputProps('tile.shape.size.width')}
          />
        </Grid.Col>

        <Grid.Col xs={12} md={6}>
          <NumberInput
            max={24}
            min={1}
            label="Height"
            description="Between 1 and 24"
            {...form.getInputProps('tile.shape.size.height')}
          />
        </Grid.Col>
      </Grid>

      <Flex justify="end" gap="sm" mt="md">
        <Button onClick={() => closeModal(id)} variant="light" color="gray">
          Cancel
        </Button>
        <Button type="submit">Change Position</Button>
      </Flex>
    </form>
  );
};
