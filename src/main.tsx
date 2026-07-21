import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import App from "@/App";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#7C5CFC" },
    background: { default: "#0F0F14", paper: "#17171F" },
  },
  shape: { borderRadius: 14 },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
