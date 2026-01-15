import React from "react";
import { getThemeColor, useMantineTheme } from "@mantine/core";
import type { MantineColor } from "@mantine/core";
import combineClasses from "clsx";
import type { Property } from "csstype";

import classes from "./masked-image.module.css";

interface MaskedImageProps {
  imageUrl?: string;
  color: MantineColor;
  alt?: string;
  style?: React.CSSProperties;
  className?: string;
  maskSize?: Property.MaskSize;
  maskRepeat?: Property.MaskRepeat;
  maskPosition?: Property.MaskPosition;
}

export const MaskedImage = ({
  imageUrl,
  color,
  alt,
  style,
  className,
  maskSize = "contain",
  maskRepeat = "no-repeat",
  maskPosition = "center",
}: MaskedImageProps) => {
  const theme = useMantineTheme();

  return (
    <div
      className={combineClasses(classes.maskedImage, className)}
      role="img"
      aria-label={alt}
      style={
        {
          ...style,
          "--image-color": getThemeColor(color, theme),
          maskSize,
          maskRepeat,
          maskPosition,
          maskImage: imageUrl ? `url(${imageUrl})` : undefined,
        } as React.CSSProperties
      }
    />
  );
};
