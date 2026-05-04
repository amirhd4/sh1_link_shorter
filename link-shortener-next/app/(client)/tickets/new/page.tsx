"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
} from "@mui/material";
import { ticketsService } from "@/services/ticketsService";
import type { TicketPriority } from "@/types/api";
import {priorityLabels} from "@/utils/ticketLabels";
import { getErrorMessage } from "@/utils/errorHandler";

export default function NewTicketPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await ticketsService.createTicket({
        subject: title,
        message: description,
        priority,
      });
      router.push("/tickets"); // بعد از ایجاد، برگرد به لیست تیکت‌ها
    } catch (err: any) {
      console.error(err);
            setError(getErrorMessage(err));

      // setError(err?.message || "خطا در ایجاد تیکت");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: "auto",
        mt: 4,
        p: 3,
        bgcolor: "background.paper",
        borderRadius: 2,
        boxShadow: 1,
      }}
    >
      <Stack spacing={2}>
        <Typography variant="h5" gutterBottom>
          ایجاد تیکت جدید
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="عنوان"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
            />

            <TextField
              label="توضیحات"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              required
              multiline
              minRows={4}
            />

            <FormControl fullWidth>
              <InputLabel>اولویت</InputLabel>
              <Select
                value={priority}
                label="اولویت"
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
              >
                  {Object.entries(priorityLabels).map(([key, label]) => (
              <MenuItem key={key} value={key}>
                {label}
              </MenuItem>
            ))}
                {/*<MenuItem value="low">کم اهمیت</MenuItem>*/}
                {/*<MenuItem value="medium">اهمیت معمولی</MenuItem>*/}
                {/*<MenuItem value="high">فوری</MenuItem>*/}
              </Select>
            </FormControl>

            <Stack direction="row" spacing={2}>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
              >
                {isSubmitting ? "در حال ارسال..." : "ارسال تیکت"}
              </Button>

              <Button
                type="button"
                variant="outlined"
                color="secondary"
                onClick={() => router.push("/tickets")}
              >
                بازگشت به تیکت‌ها
              </Button>
            </Stack>
          </Stack>
        </form>
      </Stack>
    </Box>
  );
}
