import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { domainService } from '../../services/domainService';

export const AddDomainDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [name, setName] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => domainService.addDomain(name.trim().toLowerCase(), isPrimary),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['domains'] });
      handleClose();
    },
  });

  const handleSubmit = () => {
    if (!name.trim()) return;
    mutation.mutate();
  };

  const handleClose = () => {
    setName('');
    setIsPrimary(false);
    mutation.reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>افزودن دامنهٔ اختصاصی</DialogTitle>
      <DialogContent>
        <TextField
          label="domain.com"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
          placeholder="example.com"
          autoFocus
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
            />
          }
          label="به‌عنوان دامنهٔ پیش‌فرض (Primary) تنظیم شود"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>لغو</Button>
        <Button
          onClick={handleSubmit}
          disabled={mutation.isPending}
          variant="contained"
          startIcon={mutation.isPending ? <CircularProgress size={20} /> : null}
        >
          افزودن
        </Button>
      </DialogActions>
    </Dialog>
  );
};