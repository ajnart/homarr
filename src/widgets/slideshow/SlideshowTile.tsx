/* eslint-disable @next/next/no-img-element */
import { Center, Stack, Title, createStyles, Image } from '@mantine/core';
import { IconPhoto, IconPhotoX } from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import { useRef } from 'react';
import { Carousel } from '@mantine/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { defineWidget } from '../helper';
import { IWidget } from '../widgets';

const definition = defineWidget({
  id: 'slideshow',
  icon: IconPhoto,
  options: {
    feedUrl: {
      type: 'text',
      defaultValue: '',
    },
    duration: {
      type: 'number',
      defaultValue: 5000,
    },
  },
  gridstack: {
    minWidth: 3,
    minHeight: 2,
    maxWidth: 12,
    maxHeight: 12,
  },
  component: SlideshowWidget,
});

export type SlideshowWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface SlideshowWidgetProps {
  widget: SlideshowWidget;
}

const useStyles = createStyles((_theme, _params, getRef) => ({
  controls: {
    ref: getRef('controls'),
    transition: 'opacity 150ms ease',
    opacity: 0,
  },

  root: {
    '&:hover': {
      [`& .${getRef('controls')}`]: {
        opacity: 1,
      },
    },
  },
}));

function SlideshowWidget({ widget }: SlideshowWidgetProps) {
  const { t } = useTranslation('modules/slideshow');
  const { classes } = useStyles();
  const autoplay = useRef(Autoplay({ delay: 5000 }));
  const images: any[] = [widget.properties.feedUrl];
  const slides = images.map((url) => (
    <Carousel.Slide key={url}>
      <Image src={url} />
    </Carousel.Slide>
  ));

  if (!widget.properties.feedUrl) {
    return (
      <Center h="100%">
        <Stack align="center">
          <IconPhotoX />
          <Title order={4}>{t('errors.invalidUrl')}</Title>
        </Stack>
      </Center>
    );
  }
  return (
    <Carousel
      sx={{ maxWidth: '100%' }}
      mx="auto"
      loop
      controlSize={25}
      height="450px"
      plugins={[autoplay.current]}
      onMouseEnter={autoplay.current.stop}
      onMouseLeave={autoplay.current.reset}
      classNames={classes}
    >
      {slides}
    </Carousel>
  );
}
export default definition;
