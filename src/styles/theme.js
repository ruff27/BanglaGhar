//theme for the application
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#2B7B8C", // Stays the same
    },
    secondary: {
      main: "#8FBFBF", // Stays the same
    },
    background: {
      default: "#EFF9FE", // Stays the same
      paper: "#EFF9FE", // Stays the same
    },
    text: {
      primary: "#0B1F23", // Stays the same
      secondary: "#647C82", // << UPDATED: Was #BFBBB8
    },
  },
  typography: {
    fontFamily: ["Roboto", "Arial", "sans-serif"].join(","), // Stays the same
  },
});
