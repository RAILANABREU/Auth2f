import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
} from "@mui/joy";
import { Eye, EyeOff, Lock } from "lucide-react";
import { authService } from "@/services/auth";
import { useAuthStore } from "@/store/authStore";

export const LoginForm = () => {
  const navigate = useNavigate();
  const { setPre2faToken } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid = username.trim() && password.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setError("");

    try {
      const response = await authService.login(username, password);
      setPre2faToken(response.token);
      navigate("/2fa");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0B6BCB 0%, #084592 100%)",
        padding: 3,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 440,
          padding: 4,
          boxShadow: "xl",
        }}
      >
        <Box sx={{ mb: 3, textAlign: "center" }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "16px",
              background: "linear-gradient(135deg, #0B6BCB 0%, #084592 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Lock size={32} color="white" />
          </Box>
          <Typography level="h2" sx={{ mb: 1 }}>
            Bem-vindo de volta
          </Typography>
          <Typography level="body-sm" sx={{ color: "text.secondary" }}>
            Entre para acessar seus arquivos
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          {error && (
            <Alert color="danger" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <FormControl sx={{ mb: 2 }}>
            <FormLabel>Usuário ou Email</FormLabel>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="seu.usuario"
              autoComplete="username"
              size="lg"
            />
          </FormControl>

          <FormControl sx={{ mb: 3 }}>
            <FormLabel>Senha</FormLabel>
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
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

          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={loading}
            disabled={!isValid}
            sx={{ mb: 2 }}
          >
            Fazer login
          </Button>

          <Typography level="body-sm" sx={{ textAlign: "center" }}>
            Não tem uma conta?{" "}
            <Link
              to="/register"
              style={{
                color: "var(--joy-palette-primary-500)",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Cadastre-se
            </Link>
          </Typography>
        </form>
      </Card>
    </Box>
  );
};
