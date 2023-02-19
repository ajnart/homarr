/* eslint-disable @next/next/no-img-element */
import { Center, Stack, Title, createStyles, Image } from '@mantine/core';
import { IconPhoto, IconPhotoX } from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import React, { useRef } from 'react';
import { Carousel } from '@mantine/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { defineWidget } from '../helper';
import { IWidget } from '../widgets';

const definition = defineWidget({
  id: 'slideshow',
  icon: IconPhoto,
  options: {
    imagesPath: {
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
    minHeight: 3,
    maxWidth: 12,
    maxHeight: 12,
  },
  component: SlideshowWidget,
});

export type SlideshowWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface SlideshowWidgetProps {
  widget: SlideshowWidget;
}

function SlideshowWidget({ widget }: SlideshowWidgetProps) {
  const { t } = useTranslation('modules/slideshow');
  const { classes } = useStyles();
  const autoplay = useRef(Autoplay({ delay: widget.properties.duration }));
  const cache: any = {};

  if (!widget.properties.imagesPath) {
    return (
      <Center h="100%">
        <Stack align="center">
          <IconPhotoX />
          <Title order={4}>{t('errors.invalidUrl')}</Title>
        </Stack>
      </Center>
    );
  }

  function importAll(r: any) {
    // eslint-disable-next-line no-return-assign
    r.keys().forEach((key: any) => (cache[key] = r(key)));
  }

  importAll(require.context('./media', false, /\.(png|jpe?g|svg)$/));
  const images = Object.entries(cache).map((module: any) => module[1].default);

  const slides = images.map((image) => (
    <Carousel.Slide>
      <Image src={image} />
    </Carousel.Slide>
  ));

  return (
    <div style={{ padding: 40, maxWidth: 500 }}>
      <Carousel
        mx="auto"
        loop
        controlSize={25}
        height={400}
        plugins={[autoplay.current]}
        onMouseEnter={autoplay.current.stop}
        onMouseLeave={autoplay.current.reset}
        classNames={classes}
      >
        {slides}
      </Carousel>
    </div>
  );
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

export default definition;
