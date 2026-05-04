"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ticketsService } from "@/services/ticketsService";
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Button,
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
  useMediaQuery,
  Card,
  CardContent,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { formatJalaliDate } from "@/utils/jalali_date";
import { priorityLabels, statusLabels } from "@/utils/ticketLabels";
import type { Ticket } from "@/types/api";
import dayjs from "dayjs";

const PAGE_SIZE = 10;

export default function ClientTicketsPage() {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width:768px)"); // breakpoint موبایل

  const { data = [], isLoading } = useQuery({
    queryKey: ["my-tickets"],
    queryFn: ticketsService.getMyTickets,
  });

  const openTicketsCount = useMemo(() => {
  return data.filter(t => t.status !== "closed").length;
}, [data]);


  // ---------------- Filters State ----------------
  const [status, setStatus] = useState<string>("all");
  const [priority, setPriority] = useState<string>("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(1);

  // ---------------- Data Pipeline ----------------
  const processedTickets = useMemo(() => {
    let result = [...data];

    // Filter: status
    if (status !== "all") {
      result = result.filter((t) => t.status === status);
    }

    // Filter: priority
    if (priority !== "all") {
      result = result.filter((t) => t.priority === priority);
    }

    // Sort
    result.sort((a, b) =>
      sort === "newest"
        ? dayjs(b.created_at).unix() - dayjs(a.created_at).unix()
        : dayjs(a.created_at).unix() - dayjs(b.created_at).unix()
    );

    return result;
  }, [data, status, priority, sort]);

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
    <Box px={{ xs: 2, sm: 3, md: 4 }} py={3}>
      {/* Header */}
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        mb={3}
        gap={2}
      >
        <Typography variant="h4">تیکت‌های من</Typography>
        <Button
          variant="contained"
          onClick={() => router.push("/tickets/new")}
          disabled={openTicketsCount >= 3}

        >
          ایجاد تیکت جدید
        </Button>
      </Box>

      {/* Filters */}
      <Box
        display="flex"
        gap={2}
        mb={3}
        flexWrap="wrap"
        justifyContent={{ xs: "flex-start", sm: "flex-start" }}
      >
        <FormControl size="small" sx={{ minWidth: 120, flex: 1 }}>
          <InputLabel>وضعیت</InputLabel>
          <Select
            label="وضعیت"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="all">همه</MenuItem>
            {Object.entries(statusLabels).map(([key, label]) => (
              <MenuItem key={key} value={key}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120, flex: 1 }}>
          <InputLabel>اولویت</InputLabel>
          <Select
            label="اولویت"
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="all">همه</MenuItem>
            {Object.entries(priorityLabels).map(([key, label]) => (
              <MenuItem key={key} value={key}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120, flex: 1 }}>
          <InputLabel>مرتب‌سازی</InputLabel>
          <Select
            label="مرتب‌سازی"
            value={sort}
            onChange={(e) =>
              setSort(e.target.value as "newest" | "oldest")
            }
          >
            <MenuItem value="newest">جدیدترین</MenuItem>
            <MenuItem value="oldest">قدیمی‌ترین</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Empty State */}
      {processedTickets.length === 0 && (
        <Typography color="text.secondary" mt={4}>
          تیکتی با این فیلترها پیدا نشد.
        </Typography>
      )}

      {/* Tickets: Table Desktop / Cards Mobile */}
      {processedTickets.length > 0 && (
        <>
          {isMobile ? (
            <Box display="flex" flexDirection="column" gap={2}>
              {paginatedTickets.map((ticket: Ticket) => (
                <Card
                  key={ticket.id}
                  sx={{ cursor: "pointer" }}
                  onClick={() => router.push(`/tickets/${ticket.id}`)}
                >
                  <CardContent>
                    <Typography variant="subtitle1" mb={1}>
                      {ticket.subject}
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
                      <Chip
                        size="small"
                        label={statusLabels[ticket.status]}
                      />
                      <Chip
                        size="small"
                        label={priorityLabels[ticket.priority]}
                        color={
                          ticket.priority === "high"
                            ? "error"
                            : ticket.priority === "medium"
                            ? "warning"
                            : "default"
                        }
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {formatJalaliDate(ticket.created_at, true)}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>موضوع</TableCell>
                    <TableCell>وضعیت</TableCell>
                    <TableCell>اولویت</TableCell>
                    <TableCell>تاریخ</TableCell>
                    <TableCell align="right" />
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedTickets.map((ticket: Ticket) => (
                    <TableRow
                      key={ticket.id}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() =>
                        router.push(`/tickets/${ticket.id}`)
                      }
                    >
                      <TableCell>{ticket.subject}</TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={statusLabels[ticket.status]}
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={priorityLabels[ticket.priority]}
                          color={
                            ticket.priority === "high"
                              ? "error"
                              : ticket.priority === "medium"
                              ? "warning"
                              : "default"
                          }
                        />
                      </TableCell>

                      <TableCell>
                        {formatJalaliDate(ticket.created_at, true)}
                      </TableCell>

                      <TableCell align="right">→</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
          />
        </Box>
      )}
    </Box>
  );
}
