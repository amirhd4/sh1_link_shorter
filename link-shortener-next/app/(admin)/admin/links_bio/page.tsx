"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { TextField } from "@mui/material";

import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Button,
    Stack,
    CircularProgress,
    Chip, Avatar,
} from "@mui/material";

import { adminService } from "@/services/adminService";
import { BioPage } from "@/types/bio";
import config from "@/config";

export default function AdminBioListPage() {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-bio-pages"],
    queryFn: adminService.getAllBioPages,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteBioPage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bio-pages"] });
    },
  });

  if (isLoading)
    return (
      <Box mt={8} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );

  const filteredBios = data?.filter((bio: BioPage) => {
  const q = search.toLowerCase();

  return (
    bio.slug?.toLowerCase().includes(q) ||
    bio.title?.toLowerCase().includes(q) ||
    bio.user?.phone_number?.includes(q) ||
    bio.user?.first_name?.toLowerCase().includes(q) ||
    bio.user?.last_name?.toLowerCase().includes(q)
  );
});

  return (
    <Box maxWidth={1200} mx="auto" py={4}>
      <Typography variant="h5" mb={3}>
        🌐 لیست صفحه های بیو کاربران
      </Typography>
        <TextField
  fullWidth
  placeholder="جستجو با اسلاگ، نام کاربر یا شماره تلفن..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  sx={{ mb: 3 }}
/>

      <Grid container spacing={2}>
    {filteredBios?.map((bio: BioPage) => (
          <Grid key={bio.id} size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>

                <Stack spacing={1}>

                    <Grid>
              <Avatar
                src={`${config.backendBaseUrl}/${bio.avatar_url || undefined}`}
                sx={{ width: 100, height: 100 }}
              />
            </Grid>

                  <Typography variant="h6">
                    {bio.title || bio.slug}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    اسلاگ:  {bio.slug}
                  </Typography>


                    {/* ✅ اطلاعات کاربر */}
                    <Stack spacing={0.3} mt={1}>
                      <Typography variant="body2">
                        شناسه کاربر: <strong>{bio.user_id}</strong>
                      </Typography>
                      {bio.user?.first_name && (
                        <Typography variant="body2">
                          👤 نام کاربر: {bio.user?.first_name} {bio.user?.last_name}
                        </Typography>
                      )}
                      {bio.user?.phone_number && (
                        <Typography variant="body2">
                          📞 تلفن: {bio.user?.phone_number}
                        </Typography>
                      )}
                    </Stack>

                  <Stack direction="row" spacing={1}>
                    <Chip
                      size="small"
                      label={bio.is_active ? "فعال" : "غیرفعال"}
                      color={bio.is_active ? "success" : "error"}
                    />

                    <Chip
                      size="small"
                      label={bio.is_public ? "عمومی" : "خصوصی"}
                    />
                  </Stack>

                  <Typography variant="caption">
                    ایجاد: {new Date(bio.created_at).toLocaleString("fa-IR")}
                  </Typography>

                  <Stack direction="row" spacing={1} mt={2}>

                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        router.push(`/admin/links_bio/${bio.id}`)
                      }
                    >
                      مشاهده جزئیات
                    </Button>

                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => {
                        if (
                          confirm(
                            "آیا مطمئن هستید می‌خواهید این صفحه بیو حذف شود؟"
                          )
                        ) {
                          deleteMutation.mutate(bio.id);
                        }
                      }}
                    >
                      حذف
                    </Button>

                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        router.push(`/admin/users/${bio.user_id}`)
                      }
                    >
                      مشاهده کاربر
                    </Button>

                  </Stack>

                </Stack>

              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
