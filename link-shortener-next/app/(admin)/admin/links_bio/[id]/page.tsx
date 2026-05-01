"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Button,
  Chip,
  Divider,
  Avatar,
  Grid,
} from "@mui/material";

import { adminService } from "@/services/adminService";
import { BioLink, BioPage } from "@/types/bio";
import config from "@/config";
import {iconMap} from "@/types/iconList";

export default function BioDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const bioId = Number(id);
  const queryClient = useQueryClient();

  const { data: bio, isLoading } = useQuery({
    queryKey: ["admin-bio", bioId],
    queryFn: () => adminService.getBioPage(bioId),
    enabled: !!bioId,
  });

  const deleteLinkMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteBioLink(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bio", bioId] });
    },
  });

  const deleteBioMutation = useMutation({
    mutationFn: () => adminService.deleteBioPage(bioId),
    onSuccess: () => {
      router.push("/admin/links_bio");
    },
  });

  if (isLoading)
    return (
      <Box mt={8} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );

  if (!bio) return <Typography>بیو پیدا نشد</Typography>;

  const totalClicks =
    bio.links?.reduce((acc, link) => acc + (link.click_count || 0), 0) || 0;

  return (
    <Box maxWidth={1000} mx="auto" py={4}>

      {/* ===== Header ===== */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          مدیریت صفحه بیو
        </Typography>

        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            onClick={() => window.open(`/bio-link/${bio.slug}`, "_blank")}
          >
            مشاهده صفحه عمومی
          </Button>

          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              if (confirm("کل صفحه بیو حذف شود؟")) {
                deleteBioMutation.mutate();
              }
            }}
          >
            حذف کل بیو
          </Button>
        </Stack>
      </Stack>

      {/* ===== Bio Info Card ===== */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">

            <Grid>
              <Avatar
                src={`${config.backendBaseUrl}/${bio.avatar_url || undefined}`}
                sx={{ width: 100, height: 100 }}
              />
            </Grid>

            <Grid>
              <Stack spacing={1}>
                <Typography variant="h6">
                  {bio.title || bio.slug}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  @{bio.slug}
                </Typography>

                {bio.description && (
                  <Typography variant="body2">
                    {bio.description}
                  </Typography>
                )}

                <Stack direction="row" spacing={1} mt={1}>
                  <Chip
                    label={bio.is_active ? "فعال" : "غیرفعال"}
                    color={bio.is_active ? "success" : "default"}
                  />
                  <Chip
                    label={bio.is_public ? "عمومی" : "خصوصی"}
                    color={bio.is_public ? "info" : "warning"}
                  />
                  <Chip
                    label={`تعداد لینک: ${bio.links?.length || 0}`}
                    color="primary"
                  />
                  <Chip
                    label={`کل کلیک‌ها: ${totalClicks}`}
                    color="secondary"
                  />
                </Stack>

                <Typography variant="caption">
                  ایجاد شده در:{" "}
                  {new Date(bio.created_at).toLocaleString("fa-IR")}
                </Typography>
              </Stack>
            </Grid>

          </Grid>
        </CardContent>
      </Card>

      {/* ===== Links Section ===== */}
      <Typography variant="h6" mb={2}>
        لینک‌های صفحه
      </Typography>

      <Stack spacing={2}>
        {bio.links?.length === 0 && (
          <Typography color="text.secondary">
            لینکی ثبت نشده است.
          </Typography>
        )}

        {bio.links?.map((link: BioLink) => (
          <Card key={link.id} variant="outlined">
            <CardContent>

              <Grid container spacing={2} alignItems="center">

                {/* Icon */}
                <Grid>

                  <div className="text-xl">
                        {link.icon && iconMap[link.icon]}
                    </div>
                </Grid>

                {/* Main Info */}
                <Grid>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle1">
                      {link.title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {link.value}
                    </Typography>

                    <Stack direction="row" spacing={1} mt={1}>
                      <Chip
                        size="small"
                        label={`کلیک: ${link.click_count}`}
                      />
                      {link.is_active !== undefined && (
                        <Chip
                          size="small"
                          label={link.is_active ? "فعال" : "غیرفعال"}
                          color={link.is_active ? "success" : "default"}
                        />
                      )}
                    </Stack>

                    <Typography variant="caption">
                      ایجاد:{" "}
                      {new Date(link.created_at).toLocaleString("fa-IR")}
                    </Typography>
                  </Stack>
                </Grid>

                {/* Actions */}
                <Grid>
                  <Stack spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => window.open(link.value, "_blank")}
                    >
                      باز کردن
                    </Button>

                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => {
                        if (confirm("حذف این لینک؟")) {
                          deleteLinkMutation.mutate(link.id);
                        }
                      }}
                    >
                      حذف
                    </Button>
                  </Stack>
                </Grid>

              </Grid>

            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
