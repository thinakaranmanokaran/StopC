import { useEffect, useState } from "react";
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Divider } from "@mui/material";
import { LayoutDashboard, Settings as SettingsIcon, Code2, ClipboardCheck } from "lucide-react";
import { listen } from "@tauri-apps/api/event";
import Dashboard from "@/pages/Dashboard";
import SettingsPage from "@/pages/SettingsPage";
import DeveloperPage from "@/pages/DeveloperPage";

type Page = "dashboard" | "settings" | "developer";

const DRAWER_WIDTH = 220;

const NAV_ITEMS: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { id: "settings", label: "Settings", icon: <SettingsIcon size={20} /> },
  { id: "developer", label: "Developer", icon: <Code2 size={20} /> },
];

/**
 * Root shell: fixed left nav + swapped page content. Kept as simple
 * local state rather than a router — three pages doesn't warrant the
 * dependency, and the tray menu already needs a plain "set active page"
 * target for its "settings"/"about"/"open" events (see main.rs).
 */
export default function App() {
  const [page, setPage] = useState<Page>("dashboard");

  useEffect(() => {
    const unlistenPromise = listen<string>("tray://navigate", (event) => {
      const target = event.payload;
      if (target === "dashboard" || target === "settings" || target === "developer") {
        setPage(target);
      }
    });
    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, []);

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: "border-box", borderRight: "1px solid rgba(255,255,255,0.08)" },
        }}
      >
        <Toolbar sx={{ px: 2.5 }}>
          <ClipboardCheck size={22} style={{ marginRight: 10 }} />
          <Typography variant="subtitle1" fontWeight={800}>
            StopC
          </Typography>
        </Toolbar>
        <Divider />
        <List sx={{ px: 1, pt: 1 }}>
          {NAV_ITEMS.map((item) => (
            <ListItemButton
              key={item.id}
              selected={page === item.id}
              onClick={() => setPage(item.id)}
              sx={{ borderRadius: 2, mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, overflow: "auto" }}>
        {page === "dashboard" && <Dashboard />}
        {page === "settings" && <SettingsPage />}
        {page === "developer" && <DeveloperPage />}
      </Box>
    </Box>
  );
}
