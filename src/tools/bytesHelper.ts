/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable consistent-return */
export const bytes = {
  toPerSecondString: (bytes?: number) => {
    if (!bytes) return '-';
    for (let i = 0; i < 4; i++) {
      if (bytes >= 1000 && i !== 3) {
        bytes /= 1000;
        continue;
      }

      return `${bytes.toFixed(1)} ${perSecondUnits[i]}`;
    }
  },
  toString: (bytes: number) => {
    for (let i = 0; i < 4; i++) {
      if (bytes >= 1024 && i !== 3) {
        bytes /= 1024;
        continue;
      }

      return `${bytes.toFixed(1)} ${units[i]}`;
    }
  },
};

const perSecondUnits = ['b/s', 'Kb/s', 'Mb/s', 'Gb/s'];
const units = ['B', 'KiB', 'MiB', 'GiB'];
