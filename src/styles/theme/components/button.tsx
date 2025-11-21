import type { Components } from '@mui/material/styles';

import type { Theme } from '../types';

export const MuiButton = {
  styleOverrides: {
    root: { borderRadius: '4px', textTransform: 'none' },
    sizeSmall: { padding: '4px 10px' },
    sizeMedium: { padding: '6px 16px' },
    sizeLarge: { padding: '8px 22px' },
    textSizeSmall: { padding: '4px 8px' },
    textSizeMedium: { padding: '6px 16px' },
    textSizeLarge: { padding: '8px 16px' },
  },
} satisfies Components<Theme>['MuiButton'];
