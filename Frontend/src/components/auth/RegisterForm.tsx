import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Typography,
  IconButton,
  Alert,
  Card,
  FormHelperText,
} from '@mui/joy';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { authService } from '@/services/auth';

export const RegisterForm = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordsMatch = password === confirmPassword;
  const isValid = username.trim() && password.trim() && confirmPassword && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setError('');

    try {
      const response = await authService.register(username, password);
      navigate('/setup-2fa', { state: { otpauth_uri: response.otpauth_uri } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0B6BCB 0%, #084592 100%)',
        padding: 3,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 440,
          padding: 4,
          boxShadow: 'xl',
        }}
      >
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #0B6BCB 0%, #084592 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <ShieldCheck size={32} color="white" />
          </Box>
          <Typography level="h2" sx={{ mb: 1 }}>
            Criar conta
          </Typography>
          <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
            Compartilhamento seguro de arquivos
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          {error && (
            <Alert color="danger" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <FormControl sx={{ mb: 2 }}>
            <FormLabel>Usuário</FormLabel>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="seu.usuario"
              autoComplete="username"
              size="lg"
            />
          </FormControl>

          <FormControl sx={{ mb: 2 }}>
            <FormLabel>Senha</FormLabel>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              size="lg"
              endDecorator={
                <IconButton
                  variant="plain"
                  onClick={() => setShowPassword(!showPassword)}
                  sx={{ mr: -1 }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </IconButton>
              }
            />
          </FormControl>

          <FormControl sx={{ mb: 3 }} error={confirmPassword && !passwordsMatch}>
            <FormLabel>Confirmar Senha</FormLabel>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              size="lg"
            />
            {confirmPassword && !passwordsMatch && (
              <FormHelperText>As senhas não coincidem</FormHelperText>
            )}
          </FormControl>

          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={loading}
            disabled={!isValid}
            sx={{ mb: 2 }}
          >
            Criar conta
          </Button>

          <Typography level="body-sm" sx={{ textAlign: 'center' }}>
            Já tem uma conta?{' '}
            <Link
              to="/login"
              style={{
                color: 'var(--joy-palette-primary-500)',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Fazer login
            </Link>
          </Typography>
        </form>
      </Card>
    </Box>
  );
};
