import { Container, Indicator, IndicatorProps, Popover, Center } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { MediaList } from './MediaList';
import { MediasType } from './type';


interface CalendarDayProps {
  date: Date;
  medias: MediasType;
  size: string;
}

export const CalendarDay = ({ date, medias, size }: CalendarDayProps) => {
  const [opened, { close, open }] = useDisclosure(false);
  var indicatorSize = 10;
  var indicatorOffset = -4;
  switch(size){
    case "xs": {
      indicatorSize += 0;
      indicatorOffset -= 0;
      break;
    }
    case "sm": {
      indicatorSize += 1;
      indicatorOffset -= 1;
      break;
    }
    case "md": {
      indicatorSize += 2;
      indicatorOffset -= 1;
      break;
    }
    case "lg": {
      indicatorSize += 3;
      indicatorOffset -= 2;
      break;
    }
    case "xl": {
      indicatorSize += 4;
      indicatorOffset -= 3;
      break;
    }
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
      sx={(theme : any) => ({
        padding:'18% !important',
        height: '100%',
        width: '100%',
        borderRadius: (size!=="xs" && size!=="sm")?theme.radius.lg:theme.radius.md,
        borderStyle: "solid",
        borderWidth: "0.2rem",
        borderColor: opened? theme.fn.primaryColor() : '#00000000',
      })}
    >
      <Popover.Target>
        <Container align="center" onClick={(medias.totalCount === 0)? undefined:open}>
          <DayIndicator size={indicatorSize} offset={indicatorOffset} color="red" position="bottom-start" medias={medias.books}>
            <DayIndicator size={indicatorSize} offset={indicatorOffset} color="yellow" position="top-start" medias={medias.movies}>
              <DayIndicator size={indicatorSize} offset={indicatorOffset} color="blue" position="top-end" medias={medias.tvShows}>
                <DayIndicator size={indicatorSize} offset={indicatorOffset} color="green" position="bottom-end" medias={medias.musics}>
                  <div>{date.getDate()}</div>
                </DayIndicator>
              </DayIndicator>
            </DayIndicator>
          </DayIndicator>
        </Container>
      </Popover.Target>
      <Popover.Dropdown disabled = {(medias.totalCount === 0)? false:true}>
        <MediaList medias={medias} />
      </Popover.Dropdown>
    </Popover>
  );
};

interface DayIndicatorProps {
  size: any;
  offset: any;
  color: string;
  medias: any[];
  children: JSX.Element;
  position: IndicatorProps['position'];
}

const DayIndicator = ({ size, offset, color, medias, children, position }: DayIndicatorProps) => {
  if (medias.length === 0) return children;

  return (
    <Indicator size={size} withBorder offset={offset} color={color} position={position}>
      {children}
    </Indicator>
  );
};
