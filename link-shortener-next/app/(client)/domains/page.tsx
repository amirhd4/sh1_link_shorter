"use client";

import React, {useEffect, useState} from 'react';
import {
  Box, Button, Typography, Stack, Chip, IconButton, Alert, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Snackbar,
  Card, CardContent, CircularProgress, Tooltip
} from '@mui/material';

import CheckIcon from '@mui/icons-material/Check';
import ReplayIcon from '@mui/icons-material/Replay';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import StarsIcon from '@mui/icons-material/Stars';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import VerifiedIcon from '@mui/icons-material/Verified';

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

  // خواندن دامنه‌ها
  const { data: domains = [], isLoading } = useQuery<DomainResponse[]>({
    queryKey: ['domains'],
    queryFn: async () => {
      try {
        return await domainService.getDomains();
      } catch (err: any) {
        setErrorMessage(err.response?.status === 401 ? 'دسترسی غیرمجاز' : 'خطا در بارگذاری دامنه‌ها');
        throw err;
      }
    },
  });

  // شروع تأیید
  const startMut = useMutation({
    mutationFn: (id: number) => domainService.startVerification(id),
    onSuccess: (res, id) => {
      const msg = [
        `HTTP path: ${res.http?.path ?? '-'}`,
        `HTTP content: ${res.http?.content ?? '-'}`,
        `DNS TXT name: ${res.dns?.txt_name ?? '-'}`,
        `DNS TXT value: ${res.dns?.txt_value ?? '-'}`,
      ].join('\n');

      setTokenDialog({ open: true, content: msg });

      qc.setQueryData<DomainResponse[]>(['domains'], old =>
        old?.map(d => d.id === id ? {...d} : d)
      );
    },
    onError: () => setErrorMessage('خطا در شروع تأیید دامنه.'),
  });

  // بررسی تأیید
  const checkMut = useMutation({
    mutationFn: (id: number) => domainService.checkVerification(id),
    onSuccess: (_, id) => {
      qc.setQueryData<DomainResponse[]>(['domains'], old =>
        old?.map(d => d.id === id ? {...d, is_verified: true} : d)
      );
      setSnackbar({open: true, message: 'دامنه با موفقیت تأیید شد!'});
    },
    onError: () => setErrorMessage('خطا در بررسی وضعیت'),
  });

  // تغییر وضعیت Primary
  const togglePrimaryMut = useMutation({
    mutationFn: (id: number) => domainService.togglePrimary(id), // خودت این API را بعداً بساز
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['domains'] });
      setSnackbar({open: true, message: 'وضعیت Primary تغییر کرد'});
    },
    onError: () => setErrorMessage('خطا در تغییر وضعیت Primary'),
  });

  // حذف دامنه
  const deleteMut = useMutation({
    mutationFn: (id: number) => domainService.deleteDomain(id), // بعداً API را بساز
    onSuccess: (_, id) => {
      qc.setQueryData<DomainResponse[]>(['domains'], old =>
        old?.filter(d => d.id !== id)
      );
      setSnackbar({open: true, message: 'دامنه حذف شد'});
    },
    onError: () => setErrorMessage('خطا در حذف دامنه'),
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setSnackbar({open: true, message: 'کپی شد!'});
    });
  };

  useEffect(() => {
    document.title = "مدیریت دامنه‌ها";
  }, []);

  return (
    <Box>

      <Stack spacing={2}>

        {/* عنوان صفحه */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" fontWeight="700">مدیریت دامنه‌ها</Typography>
          <Button variant="contained" size="large" onClick={() => setAddDialogOpen(true)}>
            افزودن دامنه جدید
          </Button>
        </Box>

        {/* خطا */}
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        {/* لودینگ */}
        {isLoading && <Typography>درحال بارگذاری...</Typography>}

        {/* لیست دامنه‌ها */}
        {!isLoading && domains.length === 0 && (
          <Typography>هیچ دامنه‌ای ثبت نشده است.</Typography>
        )}

        {!isLoading && domains.length > 0 && (
          <Stack spacing={2}>
            {domains.map(d => (
              <Card key={d.id} sx={{borderRadius: 3, boxShadow: 3}}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">

                    {/* اطلاعات دامنه */}
                    <Stack spacing={0.5}>
                      <Typography variant="h6" fontWeight="600">
                        {d.name}
                        {d.is_primary && (
                          <Chip
                            label="مورد استفاده"
                            color="info"
                            size="small"
                            sx={{ml: 1}}
                          />
                        )}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        شناسه دامنه: {d.id}
                      </Typography>
                        {d.user_id !== null ? (
                      <Stack direction="row" spacing={1} alignItems="center">
                        {d.is_verified ? (
                          <Chip
                            icon={<VerifiedIcon />}
                            label="تأیید شده"
                            color="success"
                            size="small"
                          />
                        ) : (
                          <Chip
                            label="تأیید نشده"
                            color="warning"
                            size="small"
                          />
                        )}
                      </Stack>
                            ) : <Chip
                            // icon={<VerifiedIcon />}
                            label="دامنه لِس"
                            color="success"
                            size="small"
                          /> }
                    </Stack>

                    {/* اکشن‌ها */}
                    {/* فقط دامنه‌های خصوصی قابل مدیریت هستند */}
                    {d.user_id !== null && (
                      <Stack direction="row" spacing={1}>

                        {/* تغییر Primary */}
                        <Tooltip title="تغییر وضعیت Primary">
                          <IconButton onClick={() => togglePrimaryMut.mutate(d.id)}>
                            {togglePrimaryMut.isPending ?
                              <CircularProgress size={20} /> :
                              d.is_primary ? <StarsIcon color="info" /> : <StarBorderIcon />
                            }
                          </IconButton>
                        </Tooltip>

                        {/* شروع تأیید */}
                        {!d.is_verified && (
                          <Button
                            variant="outlined"
                            onClick={() => startMut.mutate(d.id)}
                            disabled={startMut.isPending}
                          >
                            {startMut.isPending ? <CircularProgress size={18}/> : 'شروع تأیید'}
                          </Button>
                        )}

                        {/* بررسی تأیید */}
                        {!d.is_verified && (
                          <Tooltip title="بررسی دامنه">

                          <IconButton onClick={() => checkMut.mutate(d.id)}>
                            {checkMut.isPending ?
                              <CircularProgress size={20}/> :
                              <ReplayIcon />
                            }
                          </IconButton>
                          </Tooltip>

                        )}

                        {/* حذف */}
                        <Tooltip title="حذف دامنه">
                          <IconButton color="error" onClick={() => deleteMut.mutate(d.id)}>
                            {deleteMut.isPending ? <CircularProgress size={20}/> : <DeleteIcon />}
                          </IconButton>
                        </Tooltip>

                      </Stack>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}

      </Stack>

      <AddDomainDialog open={isAddDialogOpen} onClose={() => setAddDialogOpen(false)} />

      {/* Dialog نمایش توکن */}
      <Dialog open={tokenDialog.open} onClose={() => setTokenDialog({open:false, content:''})}>
        <DialogTitle>دستورالعمل تأیید دامنه</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            minRows={4}
            value={tokenDialog.content}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <IconButton onClick={() => handleCopy(tokenDialog.content)}>
                  <ContentCopyIcon />
                </IconButton>
              )
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTokenDialog({open:false, content:''})}>بستن</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar({open:false, message:''})}
        message={snackbar.message}
      />

    </Box>
  );
}
