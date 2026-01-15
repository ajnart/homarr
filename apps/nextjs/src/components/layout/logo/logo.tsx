import Image from "next/image";
import type { TitleOrder } from "@mantine/core";
import { Group, Title } from "@mantine/core";

interface LogoProps {
  size: number;
  src: string;
  alt: string;
  shouldUseNextImage?: boolean;
}

export const Logo = ({ size = 60, shouldUseNextImage = false, src, alt }: LogoProps) =>
  shouldUseNextImage ? (
    <Image className="logo" src={src} alt={alt} width={size} height={size} />
  ) : (
    // we only want to use next/image for logos that we are sure will be preloaded and are allowed
    // eslint-disable-next-line @next/next/no-img-element
    <img className="logo" src={src} alt={alt} width={size} height={size} />
  );

const logoWithTitleSizes = {
  lg: { logoSize: 48, titleOrder: 1 },
  md: { logoSize: 32, titleOrder: 2 },
  sm: { logoSize: 24, titleOrder: 3 },
} satisfies Record<string, { logoSize: number; titleOrder: TitleOrder }>;

export interface LogoWithTitleProps {
  size: keyof typeof logoWithTitleSizes;
  title: string;
  image: Omit<LogoProps, "size">;
  hideTitleOnMobile?: boolean;
}

export const LogoWithTitle = ({ size, title, image, hideTitleOnMobile }: LogoWithTitleProps) => {
  const { logoSize, titleOrder } = logoWithTitleSizes[size];

  return (
    <Group gap="xs" wrap="nowrap">
      <Logo {...image} size={logoSize} />
      <Title order={titleOrder} visibleFrom={hideTitleOnMobile ? "sm" : undefined} textWrap="nowrap">
        {title}
      </Title>
    </Group>
  );
};
