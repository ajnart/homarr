import {
  Autocomplete,
  Box,
  createStyles,
  Group,
  Image,
  SelectItemProps,
  Stack,
  Text,
} from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { useTranslation } from 'next-i18next';
import { forwardRef } from 'react';
import { humanFileSize } from '../../../../../../tools/humanFileSize';
import { NormalizedIconRepositoryResult } from '../../../../../../tools/server/images/abstract-icons-repository';
import { AppType } from '../../../../../../types/app';
import { DebouncedAppIcon } from '../Shared/DebouncedAppIcon';

interface IconSelectorProps {
  form: UseFormReturnType<AppType, (values: AppType) => AppType>;
  data: NormalizedIconRepositoryResult[];
}

export const IconSelector = ({ form, data }: IconSelectorProps) => {
  const { t } = useTranslation('layout/modals/add-app');
  const { classes } = useStyles();

  const a = data.flatMap((repository) =>
    repository.entries.map((entry) => ({
      url: entry.url,
      label: entry.name,
      size: entry.size,
      value: entry.url,
      group: repository.name,
    }))
  );

  return (
    <Autocomplete
      itemComponent={AutoCompleteItem}
      className={classes.textInput}
      data={a}
      icon={<DebouncedAppIcon form={form} width={20} height={20} />}
      label={t('appearance.icon.label')}
      description={t('appearance.icon.description', {
        suggestionsCount: data.reduce((a, b) => a + b.count, 0),
      })}
      variant="default"
      initiallyOpened
      withAsterisk
      required
      {...form.getInputProps('appearance.iconUrl')}
    />
  );
};

const useStyles = createStyles(() => ({
  textInput: {
    flexGrow: 1,
  },
}));

const AutoCompleteItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ label, size, url, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <Box
          sx={(theme) => ({
            backgroundColor:
              theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2],
            borderRadius: theme.radius.md,
          })}
          p={2}
        >
          <Image src={url} width={30} height={30} fit="contain" />
        </Box>
        <Stack spacing={0}>
          <Text>{label}</Text>
          <Text color="dimmed" size="xs">
            {humanFileSize(size, false)}
          </Text>
        </Stack>
      </Group>
    </div>
  )
);

interface ItemProps extends SelectItemProps {
  url: string;
  group: string;
  size: number;
}
