import { describe, expect, it } from 'vitest';

import { bytes } from '../bytesHelper';

describe('bytes.toPerSecondString', () => {
  it('should format 999 bytes as 999 b/s', () => {
    // Arrange
    const byteCount = 999;
    // Act
    const result = bytes.toPerSecondString(byteCount);
    // Assert
    expect(result).toBe('999.0 b/s');
  });
  it.each([
    [1, 'b/s', 'Kb/s'],
    [2, 'Kb/s', 'Mb/s'],
    [3, 'Mb/s', 'Gb/s'],
  ])('should format 1000^%s bytes or 1000 %s as 1.0 %s', (power, _unit, nextUnit) => {
    // Arrange
    const byteCount = Math.pow(1000, power);
    // Act
    const result = bytes.toPerSecondString(byteCount);
    // Assert
    expect(result).toBe(`1.0 ${nextUnit}`);
  });
  it('should format 1000^4 bytes or 1 Tb/s with as 1000.0 Gb/s', () => {
    // Arrange
    const byteCount = Math.pow(1000, 4);
    // Act
    const result = bytes.toPerSecondString(byteCount);
    // Assert
    expect(result).toBe('1000.0 Gb/s');
  });
  it('should format undefined as -', () => {
    // Arrange
    const byteCount = undefined;
    // Act
    const result = bytes.toPerSecondString(byteCount);
    // Assert
    expect(result).toBe('-');
  });
});

describe('bytes.toString', () => {
  it('should format 999 bytes as 999 B', () => {
    // Arrange
    const byteCount = 999;
    // Act
    const result = bytes.toString(byteCount);
    // Assert
    expect(result).toBe('999.0 B');
  });
  it.each([
    [1, 'B', 'KiB'],
    [2, 'KiB', 'MiB'],
    [3, 'MiB', 'GiB'],
  ])('should format 1024^%s bytes or 1024 %s as 1.0 %s', (power, _unit, nextUnit) => {
    // Arrange
    const byteCount = Math.pow(1024, power);
    // Act
    const result = bytes.toString(byteCount);
    // Assert
    expect(result).toBe(`1.0 ${nextUnit}`);
  });
  it('should format 1024^4 bytes or 1 TiB with as 1024.0 GiB', () => {
    // Arrange
    const byteCount = Math.pow(1024, 4);
    // Act
    const result = bytes.toString(byteCount);
    // Assert
    expect(result).toBe('1024.0 GiB');
  });
});
