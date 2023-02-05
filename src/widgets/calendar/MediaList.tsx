import { createStyles, Divider, ScrollArea } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import React from 'react';
import {
  LidarrMediaDisplay,
  RadarrMediaDisplay,
  ReadarrMediaDisplay,
  SonarrMediaDisplay,
} from '../../modules/common';
import { MediasType } from './type';

interface MediaListProps {
  medias: MediasType;
}

export const MediaList = ({ medias }: MediaListProps) => {
  const { classes } = useStyles();
  const { height } = useViewportSize();
  const lastMediaType = getLastMediaType(medias);
  const MEDIA_HEIGHT = 250;
  // Euclidean division to get the number of media displayed
  const maxMediaDisplayed = Math.floor(height / MEDIA_HEIGHT);

  return (
    <ScrollArea
      style={{
        height: maxMediaDisplayed <= 5 ? maxMediaDisplayed * MEDIA_HEIGHT : 5 * MEDIA_HEIGHT,
        minHeight: 210,
        maxWidth: '90vw',
      }}
      offsetScrollbars
      pt={5}
      className={classes.scrollArea}
    >
      {mapMedias(medias.tvShows, SonarrMediaDisplay, lastMediaType === 'tv-show')}
      {mapMedias(medias.movies, RadarrMediaDisplay, lastMediaType === 'movie')}
      {mapMedias(medias.musics, LidarrMediaDisplay, lastMediaType === 'music')}
      {mapMedias(medias.books, ReadarrMediaDisplay, lastMediaType === 'book')}
    </ScrollArea>
  );
};

const mapMedias = (
  medias: any[],
  MediaComponent: (props: { media: any }) => JSX.Element | null,
  containsLastItem: boolean
) =>
  medias.map((media, index) => (
    <div key={index}>
      <MediaComponent media={media} />
      {containsLastItem && index === medias.length - 1 ? null : <MediaDivider />}
    </div>
  ));

const MediaDivider = () => <Divider variant="dashed" size="sm" my="xl" />;

const getLastMediaType = (medias: MediasType) => {
  if (medias.books.length >= 1) return 'book';
  if (medias.musics.length >= 1) return 'music';
  if (medias.movies.length >= 1) return 'movie';
  return 'tv-show';
};

const useStyles = createStyles(() => ({
  scrollArea: {
    width: 400,
  },
}));
