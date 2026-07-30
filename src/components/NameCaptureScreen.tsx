import { useState } from "react";
import { Box, Stack, Typography, TextField, Button, Fade } from "@mui/material";
import { ArrowRight } from "lucide-react";
import { AppLogo } from "@/components/AppLogo";
import { appConfig } from "@/config/appConfig";

interface Props {
  onSubmit: (name: string) => void;
}

export function NameCaptureScreen({ onSubmit }: Props) {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    onSubmit(name.trim());
  };

  return (
    <Fade in>
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: 2000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
        }}
      >
        <Stack spacing={3} alignItems="center" sx={{ maxWidth: 380, px: 3, textAlign: "center" }}>
          <AppLogo size={40} />
          <Stack spacing={0.5}>
            <Typography variant="h5" fontWeight={800}>
              Welcome to {appConfig.appName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {appConfig.slogan}
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            What should we call you? It's just used to personalize the odd
            Funny Mode message — nothing is sent anywhere.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "14px" } }}
          />
          <Stack direction="row" spacing={1.5} sx={{ width: "100%" }}>
            <Button
              variant="text"
              color="inherit"
              onClick={() => onSubmit("")}
              sx={{ borderRadius: "12px" }}
            >
              Skip
            </Button>
            <Button
              variant="contained"
              endIcon={<ArrowRight size={16} />}
              onClick={handleSubmit}
              sx={{ borderRadius: "12px", flex: 1 }}
            >
              Continue
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Fade>
  );
}
