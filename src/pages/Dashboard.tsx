import { useState } from "react";
import { Box, Container, Stack, Typography, TextField, Button, Alert } from "@mui/material";
import { ClipboardCheck, Settings, Code2, Info, FileText, Image, Files, Folder, Clock, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { useClipboardWatcher } from "@/hooks/useClipboardWatcher";
import { useClipboardStore } from "@/store/clipboardStore";

import M3Card from "@/components/M3Card";
import M3ListItem from "@/components/M3ListItem";
import M3IconButton from "@/components/M3IconButton";
import type { FunnyModeEvent, ClipboardKind } from "@/types/clipboard";
import { MOOD_EMOJI } from "@/utils/mood";

const KIND_ICONS: Record<ClipboardKind, React.ReactNode> = {
  text: <FileText size={20} />,
  rich_text: <FileText size={20} />,
  html: <FileText size={20} />,
  image: <Image size={20} />,
  file: <Files size={20} />,
  files: <Files size={20} />,
  folder: <Folder size={20} />,
};

const KIND_LABELS: Record<ClipboardKind, string> = {
  text: "Text",
  rich_text: "Rich Text",
  html: "HTML",
  image: "Image",
  file: "File",
  files: "Files",
  folder: "Folder",
};

function formatTime(ts: number) {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  return `${Math.floor(diff / 3_600_000)}h ago`;
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" },
  }),
};

export default function Dashboard() {
  const history = useClipboardStore((s) => s.history);
  const todayCount = useClipboardStore((s) => s.todayCount);
  const totalCount = useClipboardStore((s) => s.totalCount);
  const [lastFunny, setLastFunny] = useState<FunnyModeEvent | null>(null);
  useClipboardWatcher((funnyEvent) => setLastFunny(funnyEvent));

  const [testText, setTestText] = useState("StopC just copied this for you 🎉");
  const [justCopied, setJustCopied] = useState(false);

  const handleTestCopy = async () => {
    try {
      await writeText(testText);
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 1500);
    } catch (e) {
      console.error("[stopc] test copy failed:", e);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Stack spacing={0}>
        {/* Hero Section */}
        <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
          <Stack alignItems="center" spacing={1.5} sx={{ mb: 5 }}>
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
              <ClipboardCheck size={48} />
            </Box>
            <Typography variant="h4" fontWeight={800} textAlign="center">
              StopC
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center">
              Copy once. Trust forever.
            </Typography>
          </Stack>
        </motion.div>

        {/* Background-run notice */}
        <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
          <Alert
            severity="info"
            variant="outlined"
            sx={{ mb: 3, borderRadius: "16px", alignItems: "center" }}
          >
            StopC runs quietly in the background — closing this window won't
            quit it. Look for the tray icon; a toast pops up automatically
            whenever you copy something.
          </Alert>
        </motion.div>

        {/* Stats Display */}
        <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
          <Stack alignItems="center" sx={{ mb: 5 }}>
            <Typography
              variant="caption"
              fontWeight={500}
              color="text.secondary"
              textAlign="center"
              sx={{ letterSpacing: "0.08em", textTransform: "uppercase", mb: 0.5 }}
            >
              Copies Today
            </Typography>
            <Typography variant="h3" fontWeight={700} textAlign="center">
              {todayCount}
            </Typography>
            {totalCount > 0 && (
              <Typography variant="body2" color="text.secondary" textAlign="center">
                {totalCount} total copies
              </Typography>
            )}
          </Stack>
        </motion.div>

        {/* Try It Out */}
        <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
          <M3Card title="Try It Out">
            <Stack spacing={1.5}>
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

        {/* Funny Mode Banner */}
        {lastFunny && (
          <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp}>
            <M3Card sx={{ borderLeft: "4px solid", borderColor: "primary.main" }}>
              <Stack spacing={0.5}>
                <Typography variant="subtitle2" color="text.secondary">
                  {MOOD_EMOJI[lastFunny.mood]} Funny Mode (copy #{lastFunny.repeatCount})
                </Typography>
                <Typography variant="body2">{lastFunny.message}</Typography>
              </Stack>
            </M3Card>
          </motion.div>
        )}

        {/* Recent Activity */}
        <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp}>
          <M3Card title="Recent Activity">
            {history.length === 0 ? (
              <Stack alignItems="center" py={3}>
                <Clock size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Nothing copied yet — try Ctrl+C on something.
                </Typography>
              </Stack>
            ) : (
              <Stack spacing={0}>
                {history.slice(0, 10).map((item, i) => (
                  <M3ListItem
                    key={item.timestamp}
                    icon={KIND_ICONS[item.kind]}
                    title={KIND_LABELS[item.kind]}
                    subtitle={item.preview}
                    trailing={
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(item.timestamp)}
                      </Typography>
                    }
                    showChevron={false}
                    sx={{
                      borderTop: i > 0 ? "1px solid" : "none",
                      borderColor: "divider",
                      minHeight: 64,
                    }}
                  />
                ))}
              </Stack>
            )}
          </M3Card>
        </motion.div>

        {/* Navigation Icon Row */}
        <motion.div custom={6} initial="hidden" animate="visible" variants={fadeUp}>
          <Stack direction="row" justifyContent="center" spacing={4} sx={{ pt: 2, pb: 4 }}>
            <M3IconButton
              icon={<Settings size={24} />}
              label="Settings"
              onClick={() => window.dispatchEvent(new CustomEvent("app:navigate", { detail: "settings" }))}
            />
            <M3IconButton
              icon={<Info size={24} />}
              label="About"
              onClick={() => window.dispatchEvent(new CustomEvent("app:navigate", { detail: "about" }))}
            />
            <M3IconButton
              icon={<Code2 size={24} />}
              label="Developer"
              onClick={() => window.dispatchEvent(new CustomEvent("app:navigate", { detail: "developer" }))}
            />
          </Stack>
        </motion.div>
      </Stack>
    </Container>
  );
}
