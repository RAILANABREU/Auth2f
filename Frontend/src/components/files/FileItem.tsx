import { useState } from "react";
import { Box, Card, IconButton, Typography, CircularProgress } from "@mui/joy";
import { Download, Trash2, FileText } from "lucide-react";
import { filesService, FileMetadata } from "@/services/files";
import { useAuthStore } from "@/store/authStore";

interface FileItemProps {
  file: FileMetadata;
  onDelete: () => void;
}

export const FileItem = ({ file, onDelete }: FileItemProps) => {
  const { accessToken } = useAuthStore();
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const formatBytes = (bytes?: number | null) => {
    if (bytes === null || bytes === undefined) return "Tamanho desconhecido";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.min(
      Math.floor(Math.log(bytes) / Math.log(k)),
      sizes.length - 1
    );
    const value = bytes / Math.pow(k, i);
    return `${value.toFixed(value >= 10 ? 0 : 1)} ${sizes[i]}`;
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Data não disponível";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "Data inválida";
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDownload = async () => {
    if (!accessToken) return;

    setDownloading(true);
    try {
      const response = await filesService.downloadFile(file.id, accessToken);
      const contentType = response.headers.get("content-type") || "";
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      const isJson = contentType.includes("application/json");
      a.href = url;
      a.download = isJson
        ? `${file.filename_original}.envelope.json`
        : file.filename_original;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !accessToken ||
      !confirm("Tem certeza que deseja excluir este arquivo?")
    )
      return;

    setDeleting(true);
    try {
      await filesService.deleteFile(file.id, accessToken);
      onDelete();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card
      variant="outlined"
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "stretch", sm: "center" },
        justifyContent: "space-between",
        gap: { xs: 1.5, sm: 2 },
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 2.5 },
        "&:hover": {
          borderColor: "primary.outlinedBorder",
          boxShadow: "sm",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          width: { xs: "100%", sm: 56 },
          height: { xs: 56, sm: 56 },
          borderRadius: "12px",
          bgcolor: "trans{/parent",
        }}
      >
        <FileText size={32} color="var(--joy-palette-primary-500)" />
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
          minWidth: 0, // permite truncar texto
          flex: 1,
        }}
      >
        <Typography
          level="title-md"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={file.filename_original}
        >
          {file.filename_original}
        </Typography>

        <Typography level="body-sm" sx={{ color: "text.secondary" }}>
          {formatBytes(file.size_bytes)} • {formatDate(file.created_at)}
        </Typography>
      </Box>

      {/* Ações à direita */}
      <Box
        sx={{
          display: "flex",
          gap: 0.5,
          alignItems: "center",
          justifyContent: { xs: "flex-end", sm: "center" },
        }}
      >
        <IconButton
          variant="plain"
          color="primary"
          onClick={handleDownload}
          disabled={downloading}
          aria-label="Baixar arquivo"
          title="Baixar arquivo"
        >
          {downloading ? (
            <CircularProgress size="sm" />
          ) : (
            <Download size={20} />
          )}
        </IconButton>
        <IconButton
          variant="plain"
          color="danger"
          onClick={handleDelete}
          disabled={deleting}
          aria-label="Excluir arquivo"
          title="Excluir arquivo"
        >
          {deleting ? <CircularProgress size="sm" /> : <Trash2 size={20} />}
        </IconButton>
      </Box>
    </Card>
  );
};
