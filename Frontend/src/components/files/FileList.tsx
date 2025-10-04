import { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Alert } from "@mui/joy";
import { Files as FilesIcon } from "lucide-react";
import { filesService, FileMetadata } from "@/services/files";
import { useAuthStore } from "@/store/authStore";
import { FileItem } from "./FileItem";

export const FileList = () => {
  const { accessToken } = useAuthStore();
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFiles = async () => {
    if (!accessToken) return;

    setLoading(true);
    setError("");

    try {
      const data = await filesService.listFiles(accessToken);
      // O backend responde { files: [...] }. Se algum interceptor mudar isso, protegemos aqui.
      const items = Array.isArray(data as any)
        ? (data as any)
        : (data as any)?.files;

      if (!Array.isArray(items)) {
        throw new Error(
          "Invalid response from server: expected an array of files."
        );
      }

      setFiles(items as FileMetadata[]);
    } catch (err: any) {
      // Tratamento amigável, com 401 opcional
      const msg =
        typeof err?.message === "string" ? err.message : "Failed to load files";
      setError(msg);
      setFiles([]); // garante que não é setado algo não-array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [accessToken]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <CircularProgress size="lg" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert color="danger" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (files.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 400,
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "20px",
            background: "background.level1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
          }}
        >
          <FilesIcon size={40} color="var(--joy-palette-text-tertiary)" />
        </Box>
        <Typography level="h4" sx={{ mb: 1, color: "text.primary" }}>
          Nenhum arquivo enviado ainda
        </Typography>
        <Typography level="body-md" sx={{ color: "text.secondary" }}>
          Clique no botão de upload para adicionar seus arquivos
        </Typography>
      </Box>
    );
  }

  const safeFiles = Array.isArray(files) ? files : [];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {safeFiles.map((file) => (
        <FileItem key={file.id} file={file} onDelete={loadFiles} />
      ))}
    </Box>
  );
};
