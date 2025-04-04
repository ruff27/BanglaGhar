import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import ListProperty from "./pages/ListProperty";
import Signup from "./pages/Signup";
import LanguageToggle from "./components/LanguageToggle";

// Import the new single-page component:
import Properties from "./pages/Properties";
import Saved from "./pages/Saved";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider } from "./pages/AuthContext";

// theme
const theme = createTheme({
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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="App">
            <LanguageToggle />
            <Navbar />
            <main className="content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/properties/:mode" element={<Properties />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/Signup" element={<Signup />} />
                <Route path="/list-property" element={<ListProperty />} />
                <Route path="/saved" element={<Saved />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
