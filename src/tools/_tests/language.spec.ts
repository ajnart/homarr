import { describe, expect, it } from 'vitest';

import { getLanguageByCode } from '../language';

describe('getLanguageByCode', () => {
  it('should return Vietnamese for code vi', () => {
    // Arrange
    const code = 'vi';
    // Act
    const result = getLanguageByCode(code);
    // Assert
    expect(result.translatedName).toBe('Vietnamese');
  });
  it('should return English as fallback for code null', () => {
    // Arrange
    const code = null;
    // Act
    const result = getLanguageByCode(code);
    // Assert
    expect(result.translatedName).toBe('English');
  });
});
