import React, { useState } from 'react';
import { Box, Button, Typography, Stack, Chip, IconButton, Alert } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ReplayIcon from '@mui/icons-material/Replay';
import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { domainService } from '../services/domainService';
import type { DomainResponse } from '../types/api';
import { AddDomainDialog } from "../features/client-dashboard/components/AddDomainDialog.tsx";

export const DomainsManager = () => {
  const qc = useQueryClient();
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: domains = [], isLoading, error } = useQuery({
  queryKey: ['domains'],
  queryFn: async () => {
    try {
      return await domainService.getDomains();
    } catch (err: any) {
      if (err.response?.status === 401) {
        setErrorMessage('دسترسی غیرمجاز. لطفاً وارد شوید.');
      } else {
        setErrorMessage('خطا در بارگذاری دامنه‌ها.');
      }
      throw err;
    }
  },
});




  // const { data: domains = [], isLoading } = useQuery<DomainResponse[], Error>(queryOptions);

  const startMut = useMutation({
    mutationFn: (id: number) => domainService.startVerification(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['domains'] }),
    onError: () => setErrorMessage('خطا در شروع تأیید دامنه.'),
  });

  const checkMut = useMutation({
    mutationFn: (id: number) => domainService.checkVerification(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['domains'] }),
    onError: () => setErrorMessage('خطا در بررسی وضعیت دامنه.'),
  });

  const handleStartVerification = async (id: number) => {
    try {
      const res = await startMut.mutateAsync(id);
      const instructions = [
        `HTTP path: ${res.http?.path ?? '-'}`,
        `HTTP content: ${res.http?.content ?? '-'}`,
        `DNS TXT name: ${res.dns?.txt_name ?? '-'}`,
        `DNS TXT value: ${res.dns?.txt_value ?? '-'}`,
      ].join('\n');
      alert(instructions);
    } catch (error) {
      console.error(error);
    }
  };

  const openAddDialog = () => setAddDialogOpen(true);
  const closeAddDialog = () => setAddDialogOpen(false);

  return (
    <Box>
      <Stack spacing={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">مدیریت دامنه‌ها</Typography>
          <Button variant="contained" onClick={openAddDialog}>
            افزودن دامنه
          </Button>
        </Box>

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        {isLoading ? (
          <Typography>درحال بارگذاری...</Typography>
        ) : domains.length === 0 ? (
          <Typography>هیچ دامنه‌ای ثبت نشده است.</Typography>
        ) : (
          domains.map((d) => (
            <Box
              key={d.id}
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Stack>
                <Typography fontWeight="bold">
                  {d.name} {d.is_primary && <Chip label="Primary" size="small" />}
                </Typography>
                <Typography variant="caption">
                  {d.is_verified ? 'تایید شده' : 'تایید نشده'}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1}>
                {!d.is_verified && (
                  <>
                    <Button
                      onClick={() => handleStartVerification(d.id)}
                      disabled={startMut.isPending}
                    >
                      شروع تأیید
                    </Button>

                    <Button
                      onClick={() => checkMut.mutate(d.id)}
                      disabled={checkMut.isPending}
                      startIcon={<ReplayIcon />}
                    >
                      بررسی وضعیت
                    </Button>
                  </>
                )}

                {d.is_verified && (
                  <IconButton title="تایید شده">
                    <CheckIcon color="success" />
                  </IconButton>
                )}
              </Stack>
            </Box>
          ))
        )}
      </Stack>

      <AddDomainDialog open={isAddDialogOpen} onClose={closeAddDialog} />
    </Box>
  );
};
