module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'mantine',
    'plugin:@next/next/recommended',
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vitest/recommended',
  ],
  plugins: ['testing-library', 'react-hooks', 'react', 'unused-imports', 'vitest'],
  overrides: [
    {
      files: ['**/?(*.)+(spec|test).[jt]s?(x)'],
      extends: ['plugin:testing-library/react'],
    },
  ],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    'import/no-cycle': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/no-children-prop': 'off',
    'unused-imports/no-unused-imports': 'warn',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-unused-imports': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-shadow': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'react/prop-types': 'off',
    'no-continue': 'off',
    'linebreak-style': 0,
    'vitest/max-nested-describe': [
      'error',
      {
        max: 3,
      },
    ],
    'testing-library/no-node-access': ['error', { allowContainerFirstChild: true }],
  },
  root: true,
};
