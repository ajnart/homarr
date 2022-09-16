module.exports = {
  extends: [
    'mantine',
    'plugin:@next/next/recommended',
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: ['testing-library', 'react-hooks', 'react', 'unused-imports'],
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      extends: ['plugin:testing-library/react'],
    },
  ],
  ignorePatterns: ['**/dist'],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/no-children-prop': 'off',
    'max-classes-per-file': 'off',
    'unused-imports/no-unused-imports': 'warn',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-unused-imports': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-shadow': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@next/next/no-html-link-for-pages': 'off',
    'no-console': 'off',
  },
};
