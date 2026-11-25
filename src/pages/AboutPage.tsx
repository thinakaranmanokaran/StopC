import { useEffect, useState } from "react";
import {
  Container,
  Stack,
  Typography,
  Box,
  Divider,
  useTheme,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  CircularProgress,
} from "@mui/material";
import { Check, Package, Scale, Layers, Github, RefreshCw, DownloadCloud, PartyPopper } from "lucide-react";
import { motion } from "framer-motion";
import { listen } from "@tauri-apps/api/event";
import { getVersion } from "@tauri-apps/api/app";
import M3Card from "@/components/M3Card";
import { AppLogo } from "@/components/AppLogo";
import { appConfig } from "@/config/appConfig";
import { cardShadow } from "@/utils/elevation";
import {
  checkForUpdates,
  downloadAndInstallUpdate,
  subscribeToUpdateProgress,
  subscribeToUpdateStatus,
  type UpdateInfo,
} from "@/services/updateService";

const GITHUB_URL = "https://github.com/thinakaranmanokaran/StopC";
const PRIVACY_URL = "https://stopc.netlify.app/privacy/";
const SUPPORT_URL = "https://stopc.netlify.app/support/";

const FEATURES = [
  "Clipboard monitoring with instant visual confirmation",
  "11 notification themes: material, glassmorphism, neon, macOS, and more",
  "4 animation styles: slide, fade, scale, spring",
  "Customizable position, duration, opacity, and corner radius",
  "Snooze notifications for 30 seconds up to a full day",
  "Exclusions — silence notifications per-app",
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

type UpdateStage = "idle" | "checking" | "up-to-date" | "available" | "downloading" | "installing" | "error";

export default function AboutPage() {
  const theme = useTheme();
  const iconColor = theme.palette.text.secondary;

  const [version, setVersion] = useState<string>("…");
  const [stage, setStage] = useState<UpdateStage>("idle");
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [progress, setProgress] = useState<{ downloaded: number; total: number }>({
    downloaded: 0,
    total: 0,
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  // Version is read live from tauri.conf.json (via the Tauri app API) so
  // this page never drifts out of sync with the actual build.
  useEffect(() => {
    getVersion()
      .then(setVersion)
      .catch((e) => {
        console.error("[stopc] failed to read app version:", e);
        setVersion("1.0.2");
      });
  }, []);

  const runCheck = async () => {
    setStage("checking");
    setErrorMessage("");
    setDialogOpen(true);
    try {
      const info = await checkForUpdates();
      setUpdateInfo(info);
      setStage(info.available ? "available" : "up-to-date");
    } catch (e) {
      console.error("[stopc] update check failed:", e);
      setErrorMessage(e instanceof Error ? e.message : "Couldn't check for updates.");
      setStage("error");
    }
  };

  // The tray's "Check for Updates" item navigates here and fires this
  // event so the check starts automatically — the tray itself has no
  // surface to show progress on.
  useEffect(() => {
    const unlistenPromise = listen("tray://trigger-update-check", () => {
      runCheck();
    });
    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const unsub1 = subscribeToUpdateProgress(setProgress);
    const unsub2 = subscribeToUpdateStatus((status) => {
      if (status === "installing") setStage("installing");
    });
    return () => {
      unsub1.then((u) => u());
      unsub2.then((u) => u());
    };
  }, []);

  const handleDownloadAndInstall = async () => {
    if (!updateInfo?.downloadUrl) return;
    setStage("downloading");
    setProgress({ downloaded: 0, total: 0 });
    try {
      // Resolves only after the installer has been launched and StopC
      // is about to exit — there's no "finished" UI state to show.
      await downloadAndInstallUpdate(updateInfo.downloadUrl);
    } catch (e) {
      console.error("[stopc] update download/install failed:", e);
      setErrorMessage(e instanceof Error ? e.message : "The update download failed.");
      setStage("error");
    }
  };

  const closeDialog = () => {
    // Don't let the user close the dialog mid-download/install.
    if (stage === "downloading" || stage === "installing") return;
    setDialogOpen(false);
  };

  const progressPct =
    progress.total > 0 ? Math.min(100, Math.round((progress.downloaded / progress.total) * 100)) : undefined;

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
                boxShadow: cardShadow(theme),
                mb: 2,
              }}
            >
              <AppLogo size={88} />
            </Box>
            <Typography variant="h4" fontWeight={800} textAlign="center">
              {appConfig.appName}
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mt: 0.5 }}>
              {appConfig.slogan}
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 1 }}>
              Version {version}
            </Typography>
          </Stack>
        </motion.div>

        {/* Description */}
        <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
          <Box sx={{ px: 1, mb: 3 }}>
            <Typography variant="body1" color="text.secondary" lineHeight={1.7}>
              {appConfig.appName} is a clipboard confidence app — not a clipboard manager. It
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
                  <Check size={18} color={iconColor} style={{ marginTop: 3, flexShrink: 0 }} />
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
                <Package size={18} color={iconColor} />
                <Typography variant="body2" color="text.secondary" flex={1}>
                  Version
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {version}
                </Typography>
              </Stack>
              <Divider />
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Scale size={18} color={iconColor} />
                <Typography variant="body2" color="text.secondary" flex={1}>
                  License
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  MIT
                </Typography>
              </Stack>
              <Divider />
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Layers size={18} color={iconColor} />
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

        {/* Actions — Check for Updates + GitHub, both at the bottom */}
        <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp}>
          <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<RefreshCw size={16} />}
              onClick={runCheck}
              sx={{ borderRadius: "14px" }}
            >
              Check for Updates
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              fullWidth
              startIcon={<Github size={16} />}
              onClick={() => window.open(GITHUB_URL, "_blank", "noopener,noreferrer")}
              sx={{ borderRadius: "14px" }}
            >
              GitHub
            </Button>
          </Stack>
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
            <Button
              size="small"
              color="inherit"
              onClick={() => window.open(PRIVACY_URL, "_blank", "noopener,noreferrer")}
              sx={{ color: "text.secondary", textTransform: "none" }}
            >
              Privacy Policy
            </Button>
            <Button
              size="small"
              color="inherit"
              onClick={() => window.open(SUPPORT_URL, "_blank", "noopener,noreferrer")}
              sx={{ color: "text.secondary", textTransform: "none" }}
            >
              Support &amp; FAQ
            </Button>
          </Stack>
        </motion.div>
      </Stack>

      {/* Update dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="xs" fullWidth>
        <DialogTitle>
          {stage === "checking" && "Checking for updates…"}
          {stage === "up-to-date" && "You're up to date"}
          {stage === "available" && "Update available"}
          {stage === "downloading" && "Downloading update…"}
          {stage === "installing" && "Launching installer…"}
          {stage === "error" && "Couldn't check for updates"}
        </DialogTitle>
        <DialogContent>
          {stage === "checking" && (
            <Stack alignItems="center" spacing={2} sx={{ py: 2 }}>
              <CircularProgress size={28} />
            </Stack>
          )}

          {stage === "up-to-date" && updateInfo && (
            <Stack alignItems="center" spacing={1.5} sx={{ py: 2 }}>
              <PartyPopper size={32} color={theme.palette.primary.main} />
              <Typography variant="body2" color="text.secondary" textAlign="center">
                You're already running the latest version ({updateInfo.currentVersion}).
              </Typography>
            </Stack>
          )}

          {stage === "available" && updateInfo && (
            <Stack spacing={1.5} sx={{ py: 1 }}>
              <Typography variant="body2" color="text.secondary">
                StopC {updateInfo.latestVersion} is available — you're on {updateInfo.currentVersion}.
              </Typography>
              {!updateInfo.downloadUrl && (
                <Typography variant="body2" color="text.secondary">
                  No Windows installer was found in that release. You can grab it manually from GitHub.
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                Note: the downloaded installer isn't code-signed yet, so Windows SmartScreen
                may still warn about an unrecognized publisher — that's expected until StopC
                ships with a code-signing certificate.
              </Typography>
            </Stack>
          )}

          {(stage === "downloading" || stage === "installing") && (
            <Stack spacing={1.5} sx={{ py: 1 }}>
              <LinearProgress
                variant={progressPct !== undefined ? "determinate" : "indeterminate"}
                value={progressPct}
              />
              <Typography variant="body2" color="text.secondary" textAlign="center">
                {stage === "installing"
                  ? "Starting the installer — StopC will close automatically."
                  : progressPct !== undefined
                    ? `${progressPct}% downloaded`
                    : "Downloading…"}
              </Typography>
            </Stack>
          )}

          {stage === "error" && (
            <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
              {errorMessage || "Something went wrong. Check your internet connection and try again."}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          {stage === "available" && (
            <>
              <Button onClick={() => setDialogOpen(false)} color="inherit">
                Not now
              </Button>
              <Button
                variant="contained"
                startIcon={<DownloadCloud size={16} />}
                disabled={!updateInfo?.downloadUrl}
                onClick={handleDownloadAndInstall}
              >
                Download &amp; Install
              </Button>
            </>
          )}
          {(stage === "up-to-date" || stage === "error") && (
            <Button onClick={() => setDialogOpen(false)}>Close</Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
}
