import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { TFunction } from 'next-i18next';

dayjs.extend(duration);

export const parseDuration = (time: number, t: TFunction): string => {
  const etaDuration = dayjs.duration(time, 's');

  let eta = etaDuration.format(`s [${t('common:time.seconds')}]`);

  if (etaDuration.asMinutes() > 1) {
    eta = etaDuration.format(`m [${t('common:time.minutes')}] `) + eta;
  }
  if (etaDuration.asHours() > 1) {
    eta = etaDuration.format(`H [${t('common:time.hours')}] `) + eta;
  }

  return eta;
};

export const secondsFromTimeString = (time: string | undefined): number | undefined => {
  if (!time) {
    return undefined;
  }
  const lastChar = time[time.length - 1];
  if (!isNaN(+lastChar)) {
    return Number(time);
  }

  const numTime = +time.substring(0, time.length - 1);
  switch (lastChar.toLowerCase()) {
    case 's': {
      return numTime;
    }
    case 'm': {
      return numTime * 60;
    }
    case 'h': {
      return numTime * 60 * 60;
    }
    case 'd': {
      return numTime * 24 * 60 * 60;
    }
    default: {
      return undefined;
    }
  }
};
