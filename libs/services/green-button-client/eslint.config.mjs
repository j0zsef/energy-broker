import eslintConfig from '../../../eslint.config.mjs';
import tsEslintParser from "@typescript-eslint/parser";

export default [
  ...eslintConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    languageOptions: {
      parser: tsEslintParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
  }
]
