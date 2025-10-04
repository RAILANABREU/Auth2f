import { ReactNode } from 'react';
import { Box } from '@mui/joy';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface AppShellProps {
  children: ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Topbar />
        <Box
          component="main"
          sx={{
            flex: 1,
            padding: { xs: 2, sm: 3 },
            background: 'background.body',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};
