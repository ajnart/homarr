import { Center, Group, Stack, Title } from '@mantine/core';
import { IconPhoto, IconPhotoX } from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { Slide, Fade, Zoom } from 'react-slideshow-image';
import { defineWidget } from '../helper';
import { IWidget } from '../widgets';
import 'react-slideshow-image/dist/styles.css';

const definition = defineWidget({
  id: 'slideshow',
  icon: IconPhoto,
  options: {
    FeedUrl: {
      type: 'text',
      defaultValue: '',
    },
    Effect: {
      type: 'select',
      defaultValue: 'Fade',
      data: [
        { label: 'Slide', value: 'Slide' },
        { label: 'Fade', value: 'Fade' },
        { label: 'Zoom', value: 'Zoom scale={0.4}' },
      ],
    },
    Duration: {
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
  const divStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundSize: 'cover',
    height: '400px',
  };
  const Images = [
    {
      url: 'https://images.unsplash.com/photo-1509721434272-b79147e0e708?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80',
      caption: 'Slide 1',
    },
    {
      url: 'https://images.unsplash.com/photo-1506710507565-203b9f24669b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1536&q=80',
      caption: 'Slide 2',
    },
    {
      url: 'https://images.unsplash.com/photo-1536987333706-fc9adfb10d91?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80',
      caption: 'Slide 3',
    },
  ];

  if (!widget.properties.FeedUrl) {
    return (
      <Center h="100%">
        <Stack align="center">
          <IconPhotoX />
          <Title order={4}>{t('errors.invalidStream')}</Title>
        </Stack>
      </Center>
    );
  }
  return (
    <div className="slide-container">
      <Fade>
        {Images.map((Image, index) => (
          <div key={index}>
            <div style={{ ...divStyle, backgroundImage: `url(${Image.url})` }} />
          </div>
        ))}
      </Fade>
    </div>
  );
}

export default definition;
