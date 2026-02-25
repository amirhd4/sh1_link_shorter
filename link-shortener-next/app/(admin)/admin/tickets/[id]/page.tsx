"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { adminTicketService } from "@/services/adminTicketsService";
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
import queryClient from "@/lib/queryClient";
import {statusLabels} from "@/utils/ticketLabels";

export default function AdminTicketPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = Number(params.id);
  const [message, setMessage] = useState("");

  if (isNaN(ticketId)) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">Ticket ID نامعتبر است</Typography>
        <Button sx={{ mt: 2 }} onClick={() => router.push("/admin/tickets")}>
          بازگشت به لیست تیکت‌ها
        </Button>
      </Box>
    );
  }

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-ticket", ticketId],
    queryFn: () => adminTicketService.getTicketDetails(ticketId),
  });

  const replyMutation = useMutation({
    mutationFn: () => adminTicketService.replyTicket(ticketId, { message }),
    onSuccess: () => {
      setMessage("");
      refetch().then(r => null)
    },
  });

  const closeMutation = useMutation({
  mutationFn: () => adminTicketService.closeTicket(ticketId),
  onSuccess: (updatedTicket) => {
    // مستقیماً cache رو آپدیت می‌کنیم
    queryClient.setQueryData(["admin-ticket", ticketId], updatedTicket);
  },
});

  if (isLoading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">خطا در بارگذاری تیکت</Typography>
        <Button sx={{ mt: 2 }} onClick={() => router.push("/admin/tickets")}>
          بازگشت به لیست تیکت‌ها
        </Button>
      </Box>
    );

  if (!data)
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">تیکت پیدا نشد</Typography>
        <Button sx={{ mt: 2 }} onClick={() => router.push("/admin/tickets")}>
          بازگشت به لیست تیکت‌ها
        </Button>
      </Box>
    );

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 4, p: 2 }}>
      <Button
        variant="outlined"
        sx={{ mb: 3 }}
        onClick={() => router.push("/admin/tickets")}
      >
        بازگشت به لیست تیکت‌ها
      </Button>

        <Box
          mb={3}
          p={2}
          bgcolor="grey.100"
          borderRadius={2}
          sx={{
            cursor: "pointer",
            "&:hover": { bgcolor: "grey.200" },
          }}
          onClick={() =>
            router.push(`/admin/users/${data.user?.id}`)
          }
        >
          <Typography variant="subtitle2">
            👤 {data.user?.first_name} {data.user?.last_name} –{" "}
            {data.user?.phone_number}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            نوع حساب: {data.user?.plan?.name == "Pro" ? "پرو ⭐" : "رایگان"}
          </Typography>
        </Box>


      <Typography variant="h5" mb={2}>
        {data.subject}
      </Typography>

      <Typography color="text.secondary" mb={3}>
        وضعیت: {statusLabels[data.status]}
      </Typography>

      {data.messages.map((msg) => (
        <Box
          key={msg.id}
          mb={2}
          p={2}
          borderRadius={2}
          bgcolor={msg.is_admin ? "primary.light" : "grey.100"}
        >
          <Typography
            variant="body2"
            color={msg.is_admin ? "white" : "text.primary"}
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
          <Divider sx={{ mt: 1 }} />
        </Box>
      ))}

      {data.status !== "closed" && (
        <>
          <TextField
            fullWidth
            multiline
            minRows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="پاسخ ادمین..."
            sx={{ mt: 2 }}
          />

          <Box mt={2} display="flex" gap={2}>
            <Button
              variant="contained"
              onClick={() => replyMutation.mutate()}
              disabled={!message || replyMutation.isPending}
            >
              {replyMutation.isPending ? <CircularProgress size={24} /> : "ارسال پاسخ"}
            </Button>

            <Button
              variant="outlined"
              color="error"
              onClick={() => closeMutation.mutate()}
              disabled={closeMutation.isPending}
            >
              {closeMutation.isPending ? <CircularProgress size={24} /> : "بستن تیکت"}
            </Button>
          </Box>
        </>
      )}

      {data.status === "closed" && (
        <Typography color="error" mt={2}>
          این تیکت بسته شده است.
        </Typography>
      )}
    </Box>
  );
}
