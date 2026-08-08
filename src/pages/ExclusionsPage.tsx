import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Stack,
  Typography,
  Box,
  TextField,
  Checkbox,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Search, ShieldOff, AppWindow, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import M3Card from "@/components/M3Card";
import M3ListItem from "@/components/M3ListItem";
import { useSettingsStore } from "@/store/settingsStore";
import { saveSettings } from "@/services/settingsService";
import { listInstalledApps, type InstalledApp } from "@/services/appsService";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" },
  }),
};

export default function ExclusionsPage() {
  const settings = useSettingsStore((s) => s.settings);
  const setSettings = useSettingsStore((s) => s.setSettings);

  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [savingExe, setSavingExe] = useState<string | null>(null);

  const loadApps = () => {
    setLoading(true);
    setLoadError(null);
    listInstalledApps()
      .then(setApps)
      .catch((e) => {
        console.error("[stopc] failed to list installed apps:", e);
        setLoadError("Couldn't read the installed apps list.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(loadApps, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return apps;
    return apps.filter((a) => a.name.toLowerCase().includes(q) || a.exe.includes(q));
  }, [apps, search]);

  const excludedSet = useMemo(() => new Set(settings.excludedApps), [settings.excludedApps]);

  const toggle = async (exe: string) => {
    if (!exe) return;
    const next = excludedSet.has(exe)
      ? settings.excludedApps.filter((e) => e !== exe)
      : [...settings.excludedApps, exe];

    setSettings({ excludedApps: next });
    setSavingExe(exe);
    try {
      await saveSettings({ ...settings, excludedApps: next });
    } catch (e) {
      console.error("[stopc] failed to save exclusions:", e);
      // Revert on failure.
      setSettings({ excludedApps: settings.excludedApps });
    } finally {
      setSavingExe(null);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6, pb: 10 }}>
      <Stack spacing={0}>
        <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="h4" fontWeight={800}>
              Exclusions
            </Typography>
            <Tooltip title="Refresh app list" arrow>
              <IconButton onClick={loadApps} size="small">
                <RefreshCw size={18} />
              </IconButton>
            </Tooltip>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Pick apps whose copies should never show a notification. StopC still
            tracks the copy in your history — it just won't pop up a toast or play
            a sound when one of these apps is the active window.
          </Typography>
        </motion.div>

        <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search installed apps…"
            size="small"
            fullWidth
            InputProps={{
              startAdornment: <Search size={16} style={{ marginRight: 8, opacity: 0.6 }} />,
            }}
            sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: "14px" } }}
          />
        </motion.div>

        {settings.excludedApps.length > 0 && (
          <motion.div custom={1.5} initial="hidden" animate="visible" variants={fadeUp}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
              {settings.excludedApps.map((exe) => (
                <Chip
                  key={exe}
                  size="small"
                  icon={<ShieldOff size={14} />}
                  label={apps.find((a) => a.exe === exe)?.name ?? exe}
                  onDelete={() => toggle(exe)}
                />
              ))}
            </Box>
          </motion.div>
        )}

        <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
          <M3Card sx={{ p: 1 }}>
            {loading ? (
              <Stack alignItems="center" spacing={1.5} sx={{ py: 6 }}>
                <CircularProgress size={28} />
                <Typography variant="body2" color="text.secondary">
                  Reading installed apps…
                </Typography>
              </Stack>
            ) : loadError ? (
              <Stack alignItems="center" spacing={1} sx={{ py: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  {loadError}
                </Typography>
              </Stack>
            ) : filtered.length === 0 ? (
              <Stack alignItems="center" spacing={1} sx={{ py: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  {apps.length === 0
                    ? "No installed apps found — this feature currently reads Windows' installed-programs list, so it's only available there."
                    : "No apps match your search."}
                </Typography>
              </Stack>
            ) : (
              <Stack spacing={0} divider={<Box sx={{ borderBottom: "1px solid", borderColor: "divider" }} />}>
                {filtered.map((app) => (
                  <M3ListItem
                    key={`${app.name}-${app.exe}`}
                    icon={<AppWindow size={20} />}
                    title={app.name}
                    subtitle={app.exe || "Can't be matched to a running process"}
                    showChevron={false}
                    onClick={app.exe ? () => toggle(app.exe) : undefined}
                    trailing={
                      <Checkbox
                        checked={!!app.exe && excludedSet.has(app.exe)}
                        disabled={!app.exe || savingExe === app.exe}
                        onChange={() => toggle(app.exe)}
                      />
                    }
                  />
                ))}
              </Stack>
            )}
          </M3Card>
        </motion.div>
      </Stack>
    </Container>
  );
}
