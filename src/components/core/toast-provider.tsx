'use client';

import * as React from 'react';
import { Snackbar, Alert } from '@mui/material';
import type { AlertColor } from '@mui/material';
import { onToast } from '@/utils/toast';

interface ToastState {
  open: boolean;
  message: string;
  severity: AlertColor;
  autoHideDuration?: number;
}

export function ToastProvider(): React.JSX.Element {
  const [state, setState] = React.useState<ToastState>({
    open: false,
    message: '',
    severity: 'info',
    autoHideDuration: 3000,
  });

  React.useEffect(() => {
    const unsubscribe = onToast((payload) => {
      setState({
        open: true,
        message: payload.message,
        severity: payload.severity ?? 'info',
        autoHideDuration: payload.duration ?? 3000,
      });
    });
    return () => unsubscribe();
  }, []);

  const handleClose = (_?: unknown, reason?: string) => {
    if (reason === 'clickaway') return;
    setState((prev) => ({ ...prev, open: false }));
  };

  return (
    <Snackbar
      open={state.open}
      autoHideDuration={state.autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        // onClose={handleClose} // 不显示"X"
        severity={state.severity}
        sx={{ width: '100%' }}
      >
        {state.message}
      </Alert>
    </Snackbar>
  );
}
