import { createTheme } from '@mui/material/styles';

import { colorSchemes } from './color-schemes';
import { components } from './components/components';
import { shadows } from './shadows';
import type { Theme } from './types';
import { typography } from './typography';

function customCreateTheme(): Theme {
  const theme = createTheme({
    breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1440 } },
    colorSchemes,
    cssVariables: {
      colorSchemeSelector: 'class',
    },
    direction: 'ltr',
    shadows,
    shape: { borderRadius: 4 },
    // typography,
    // 全局的默认样式
    typography: {
      fontSize: 13, // 全局默认字体大小（Element-UI 的 small 是 13px）
    },
    // 组件样式调整
    components: {
      // 按钮
      MuiButton: {
        defaultProps: {
          size: 'small', // 默认使用 small
        },
        styleOverrides: {
          root: {
            height: '32px', // 按钮高度
            fontSize: '13px', // 按钮文字大小
            padding: '4px 12px', // 按钮内边距
            borderRadius: '4px', // 圆角
          },
        },
      },
      // 输入框
      MuiTextField: {
        defaultProps: {
          size: 'small', // 默认使用 small
        },
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              height: '32px', // 输入框高度
              fontSize: '13px', // 输入框文字大小
              padding: '0', // 去除多余内边距
              // 多行容器需要自适应高度且内容从上方开始
              '&.MuiInputBase-multiline': {
                height: 'auto',
                alignItems: 'flex-start',
                padding: 0,
              },
              '& .MuiInputBase-input': {
                padding: '4px 8px', // 输入框文字的内边距
              },
            },
          },
        },
      },
      // 选择框
      MuiSelect: {
        defaultProps: {
          size: 'small', // 默认使用 small
        },
        styleOverrides: {
          root: {
            height: '32px', // 选择框高度
            fontSize: '13px', // 文字大小
          },
          select: {
            padding: '4px 8px', // 内边距
          },
        },
      },
      // 多选框
      MuiCheckbox: {
        defaultProps: {
          size: 'small', // 默认使用 small
        },
        styleOverrides: {
          root: {
            width: '16px', // 调整多选框的尺寸
            height: '16px',
            padding: '4px', // 内间距
          },
        },
      },
      // 表单控件的标签
      MuiFormLabel: {
        styleOverrides: {
          root: {
            fontSize: '13px', // 标签文字大小
          },
        },
      },
      // 表单控件
      MuiFormControl: {
        defaultProps: {
          size: 'small', // 默认使用 small
        },
        styleOverrides: {
          root: {
            margin: '4px 0', // 控件的外边距
          },
        },
      },
      // 轮廓输入框
      MuiOutlinedInput: {
        defaultProps: {
          size: 'small', // 默认使用 small
        },
        styleOverrides: {
          root: {
            height: '32px', // 与 TextField 保持一致的高度
            fontSize: '13px', // 与 TextField 保持一致的字体大小
            padding: '0', // 去除多余内边距
            '& .MuiInputBase-input': {
              padding: '4px 8px', // 输入框文字的内边距
            },
            // 多行容器需要自适应高度且内容从上方开始
            '&.MuiInputBase-multiline': {
              height: 'auto',
              alignItems: 'flex-start',
              padding: 0,
            },
          },
        },
      },
    },
  });
  return theme;
}

export { customCreateTheme as createTheme };
