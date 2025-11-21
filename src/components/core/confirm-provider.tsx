'use client';

import * as React from 'react';
import { ConfirmProvider } from 'material-ui-confirm';

interface Props {
  children: React.ReactNode;
}
// 不能直接用<ConfirmProvider> 套在layout的children外面，默认是server的，所以要自建一个provider配成use client
export function AppConfirmProvider({ children }: Props): React.JSX.Element {
  return <ConfirmProvider>{children}</ConfirmProvider>;
}
