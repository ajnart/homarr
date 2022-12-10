/* eslint-disable @next/next/no-img-element */
import {
  ActionIcon,
  Button,
  createStyles,
  Divider,
  Flex,
  Loader,
  Popover,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons';
import { useState } from 'react';
import { ICON_PICKER_SLICE_LIMIT } from '../../../../../../../../data/constants';
import { useRepositoryIconsQuery } from '../../../../../../../tools/hooks/useRepositoryIconsQuery';
import { IconSelectorItem } from '../../../../../../../types/iconSelector/iconSelectorItem';
import { WalkxcodeRepositoryIcon } from '../../../../../../../types/iconSelector/repositories/walkxcodeIconRepository';

interface IconSelectorProps {
  onChange: (icon: IconSelectorItem) => void;
}

export const IconSelector = ({ onChange }: IconSelectorProps) => {
  const { data, isLoading } = useRepositoryIconsQuery<WalkxcodeRepositoryIcon>({
    url: 'https://api.github.com/repos/walkxcode/Dashboard-Icons/contents/png',
    converter: (item) => ({
      url: `https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/${item.name}`,
    }),
  });

  const [searchTerm, setSearchTerm] = useState<string>('');
  const { classes } = useStyles();

  if (isLoading || !data) {
    return <Loader />;
  }

  const replaceCharacters = (value: string) =>
    value.toLowerCase().replaceAll(' ', '').replaceAll('-', '');

  const filteredItems = searchTerm
    ? data.filter((x) => replaceCharacters(x.url).includes(replaceCharacters(searchTerm)))
    : data;
  const slicedFilteredItems = filteredItems.slice(0, ICON_PICKER_SLICE_LIMIT);
  const isTruncated =
    slicedFilteredItems.length > 0 && slicedFilteredItems.length !== filteredItems.length;

  return (
    <Popover width={310}>
      <Popover.Target>
        <Button
          className={classes.actionIcon}
          variant="default"
          leftIcon={<IconSearch size={20} />}
        >
          Icon Picker
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack pt={4}>
          <TextInput
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.currentTarget.value)}
            placeholder="Search for icons..."
            variant="filled"
            rightSection={
              <ActionIcon onClick={() => setSearchTerm('')}>
                <IconX opacity={0.5} size={20} strokeWidth={2} />
              </ActionIcon>
            }
          />

          <ScrollArea style={{ height: 250 }} type="always">
            <Flex gap={4} wrap="wrap" pr={15}>
              {slicedFilteredItems.map((item) => (
                <ActionIcon onClick={() => onChange(item)} size={40} p={3}>
                  <img className={classes.icon} src={item.url} alt="" />
                </ActionIcon>
              ))}
            </Flex>

            {isTruncated && (
              <Stack spacing="xs" pr={15}>
                <Divider mt={35} mx="xl" />
                <Title order={6} color="dimmed" align="center">
                  Search is limited to {ICON_PICKER_SLICE_LIMIT} icons
                </Title>
                <Text color="dimmed" align="center" size="sm">
                  To keep things snappy and fast, the search is limited to {ICON_PICKER_SLICE_LIMIT}{' '}
                  icons. Use the search box to find more icons.
                </Text>
              </Stack>
            )}
          </ScrollArea>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
};

const useStyles = createStyles(() => ({
  flameIcon: {
    margin: '0 auto',
  },
  icon: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  actionIcon: {
    alignSelf: 'end',
  },
}));
