// @ts-check
import * as path from 'node:path';
import * as url from 'node:url';

import eslintJs from '@eslint/js';
import typescriptEslintParser from '@typescript-eslint/parser';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginReactDom from 'eslint-plugin-react-dom';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import eslintPluginReactRefresh from 'eslint-plugin-react-refresh';
import eslintPluginReactX from 'eslint-plugin-react-x';
import eslintPluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import typescriptEslint from 'typescript-eslint';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default typescriptEslint.config(
  {
    ignores: ['**/dist/**'],
  },

  ...typescriptEslint.config({
    extends: [eslintJs.configs.recommended],
    languageOptions: {
      globals: globals.browser,
      sourceType: 'module',
      ecmaVersion: 2015,
    },
  }),

  // https://github.com/prettier/eslint-plugin-prettier#configuration-new-eslintconfigjs
  ...typescriptEslint.config({
    extends: [eslintPluginPrettierRecommended],
    rules: {
      // https://prettier.io/docs/options
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
          singleQuote: true,
          printWidth: 100,
          singleAttributePerLine: true,
          experimentalTernaries: true,
        },
      ],
    },
  }),

  // https://typescript-eslint.io/getting-started/typed-linting
  ...typescriptEslint.configs.recommended,
  {
    files: ['**/*.?([cm])ts?(x)', '**/*.?([cm])js?(x)'],
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        // Can't use tsconfig.json composite config
        project: ['./tsconfig.lint.json'],
        tsconfigRootDir: __dirname,
        warnOnUnsupportedTypeScriptVersion: false,
      },
    },
    rules: {
      // https://eslint.org/docs/latest/rules/

      // https://typescript-eslint.io/rules/
      '@typescript-eslint/consistent-type-definitions': 'warn',
      '@typescript-eslint/no-confusing-non-null-assertion': 'error',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-for-in-array': 'error',
      '@typescript-eslint/no-implied-eval': 'error',
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/no-redundant-type-constituents': 'warn',
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/no-unnecessary-parameter-property-assignment': 'error',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/non-nullable-type-assertion-style': 'error',
      '@typescript-eslint/only-throw-error': 'error',
      '@typescript-eslint/prefer-function-type': 'error',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/prefer-reduce-type-parameter': 'warn',
      '@typescript-eslint/prefer-return-this-type': 'warn',
      '@typescript-eslint/prefer-string-starts-ends-with': 'warn',
      '@typescript-eslint/return-await': 'error',
    },
  },

  ...typescriptEslint.config({
    extends: [eslintPluginReactHooks.configs['recommended-latest']],
    rules: {
      // https://www.npmjs.com/package/eslint-plugin-react-hooks
    },
  }),

  ...typescriptEslint.config({
    extends: [eslintPluginReactRefresh.configs.vite],
    rules: {
      // https://github.com/ArnaudBarre/eslint-plugin-react-refresh#options
    },
  }),

  ...typescriptEslint.config({
    extends: [eslintPluginReactX.configs.recommended],
    rules: {
      // https://eslint-react.xyz/docs/rules/overview#x-rules
    },
  }),

  ...typescriptEslint.config({
    extends: [eslintPluginReactDom.configs.recommended],
    rules: {
      // https://eslint-react.xyz/docs/rules/overview#dom-rules
    },
  }),

  // https://github.com/lydell/eslint-plugin-simple-import-sort#example-configuration
  {
    plugins: {
      'simple-import-sort': eslintPluginSimpleImportSort,
      import: eslintPluginImport,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
    },
  },
);
