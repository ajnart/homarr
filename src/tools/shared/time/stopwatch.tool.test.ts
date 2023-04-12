import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Stopwatch } from './stopwatch.tool';

describe('stopwatch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.concurrent('should be elapsed time between start and current', () => {
    // arrange
    vi.setSystemTime(new Date(2023, 2, 26, 0, 0, 0));
    const stopwatch = new Stopwatch();

    // act
    vi.setSystemTime(new Date(2023, 2, 26, 0, 0, 2));
    const milliseconds = stopwatch.getEllapsedMilliseconds();

    // assert
    expect(milliseconds).toBe(2000);
  });
});
