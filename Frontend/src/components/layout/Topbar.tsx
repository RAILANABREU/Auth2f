import { useState } from 'react';
import { Box, IconButton, Sheet, Typography } from '@mui/joy';
import { Upload } from 'lucide-react';
import { UploadDialog } from '@/components/files/UploadDialog';

export const Topbar = () => {
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <>
      <Sheet
        sx={{
          height: 64,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 2,
        }}
      >
        <Typography level="h4" sx={{ fontWeight: 600 }}>
          Meus Arquivos
        </Typography>

        <IconButton
          variant="solid"
          color="primary"
          onClick={() => setUploadOpen(true)}
          sx={{
            borderRadius: '12px',
          }}
        >
          <Upload size={20} />
        </IconButton>
      </Sheet>

      <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </>
  );
};
