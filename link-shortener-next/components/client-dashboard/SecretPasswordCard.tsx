import { Card, CardContent, Typography, Button, Stack, Alert, IconButton } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import apiClient from "@/lib/axios";

export function InitialPasswordCard() {
  const { data, isSuccess } = useQuery({
    queryKey: ["initial-password"],
    queryFn: async () => {
      const res = await apiClient.get(
        "/auth/users/me/secrets/initial_password"
      );
      return res.data;
    },
    retry: false,
  });

  const queryClient = useQueryClient();

const confirmMutation = useMutation({
  mutationFn: () =>
    apiClient.post("/auth/users/me/secrets/initial_password/confirm"),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["initial-password"] });
  },
});

  if (!isSuccess || !data?.value) return null;

  const handleConfirm = async () => {
    await confirmMutation.mutateAsync();
  };

  return (
    <Card
      sx={{
        mb: 3,
        borderRadius: 3,
        border: "1px dashed",
        borderColor: "warning.main",
        background: "linear-gradient(135deg, #fff8e1, #fff)",
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Alert severity="warning">
            این رمز فقط <b>یک‌بار</b> نمایش داده می‌شود. حتماً ذخیره‌اش کن.
          </Alert>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: "monospace",
                wordBreak: "break-all",
              }}
            >
              {data.value}
            </Typography>

            <IconButton
              onClick={() => navigator.clipboard.writeText(data.value)}
            >
              <ContentCopyIcon />
            </IconButton>
          </Stack>

          <Button
            variant="contained"
            color="warning"
            onClick={handleConfirm}
            disabled={confirmMutation.isPending}
          >
            ذخیره کردم – دیگه نشون نده
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
