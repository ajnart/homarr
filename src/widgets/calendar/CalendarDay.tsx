import { Container, Indicator, IndicatorProps, Popover } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { MediaList } from './MediaList';
import { MediasType } from './type';

interface CalendarDayProps {
  date: Date;
  medias: MediasType;
}

export const CalendarDay = ({ date, medias }: CalendarDayProps) => {
  const [opened, { close, open }] = useDisclosure(false);

  if (medias.totalCount === 0) {
    return <div>{date.getDate()}</div>;
  }

  return (
    <Popover
      position="bottom"
      withArrow
      withinPortal
      radius="lg"
      shadow="sm"
      transitionProps={{
        transition: 'pop',
      }}
      onClose={close}
      opened={opened}
    >
      <Popover.Target>
        <Container p={10} onClick={open}>
          <DayIndicator color="red" position="bottom-start" medias={medias.books}>
            <DayIndicator color="yellow" position="top-start" medias={medias.movies}>
              <DayIndicator color="blue" position="top-end" medias={medias.tvShows}>
                <DayIndicator color="green" position="bottom-end" medias={medias.musics}>
                  <div>{date.getDate()}</div>
                </DayIndicator>
              </DayIndicator>
            </DayIndicator>
          </DayIndicator>
        </Container>
      </Popover.Target>
      <Popover.Dropdown>
        <MediaList medias={medias} />
      </Popover.Dropdown>
    </Popover>
  );
};

interface DayIndicatorProps {
  color: string;
  medias: any[];
  children: JSX.Element;
  position: IndicatorProps['position'];
}

const DayIndicator = ({ color, medias, children, position }: DayIndicatorProps) => {
  if (medias.length === 0) return children;

  return (
    <Indicator size={10} withBorder offset={-5} color={color} position={position}>
      {children}
    </Indicator>
  );
};
