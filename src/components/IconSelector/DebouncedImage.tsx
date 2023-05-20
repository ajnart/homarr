import { Image, Loader, createStyles } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconPhotoOff } from '@tabler/icons-react';

interface DebouncedImageProps {
  width: number;
  height: number;
  src: string;
  debouncedWaitPeriod?: number;
}

export const DebouncedImage = ({
  src,
  width,
  height,
  debouncedWaitPeriod = 1000,
}: DebouncedImageProps) => {
  const { classes } = useStyles();
  const [debouncedIconImageUrl] = useDebouncedValue(src, debouncedWaitPeriod);

  if (debouncedIconImageUrl !== src) {
    return <Loader width={width} height={height} />;
  }

  if (debouncedIconImageUrl.length > 0) {
    return (
      <Image
        placeholder={<IconPhotoOff />}
        className={classes.iconImage}
        src={debouncedIconImageUrl}
        width={width}
        height={height}
        fit="contain"
        alt=""
        withPlaceholder
      />
    );
  }

  return (
    <Image
      className={classes.iconImage}
      src="/imgs/logo/logo.png"
      width={width}
      height={height}
      fit="contain"
      alt=""
      withPlaceholder
    />
  );
};

const useStyles = createStyles(() => ({
  iconImage: {
    objectFit: 'contain',
  },
}));
