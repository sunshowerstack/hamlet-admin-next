import type { AlertColor } from '@mui/material';

type ToastPayload = {
  message: string;
  severity?: AlertColor;
  duration?: number;
};

type Listener = (payload: ToastPayload) => void;

let listeners: Listener[] = [];

export function showToast(message: string, severity: AlertColor = 'info', duration = 3000): void {
  const payload: ToastPayload = { message, severity, duration };
  // 在浏览器环境下才通知（Next SSR 阶段无需）
  if (globalThis.window !== undefined) {
    listeners.forEach((fn) => {
      try {
        fn(payload);
      } catch {
        // ignore
      }
    });
  }
}

export function onToast(fn: Listener): () => void {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

export type { ToastPayload };
