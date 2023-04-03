import { forwardRef } from 'react';
import {
  Autocomplete,
  Box,
  CloseButton,
  Group,
  Image,
  Loader,
  ScrollArea,
  SelectItemProps,
  Stack,
  Text,
  Title,
  createStyles,
} from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { IconSearch } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';

import { humanFileSize } from '../../../../../../tools/humanFileSize';
import { NormalizedIconRepositoryResult } from '../../../../../../tools/server/images/abstract-icons-repository';
import { AppType } from '../../../../../../types/app';
import { DebouncedAppIcon } from '../Shared/DebouncedAppIcon';

interface IconSelectorProps {
  form: UseFormReturnType<AppType, (values: AppType) => AppType>;
  data: NormalizedIconRepositoryResult[] | undefined;
  isLoading: boolean;
  disallowAppNameProgagation: () => void;
  allowAppNamePropagation: boolean;
}

export const IconSelector = ({
  form,
  data,
  isLoading,
  allowAppNamePropagation,
  disallowAppNameProgagation,
}: IconSelectorProps) => {
  const { t } = useTranslation('layout/modals/add-app');
  const { classes } = useStyles();

  const a =
    data === undefined
      ? []
      : data.flatMap((repository) =>
          repository.entries.map((entry) => ({
            url: entry.url,
            label: entry.name,
            size: entry.size,
            value: entry.url,
            group: repository.name,
            copyright: repository.copyright,
          }))
        );

  return (
    <Stack w="100%">
      <Autocomplete
        nothingFound={
          <Stack align="center" spacing="xs" my="lg">
            <IconSearch />
            <Title order={6} align="center">
              {t('appearance.icon.autocomplete.title')}
            </Title>
            <Text align="center" maw={350}>
              {t('appearance.icon.autocomplete.text')}
            </Text>
          </Stack>
        }
        icon={<DebouncedAppIcon form={form} width={20} height={20} />}
        rightSection={
          form.values.appearance.iconUrl.length > 0 ? (
            <CloseButton onClick={() => form.setFieldValue('appearance.iconUrl', '')} />
          ) : null
        }
        itemComponent={AutoCompleteItem}
        className={classes.textInput}
        data={a}
        limit={25}
        label={t('appearance.icon.label')}
        description={t('appearance.icon.description', {
          suggestionsCount: data?.reduce((a, b) => a + b.count, 0) ?? 0,
        })}
        filter={(search, item) =>
          item.value
            .toLowerCase()
            .replaceAll('_', '')
            .replaceAll(' ', '-')
            .includes(search.toLowerCase().replaceAll('_', '').replaceAll(' ', '-'))
        }
        variant="default"
        withAsterisk
        dropdownComponent={(props: any) => <ScrollArea {...props} mah={250} />}
        dropdownPosition="bottom"
        required
        onChange={(event) => {
          if (allowAppNamePropagation) {
            disallowAppNameProgagation();
          }
          form.setFieldValue('appearance.iconUrl', event);
        }}
        value={form.values.appearance.iconUrl}
      />
      {(!data || isLoading) && (
        <Group>
          <Loader variant="oval" size="sm" />
          <Stack spacing={0}>
            <Text size="xs" weight="bold">
              {t('appearance.icon.noItems.title')}
            </Text>
            <Text color="dimmed" size="xs">
              {t('appearance.icon.noItems.text')}
            </Text>
          </Stack>
        </Group>
      )}
    </Stack>
  );
};

const useStyles = createStyles(() => ({
  textInput: {
    flexGrow: 1,
  },
}));

const AutoCompleteItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ label, size, copyright, url, ...others }: ItemProps, ref) => (
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
          <Group>
            <Text color="dimmed" size="xs">
              {humanFileSize(size, false)}
            </Text>
            {copyright && (
              <Text color="dimmed" size="xs">
                © {copyright}
              </Text>
            )}
          </Group>
        </Stack>
      </Group>
    </div>
  )
);

AutoCompleteItem.displayName = 'AutocompleteItem';

interface ItemProps extends SelectItemProps {
  url: string;
  group: string;
  size: number;
  copyright: string | undefined;
}
