import eslintConfig from '../../eslint.config.mjs';
import tsEslintParser from '@typescript-eslint/parser';

export default [
  ...eslintConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsEslintParser,
      parserOptions: {
        ecmaVersion: 'latest',
        project: './tsconfig.json',
        sourceType: 'module',
      },
    },
  },
];
