import stylistic from '@stylistic/eslint-plugin'
import tsEslint from '@typescript-eslint/eslint-plugin'
import tsEslintParser from '@typescript-eslint/parser'

export default [
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/tmp/**', './nx/**'],
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.js',
      '**/*.jsx',
    ],
    plugins: {
      '@typescript-eslint': tsEslint,
      '@stylistic': stylistic,
    },
    rules: {
      ...tsEslint.configs.recommended.rules,
      ...stylistic.configs['recommended-flat'].rules,
    },
  },
  {
    files: ['*.ts', '*.tsx'],
    languageOptions: {
      parser: tsEslintParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.base.json',
      },
    },
  },
]
