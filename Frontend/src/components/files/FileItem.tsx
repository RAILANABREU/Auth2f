import { useState } from 'react';
import { Box, Card, IconButton, Typography, CircularProgress } from '@mui/joy';
import { Download, Trash2, FileText } from 'lucide-react';
import { filesService, FileMetadata } from '@/services/files';
import { useAuthStore } from '@/store/authStore';

interface FileItemProps {
  file: FileMetadata;
  onDelete: () => void;
}

export const FileItem = ({ file, onDelete }: FileItemProps) => {
  const { accessToken } = useAuthStore();
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownload = async () => {
    if (!accessToken) return;

    setDownloading(true);
    try {
      const response = await filesService.downloadFile(file.id, accessToken);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!accessToken || !confirm('Tem certeza que deseja excluir este arquivo?')) return;

    setDeleting(true);
    try {
      await filesService.deleteFile(file.id, accessToken);
      onDelete();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card
      variant="outlined"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: 2,
        '&:hover': {
          borderColor: 'primary.outlinedBorder',
          boxShadow: 'sm',
        },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '12px',
          background: 'background.level1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <FileText size={24} color="var(--joy-palette-primary-500)" />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          level="title-sm"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {file.filename}
        </Typography>
        <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
          {formatBytes(file.file_size)} • {formatDate(file.upload_date)}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <IconButton
          variant="plain"
          color="primary"
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading ? <CircularProgress size="sm" /> : <Download size={20} />}
        </IconButton>
        <IconButton
          variant="plain"
          color="danger"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? <CircularProgress size="sm" /> : <Trash2 size={20} />}
        </IconButton>
      </Box>
    </Card>
  );
};
