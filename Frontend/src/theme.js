import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1E3A8A", // Royal Blue
    },
    secondary: {
      main: "#2563EB", // Dodger Blue
    },
    background: {
      default: "#F9FAFB", // Light background
      paper: "#FFFFFF",
    },
    text: {
      primary: "#111827", // Main Text
      secondary: "#6B7280", // Descriptions
    },
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
  },
});

export default theme;
