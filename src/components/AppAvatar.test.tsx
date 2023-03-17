import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppAvatar } from './AppAvatar';

describe(AppAvatar.name, () => {
  it.concurrent('display placeholder when no url', () => {
    const { container } = render(<AppAvatar iconUrl="" color="blue" />);

    expect(container.firstElementChild).not.toBeNull();
    expect(container.firstElementChild!.className).contain('mantine-Avatar-root');

    const svgElement = container.querySelector('svg');
    expect(svgElement).not.toBeNull();
    expect(svgElement?.getAttribute('fill')).not.toBeNull();
  });
});
