"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/adminService";
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  Button,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import { useRouter } from "next/navigation";
import { formatJalaliDate } from "@/utils/jalali_date";
import type { AdminSMS } from "@/types/api";
import dayjs from "dayjs";

const PAGE_SIZE = 10;

export default function AdminSMSPage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [selectedSMS, setSelectedSMS] = useState<number | null>(null);

  const { data = [], isLoading } = useQuery<AdminSMS[]>({
    queryKey: ["admin-sms-list"],
    queryFn: adminService.getAllSMS
  });

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const processed = useMemo(() => {
    let res = [...data];
    if (search.trim()) {
      res = res.filter(
        (s) =>
          s.message_text.toLowerCase().includes(search.toLowerCase()) ||
          s.sender_mobile.includes(search)
      );
    }
    return res.sort(
      (a, b) => dayjs(b.received_at).unix() - dayjs(a.received_at).unix()
    );
  }, [data, search]);

  const totalPages = Math.ceil(processed.length / PAGE_SIZE);
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return processed.slice(start, start + PAGE_SIZE);
  }, [processed, page]);

  const { data: smsDetail, isLoading: smsLoading } = useQuery({
    queryKey: ["admin-sms-detail", selectedSMS],
    queryFn: () => adminService.getSMSDetail(selectedSMS!),
    enabled: !!selectedSMS
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" mb={3}>
        پیامک‌های دریافتی
      </Typography>

      <Box display="flex" gap={2} mb={3}>
        <TextField
          size="small"
          placeholder="جستجوی متن یا شماره..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>شماره فرستنده</TableCell>
              <TableCell>متن پیام</TableCell>
              <TableCell>کاربر سیستم</TableCell>
              <TableCell>تاریخ دریافت</TableCell>
              <TableCell>وضعیت</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginated.map((sms) => (
              <TableRow
                key={sms.id}
                hover
                sx={{ cursor: "pointer" }}
                onClick={() => setSelectedSMS(sms.id)}
              >
                <TableCell>{sms.sender_mobile}</TableCell>

                <TableCell>{sms.message_text}</TableCell>

                <TableCell>
                  {sms.is_known_user ? (
                    <Button
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/admin/users/${sms.user_id}`);
                      }}
                    >
                      {sms.user_fullname || "مشاهده کاربر"}
                    </Button>
                  ) : (
                    <Chip size="small" label="غیرکاربر" />
                  )}
                </TableCell>

                <TableCell>
                  {formatJalaliDate(sms.received_at, true)}
                </TableCell>

                <TableCell>
                  {sms.is_processed ? (
                    <Chip
                      label="پردازش‌شده"
                      color="success"
                      variant="filled"
                      size="small"
                    />
                  ) : (
                    <Chip
                      label="پردازش‌نشده"
                      color="warning"
                      variant="outlined"
                      size="small"
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, v) => setPage(v)}
          />
        </Box>
      )}

      {/* ---------- MODAL ---------- */}
      <Dialog
        open={!!selectedSMS}
        onClose={() => setSelectedSMS(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>جزئیات پیامک</DialogTitle>

        <DialogContent>
          {smsLoading ? (
            <CircularProgress />
          ) : smsDetail ? (
            <Box display="flex" flexDirection="column" gap={2} mt={1}>
              <Typography>
                <b>شماره فرستنده:</b> {smsDetail.sender_mobile}
              </Typography>

              <Typography>
                <b>شماره گیرنده:</b> {smsDetail.receiver_number}
              </Typography>

              <Typography>
                <b>متن پیام:</b>
              </Typography>

              <Paper sx={{ p: 2 }}>{smsDetail.message_text}</Paper>

              <Typography>
                <b>زمان دریافت:</b>{" "}
                {formatJalaliDate(smsDetail.received_at, true)}
              </Typography>

              <Box display="flex" gap={1} alignItems="center">
                <Typography>
                  <b>وضعیت:</b>
                </Typography>

                {smsDetail.is_processed ? (
                  <Chip
                    label="پردازش‌شده"
                    color="success"
                    variant="filled"
                    size="small"
                  />
                ) : (
                  <Chip
                    label="پردازش‌نشده"
                    color="warning"
                    variant="outlined"
                    size="small"
                  />
                )}
              </Box>
            </Box>
          ) : null}
        </DialogContent>

        <DialogActions>
          {!smsDetail?.is_processed && (
            <Button
              variant="contained"
              color="success"
              onClick={async () => {
                await adminService.markSMSProcessed(selectedSMS!);

                // invalidate correct (React Query v5)
                queryClient.invalidateQueries({
                  queryKey: ["admin-sms-list"]
                });
                queryClient.invalidateQueries({
                  queryKey: ["admin-sms-detail", selectedSMS]
                });
              }}
            >
              علامت‌گذاری به عنوان پردازش‌شده
            </Button>
          )}

          <Button onClick={() => setSelectedSMS(null)}>بستن</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
