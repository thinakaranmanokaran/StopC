import { useState } from "react";
import { Box, Container, Stack, Typography, Chip, Paper } from "@mui/material";
import { ClipboardCheck } from "lucide-react";
import { useClipboardWatcher } from "@/hooks/useClipboardWatcher";
import { useClipboardStore } from "@/store/clipboardStore";
import type { FunnyModeEvent } from "@/types/clipboard";

/**
 * Dashboard page — proves the clipboard pipeline end-to-end
 * (Rust -> event -> store -> UI). Stats/Achievements charts are a
 * follow-up (see PLAN.md); this still shows today's count + live feed.
 */
export default function Dashboard() {
  const history = useClipboardStore((s) => s.history);
  const todayCount = useClipboardStore((s) => s.todayCount);
  const [lastFunny, setLastFunny] = useState<FunnyModeEvent | null>(null);

  useClipboardWatcher((funnyEvent) => setLastFunny(funnyEvent));

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Stack spacing={3}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <ClipboardCheck size={28} />
          <Typography variant="h4" fontWeight={800}>
            StopC
          </Typography>
          <Chip label="Copy Once. Trust Forever." size="small" variant="outlined" />
        </Stack>

        <Paper sx={{ p: 3 }}>
          <Typography variant="overline" color="text.secondary">
            Today
          </Typography>
          <Typography variant="h3" fontWeight={700}>
            {todayCount}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            copies detected
          </Typography>
        </Paper>

        {lastFunny && (
          <Paper sx={{ p: 2.5, borderLeft: "4px solid #7C5CFC" }}>
            <Typography variant="subtitle2" color="text.secondary">
              {lastFunny.mascot} Funny Mode (copy #{lastFunny.repeat_count})
            </Typography>
            <Typography variant="body1">{lastFunny.message}</Typography>
          </Paper>
        )}

        <Box>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Recent Activity
          </Typography>
          <Stack spacing={1}>
            {history.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Nothing copied yet — try Ctrl+C on something.
              </Typography>
            )}
            {history.map((item) => (
              <Paper key={item.timestamp} sx={{ p: 1.5 }}>
                <Typography variant="body2">
                  <strong>{item.kind}</strong> — {item.preview}
                </Typography>
              </Paper>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}
