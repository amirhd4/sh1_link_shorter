// 🚀 ULTIMATE Admin User Details Page
// This file is intentionally comprehensive and production‑grade.
// Stack: Next.js (App Router), React Query, MUI, TypeScript

"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Divider,
  Chip,
  Button,
  Stack,
  CircularProgress,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  TableContainer,
  Paper,
  Table,
  TableCell,
  TableHead,
  TableBody,
  TableRow,
} from "@mui/material";

import { adminUserService } from "@/services/admin";
import { adminService } from "@/services/adminService";
import {AdminBioPageSummary, AdminUserSummary, TransactionResponse} from "@/types/api";
import {formatJalaliDate} from "@/utils/jalali_date";
import config from "@/config";

// =====================================================
// 🧠 Main Page
// =====================================================

export default function AdminUserDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const userId = Number(id);

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["admin-user", userId],
    queryFn: () => adminUserService.getUserById(userId),
    enabled: !isNaN(userId),
  });

  const toggleActive = useMutation({
    mutationFn: (isActive: boolean) =>
      adminService.updateUserActive(userId, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-user", userId] }),
  });

  const updateRole = useMutation({
  mutationFn: (role: "user" | "admin") =>
    adminService.updateUserRole(userId, role),
  onSuccess: () =>
    queryClient.invalidateQueries({ queryKey: ["admin-user", userId] }),
});

  const deleteMutation = useMutation({
  mutationFn: () => adminService.deleteUser(Number(userId)),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    router.push("/admin/users"); // برگرد به لیست کاربران
  },
});


  if (isLoading)
    return (
      <Box mt={8} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );

  if (!user || error)
    return (
      <Box p={4}>
        <Typography color="error">کاربر پیدا نشد</Typography>
        <Button onClick={() => router.push("/admin/users")}>بازگشت</Button>
      </Box>
    );

  return (
    <Box maxWidth={1400} mx="auto" py={4}>
      <Button variant="outlined" onClick={() => router.back()}>
        ← بازگشت
      </Button>

      <Grid container spacing={3} mt={1}>
        {/* LEFT SIDEBAR */}
        <Grid size={{ xs:12, md: 4}}>
          <UserIdentityCard user={user} />
          <AdminActionsCard
            user={user}
            onToggleActive={toggleActive.mutate}
            onUpdateRole={updateRole.mutate}
            onDeleteUser={deleteMutation.mutate}
            isDeleting={deleteMutation.isPending}
          />
          <SubscriptionCard user={user} />
        </Grid>

        {/* MAIN CONTENT */}
        <Grid size={{ xs: 12, md: 8 }}>
          <StatsOverview user={user} />
          <FinancialOverview user={user} />
          <TransactionsTable transactions={user.transactions} />
          <AdsOverview user={user} />
          <SystemMeta user={user} />
          <BioPagesSection user={user} /> {/* ✅ اضافه‌شده جدید */}
        </Grid>
      </Grid>
    </Box>
  );
}

// =====================================================
// 🧩 Components
// =====================================================

const UserIdentityCard = ({ user }: { user: AdminUserSummary }) => (
  <Card>
    <CardContent>
      <Typography variant="h6">👤 {user.first_name} {user.last_name}</Typography>
      <Typography color="text.secondary">📞 {user.phone_number}</Typography>

      <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
        <Chip label={user.is_active ? "فعال" : "غیرفعال"} color={user.is_active ? "success" : "error"} />
        <Chip label={user.is_verified ? "وریفای شده" : "وریفای نشده"} />
        <Chip label={`نقش: ${user.role}`} />
      </Stack>
    </CardContent>
  </Card>
);

const TransactionsTable = ({ transactions }: { transactions: TransactionResponse[] }) => {
  if (!transactions || transactions.length === 0) return <Typography>تراکنش وجود ندارد</Typography>;

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>آیدی</TableCell>
            <TableCell>پلن</TableCell>
            <TableCell>مبلغ (تومان)</TableCell>
            <TableCell>وضعیت</TableCell>
            <TableCell>Authority</TableCell>
            <TableCell>تاریخ</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map(tx => (
            <TableRow key={tx.id}>
              <TableCell>{tx.id}</TableCell>
              <TableCell>{tx.plan.name}</TableCell>
              <TableCell>{tx.amount}</TableCell>
              <TableCell>{tx.status}</TableCell>
              <TableCell>{tx.authority}</TableCell>
              <TableCell>{new Date(tx.created_at).toLocaleString("fa-IR")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const AdminActionsCard = ({
  user,
  onToggleActive,
  onUpdateRole,
  onDeleteUser,
  isDeleting,
}: {
  user: AdminUserSummary;
  onToggleActive: (v: boolean) => void;
  onUpdateRole: (r: "user" | "admin") => void;
  onDeleteUser: () => void;
  isDeleting: boolean;
}) => (
  <Card sx={{ mt: 2 }}>
    <CardContent>
      <Typography variant="subtitle1">⚙️ اقدامات ادمین</Typography>

      <Stack spacing={2} mt={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography>فعال</Typography>
          <Switch
            checked={user.is_active}
            onChange={e => onToggleActive(e.target.checked)}
          />
        </Stack>

        <FormControl fullWidth size="small">
          <InputLabel>نقش</InputLabel>
          <Select
            value={user.role}
            label="نقش"
            onChange={e => onUpdateRole(e.target.value as any)}
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>

        <Button
  color="error"
  variant="outlined"
  onClick={() => {
    if (confirm("آیا مطمئنی می‌خواهی این کاربر را کامل حذف کنی؟")) {
      onDeleteUser();
    }
  }}
  disabled={isDeleting}
>
  {isDeleting ? "در حال حذف..." : "حذف کامل کاربر (Danger)"}
</Button>


      </Stack>
    </CardContent>
  </Card>
);

const SubscriptionCard = ({ user }: { user: AdminUserSummary }) => (
  <Card sx={{ mt: 2 }}>
    <CardContent>
      <Typography variant="subtitle1">💎 اشتراک</Typography>
      <Divider sx={{ my: 1 }} />
      <Typography>پلن: {user.plan_name ?? "Free"}</Typography>
      <Typography>قیمت: {user.plan_price != null ? user.plan_price / 10 : 0} تومان</Typography>
      <Typography>شروع: {formatJalaliDate(user.subscription_start_date ?? "-")}</Typography>
      <Typography>پایان: {formatJalaliDate(user.subscription_end_date ?? "-")}</Typography>
      <Chip
        sx={{ mt: 1 }}
        label={user.is_subscription_active ? "فعال" : "منقضی"}
        color={user.is_subscription_active ? "success" : "warning"}
      />
    </CardContent>
  </Card>
);

const StatsOverview = ({ user }: { user: AdminUserSummary }) => (
  <Card>
    <CardContent>
      <Typography variant="h6">📊 آمار سیستم</Typography>
      <Grid container spacing={2} mt={1}>
        <Stat title="لینک‌ها" value={user.total_links} />
        <Stat title="دامنه‌ها" value={user.total_domains} />
        <Stat title="کلیک‌ها" value={user.total_clicks} />
      </Grid>
    </CardContent>
  </Card>
);

const FinancialOverview = ({ user }: { user: AdminUserSummary }) => (
  <Card sx={{ mt: 3 }}>
    <CardContent>
      <Typography variant="h6">💰 مالی</Typography>
      <Divider sx={{ my: 1 }} />
      <Grid container spacing={2}>
        <Stat title="تراکنش‌ها" value={user.total_transactions} />
        <Stat title="مجموع پرداخت" value={`${user.total_paid_amount} تومان`} />
        <Stat title="آخرین وضعیت" value={user.last_transaction_status ?? "—"} />
      </Grid>
    </CardContent>
  </Card>
);

const AdsOverview = ({ user }: { user: AdminUserSummary }) => (
  <Card sx={{ mt: 3 }}>
    <CardContent>
      <Typography variant="h6">🎯 تبلیغات</Typography>
      <Divider sx={{ my: 1 }} />
      <Typography>امتیاز کل: {user.total_ad_points}</Typography>
      <Typography>
        بازدید: {user.total_ad_views} / {user.total_unique_ad_views} یونیک
      </Typography>
    </CardContent>
  </Card>
);

const SystemMeta = ({ user }: { user: AdminUserSummary }) => (
  <Card sx={{ mt: 3 }}>
    <CardContent>
      <Typography variant="subtitle2">🧠 متادیتا</Typography>
      <Typography variant="body2">
        ایجاد شده در: {new Date(user.created_at).toLocaleString("fa-IR")}
      </Typography>
      <Typography variant="body2">آیدی کاربر: {user.id}</Typography>
    </CardContent>
  </Card>
);

const Stat = ({ title, value }: { title: string; value: any }) => (
  <Grid size={{ xs:12, sm:4 }}>
    <Card variant="outlined">
      <CardContent>
        <Typography variant="caption" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h6">{value}</Typography>
      </CardContent>
    </Card>
  </Grid>
);


// داخل همان فایل AdminUserDetailsPage اضافه کن در پایین دیگر کامپوننت‌ها:

const BioPagesSection = ({ user }: { user: AdminUserSummary }) => {
  const router = useRouter();

  if (!user.bio_pages || user.bio_pages.length === 0)
    return (
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6">🌐 بیو‌پیج‌ها</Typography>
          <Divider sx={{ my: 1 }} />
          <Typography color="text.secondary">
            کاربر هیچ بیو‌پیجی ندارد.
          </Typography>
        </CardContent>
      </Card>
    );

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6">🌐 بیو‌پیج‌های کاربر</Typography>
        <Divider sx={{ my: 1 }} />

        <Grid container spacing={2}>
          {user.bio_pages.map((bp: AdminBioPageSummary) => (
            <Grid size={{ xs: 12, sm: 6 }} key={bp.id}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardContent>
                  <Stack spacing={1}>
                    {/* Avatar */}
                    {bp.avatar_url && (
                      <Box
                        component="img"
                        src={`${config.backendBaseUrl}/${bp.avatar_url}`}
                        alt={bp.title ?? bp.slug}
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    )}

                    <Typography variant="subtitle1">
                      {bp.title || bp.slug}
                    </Typography>

                    {bp.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ lineHeight: 1.5 }}
                      >
                        {bp.description.substring(0, 120)}
                        {bp.description.length > 120 && "…"}
                      </Typography>
                    )}

                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip
                        size="small"
                        label={bp.is_active ? "فعال" : "غیرفعال"}
                        color={bp.is_active ? "success" : "default"}
                      />
                      <Chip
                        size="small"
                        label={bp.is_public ? "عمومی" : "خصوصی"}
                        color={bp.is_public ? "info" : "warning"}
                      />
                      <Chip
                        size="small"
                        label={`لینک‌ها: ${bp.links_count}`}
                        color="primary"
                      />
                    </Stack>

                    <Typography variant="caption">
                      ایجاد: {new Date(bp.created_at).toLocaleString("fa-IR")}
                    </Typography>

                    <Stack direction="row" spacing={1} mt={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => router.push(`/admin/links_bio/${bp.id}`)}
                      >
                        مشاهده جزئیات
                      </Button>

                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          window.open(
                            `/bio-link/${bp.slug}`,
                            "_blank"
                          );
                        }}
                      >
                        مشاهده صفحه عمومی
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};
