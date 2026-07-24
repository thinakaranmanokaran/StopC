import { Container, Stack, Typography, Box, Divider } from "@mui/material";
import { ClipboardCheck, Check, Package, Scale, Layers } from "lucide-react";
import { motion } from "framer-motion";
import M3Card from "@/components/M3Card";

const APP_VERSION = "0.1.0";

const FEATURES = [
  "Clipboard monitoring with instant visual confirmation",
  "11 notification themes: material, glassmorphism, neon, macOS, and more",
  "4 animation styles: slide, fade, scale, spring",
  "Customizable position, duration, opacity, and corner radius",
  "Funny Mode with repeat-detection and mascot reactions",
  "Sound feedback packs for copy events",
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" },
  }),
};

export default function AboutPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Stack spacing={0}>
        {/* Hero */}
        <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
          <Stack alignItems="center" sx={{ mb: 4 }}>
            <Box
              sx={{
                width: 104,
                height: 104,
                borderRadius: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "primaryContainer",
                color: "onPrimaryContainer",
                boxShadow: "0px 1px 2px rgba(0,0,0,0.12), 0px 2px 6px 2px rgba(0,0,0,0.08)",
                mb: 2,
              }}
            >
              <ClipboardCheck size={48} />
            </Box>
            <Typography variant="h4" fontWeight={800} textAlign="center">
              StopC
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mt: 0.5 }}>
              Copy once. Trust forever.
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 1 }}>
              Version {APP_VERSION}
            </Typography>
          </Stack>
        </motion.div>

        {/* Description */}
        <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
          <Box sx={{ px: 1, mb: 3 }}>
            <Typography variant="body1" color="text.secondary" lineHeight={1.7}>
              StopC is a clipboard confidence app — not a clipboard manager. It
              watches your clipboard and gives you an instant, beautiful
              confirmation the moment a copy lands, so you never have to press
              Ctrl+C twice out of doubt again.
            </Typography>
          </Box>
        </motion.div>

        {/* Features */}
        <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
          <M3Card title="Features">
            <Stack spacing={1.5}>
              {FEATURES.map((feature, i) => (
                <Stack key={i} direction="row" spacing={1.5} alignItems="flex-start">
                  <Check size={18} color="white" style={{ marginTop: 3, flexShrink: 0 }} />
                  <Typography variant="body2" color="text.secondary">
                    {feature}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </M3Card>
        </motion.div>

        {/* App Info */}
        <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
          <M3Card>
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Package size={18} color="primary" />
                <Typography variant="body2" color="text.secondary" flex={1}>
                  Version
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {APP_VERSION}
                </Typography>
              </Stack>
              <Divider />
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Scale size={18} color="primary" />
                <Typography variant="body2" color="text.secondary" flex={1}>
                  License
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  MIT
                </Typography>
              </Stack>
              <Divider />
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Layers size={18} color="primary" />
                <Typography variant="body2" color="text.secondary" flex={1}>
                  Stack
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  Rust · Tauri 2 · React · Vite
                </Typography>
              </Stack>
            </Stack>
          </M3Card>
        </motion.div>
      </Stack>
    </Container>
  );
}
