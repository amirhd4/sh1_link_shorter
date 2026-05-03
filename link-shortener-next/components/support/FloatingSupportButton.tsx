"use client";

import { Fab, Tooltip, Zoom } from "@mui/material";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import { useRouter } from "next/navigation";
import { useTheme, useMediaQuery } from "@mui/material";

export default function FloatingSupportButton() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleClick = () => {
    router.push("/tickets");
  };

  return (
    <Zoom in>
      <Tooltip title="پشتیبانی" placement="right">
        <Fab
          size={isMobile ? "medium" : "large"}
          onClick={handleClick}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 2000,
            boxShadow: theme.shadows[6],
            bgcolor:"#6b21a8",
            color: "#fff",
            transition: "all 0.25s ease",
            "&:hover": {
              transform: "scale(1.08)",
              boxShadow: theme.shadows[10],
             color: theme.palette.text.primary,
            },
          }}
        >
          <SupportAgentIcon />
        </Fab>
      </Tooltip>
    </Zoom>
  );
}
