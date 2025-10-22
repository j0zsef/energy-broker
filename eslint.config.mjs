import globals from 'globals';
import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import nxPlugin from '@nx/eslint-plugin';
import react from 'eslint-plugin-react';
import stylistic from '@stylistic/eslint-plugin';
import tsEslint from '@typescript-eslint/eslint-plugin';
import tsEslintParser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/tmp/**', './nx/**'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parser: tsEslintParser,
      parserOptions: {
        ecmaVersion: 'latest',
        project: './tsconfig.base.json',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsEslint,
    },
    rules: {
      ...tsEslint.configs.recommended.rules,
    },
  },
  {
    ...jsxA11y.flatConfigs.recommended,
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    languageOptions: {
      ...react.configs.flat.recommended.languageOptions,
      ...jsxA11y.flatConfigs.recommended.languageOptions,
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      react: react,
    },
    rules: {
      ...react.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
    },
  },
  {
    plugins: {
      '@nx': nxPlugin,
      '@stylistic': stylistic,
    },
    rules: {
      ...stylistic.configs['recommended-flat'].rules,
      '@stylistic/semi': ['error', 'always'],
      'no-undef': 'off',
      'sort-imports': ['error', {
        allowSeparatedGroups: false,
        ignoreCase: false,
        ignoreDeclarationSort: false,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
      }],
      'sort-keys': ['error', 'asc', { caseSensitive: true, minKeys: 2, natural: false }],
    },
  },
];
