import { describe, expect, it, vi } from 'vitest';

import { env } from './env';

describe('environment validation', () => {
  it('test', () => {
    vi.stubEnv('PORT', '9876')

    expect(env.NEXT_PUBLIC_PORT).toBe(9876);
  });
});
