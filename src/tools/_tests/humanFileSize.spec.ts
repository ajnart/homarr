import { describe, expect, it } from 'vitest';

import { humanFileSize } from '../humanFileSize';

describe('humanFileSize', () => {
  it('should format 1023 bytes as 1023 B', () => {
    // Arrange
    const bytes = 1023;

    // Act
    const result = humanFileSize(bytes, false);

    // Assert
    expect(result).toBe('1023 B');
  });
  it.each([
    [1, 'B', 'KiB'],
    [2, 'KiB', 'MiB'],
    [3, 'MiB', 'GiB'],
    [4, 'GiB', 'TiB'],
    [5, 'TiB', 'PiB'],
    [6, 'PiB', 'EiB'],
    [7, 'EiB', 'ZiB'],
    [8, 'ZiB', 'YiB'],
  ])(
    'should format 1024^%s B or 1024 %s with 1024 threshhold as 1.0 %s',
    (power, _unit, nextUnit) => {
      // Arrange
      const bytes = Math.pow(1024, power);

      // Act
      const result = humanFileSize(bytes, false);

      // Assert
      expect(result).toBe(`1.0 ${nextUnit}`);
    }
  );
  it('should format 1024^9 B or 1024 YiB with 1024 threshhold as 1024.0 YiB', () => {
    // Arrange
    const bytes = Math.pow(1024, 9);

    // Act
    const result = humanFileSize(bytes, false);

    // Assert
    expect(result).toBe('1024.0 YiB');
  });
  it('should format 999 bytes as 999 B', () => {
    // Arrange
    const bytes = 999;

    // Act
    const result = humanFileSize(bytes);

    // Assert
    expect(result).toBe('999 B');
  });
  it.each([
    [1, 'B', 'KB'],
    [2, 'KB', 'MB'],
    [3, 'MB', 'GB'],
    [4, 'GB', 'TB'],
    [5, 'TB', 'PB'],
    [6, 'PB', 'EB'],
    [7, 'EB', 'ZB'],
    [8, 'ZB', 'YB'],
  ])(
    'should format 1000^%s B or 1000 %s with 1000 threshhold as 1.0 %s',
    (power, _unit, nextUnit) => {
      // Arrange
      const bytes = Math.pow(1000, power);

      // Act
      const result = humanFileSize(bytes);

      // Assert
      expect(result).toBe(`1.0 ${nextUnit}`);
    }
  );
  it('should format 1000^9 B or 1000 YB with 1000 threshhold as 1000.0 YB', () => {
    // Arrange
    const bytes = Math.pow(1000, 9);

    // Act
    const result = humanFileSize(bytes);

    // Assert
    expect(result).toBe('1000.0 YB');
  });
  it('should format 1000 B with 1000 threshhold and 0 decimal places as 1 KB', () => {
    // Arrange
    const bytes = 1000;

    // Act
    const result = humanFileSize(bytes, true, 0);

    // Assert
    expect(result).toBe('1 KB');
  });
  it('should format 1000 B with 1000 threshhold and 4 decimal places as 1.0000 KB', () => {
    // Arrange
    const bytes = 1000;

    // Act
    const result = humanFileSize(bytes, true, 4);

    // Assert
    expect(result).toBe('1.0000 KB');
  });
});
