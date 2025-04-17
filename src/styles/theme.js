//theme for the application
import { createTheme } from "@mui/material/styles";
export const theme = createTheme({
  palette: {
    primary: {
      main: "#2B7B8C",
    },
    secondary: {
      main: "#8FBFBF",
    },
    background: {
      default: "#EFF9FE",
      paper: "#EFF9FE",
    },
    text: {
      primary: "#0B1F23",
      secondary: "#BFBBB8",
    },
  },
  typography: {
    fontFamily: ["Roboto", "Arial", "sans-serif"].join(","),
  },
});
