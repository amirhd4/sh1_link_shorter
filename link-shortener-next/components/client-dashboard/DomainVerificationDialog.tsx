import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, IconButton, Stack } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export function DomainVerificationDialog({ open, onClose, data }: { open: boolean; onClose: () => void; data: any | null }) {
  // data is the startVerification response
  if (!data) return null;
  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>دستورالعمل تأیید دامنه</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="subtitle2">روش HTTP</Typography>
          <Typography variant="body2">مسیر: <code>{data.http.path}</code></Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>{data.http.content}</Typography>
            <IconButton size="small" onClick={() => copy(data.http.content)}><ContentCopyIcon /></IconButton>
          </Stack>

          <Typography variant="subtitle2">روش DNS (TXT)</Typography>
          <Typography variant="body2">{data.dns.txt_name}</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>{data.dns.txt_value}</Typography>
            <IconButton size="small" onClick={() => copy(data.dns.txt_value)}><ContentCopyIcon /></IconButton>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>بستن</Button>
      </DialogActions>
    </Dialog>
  );
}
