import { Button, createStyles, Group, Menu, TextInput } from '@mantine/core';
import { IconChevronDown, IconSearch } from '@tabler/icons';
import { Dispatch, SetStateAction } from 'react';

interface GenericSearchProps<TFilters extends GenericFiltersType> {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  applyFilter: (f: TFilters[number]['value']) => void;
  filters: TFilters;
}

export type GenericFiltersType<TValue extends string = string> = Readonly<
  {
    readonly value: TValue;
    readonly label: string;
  }[]
>;

export const GenericSearch = <TFilters extends GenericFiltersType = GenericFiltersType>({
  search,
  setSearch,
  applyFilter,
  filters,
}: GenericSearchProps<TFilters>) => {
  const { classes } = useStyles();

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
          {filters.map((filter) => (
            <Menu.Item key={filter.value} onClick={() => applyFilter(filter.value)}>
              {filter.label}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
      <TextInput
        icon={<IconSearch size={16} />}
        className={classes.input}
        w="100%"
        placeholder="Search all users"
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
