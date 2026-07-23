import { Container, Stack, Typography, Paper, Avatar, Chip, Divider, Box } from "@mui/material";
import { Code2, Heart, Github } from "lucide-react";

const APP_VERSION = "0.1.0";
const DEVELOPER_NAME = "Thinakaran Manokaran";

export default function DeveloperPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Stack spacing={3}>
        <Typography variant="h4" fontWeight={800}>
          Developer
        </Typography>

        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            background: "linear-gradient(135deg, #7C5CFC22, #3A28A822)",
          }}
        >
          <Avatar
            sx={{
              width: 72,
              height: 72,
              mx: "auto",
              mb: 2,
              bgcolor: "primary.main",
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            TM
          </Avatar>
          <Typography variant="h6" fontWeight={700}>
            {DEVELOPER_NAME}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Creator & Developer of StopC
          </Typography>
          <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
            <Chip icon={<Code2 size={14} />} label="Rust + Tauri" size="small" variant="outlined" />
            <Chip icon={<Heart size={14} />} label="Built with care" size="small" variant="outlined" />
          </Stack>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            About StopC
          </Typography>
          <Typography variant="body2" color="text.secondary">
            StopC is a clipboard confidence app — not a clipboard manager. It
            watches your clipboard and gives you an instant, beautiful
            confirmation the moment a copy lands, so you never have to press
            Ctrl+C twice out of doubt again.
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Stack spacing={1}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">
                Version
              </Typography>
              <Typography variant="body2">{APP_VERSION}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">
                License
              </Typography>
              <Typography variant="body2">MIT</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">
                Stack
              </Typography>
              <Typography variant="body2">Rust · Tauri 2 · React · MUI</Typography>
            </Box>
          </Stack>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Mission
          </Typography>
          <Typography variant="body2" color="text.secondary">
            🐱 "Bro... it already copied." — Stop people from abusing Ctrl+C,
            one delightful notification at a time.
          </Typography>
        </Paper>

        <Stack direction="row" spacing={1} justifyContent="center" sx={{ pt: 1 }}>
          <Chip icon={<Github size={14} />} label="Open source · MIT licensed" variant="outlined" />
        </Stack>
      </Stack>
    </Container>
  );
}
