import { useEffect, useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import { LayoutDashboard, Settings as SettingsIcon, Code2, ClipboardCheck, Sun, Moon, Info } from "lucide-react";
import { listen } from "@tauri-apps/api/event";
import { useThemeMode } from "@/main";
import Dashboard from "@/pages/Dashboard";
import SettingsPage from "@/pages/SettingsPage";
import AboutPage from "@/pages/AboutPage";
import DeveloperPage from "@/pages/DeveloperPage";

type Page = "dashboard" | "settings" | "about" | "developer";

const DRAWER_WIDTH = 220;

const NAV_ITEMS: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { id: "settings", label: "Settings", icon: <SettingsIcon size={20} /> },
  { id: "about", label: "About", icon: <Info size={20} /> },
];

const BOTTOM_NAV_ITEMS: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: "developer", label: "Developer", icon: <Code2 size={20} /> },
];

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const { mode, toggleMode } = useThemeMode();

  useEffect(() => {
    const unlistenPromise = listen<string>("tray://navigate", (event) => {
      const target = event.payload;
      if (target === "dashboard" || target === "settings" || target === "about" || target === "developer") {
        setPage(target);
      }
    });
    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<Page>).detail;
      if (detail === "dashboard" || detail === "settings" || detail === "about" || detail === "developer") {
        setPage(detail);
      }
    };
    window.addEventListener("app:navigate", handler);
    return () => window.removeEventListener("app:navigate", handler);
  }, []);

  useEffect(() => {
    document.querySelector("main")?.scrollTo({ top: 0 });
  }, [page]);

  const renderNavItems = (items: { id: Page; label: string; icon: React.ReactNode }[]) =>
    items.map((item) => (
      <ListItemButton
        key={item.id}
        selected={page === item.id}
        onClick={() => setPage(item.id)}
        sx={{ borderRadius: 2, mb: 0.5 }}
      >
        <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>{item.icon}</ListItemIcon>
        <ListItemText primary={item.label} />
      </ListItemButton>
    ));

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            borderRadius: 0,
          },
        }}
      >
        <Toolbar sx={{ px: 2.5, py: 1 }}>
          <ClipboardCheck size={22} style={{ marginRight: 10 }} />
          <Typography variant="subtitle1" fontWeight={800} sx={{ flex: 1 }}>
            StopC
          </Typography>
          <Tooltip title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"} arrow>
            <IconButton size="small" onClick={toggleMode} sx={{ color: "text.secondary" }}>
              {mode === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </IconButton>
          </Tooltip>
        </Toolbar>
        <Divider />
        <List sx={{ px: 1, pt: 1, flex: 1 }}>
          {renderNavItems(NAV_ITEMS)}
        </List>
        <Divider sx={{ mx: 1 }} />
        <List sx={{ px: 1, pb: 1 }}>
          {renderNavItems(BOTTOM_NAV_ITEMS)}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, overflow: "auto" }}>
        {page === "dashboard" && <Dashboard />}
        {page === "settings" && <SettingsPage />}
        {page === "about" && <AboutPage />}
        {page === "developer" && <DeveloperPage />}
      </Box>
    </Box>
  );
}
