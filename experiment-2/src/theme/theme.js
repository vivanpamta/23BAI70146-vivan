import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#7C4DFF" },  // modern purple
    secondary: { main: "#22C55E" }, // green accent
    background: {
      default: "#0B1020",
      paper: "#111833",
    },
    text: {
      primary: "#EAF0FF",
      secondary: "rgba(234,240,255,0.72)",
    },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: ["Inter", "system-ui", "Segoe UI", "Roboto", "Arial"].join(","),
    h2: { fontWeight: 800, letterSpacing: "-0.02em" },
    h5: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 700 },
  },
});
