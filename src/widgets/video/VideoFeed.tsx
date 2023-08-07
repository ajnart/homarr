import { LoadingOverlay, createStyles } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

interface VideoFeedProps {
  source: string;
  muted: boolean;
  autoPlay: boolean;
  controls: boolean;
}

const VideoFeed = ({ source, controls, autoPlay, muted }: VideoFeedProps) => {
  const videoRef = useRef(null);
  const [player, setPlayer] = useState<ReturnType<typeof videojs>>();

  const { classes, cx } = useStyles();
  useEffect(() => {
    // make sure Video.js player is only initialized once
    if (player) {
      return;
    }

    const videoElement = videoRef.current;
    if (!videoElement) {
      return;
    }

    setPlayer(videojs(videoElement, { autoplay: autoPlay, muted, controls }, () => {}));
  }, [videoRef]);

  useEffect(
    () => () => {
      if (!player) {
        return;
      }

      if (player.isDisposed()) {
        return;
      }

      player.dispose();
    },
    [player]
  );

  return (
    <>
      <LoadingOverlay visible={player === undefined} />
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video className={cx('video-js', classes.video)} ref={videoRef}>
        <source src={source} />
      </video>
    </>
  );
};

const useStyles = createStyles(({ radius }) => ({
  video: {
    height: '100%',
    width: '100%',
    borderRadius: radius.md,
    overflow: 'hidden',
  },
}));

export default VideoFeed;
