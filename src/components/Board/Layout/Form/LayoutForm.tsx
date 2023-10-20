import { Button, Checkbox, Grid, Group, Input, Slider, Stack, TextInput } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { z } from 'zod';
import { api } from '~/utils/api';
import { layoutCreateFormSchema } from '~/validations/layouts';

import { LayoutPreviewProps } from './Preview/DesktopPreview';

type LayoutFormProps = {
  kind: 'mobile' | 'desktop';
  columns: {
    min: number;
    default: number;
    max: number;
  };
  boardId: string;
  preview: (props: LayoutPreviewProps) => JSX.Element;
  onClose: () => void;
};

export const LayoutForm = ({
  kind,
  columns,
  boardId,
  preview: Preview,
  onClose,
}: LayoutFormProps) => {
  const sliderMarks = useMemo(calculateSliderMarks(columns), [columns.min, columns.max]);
  const router = useRouter();
  const { mutate: createLayout } = api.layouts.create.useMutation();

  const form = useForm<FormType>({
    initialValues: {
      showRightSidebar: false,
      showLeftSidebar: false,
      columns: columns.default,
      name: '',
    },
    validate: zodResolver(layoutCreateFormSchema),
  });

  console.log(router);

  const handleSubmit = (values: FormType) => {
    createLayout(
      {
        ...values,
        kind,
        boardId,
      },
      {
        onSuccess: ({ id }) => {
          onClose();
          router.replace({
            query: {
              ...router.query,
              layout: id,
            },
          });
        },
      }
    );
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <Grid>
          <Grid.Col span={12} md={6}>
            <Preview {...form.values} />
          </Grid.Col>
          <Grid.Col span={12} md={6}>
            <Stack>
              <Checkbox
                label="Show left sidebar"
                {...form.getInputProps('showLeftSidebar', { type: 'checkbox' })}
              />
              <Checkbox
                label="Show right sidebar"
                {...form.getInputProps('showRightSidebar', { type: 'checkbox' })}
              />
              <Input.Wrapper label="Columns">
                <Slider
                  marks={sliderMarks}
                  {...form.getInputProps('columns')}
                  min={columns.min}
                  max={columns.max}
                  step={1}
                  thumbLabel=""
                />
              </Input.Wrapper>
            </Stack>
          </Grid.Col>
          <Grid.Col span={12}>
            <TextInput label="Layout name" {...form.getInputProps('name')} />
          </Grid.Col>
        </Grid>
        <Group position="right">
          <Button onClick={onClose} type="button" variant="subtle" color="gray">
            Cancel
          </Button>
          <Button type="submit" color="teal">
            Create layout
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

type FormType = z.infer<typeof layoutCreateFormSchema>;

const calculateSliderMarks = (columns: Omit<LayoutFormProps['columns'], 'default'>) => () => {
  return Array.from({ length: 5 })
    .map((_, index) => index * ((columns.max - columns.min) / 4) + columns.min)
    .map((value) => ({ value, label: value.toString() }));
};
