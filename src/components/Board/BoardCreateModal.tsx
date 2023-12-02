import { ActionIcon, Button, Group, Loader, Stack, Switch, TextInput } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { useDebouncedValue } from '@mantine/hooks';
import { ContextModalProps, closeModal } from '@mantine/modals';
import { IconAlertTriangle, IconCheck, IconPencil, IconPencilOff } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { z } from 'zod';
import { api } from '~/utils/api';
import { createBoardSchema } from '~/validations/boards';

export const CreateBoardModal = ({ id }: { id: string }) => {
  const [autoBoardName, setAutoBoardName] = useState(true);
  const router = useRouter();
  const form = useForm<FormType>({
    validate: zodResolver(createBoardSchema),
    validateInputOnBlur: true,
    initialValues: {
      pageTitle: '',
      boardName: '',
      allowGuests: false,
    },
  });
  const [debouncedRouteName] = useDebouncedValue(form.values.boardName, 500);
  const { data: boardNameAvailable, isFetching } = api.boards.checkNameAvailable.useQuery(
    { boardName: debouncedRouteName },
    { enabled: !!debouncedRouteName }
  );
  const { mutate: createBoard, isLoading, isSuccess } = api.boards.create.useMutation();
  const utils = api.useContext();

  const handleSubmit = (values: FormType) => {
    if (!boardNameAvailable) return;
    createBoard(values, {
      onSuccess: async () => {
        await router.push(`/board/${values.boardName}`);
        closeModal(id);
        utils.boards.checkNameAvailable.invalidate({ boardName: values.boardName });
      },
    });
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <Group grow>
          <TextInput
            // TODO: Add translations
            label="Page Title"
            description="The title of the page as it shows on your browser tab"
            required
            {...form.getInputProps('pageTitle')}
            onChange={(e) => {
              form.getInputProps('pageTitle').onChange(e);
              if (!autoBoardName) return;
              form.setFieldValue(
                'boardName',
                e.currentTarget.value
                  .replace(/([A-z0-9])[^A-z0-9]+([A-z0-9])/g, '$1-$2')
                  .replace(/([A-z0-9])[^A-z0-9\-]+([A-z0-9])/g, '$1-$2')
                  .replace(/[^A-z\-0-9]+/g, '')
                  .replace(/-+/g, '-')
                  .toLowerCase()
              );
            }}
          />
          <TextInput
            label="Routename"
            description="The name that will be used in the URL to access your board"
            required
            {...form.getInputProps('boardName')}
            readOnly={autoBoardName}
            rightSection={
              <ActionIcon variant="transparent" onClick={() => setAutoBoardName((c) => !c)}>
                {autoBoardName ? (
                  <IconPencil size="1.25rem" stroke={1.5} />
                ) : (
                  <IconPencilOff size="1.25rem" stroke={1.5} />
                )}
              </ActionIcon>
            }
            icon={
              debouncedRouteName !== form.values.boardName || isFetching ? (
                <Loader size="xs" />
              ) : boardNameAvailable === true ? (
                <IconCheck size="1.25rem" stroke={1.5} color="green" />
              ) : boardNameAvailable === false ? (
                <IconAlertTriangle size="1.25rem" stroke={1.5} color="red" />
              ) : null
            }
          />
        </Group>
        <Switch
          label="Allow Guests"
          description="Allow users that are not logged in to view your board"
          {...form.getInputProps('allowGuests')}
        />
        <Group position="right">
          <Button type="button" color="gray" variant="subtle" onClick={() => closeModal(id)}>
            Cancel
          </Button>
          <Button type="submit" color="teal" loading={isLoading || isSuccess}>
            Create
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

type FormType = z.infer<typeof createBoardSchema>;
