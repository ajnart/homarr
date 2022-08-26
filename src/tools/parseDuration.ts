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
