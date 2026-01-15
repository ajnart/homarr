import { Image } from "@mantine/core";
import type { MantineColor } from "@mantine/core";
import combineClasses from "clsx";
import type { Property } from "csstype";

import { MaskedImage } from "./masked-image";

interface MaskedOrNormalImageProps {
  imageUrl?: string;
  hasColor?: boolean;
  color?: MantineColor;
  alt?: string;
  style?: React.CSSProperties;
  className?: string;
  fit?: Property.ObjectFit;
  maskSize?: Property.MaskSize;
  maskRepeat?: Property.MaskRepeat;
  maskPosition?: Property.MaskPosition;
}

export const MaskedOrNormalImage = ({
  imageUrl,
  hasColor = true,
  color = "iconColor",
  alt,
  style,
  className,
  fit = "contain",
  maskSize = "contain",
  maskRepeat = "no-repeat",
  maskPosition = "center",
}: MaskedOrNormalImageProps) => {
  return hasColor ? (
    <MaskedImage
      imageUrl={imageUrl}
      color={color}
      alt={alt}
      className={combineClasses("masked-image", className)}
      maskSize={maskSize}
      maskRepeat={maskRepeat}
      maskPosition={maskPosition}
      style={{
        ...style,
      }}
    />
  ) : (
    <Image
      className={combineClasses("normal-image", className)}
      src={imageUrl}
      alt={alt}
      fit={fit}
      style={{ ...style }}
    />
  );
};
