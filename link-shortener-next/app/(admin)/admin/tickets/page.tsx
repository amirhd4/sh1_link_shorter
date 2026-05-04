"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { adminTicketService } from "@/services/adminTicketsService";
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  Pagination,
  FormControl,
  InputLabel,
  Checkbox,
  Button,
  TextField,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { priorityLabels, statusLabels } from "@/utils/ticketLabels";
import { formatJalaliDate } from "@/utils/jalali_date";
import type {AdminTicket} from "@/types/api";
import dayjs from "dayjs";
import queryClient from "@/lib/queryClient";

const PAGE_SIZE = 10;

export default function AdminTicketsPage() {
  const router = useRouter();

  const { data = [] , isLoading } = useQuery<AdminTicket[]>({
  queryKey: ["admin-tickets"],
  queryFn: adminTicketService.getAllTickets,
});

  // ---------------- State ----------------
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [sort] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);

  // ---------------- Helpers ----------------
  const isUnanswered = (ticket: AdminTicket) => {
      if (!ticket.messages?.length) return false;
      const last = ticket.messages[ticket.messages.length - 1];
      return ticket.status !== "closed" && !last.is_admin;
    };


  // ---------------- Close mutation ----------------
  const closeMutation = useMutation({
    mutationFn: (ticketId: number) =>
      adminTicketService.closeTicket(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] }).then(() => {
        setSelected([]);
      });
    },

  });

  // ---------------- Data pipeline ----------------
  const processedTickets = useMemo(() => {
    let result = [...data];

    if (onlyOpen) {
      result = result.filter((t) => t.status !== "closed");
    }

    if (status !== "all") {
      result = result.filter((t) => t.status === status);
    }

    if (priority !== "all") {
      result = result.filter((t) => t.priority === priority);
    }

    if (search.trim()) {
      result = result.filter((t) =>
        t.subject.toLowerCase().includes(search.toLowerCase())
      );
    }

    result.sort((a, b) =>
      sort === "newest"
        ? dayjs(b.created_at).unix() - dayjs(a.created_at).unix()
        : dayjs(a.created_at).unix() - dayjs(b.created_at).unix()
    );

    return result;
  }, [data, status, priority, sort, search, onlyOpen]);

  const totalPages = Math.ceil(processedTickets.length / PAGE_SIZE);

  const paginatedTickets = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return processedTickets.slice(start, start + PAGE_SIZE);
  }, [processedTickets, page]);

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
        تیکت‌های کاربران
      </Typography>

      {/* Filters */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          size="small"
          placeholder="جستجو موضوع..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>وضعیت</InputLabel>
          <Select value={status} label="وضعیت" onChange={(e) => setStatus(e.target.value)}>
            <MenuItem value="all">همه</MenuItem>
            {Object.entries(statusLabels).map(([k, v]) => (
              <MenuItem key={k} value={k}>{v}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>اولویت</InputLabel>
          <Select value={priority} label="اولویت" onChange={(e) => setPriority(e.target.value)}>
            <MenuItem value="all">همه</MenuItem>
            {Object.entries(priorityLabels).map(([k, v]) => (
              <MenuItem key={k} value={k}>{v}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant={onlyOpen ? "contained" : "outlined"}
          onClick={() => setOnlyOpen((p) => !p)}
        >
          فقط بازها
        </Button>

        {selected.length > 0 && (
          <Button
            color="error"
            variant="contained"
            onClick={() => selected.forEach((id) => closeMutation.mutate(id))}
          >
            بستن {selected.length} تیکت
          </Button>
        )}
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selected.length === paginatedTickets.length}
                  onChange={(e) =>
                    setSelected(
                      e.target.checked ? paginatedTickets.map((t) => t.id) : []
                    )
                  }
                />
              </TableCell>
              <TableCell>موضوع</TableCell>
              <TableCell>وضعیت</TableCell>
              <TableCell>اولویت</TableCell>
              <TableCell>تاریخ</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedTickets.map((ticket) => {
              const unanswered = isUnanswered(ticket);

              return (
                <TableRow
                  key={ticket.id}
                  hover
                  sx={{
                    cursor: "pointer",
                    bgcolor: unanswered ? "warning.light" : undefined,
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selected.includes(ticket.id)}
                      onChange={() =>
                        setSelected((prev) =>
                          prev.includes(ticket.id)
                            ? prev.filter((id) => id !== ticket.id)
                            : [...prev, ticket.id]
                        )
                      }
                    />
                  </TableCell>

                  <TableCell onClick={() => router.push(`/admin/tickets/${ticket.id}`)}>
                    {ticket.subject}
                    {unanswered && (
                      <Chip
                        size="small"
                        color="error"
                        label="پاسخ داده نشده"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </TableCell>

                  <TableCell>
                    <Chip size="small" label={statusLabels[ticket.status]} />
                  </TableCell>

                  <TableCell>
                    <Chip size="small" label={priorityLabels[ticket.priority]} />
                  </TableCell>

                  <TableCell>
                    {formatJalaliDate(ticket.created_at, true)}
                  </TableCell>

                  <TableCell align="right">
                    {ticket.status !== "closed" && (
                      <Button
                        size="small"
                        color="error"
                        onClick={() => closeMutation.mutate(ticket.id)}
                      >
                        بستن
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} />
        </Box>
      )}
    </Box>
  );
}
