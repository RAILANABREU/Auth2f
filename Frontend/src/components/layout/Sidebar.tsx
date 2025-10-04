import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, Sheet, Typography } from '@mui/joy';
import { Files, LogOut, Lock } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sheet
      sx={{
        width: { xs: 0, sm: 240 },
        height: '100vh',
        borderRight: '1px solid',
        borderColor: 'divider',
        display: { xs: 'none', sm: 'flex' },
        flexDirection: 'column',
        padding: 2,
      }}
    >
      <Box sx={{ mb: 3, padding: 2 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0B6BCB 0%, #084592 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1,
          }}
        >
          <Lock size={20} color="white" />
        </Box>
        <Typography level="title-lg" sx={{ fontWeight: 700 }}>
          SecureFiles
        </Typography>
      </Box>

      <Box sx={{ flex: 1 }}>
        <Button
          variant={isActive('/app/files') ? 'soft' : 'plain'}
          color={isActive('/app/files') ? 'primary' : 'neutral'}
          startDecorator={<Files size={20} />}
          onClick={() => navigate('/app/files')}
          sx={{
            width: '100%',
            justifyContent: 'flex-start',
            mb: 1,
          }}
        >
          Arquivos
        </Button>
      </Box>

      <Button
        variant="plain"
        color="danger"
        startDecorator={<LogOut size={20} />}
        onClick={handleLogout}
        sx={{
          width: '100%',
          justifyContent: 'flex-start',
        }}
      >
        Sair
      </Button>
    </Sheet>
  );
};
