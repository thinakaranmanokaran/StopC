import React, { createContext, useContext, useState, useMemo } from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider, CssBaseline } from "@mui/material";
import App from "@/App";
import { darkTheme, lightTheme } from "@/theme/theme";
import "@/assets/fonts/fonts.css";

type Mode = "light" | "dark";

interface ThemeContextValue {
  mode: Mode;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({ mode: "dark", toggleMode: () => {} });
export const useThemeMode = () => useContext(ThemeContext);

function Root() {
  const [mode, setMode] = useState<Mode>("dark");
  const toggleMode = () => setMode((m) => (m === "dark" ? "light" : "dark"));
  const theme = useMemo(() => (mode === "dark" ? darkTheme : lightTheme), [mode]);

  const ctx = useMemo(() => ({ mode, toggleMode }), [mode, toggleMode]);

  return (
    <ThemeContext.Provider value={ctx}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
