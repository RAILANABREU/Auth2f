import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Card, Typography, Alert, Input } from "@mui/joy";
import { ShieldCheck } from "lucide-react";
import { authService } from "@/services/auth";
import { useAuthStore } from "@/store/authStore";

export const TwoFAForm = () => {
  const navigate = useNavigate();
  const { pre2faToken, accessToken, setAccessToken, setPre2faToken } =
    useAuthStore();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid = code.length === 6 && /^\d+$/.test(code);

  // Redireciona automaticamente quando já houver accessToken (ex.: após setAccessToken persistir)
  useEffect(() => {
    if (accessToken) {
      navigate("/app/files", { replace: true });
    }
  }, [accessToken, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !pre2faToken) return;

    setLoading(true);
    setError("");
    try {
      const response = await authService.verify2FA(pre2faToken, code);
      const token = (response as any)?.access_token;
      if (!token) {
        throw new Error("Token de acesso ausente na resposta da API.");
      }
      // Persiste o access token no store (e.g., sessionStorage por trás)
      setAccessToken(token);
      setPre2faToken(null);

      // Navega para o app; também temos o efeito acima que garante o redirect
      navigate("/app/files", { replace: true });
    } catch (err) {
      console.error("[TwoFA] verify2FA error:", err);
      setError(
        err instanceof Error ? err.message : "Falha na verificação do código."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(value);
    // console.debug('[TwoFA] code:', value);
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
            <ShieldCheck size={32} color="white" />
          </Box>
          <Typography level="h2" sx={{ mb: 1 }}>
            Verificação em duas etapas
          </Typography>
          <Typography level="body-sm" sx={{ color: "text.secondary" }}>
            Digite o código de 6 dígitos do seu autenticador
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          {error && (
            <Alert color="danger" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            <Input
              type="text"
              inputMode="numeric"
              value={code}
              onChange={handleCodeChange}
              placeholder="000000"
              size="lg"
              sx={{
                fontSize: "2rem",
                textAlign: "center",
                letterSpacing: "0.5em",
                fontFamily: "monospace",
                fontWeight: 600,
              }}
              slotProps={{
                input: {
                  maxLength: 6,
                },
              }}
            />
          </Box>

          <Button
            type="submit"
            fullWidth
            size="lg"
            variant="solid"
            loading={loading}
            disabled={!isValid || loading}
          >
            Verificar código
          </Button>
        </form>
      </Card>
    </Box>
  );
};
