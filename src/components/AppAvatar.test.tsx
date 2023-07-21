import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { AppAvatar } from './AppAvatar';

describe('AppAvatar', () => {
  afterEach(cleanup);

  it('display placeholder when no url', () => {
    render(<AppAvatar iconUrl="" color="blue" />);

    expect(screen.getByTestId('app-avatar')).toBeDefined();
  });
});
