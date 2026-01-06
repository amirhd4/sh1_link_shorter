"use client";

import React, {useEffect, useState} from 'react';
import { Box, Button, Typography, Stack, Chip, IconButton, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ReplayIcon from '@mui/icons-material/Replay';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { domainService } from '@/services/domainService';
import type { DomainResponse } from '@/types/api';
import { AddDomainDialog } from "@/components/client-dashboard/AddDomainDialog";

export default function DomainsManager () {
  const qc = useQueryClient();
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tokenDialog, setTokenDialog] = useState<{open: boolean; content: string}>({open: false, content: ''});
  const [snackbar, setSnackbar] = useState<{open: boolean; message: string}>({open: false, message: ''});

  const { data: domains = [], isLoading } = useQuery<DomainResponse[]>({
    queryKey: ['domains'],
    queryFn: async () => {
      try {
        return await domainService.getDomains();
      } catch (err: any) {
        console.error(err);
        setErrorMessage(err.response?.status === 401 ? 'دسترسی غیرمجاز' : 'خطا در بارگذاری دامنه‌ها');
        throw err;
      }
    },
  });

  const startMut = useMutation({
    mutationFn: (id: number) => domainService.startVerification(id),
    onSuccess: (res, id) => {
      // نمایش Dialog با توکن
      const instructions = [
        `HTTP path: ${res.http?.path ?? '-'}`,
        `HTTP content: ${res.http?.content ?? '-'}`,
        `DNS TXT name: ${res.dns?.txt_name ?? '-'}`,
        `DNS TXT value: ${res.dns?.txt_value ?? '-'}`,
      ].join('\n');

      setTokenDialog({ open: true, content: instructions });
      // Cache آپدیت
      qc.setQueryData<DomainResponse[]>(['domains'], old =>
        old?.map(d => d.id === id ? {...d} : d)
      );
    },
    onError: (err) => {
      console.error(err);
      setErrorMessage('خطا در شروع تأیید دامنه.');
    },
  });

  const checkMut = useMutation({
    mutationFn: (id: number) => domainService.checkVerification(id),
    onSuccess: (_, id) => {
      // Cache آپدیت: set is_verified = true
      qc.setQueryData<DomainResponse[]>(['domains'], old =>
        old?.map(d => d.id === id ? {...d, is_verified: true} : d)
      );
      setSnackbar({open: true, message: 'دامنه با موفقیت تایید شد!'});
    },
    onError: (err) => {
      console.error(err);
      setErrorMessage('خطا در بررسی وضعیت دامنه.');
    },
  });

  const handleStartVerification = async (id: number) => {
    try {
      await startMut.mutateAsync(id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setSnackbar({open: true, message: 'کپی شد!'});
    });
  };
useEffect(() => {
    document.title = "مدیریت دامنه ها";
  }, []);
  return (
    <Box>
      <Stack spacing={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">مدیریت دامنه‌ها</Typography>
          <Button variant="contained" onClick={() => setAddDialogOpen(true)}>افزودن دامنه</Button>
        </Box>

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        {isLoading ? (
          <Typography>درحال بارگذاری...</Typography>
        ) : domains.length === 0 ? (
          <Typography>هیچ دامنه‌ای ثبت نشده است.</Typography>
        ) : (
          domains.map(d => (
            <Box key={d.id} sx={{p:2, borderRadius:2, border:'1px solid #eee', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <Stack>
                <Typography fontWeight="bold">
                  {d.name} {d.is_primary && <Chip label="Primary" size="small" />}
                </Typography>
                <Typography variant="caption">
                  {Boolean(d.is_verified) ? 'تایید شده' : 'تایید نشده'}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1}>
                {!d.is_verified && (
                  <>
                    <Button onClick={() => handleStartVerification(d.id)} disabled={startMut.isPending}>شروع تأیید</Button>
                    <Button onClick={() => checkMut.mutate(d.id)} disabled={checkMut.isPending} startIcon={<ReplayIcon />}>بررسی وضعیت</Button>
                  </>
                )}
                {d.is_verified && (
                  <IconButton title="تایید شده"><CheckIcon color="success" /></IconButton>
                )}
              </Stack>
            </Box>
          ))
        )}
      </Stack>

      <AddDomainDialog open={isAddDialogOpen} onClose={() => setAddDialogOpen(false)} />

      {/* Dialog نمایش توکن */}
      <Dialog open={tokenDialog.open} onClose={() => setTokenDialog({open:false, content:''})}>
        <DialogTitle>دستورالعمل تایید دامنه</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            minRows={4}
            value={tokenDialog.content}
            InputProps={{readOnly:true, endAdornment: (
              <IconButton onClick={() => handleCopy(tokenDialog.content)}><ContentCopyIcon /></IconButton>
            )}}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTokenDialog({open:false, content:''})}>بستن</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({open:false, message:''})}
        message={snackbar.message}
      />
    </Box>
  );
};
