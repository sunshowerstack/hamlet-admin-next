import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import pluginNext from '@next/eslint-plugin-next';
import configPrettier from 'eslint-config-prettier';
import pluginImport from 'eslint-plugin-import';
import pluginReact from 'eslint-plugin-react';
import pluginUnicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import ts from 'typescript-eslint';

const compat = new FlatCompat();

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          ignoreRestSiblings: true,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
  configPrettier,
  pluginImport.flatConfigs.recommended,
  ...compat.extends('plugin:import/typescript'),
  {
    settings: {
      'import/resolver': {
        typescript: true,
        node: true,
        alias: {
          map: [['@', './src']],
          extensions: ['.js', '.jsx'],
        },
      },
    },
  },
  pluginUnicorn.configs['flat/recommended'],
  {
    rules: {
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-null': 'off',
      'unicorn/no-nested-ternary': 'off',
      'unicorn/no-array-reduce': 'off',
      // add
      'unicorn/prefer-switch': 'off',
      'unicorn/no-lonely-if': 'off',
      'unicorn/prefer-ternary': 'off', // 关闭 推荐使用三元函数
      'unicorn/prefer-default-parameters': 'off',
      'unicorn/no-array-for-each': 'off', // 严格模式：禁止使用 .forEach()
      'unicorn/consistent-existence-index-check': 'off', // Prefer `!== -1` over `>= 0` to check existence
    },
  },
  // 添加这个新的配置对象来覆盖 TypeScript 规则
  {
    rules: {
      // 禁用 any 类型检查
      '@typescript-eslint/no-explicit-any': 'off',
      // 禁用 未使用变量检查
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  pluginReact.configs.flat.recommended,
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'react/prop-types': 'off',
    },
  },
  ...compat.extends('plugin:react-hooks/recommended'),
  ...compat.config(pluginNext.configs.recommended),
];
