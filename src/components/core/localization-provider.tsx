'use client';

import * as React from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs';
import { LocalizationProvider as Provider } from '@mui/x-date-pickers-pro/LocalizationProvider';

// import dayjs from 'dayjs';
// import 'dayjs/locale/ja';
// dayjs.locale('ja');

import 'dayjs/locale/zh-cn';
export interface LocalizationProviderProps {
  children: React.ReactNode;
}

export function LocalizationProvider({
  children,
}: LocalizationProviderProps): React.JSX.Element {
  return (
    <Provider dateAdapter={AdapterDayjs} adapterLocale="zh-cn">
      {children}
    </Provider>
  );
}
