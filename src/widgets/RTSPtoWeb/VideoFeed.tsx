import { useRef, useEffect, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

const VideoFeed: React.FC<VideoFeedProps> = ({ src }) => {
  const videoRef = useRef(null);
  const [player, setPlayer] = useState<ReturnType<typeof videojs>>();

  useEffect(() => {
    // make sure Video.js player is only initialized once
    if (!player) {
      const videoElement = videoRef.current;
      if (!videoElement) return;

      setPlayer(videojs(videoElement, {}, () => {
        })
      );
    }
  }, [videoRef]);

  useEffect(() => () => {
      if (player) {
        player.dispose();
      }
    }, [player]);

  return (
    <div>
      <video className="video-js" ref={videoRef} controls>
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
};

export default VideoFeed;
