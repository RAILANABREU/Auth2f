import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, Card, Typography, IconButton, Alert } from '@mui/joy';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Smartphone } from 'lucide-react';

export const QrCodeCard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const otpauth_uri = location.state?.otpauth_uri || '';
  
  const [copied, setCopied] = useState(false);

  const secret = otpauth_uri.split('secret=')[1]?.split('&')[0] || '';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!otpauth_uri) {
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
        <Card sx={{ maxWidth: 480, padding: 4 }}>
          <Alert color="warning">
            Nenhum código QR disponível. Por favor, faça o registro novamente.
          </Alert>
          <Button onClick={() => navigate('/register')} sx={{ mt: 2 }}>
            Voltar ao registro
          </Button>
        </Card>
      </Box>
    );
  }

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
          maxWidth: 480,
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
            <Smartphone size={32} color="white" />
          </Box>
          <Typography level="h2" sx={{ mb: 1 }}>
            Configure o 2FA
          </Typography>
          <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
            Escaneie o código QR com seu app autenticador
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            padding: 3,
            background: 'white',
            borderRadius: '12px',
            mb: 3,
            boxShadow: 'sm',
          }}
        >
          <QRCodeSVG value={otpauth_uri} size={240} level="H" />
        </Box>

        <Alert color="neutral" sx={{ mb: 3 }}>
          <Typography level="body-sm" sx={{ mb: 1, fontWeight: 600 }}>
            Instruções:
          </Typography>
          <Typography level="body-sm" component="ol" sx={{ pl: 2, m: 0 }}>
            <li>Abra seu app autenticador (Google Authenticator, Authy, etc.)</li>
            <li>Escaneie o código QR acima</li>
            <li>Ou insira manualmente o código secreto abaixo</li>
          </Typography>
        </Alert>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            padding: 2,
            background: 'background.level1',
            borderRadius: '8px',
            mb: 3,
          }}
        >
          <Typography
            level="body-sm"
            sx={{
              flex: 1,
              fontFamily: 'monospace',
              wordBreak: 'break-all',
            }}
          >
            {secret}
          </Typography>
          <IconButton
            variant="plain"
            color={copied ? 'success' : 'neutral'}
            onClick={handleCopy}
          >
            {copied ? <Check size={20} /> : <Copy size={20} />}
          </IconButton>
        </Box>

        <Button
          fullWidth
          size="lg"
          onClick={() => navigate('/login')}
        >
          Já escaneei o código
        </Button>
      </Card>
    </Box>
  );
};
