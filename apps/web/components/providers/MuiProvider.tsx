'use client';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ReactNode } from 'react';
import gymTheme from '@repo/ui/theme';

export default function MuiProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={gymTheme}>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  );
}
