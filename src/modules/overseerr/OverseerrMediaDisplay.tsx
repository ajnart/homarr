import { MediaDisplay } from '../common';

export default function OverseerrMediaDisplay(props: any) {
  const { media }: { media: any } = props;
  return (
    <MediaDisplay
      media={{
        title: media.name ?? media.originalTitle,
        overview: media.overview,
        poster: `https://image.tmdb.org/t/p/w600_and_h900_bestv2/${media.posterPath}`,
        genres: [`score: ${media.voteAverage}/10`],
        seasonNumber: media.mediaInfo?.seasons.length,
        plexUrl: media.mediaInfo?.plexUrl,
        imdbId: media.mediaInfo?.imdbId,
        ...media,
      }}
    />
  );
}
