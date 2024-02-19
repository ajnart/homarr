import { describe, expect, test } from 'vitest';

import { createRedirectUri } from './oidc';

describe('redirect', () => {
  test('Callback should return http url when not defining protocol', async () => {
    // Arrange
    const headers = {
      'x-forwarded-host': 'localhost:3000',
    };

    // Act
    const result = await createRedirectUri(headers, '/api/auth/callback/oidc');

    // Assert
    expect(result).toBe('http://localhost:3000/api/auth/callback/oidc');
  });

  test('Callback should return https url when defining protocol', async () => {
    // Arrange
    const headers = {
      'x-forwarded-proto': 'https',
      'x-forwarded-host': 'localhost:3000',
    };

    // Act
    const result = await createRedirectUri(headers, '/api/auth/callback/oidc');

    // Assert
    expect(result).toBe('https://localhost:3000/api/auth/callback/oidc');
  });

  test('Callback should return https url when defining protocol and host', async () => {
    // Arrange
    const headers = {
      'x-forwarded-proto': 'https',
      host: 'something.else',
    };

    // Act
    const result = await createRedirectUri(headers, '/api/auth/callback/oidc');

    // Assert
    expect(result).toBe('https://something.else/api/auth/callback/oidc');
  });

  test('Callback should return https url when defining protocol as http,https and host', async () => {
    // Arrange
    const headers = {
      'x-forwarded-proto': 'http,https',
      'x-forwarded-host': 'hello.world',
    };

    // Act
    const result = await createRedirectUri(headers, '/api/auth/callback/oidc');

    // Assert
    expect(result).toBe('https://hello.world/api/auth/callback/oidc');
  });
});
