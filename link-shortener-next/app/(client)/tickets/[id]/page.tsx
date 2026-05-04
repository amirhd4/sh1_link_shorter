"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { ticketsService } from "@/services/ticketsService";
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  CircularProgress,
} from "@mui/material";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {statusLabels} from "@/utils/ticketLabels";
import { getErrorMessage } from "@/utils/errorHandler";
import { Alert } from "@mui/material";

const MAX_USER_MESSAGES = 5

export default function ClientTicketPage() {
    const params = useParams();
    const router = useRouter();
    const ticketId = Number(params.id);
    const [message, setMessage] = useState("");
    const [error, setError] = useState<string | null>(null);
  // بررسی ticketId نامعتبر
  if (isNaN(ticketId)) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">Ticket ID نامعتبر است</Typography>
        <Button sx={{ mt: 2 }} onClick={() => router.push("/tickets")}>
          بازگشت به لیست تیکت‌ها
        </Button>
      </Box>
    );
  }

  // دریافت جزئیات تیکت
  const { data: ticket, isLoading, refetch } = useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: () => ticketsService.getTicketDetails(ticketId),
  });

   const consecutiveUserMessages = (() => {
    if (!ticket) return 0;
    let count = 0;
    // آخرین پیام‌ها رو از آخر به اول بررسی کن
    for (let i = ticket.messages.length - 1; i >= 0; i--) {
      const msg = ticket.messages[i];
      if (!msg.is_admin) count++;
      else break; // وقتی پیام ادمین پیدا شد، متوقف کن
    }
    return count;
  })();

  // mutation برای پاسخ دادن
  const replyMutation = useMutation({
    mutationFn: ()=> {

        return ticketsService.replyTicket(ticketId, { message })
    },
    onSuccess: () => {
      setMessage("");
      refetch().then(r => null);
    },
  onError: (err: any) => setError(getErrorMessage(err)), // ← اینجا

  });

  if (isLoading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );

  if (!ticket)
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">تیکت پیدا نشد</Typography>
        <Button sx={{ mt: 2 }} onClick={() => router.push("/tickets")}>
          بازگشت به لیست تیکت‌ها
        </Button>
      </Box>
    );
 const disableReply =
    ticket.status === "closed" || consecutiveUserMessages >= MAX_USER_MESSAGES;
  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 4, p: 2 }}>
      <Button variant="outlined" sx={{ mb: 3 }} onClick={() => router.push("/tickets")}>
        بازگشت به لیست تیکت‌ها
      </Button>

        {error && (
  <Alert severity="error" sx={{ mb: 2 }}>
    {error}
  </Alert>
)}


      <Typography variant="h5" mb={1}>
        {ticket.subject}
      </Typography>

      <Typography color="text.secondary" mb={3}>
        وضعیت: {statusLabels[ticket.status]}
      </Typography>

      {/* Messages */}
      {ticket.messages.map((msg) => (
        <Box
          key={msg.id}
          mb={2}
          p={2}
          borderRadius={2}
          bgcolor={msg.is_admin ? "grey.100" : "primary.light"}
        >
          <Typography
            variant="body2"
            color={msg.is_admin ? "text.primary" : "white"}
          >
            {msg.message}
          </Typography>

          <Typography
            variant="caption"
            display="block"
            mt={1}
            color="text.secondary"
          >
            {new Date(msg.created_at).toLocaleString("fa-IR")}
          </Typography>
        </Box>
      ))}

      <Divider sx={{ my: 3 }} />

      {/* Reply box */}
      {ticket.status !== "closed" ? (
        <>
          <TextField
            fullWidth
            multiline
            minRows={3}
            placeholder="پاسخ خود را بنویسید..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={disableReply}
          />

          <Button
            sx={{ mt: 2 }}
            variant="contained"
            onClick={() => replyMutation.mutate()}
            disabled={!message || disableReply || replyMutation.isPending}
          >
            {replyMutation.isPending ? <CircularProgress size={24} /> : "ارسال پاسخ"}
          </Button>
        </>
      ) : (
        <Typography color="error">این تیکت بسته شده است.</Typography>
      )}
    </Box>
  );
}
