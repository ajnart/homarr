import { describe, expect, test } from 'vitest';

import { redirectCallback } from './auth';

describe('redirect', () => {
  test('Callback should return http url when not defining protocol', async () => {
    // Arrange
    const req = {
      headers: {
        'x-forwarded-host': 'localhost:3000',
      },
    };
    const url = 'http://localhost:3000/callback';

    // Act
    const result = await redirectCallback(req, { url });

    // Assert
    expect(result).toBe('http://localhost:3000/callback');
  });

  test('Callback should return https url when defining protocol', async () => {
    // Arrange
    const req = {
      headers: {
        'x-forwarded-proto': 'https',
        'x-forwarded-host': 'localhost:3000',
      },
    };
    const url = 'http://something.else/callback';

    // Act
    const result = await redirectCallback(req, { url });

    // Assert
    expect(result).toBe('https://localhost:3000/callback');
  });

  test('Callback should return https url when defining protocol and host', async () => {
    // Arrange
    const req = {
      headers: {
        'x-forwarded-proto': 'https',
        host: 'something.else',
      },
    };
    const url = 'http://localhost:3000/callback';

    // Act
    const result = await redirectCallback(req, { url });

    // Assert
    expect(result).toBe('https://something.else/callback');
  });

  test('Callback should return https url when defining protocol as http,https and host', async () => {
    // Arrange
    const req = {
      headers: {
        'x-forwarded-proto': 'http,https',
        'x-forwarded-host': 'hello.world',
      },
    };
    const url = 'http://localhost:3000/callback';

    // Act
    const result = await redirectCallback(req, { url });

    // Assert
    expect(result).toBe('https://hello.world/callback');
  });

  test('Callback should return valid url with only path when url starts with /', async () => {
    // Arrange
    const req = {
      headers: {
        'x-forwarded-proto': 'https',
        'x-forwarded-host': 'hello.world',
      },
    };
    const url = '/callback';

    // Act
    const result = await redirectCallback(req, { url });

    // Assert
    expect(result).toBe('https://hello.world/callback');
  });
});
