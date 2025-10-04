import { useState } from 'react';
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  Button,
  FormControl,
  FormLabel,
  Input,
  LinearProgress,
  Box,
  Alert,
} from '@mui/joy';
import { Upload, File as FileIcon } from 'lucide-react';
import { filesService } from '@/services/files';
import { useAuthStore } from '@/store/authStore';
import { createEncryptedEnvelope } from '@/utils/crypto/envelope';

interface UploadDialogProps {
  open: boolean;
  onClose: () => void;
}

export const UploadDialog = ({ open, onClose }: UploadDialogProps) => {
  const { accessToken } = useAuthStore();
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      setSuccess('');
    }
  };

  const handleUpload = async () => {
    if (!file || !password || !accessToken) return;

    setUploading(true);
    setProgress(10);
    setError('');
    setSuccess('');

    try {
      // Encrypt file
      setProgress(30);
      const envelope = await createEncryptedEnvelope(file, password);
      
      setProgress(50);

      // Prepare form data
      const formData = new FormData();
      formData.append('filename', file.name);
      formData.append('v', '1');
      formData.append('kdf', 'scrypt');
      formData.append('kdf_params', JSON.stringify(envelope.kdfParams));
      formData.append('salt', envelope.salt);
      formData.append('nonce', envelope.nonce);
      formData.append('file', envelope.ciphertext, file.name);

      setProgress(70);

      // Upload
      await filesService.uploadFile(formData, accessToken);

      setProgress(100);
      setSuccess('Arquivo salvo com sucesso!');
      
      setTimeout(() => {
        setFile(null);
        setPassword('');
        setProgress(0);
        onClose();
        window.location.reload(); // Refresh file list
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFile(null);
      setPassword('');
      setProgress(0);
      setError('');
      setSuccess('');
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalDialog sx={{ width: 480, maxWidth: '90vw' }}>
        <ModalClose disabled={uploading} />
        
        <Typography level="h4" sx={{ mb: 2 }}>
          Upload de Arquivo
        </Typography>

        {error && (
          <Alert color="danger" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert color="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <FormControl sx={{ mb: 2 }}>
          <FormLabel>Selecionar arquivo</FormLabel>
          <Button
            component="label"
            variant="outlined"
            startDecorator={<FileIcon size={20} />}
            disabled={uploading}
            sx={{ justifyContent: 'flex-start' }}
          >
            {file ? file.name : 'Escolher arquivo...'}
            <input
              type="file"
              hidden
              onChange={handleFileChange}
              disabled={uploading}
            />
          </Button>
        </FormControl>

        <FormControl sx={{ mb: 2 }}>
          <FormLabel>Senha de criptografia</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite uma senha forte"
            disabled={uploading}
          />
          <Typography level="body-xs" sx={{ mt: 0.5, color: 'text.secondary' }}>
            Esta senha será necessária para descriptografar o arquivo
          </Typography>
        </FormControl>

        {uploading && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress
              determinate
              value={progress}
              sx={{ mb: 1 }}
            />
            <Typography level="body-sm" sx={{ textAlign: 'center' }}>
              {progress < 30 && 'Preparando...'}
              {progress >= 30 && progress < 70 && 'Criptografando...'}
              {progress >= 70 && progress < 100 && 'Enviando...'}
              {progress === 100 && 'Concluído!'}
            </Typography>
          </Box>
        )}

        <Button
          startDecorator={<Upload size={20} />}
          onClick={handleUpload}
          loading={uploading}
          disabled={!file || !password || uploading}
          fullWidth
        >
          Enviar arquivo
        </Button>
      </ModalDialog>
    </Modal>
  );
};
