export function humanFileSize(initialBytes: number, si = true, dp = 1) {
    const thresh = si ? 1000 : 1024;
    let bytes = initialBytes;
  
    if (Math.abs(bytes) < thresh) {
      return `${bytes} B`;
    }
  
    const units = si
      ? ['kb', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
      : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10 ** dp;
  
    do {
      bytes /= thresh;
      u += 1;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);
  
    return `${bytes.toFixed(dp)} ${units[u]}`;
  }
