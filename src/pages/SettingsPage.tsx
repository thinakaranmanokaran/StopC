import { useEffect, useState } from "react";
import {
  Container,
  Stack,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  Divider,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Slider,
  Button,
  Snackbar,
  Alert,
  Box,
} from "@mui/material";
import { Bell, Sparkles, Volume2, Power, RotateCcw } from "lucide-react";
import { useSettingsStore, DEFAULT_SETTINGS } from "@/store/settingsStore";
import type { StopCSettings } from "@/store/settingsStore";
import { loadSettings, saveSettings, resetSettingsBackend } from "@/services/settingsService";

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1.5 }}>
      {icon}
      <Typography variant="subtitle1" fontWeight={700}>
        {title}
      </Typography>
    </Stack>
  );
}

export default function SettingsPage() {
  const settings = useSettingsStore((s) => s.settings);
  const replaceSettings = useSettingsStore((s) => s.replaceSettings);
  const setSettings = useSettingsStore((s) => s.setSettings);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    loadSettings()
      .then(replaceSettings)
      .catch((e) => {
        console.error("[stopc] failed to load settings, using defaults:", e);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = <K extends keyof StopCSettings>(key: K, value: StopCSettings[K]) => {
    setSettings({ [key]: value } as Partial<StopCSettings>);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettings(settings);
      setToast({ open: true, message: "Settings saved", severity: "success" });
    } catch (e) {
      console.error("[stopc] failed to save settings:", e);
      setToast({ open: true, message: "Couldn't save settings", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      const defaults = await resetSettingsBackend();
      replaceSettings(defaults);
      setToast({ open: true, message: "Reset to defaults", severity: "success" });
    } catch (e) {
      console.error("[stopc] failed to reset settings, resetting locally:", e);
      replaceSettings(DEFAULT_SETTINGS);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Stack spacing={3}>
        <Typography variant="h4" fontWeight={800}>
          Settings
        </Typography>

        {/* Notifications: the toggles you asked for */}
        <Paper sx={{ p: 3 }}>
          <SectionHeader icon={<Bell size={20} />} title="Notifications" />
          <Stack spacing={0.5}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifyOnText}
                  onChange={(e) => update("notifyOnText", e.target.checked)}
                />
              }
              label="Notify on text copy"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifyOnImage}
                  onChange={(e) => update("notifyOnImage", e.target.checked)}
                />
              }
              label="Notify on image copy"
            />
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel id="theme-label">Theme</InputLabel>
              <Select
                labelId="theme-label"
                label="Theme"
                value={settings.theme}
                onChange={(e) => update("theme", e.target.value as StopCSettings["theme"])}
              >
                {[
                  "material",
                  "glassmorphism",
                  "minimal",
                  "neon",
                  "macos",
                  "windows11",
                  "retro",
                  "terminal",
                  "cute",
                  "dark",
                  "light",
                ].map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel id="animation-label">Animation</InputLabel>
              <Select
                labelId="animation-label"
                label="Animation"
                value={settings.animation}
                onChange={(e) => update("animation", e.target.value as StopCSettings["animation"])}
              >
                {["slide", "fade", "scale", "spring"].map((a) => (
                  <MenuItem key={a} value={a}>
                    {a}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel id="position-label">Position</InputLabel>
              <Select
                labelId="position-label"
                label="Position"
                value={settings.position}
                onChange={(e) => update("position", e.target.value as StopCSettings["position"])}
              >
                {["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"].map(
                  (p) => (
                    <MenuItem key={p} value={p}>
                      {p}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Duration: {(settings.durationMs / 1000).toFixed(1)}s
              </Typography>
              <Slider
                min={500}
                max={6000}
                step={100}
                value={settings.durationMs}
                onChange={(_, v) => update("durationMs", v as number)}
              />
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Opacity: {Math.round(settings.opacity * 100)}%
              </Typography>
              <Slider
                min={0.4}
                max={1}
                step={0.02}
                value={settings.opacity}
                onChange={(_, v) => update("opacity", v as number)}
              />
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Corner radius: {settings.cornerRadius}px
              </Typography>
              <Slider
                min={0}
                max={32}
                step={1}
                value={settings.cornerRadius}
                onChange={(_, v) => update("cornerRadius", v as number)}
              />
            </Box>
          </Stack>
        </Paper>

        {/* Funny Mode */}
        <Paper sx={{ p: 3 }}>
          <SectionHeader icon={<Sparkles size={20} />} title="Funny Mode" />
          <Stack spacing={0.5}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.funnyModeEnabled}
                  onChange={(e) => update("funnyModeEnabled", e.target.checked)}
                />
              }
              label="Enable Funny Mode"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.mascotsEnabled}
                  onChange={(e) => update("mascotsEnabled", e.target.checked)}
                />
              }
              label="Show mascots"
            />
          </Stack>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Trigger after {settings.funnyModeThreshold} repeat Ctrl+C presses
            </Typography>
            <Slider
              min={1}
              max={10}
              step={1}
              value={settings.funnyModeThreshold}
              onChange={(_, v) => update("funnyModeThreshold", v as number)}
              disabled={!settings.funnyModeEnabled}
            />
          </Box>
        </Paper>

        {/* Sound */}
        <Paper sx={{ p: 3 }}>
          <SectionHeader icon={<Volume2 size={20} />} title="Sound" />
          <FormControlLabel
            control={
              <Switch
                checked={settings.soundEnabled}
                onChange={(e) => update("soundEnabled", e.target.checked)}
              />
            }
            label="Enable sound"
          />
          <FormControl fullWidth size="small" sx={{ mt: 1.5 }} disabled={!settings.soundEnabled}>
            <InputLabel id="sound-label">Sound pack</InputLabel>
            <Select
              labelId="sound-label"
              label="Sound pack"
              value={settings.soundPack}
              onChange={(e) => update("soundPack", e.target.value as StopCSettings["soundPack"])}
            >
              {["pop", "click", "bubble", "retro", "mute"].map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>

        {/* Startup */}
        <Paper sx={{ p: 3 }}>
          <SectionHeader icon={<Power size={20} />} title="Startup" />
          <FormControlLabel
            control={
              <Switch checked={settings.autoStart} onChange={(e) => update("autoStart", e.target.checked)} />
            }
            label="Launch StopC when you log in"
          />
        </Paper>

        <Stack direction="row" spacing={1.5}>
          <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ flex: 1 }}>
            {saving ? "Saving…" : "Save Changes"}
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<RotateCcw size={16} />}
            onClick={handleReset}
          >
            Reset to Defaults
          </Button>
        </Stack>
      </Stack>

      <Snackbar
        open={toast.open}
        autoHideDuration={2500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={toast.severity} variant="filled" sx={{ width: "100%" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
