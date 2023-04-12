import { describe, expect, it } from 'vitest';

import { percentage } from './percentage.tool';

describe('percentage', () => {
  it.concurrent('be fixed value', () => {
    // arrange
    const value = 62;

    // act
    const fixedPercentage = percentage(value, 100);

    // assert
    expect(fixedPercentage).toBe('62.0');
  });

  it.concurrent('be fixed value when decimal places', () => {
    // arrange
    const value = 42.69696969;

    // act
    const fixedPercentage = percentage(value, 100);

    // assert
    expect(fixedPercentage).toBe('42.7');
  });
});
