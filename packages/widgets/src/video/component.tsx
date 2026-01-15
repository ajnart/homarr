"use client";

import { useEffect, useRef } from "react";
import { Anchor, Box, Center, Group, Stack, Title } from "@mantine/core";
import { IconBrandYoutube, IconDeviceCctvOff } from "@tabler/icons-react";
import videojs from "video.js";

import { useI18n } from "@homarr/translation/client";

import type { WidgetComponentProps } from "../definition";
import classes from "./component.module.css";

import "video.js/dist/video-js.css";

import type Player from "video.js/dist/types/player";

import { createDocumentationLink } from "@homarr/definitions";

export default function VideoWidget({ options }: WidgetComponentProps<"video">) {
  if (options.feedUrl.trim() === "") {
    return <NoUrl />;
  }

  if (options.feedUrl.trim().startsWith("https://www.youtube.com/watch")) {
    return <ForYoutubeUseIframe />;
  }

  return <Feed options={options} />;
}

const NoUrl = () => {
  const t = useI18n();

  return (
    <Center h="100%">
      <Stack align="center">
        <IconDeviceCctvOff />
        <Title order={4}>{t("widget.video.error.noUrl")}</Title>
      </Stack>
    </Center>
  );
};

const ForYoutubeUseIframe = () => {
  const t = useI18n();

  return (
    <Center h="100%">
      <Stack align="center" gap="xs">
        <IconBrandYoutube />
        <Title order={4}>{t("widget.video.error.forYoutubeUseIframe")}</Title>
        <Anchor href={createDocumentationLink("/docs/widgets/iframe")}>{t("common.action.checkoutDocs")}</Anchor>
      </Stack>
    </Center>
  );
};

const Feed = ({ options }: Pick<WidgetComponentProps<"video">, "options">) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player>(null);

  useEffect(() => {
    if (playerRef.current) return;
    const videoElement = document.createElement("video-js");
    videoElement.classList.add("vjs-big-play-centered");
    if (classes.video) {
      videoElement.classList.add(classes.video);
    }
    videoRef.current?.appendChild(videoElement);

    playerRef.current = videojs(videoElement, {
      autoplay: options.hasAutoPlay,
      muted: options.isMuted,
      controls: options.hasControls,
      sources: [
        {
          src: options.feedUrl,
        },
      ],
    });
    // All other properties are updated with other useEffect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoRef]);

  useEffect(() => {
    if (!playerRef.current) return;
    playerRef.current.src(options.feedUrl);
  }, [options.feedUrl]);

  useEffect(() => {
    if (!playerRef.current) return;
    playerRef.current.autoplay(options.hasAutoPlay);
  }, [options.hasAutoPlay]);

  useEffect(() => {
    if (!playerRef.current) return;
    playerRef.current.muted(options.isMuted);
  }, [options.isMuted]);

  useEffect(() => {
    if (!playerRef.current) return;
    playerRef.current.controls(options.hasControls);
  }, [options.hasControls]);

  useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <Group justify="center" w="100%" h="100%" pos="relative">
      <Box w="100%" h="100%" ref={videoRef} />
    </Group>
  );
};
