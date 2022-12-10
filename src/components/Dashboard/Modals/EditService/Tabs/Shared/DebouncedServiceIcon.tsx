// disabled due to too many dynamic targets for next image cache
/* eslint-disable @next/next/no-img-element */
import Image from 'next/image';
import { createStyles, Loader } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { useDebouncedValue } from '@mantine/hooks';
import { ServiceType } from '../../../../../../types/service';

interface DebouncedServiceIconProps {
  width: number;
  height: number;
  form: UseFormReturnType<ServiceType, (values: ServiceType) => ServiceType>;
  debouncedWaitPeriod?: number;
}

export const DebouncedServiceIcon = ({
  form,
  width,
  height,
  debouncedWaitPeriod = 1000,
}: DebouncedServiceIconProps) => {
  const { classes } = useStyles();
  const [debouncedIconImageUrl] = useDebouncedValue(
    form.values.appearance.iconUrl,
    debouncedWaitPeriod
  );

  if (debouncedIconImageUrl !== form.values.appearance.iconUrl) {
    return <Loader width={width} height={height} />;
  }

  if (debouncedIconImageUrl.length > 0) {
    return (
      <img
        className={classes.iconImage}
        src={debouncedIconImageUrl}
        width={width}
        height={height}
        alt=""
      />
    );
  }

  return (
    <Image
      className={classes.iconImage}
      src="/imgs/logo/logo.png"
      width={width}
      height={height}
      alt=""
    />
  );
};

const useStyles = createStyles(() => ({
  iconImage: {
    objectFit: 'contain',
  },
}));
