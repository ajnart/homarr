import { Button, createStyles, Group, Menu, TextInput } from '@mantine/core';
import { IconChevronDown, IconSearch } from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction } from 'react';

interface GenericSearchProps<TFilters extends GenericFiltersType> {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  applyFilter: (f: TFilters[number]) => void;
  filters: TFilters | undefined;
  labelTranslationPath: (f: TFilters[number]) => string;
  searchPlaceholder: string;
}

export type GenericFiltersType = readonly string[];

export const GenericSearch = <TFilters extends GenericFiltersType = GenericFiltersType>({
  search,
  setSearch,
  applyFilter,
  filters,
  labelTranslationPath,
  searchPlaceholder,
}: GenericSearchProps<TFilters>) => {
  const { classes } = useStyles();
  const { t } = useTranslation();

  return (
    <Group spacing={0} w="100%" noWrap>
      <Menu position="bottom-start">
        <Menu.Target>
          <Button
            className={classes.dropDown}
            variant="default"
            rightIcon={<IconChevronDown size={16} />}
          >
            Filters
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          {filters?.map((filter) => (
            <Menu.Item key={filter} onClick={() => applyFilter(filter)}>
              {t(labelTranslationPath(filter))}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
      <TextInput
        icon={<IconSearch size={16} />}
        className={classes.input}
        w="100%"
        placeholder={searchPlaceholder}
        value={search}
        onChange={(ev) => setSearch(ev.target.value)}
      />
    </Group>
  );
};

const useStyles = createStyles(() => ({
  dropDown: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderRight: 'none',
  },
  input: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
}));
