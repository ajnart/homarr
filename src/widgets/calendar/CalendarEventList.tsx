import {
  Box,
  Button,
  createStyles,
  Group,
  Image,
  Indicator,
  ScrollArea,
  Stack,
  Text,
  useMantineTheme,
} from '@mantine/core';
import React from 'react';
import { z } from 'zod';
import { calendarMediaEventSchema } from '~/widgets/calendar/type';
import { IconClock } from '@tabler/icons-react';
import dayjs from 'dayjs';

interface CalendarEventListProps {
  events: z.infer<typeof calendarMediaEventSchema>[];
}

export const CalendarEventList = ({ events }: CalendarEventListProps) => {
  const { classes } = useStyles();
  const { fn } = useMantineTheme();

  return (
    <ScrollArea
      offsetScrollbars
      pt={5}
      className={classes.scrollArea}
      styles={{
        viewport: {
          maxHeight: 450,
          minHeight: 210,
        },
      }}
    >
      <Stack>
        {events.map((item, index) => (
          <Group key={index} align={'stretch'} noWrap>
            <Box w={70} h={120}>
              <Indicator
                position={'bottom-center'}
                styles={{
                  common: {
                    height: '1.2rem',
                  },
                }}
                disabled={item.content.mediaType !== 'series'}
                label={`S${item.content.seasonNumber} / E${item.content.episodeNumber}`}
                withBorder>
                <Image src={item.poster} width={70} height={120} radius={'sm'} withPlaceholder />
              </Indicator>
            </Box>
            <Stack style={{ flexGrow: 1 }} spacing={0}>
              <Group position={'apart'} align={'start'} mb={'xs'} noWrap>
                <Stack spacing={0}>
                  {item.subName && (
                    <Text lineClamp={1}>{item.subName}</Text>
                  )}
                  <Text weight={'bold'} lineClamp={1}>{item.name}</Text>
                </Stack>
                <Group spacing={3} noWrap>
                  <IconClock opacity={0.7} size={'1rem'} />
                  <Text color={'dimmed'}>
                    {dayjs(item.date.toString()).format('HH:mm')}
                  </Text>
                </Group>
              </Group>
              {item.description && (
                <Text size={'xs'} color={'dimmed'} lineClamp={2}>{item.description}</Text>
              )}
              {item.links.length > 0 && (
                <Group pt={5} spacing={5} mt={"auto"} noWrap>
                  {item.links.map((link) => (
                    <Button
                      component={'a'}
                      href={link.href}
                      target={'_blank'}
                      size={'xs'}
                      radius={'xl'}
                      variant={link.color ? undefined : 'default'}
                      styles={{
                        root: {
                          backgroundColor: link.color,
                          color: link.isDark ? 'white' : 'black',
                          '&:hover': link.isDark && link.color ? {
                            backgroundColor: link.isDark ? fn.lighten(link.color, 0.1) : fn.darken(link.color, 0.1),
                          } : undefined,
                        },
                      }}
                      leftIcon={link.logo ? <Image src={link.logo} width={20} height={20} /> : undefined}>
                      <Text>{link.name}</Text>
                    </Button>
                  ))}
                </Group>
              )}
            </Stack>
          </Group>
        ))}
      </Stack>
    </ScrollArea>
  );
};

const useStyles = createStyles(() => ({
  scrollArea: {
    width: 400,
  },
}));
