import { render, screen, cleanup } from '@testing-library/react';
import { describe, expect, it, afterEach } from 'vitest';
import { AppAvatar } from './AppAvatar';

describe('AppAvatar', () => {
  afterEach(cleanup);

  it('display placeholder when no url', () => {
    render(<AppAvatar iconUrl="" color="blue" />);

    expect(screen.getByTestId('app-avatar')).toBeDefined();
  });
});
