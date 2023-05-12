import { forwardRef, useImperativeHandle, useState } from 'react';
import {
  Autocomplete,
  CloseButton,
  Stack,
  Title,
  Text,
  Group,
  Loader,
  createStyles,
  Box,
  Image,
  SelectItemProps,
  ScrollArea,
} from '@mantine/core';
import { IconSearch } from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import { useGetDashboardIcons } from '../../hooks/icons/useGetDashboardIcons';
import { humanFileSize } from '../../tools/humanFileSize';
import { DebouncedImage } from './DebouncedImage';

export const IconSelector = forwardRef(
  (
    {
      defaultValue,
      onChange,
    }: { defaultValue: string; onChange: (debouncedValue: string | undefined) => void },
    ref
  ) => {
    const { t } = useTranslation('layout/modals/add-app');
    const { classes } = useStyles();

    const { data, isLoading } = useGetDashboardIcons();
    const [value, setValue] = useState(defaultValue);

    const flatIcons =
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

    useImperativeHandle(ref, () => ({
      chooseFirstOrDefault(searchTerm: string) {
        const match = flatIcons.find((icon) =>
          icon.label.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (!match) {
          return;
        }

        onChange(match.url);
      },
    }));

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
          icon={<DebouncedImage src={value} width={20} height={20} />}
          rightSection={
            value.length > 0 ? <CloseButton onClick={() => onChange(undefined)} /> : null
          }
          itemComponent={AutoCompleteItem}
          className={classes.textInput}
          data={flatIcons}
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
          dropdownComponent={(props: any) => <ScrollArea {...props} mah={250} />}
          onChange={(event) => {
            onChange(event);
            setValue(event);
          }}
          dropdownPosition="bottom"
          variant="default"
          value={value}
          withAsterisk
          withinPortal
          required
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
  }
);

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

interface ItemProps extends SelectItemProps {
  url: string;
  group: string;
  size: number;
  copyright: string | undefined;
}
