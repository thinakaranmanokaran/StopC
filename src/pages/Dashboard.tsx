import { useState } from "react";
import { Box, Container, Stack, Typography, TextField, Button, Chip, Avatar } from "@mui/material";
import { Copy, Check, Mail, MapPin, KeyRound, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { notify } from "@/services/toast";
import { useSettingsStore } from "@/store/settingsStore";
import { AppLogo } from "@/components/AppLogo";
import { appConfig } from "@/config/appConfig";

import M3Card from "@/components/M3Card";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" },
  }),
};

const QUICK_FILLS = [
  // { label: "Email", icon: <Mail size={14} />, value: "hello@example.com" },
  // { label: "Address", icon: <MapPin size={14} />, value: "221B Baker Street, London" },
  // { label: "Password", icon: <KeyRound size={14} />, value: "Tr0ub4dor&3xample" },
  { label: "Paragraph", icon: <FileText size={14} />, value: "StopC just copied this for you — press Ctrl+C again on the same text and Funny Mode will notice." },
];

export default function Dashboard() {
  const userName = useSettingsStore((s) => s.settings.userName);
  const [testText, setTestText] = useState(QUICK_FILLS[0].value);
  const [justCopied, setJustCopied] = useState(false);

  const handleTestCopy = async () => {
    try {
      await writeText(testText);
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 1500);
    } catch (primaryError) {
      // Fall back to the standard web clipboard API before giving up —
      // covers the (rare) case where the Tauri plugin call is rejected
      // for a permission reason the web API isn't subject to.
      try {
        await navigator.clipboard.writeText(testText);
        setJustCopied(true);
        setTimeout(() => setJustCopied(false), 1500);
      } catch (fallbackError) {
        console.error("[stopc] test copy failed:", primaryError, fallbackError);
        notify("Test Copy Failed", "StopC couldn't write to the clipboard. Check the clipboard permission in your OS settings.");
      }
    }
  };

  const initial = userName.trim().charAt(0).toUpperCase();

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Stack spacing={0}>
        {/* Hero Section */}
        <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
          <Box sx={{ position: "relative", mb: 5 }}>
            {initial && (
              <Avatar
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: 40,
                  height: 40,
                  bgcolor: "primary.main",
                  fontWeight: 700,
                  fontSize: 16,
                }}
                title={userName}
              >
                {initial}
              </Avatar>
            )}
            <Stack alignItems="center" spacing={1.5}>
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
                }}
              >
                <AppLogo size={48} />
              </Box>
              <Typography variant="h4" fontWeight={800} textAlign="center">
                {userName ? `Hey, ${userName}` : appConfig.appName}
              </Typography>
              <Typography variant="body1" color="text.secondary" textAlign="center">
                {appConfig.slogan}
              </Typography>
            </Stack>
          </Box>
        </motion.div>

        {/* Try It Out */}
        <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
          <M3Card title="Try It Out">
            <Stack spacing={1.75}>
              <Typography variant="body2" color="text.secondary">
                Pick something below, or type your own, then copy it — watch
                the notification appear.
              </Typography>
              {/* <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {QUICK_FILLS.map((fill) => (
                  <Chip
                    key={fill.label}
                    icon={fill.icon as any}
                    label={fill.label}
                    size="small"
                    onClick={() => setTestText(fill.value)}
                    variant={testText === fill.value ? "filled" : "outlined"}
                    color={testText === fill.value ? "primary" : "default"}
                  />
                ))}
              </Stack> */}
              <TextField
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                size="small"
                fullWidth
                multiline
                maxRows={3}
                placeholder="Type something to test the notification…"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "14px" } }}
              />
              <Button
                variant="contained"
                onClick={handleTestCopy}
                disabled={!testText.trim()}
                startIcon={justCopied ? <Check size={16} /> : <Copy size={16} />}
                sx={{ borderRadius: "14px", alignSelf: "flex-start" }}
              >
                {justCopied ? "Copied!" : "Copy This Text"}
              </Button>
            </Stack>
          </M3Card>
        </motion.div>
      </Stack>
    </Container>
  );
}
