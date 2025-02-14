import stylistic from "@stylistic/eslint-plugin";
import tsEslint from "@typescript-eslint/eslint-plugin";
import tsEslintParser from "@typescript-eslint/parser";
import js from '@eslint/js';
import nxPlugin from '@nx/eslint-plugin';

export default [
  js.configs.recommended,
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/tmp/**', './nx/**', '**/*.json'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    languageOptions: {
      parser: tsEslintParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.base.json',
      },
    },
    plugins: {
      '@typescript-eslint': tsEslint,
      '@stylistic': stylistic,
      '@nx': nxPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tsEslint.configs.recommended.rules,
      ...stylistic.configs['recommended-flat'].rules,
      'no-console': 'warn',
      'no-debugger': 'warn',
      "semi": ["error", "always"],
      "@stylistic/semi": "off",
    },
  },
];
