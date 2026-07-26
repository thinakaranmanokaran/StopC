import { useEffect, useState } from "react";
import {
  Container,
  Stack,
  Typography,
  Divider,
  Button,
  Snackbar,
  Alert,
  Box,
  Tooltip,
} from "@mui/material";
import {
  Bell,
  Sparkles,
  Volume2,
  Power,
  RotateCcw,
  Palette,
  Clapperboard,
  Move,
  Music,
  Monitor,
  Droplets,
  Zap,
  Layout,
  Smile,
  Terminal,
  Sun,
  Moon,
  LayoutDashboard,
  Gamepad2,
  Cloud,
  BadgeInfo,
} from "lucide-react";
import { motion } from "framer-motion";
import { useSettingsStore, DEFAULT_SETTINGS } from "@/store/settingsStore";
import type { StopCSettings } from "@/store/settingsStore";
import { loadSettings, saveSettings, resetSettingsBackend } from "@/services/settingsService";
import { playNotificationSound } from "@/services/soundPlayer";
import M3Card from "@/components/M3Card";
import ToggleRow from "@/components/ToggleRow";
import M3SelectableGrid from "@/components/M3SelectableGrid";

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1.5 }}>
      <Box sx={{ color: "primary.main", display: "flex" }}>{icon}</Box>
      <Typography variant="subtitle1" fontWeight={700}>
        {title}
      </Typography>
    </Stack>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: "easeOut" },
  }),
};

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
      <Stack spacing={0}>
        <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
          <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>
            Settings
          </Typography>
        </motion.div>

        {/* Notifications */}
        <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
          <M3Card>
            <SectionHeader icon={<Bell size={20} />} title="Notifications" />
            <Stack spacing={0}>
              <ToggleRow
                label="Notify on text copy"
                checked={settings.notifyOnText}
                onChange={(v) => update("notifyOnText", v)}
              />
              <ToggleRow
                label="Notify on image copy"
                checked={settings.notifyOnImage}
                onChange={(v) => update("notifyOnImage", v)}
              />
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack spacing={2.5}>
              <Box>
                <Typography variant="body1" fontWeight={500} sx={{ mb: 1 }}>Theme</Typography>
                <M3SelectableGrid
                  value={settings.theme}
                  onChange={(v) => update("theme", v as StopCSettings["theme"])}
                  columns={3}
                  options={[
                    { value: "material", label: "Material", icon: <Palette size={22} /> },
                    { value: "glassmorphism", label: "Glass", icon: <Cloud size={22} /> },
                    { value: "minimal", label: "Minimal", icon: <Layout size={22} /> },
                    { value: "neon", label: "Neon", icon: <Zap size={22} /> },
                    { value: "macos", label: "macOS", icon: <Monitor size={22} /> },
                    { value: "windows11", label: "Win 11", icon: <LayoutDashboard size={22} /> },
                    { value: "retro", label: "Retro", icon: <Gamepad2 size={22} /> },
                    { value: "terminal", label: "Terminal", icon: <Terminal size={22} /> },
                    { value: "cute", label: "Cute", icon: <Smile size={22} /> },
                    { value: "dark", label: "Dark", icon: <Moon size={22} /> },
                    { value: "light", label: "Light", icon: <Sun size={22} /> },
                  ]}
                />
              </Box>

              <Box>
                <Typography variant="body1" fontWeight={500} sx={{ mb: 1 }}>Animation</Typography>
                <M3SelectableGrid
                  value={settings.animation}
                  onChange={(v) => update("animation", v as StopCSettings["animation"])}
                  columns={2}
                  options={[
                    { value: "slide", label: "Slide", icon: <Move size={22} /> },
                    { value: "fade", label: "Fade", icon: <Droplets size={22} /> },
                    { value: "scale", label: "Scale", icon: <Clapperboard size={22} /> },
                    { value: "spring", label: "Spring", icon: <Zap size={22} /> },
                  ]}
                />
              </Box>

              <Box>
                <Typography variant="body1" fontWeight={500} sx={{ mb: 1 }}>Position</Typography>
                <M3SelectableGrid
                  value={settings.position}
                  onChange={(v) => update("position", v as StopCSettings["position"])}
                  columns={3}
                  options={[
                    { value: "top-left", label: "Top Left" },
                    { value: "top-center", label: "Top Center" },
                    { value: "top-right", label: "Top Right" },
                    { value: "bottom-left", label: "Bottom Left" },
                    { value: "bottom-center", label: "Bottom Center" },
                    { value: "bottom-right", label: "Bottom Right" },
                  ]}
                />
              </Box>

              <Box>
                <Typography variant="body1" fontWeight={500} sx={{ mb: 1 }}>Duration</Typography>
                <M3SelectableGrid
                  value={settings.durationMs}
                  onChange={(v) => update("durationMs", v as number)}
                  columns={3}
                  options={[
                    { value: 1000, label: "1s" },
                    { value: 2000, label: "2s" },
                    { value: 3000, label: "3s" },
                    { value: 5000, label: "5s" },
                    { value: 8000, label: "8s" },
                  ]}
                />
              </Box>

              <Box>
                <Typography variant="body1" fontWeight={500} sx={{ mb: 1 }}>Opacity</Typography>
                <M3SelectableGrid
                  value={settings.opacity}
                  onChange={(v) => update("opacity", v as number)}
                  columns={3}
                  options={[
                    { value: 0.4, label: "40%" },
                    { value: 0.6, label: "60%" },
                    { value: 0.8, label: "80%" },
                    { value: 0.9, label: "90%" },
                    { value: 1, label: "100%" },
                  ]}
                />
              </Box>

              <Box>
                <Typography variant="body1" fontWeight={500} sx={{ mb: 1 }}>Corner radius</Typography>
                <M3SelectableGrid
                  value={settings.cornerRadius}
                  onChange={(v) => update("cornerRadius", v as number)}
                  columns={3}
                  options={[
                    { value: 0, label: "None" },
                    { value: 8, label: "Small" },
                    { value: 16, label: "Medium" },
                    { value: 24, label: "Large" },
                    { value: 32, label: "Full" },
                  ]}
                />
              </Box>
            </Stack>
          </M3Card>
        </motion.div>

        {/* Funny Mode */}
        <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
          <M3Card>
            <SectionHeader icon={<Sparkles size={20} />} title="Funny Mode" />
            <Stack spacing={0}>
              <ToggleRow
                label="Enable Funny Mode"
                checked={settings.funnyModeEnabled}
                onChange={(v) => update("funnyModeEnabled", v)}
              />
              <ToggleRow
                label="Show mascots"
                checked={settings.mascotsEnabled}
                onChange={(v) => update("mascotsEnabled", v)}
              />
            </Stack>
            <Box sx={{ mt: 2 }}>
              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1.5 }}>
                <Typography variant="body1" fontWeight={500}>Funny Mode Threshold</Typography>
                <Tooltip
                  arrow
                  placement="top"
                  title={`How many times in a row you can press Ctrl+C on clipboard content that hasn't changed before StopC shows a funny message. Lower = it teases you sooner; higher = it gives you more room before speaking up. Currently, Trigger after ${settings.funnyModeThreshold} repeat Ctrl+C presses on the same content.`}
                >
                  <Box sx={{ display: "flex", color: "text.secondary", cursor: "help" }}>
                    <BadgeInfo size={18} />
                  </Box>
                </Tooltip>
              </Stack>
              {/* <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Trigger after {settings.funnyModeThreshold} repeat Ctrl+C presses on the same content.
              </Typography> */}
              <M3SelectableGrid
                value={settings.funnyModeThreshold}
                onChange={(v) => update("funnyModeThreshold", v as number)}
                columns={3}
                disabled={!settings.funnyModeEnabled}
                options={[
                  { value: 2, label: "2x" },
                  { value: 3, label: "3x" },
                  { value: 5, label: "5x" },
                  { value: 7, label: "7x" },
                  { value: 10, label: "10x" },
                ]}
              />
            </Box>
          </M3Card>
        </motion.div>

        {/* Sound */}
        <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
          <M3Card>
            <SectionHeader icon={<Volume2 size={20} />} title="Sound" />
            <ToggleRow
              label="Enable sound"
              checked={settings.soundEnabled}
              onChange={(v) => update("soundEnabled", v)}
            />
            <Box sx={{ mt: 1.5 }}>
              <Typography variant="body1" fontWeight={500} sx={{ mb: 1 }}>Sound pack</Typography>
              <M3SelectableGrid
                value={settings.soundPack}
                onChange={(v) => update("soundPack", v as StopCSettings["soundPack"])}
                columns={3}
                disabled={!settings.soundEnabled}
                options={[
                  { value: "pop", label: "Pop", icon: <Music size={20} /> },
                  { value: "click", label: "Click", icon: <Zap size={20} /> },
                  { value: "bubble", label: "Bubble", icon: <Cloud size={20} /> },
                  { value: "retro", label: "Retro", icon: <Gamepad2 size={20} /> },
                  { value: "mute", label: "Mute", icon: <Volume2 size={20} /> },
                ]}
              />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" fontWeight={500} sx={{ mb: 1 }}>Volume</Typography>
              <M3SelectableGrid
                value={settings.soundVolume}
                onChange={(v) => update("soundVolume", v as number)}
                columns={4}
                disabled={!settings.soundEnabled || settings.soundPack === "mute"}
                options={[
                  { value: 0.2, label: "Low" },
                  { value: 0.5, label: "Medium" },
                  { value: 0.8, label: "High" },
                  { value: 1, label: "Max" },
                ]}
              />
            </Box>
            <Button
              variant="outlined"
              size="small"
              onClick={() => playNotificationSound(settings)}
              disabled={!settings.soundEnabled || settings.soundPack === "mute"}
              sx={{ mt: 2, borderRadius: "12px" }}
            >
              Test Sound
            </Button>
          </M3Card>
        </motion.div>

        {/* Startup */}
        <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp}>
          <M3Card>
            <SectionHeader icon={<Power size={20} />} title="Startup" />
            <ToggleRow
              label="Launch StopC when you log in"
              checked={settings.autoStart}
              onChange={(v) => update("autoStart", v)}
            />
          </M3Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp}>
          <Stack direction="row" spacing={1.5}>
            <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ flex: 1 }}>
              {saving ? "Saving\u2026" : "Save Changes"}
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
        </motion.div>
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
