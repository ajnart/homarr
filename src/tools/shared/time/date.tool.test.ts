import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { isToday } from './date.tool';

describe('isToday', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.concurrent('should return true if date is today', () => {
    // arrange
    const date = new Date(2022, 3, 17);
    vi.setSystemTime(date);

    // act
    const today = isToday(date);

    // assert
    expect(today).toBe(true);
  });

  it.concurrent("should return true if date is today and time doesn't match", () => {
    // arrange
    vi.setSystemTime(new Date(2022, 3, 17, 16, 25, 11));

    // act
    const today = isToday(new Date(2022, 3, 17));

    // assert
    expect(today).toBe(true);
  });

  it.concurrent("should be false if date doesn't match", () => {
    // arrange
    vi.setSystemTime(new Date(2022, 3, 17, 16));

    // act
    const today = isToday(new Date(2022, 3, 15));

    // assert
    expect(today).toBe(false);
  });
});
