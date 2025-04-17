import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";

import Footer from "./components/layout/Footer";

import Home from "./features/home/HomePage";

import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import ListProperty from "./pages/ListProperty";
import Signup from "./pages/Signup";
import VerifyOtp from "./pages/VerifyOtp";
import ForgotPassword from "./pages/ForgotPassword";
import { theme } from "./styles/theme";

// Import the new single-page component:
import Properties from "./features/properties/PropertiesPage"; // Update path
import Saved from "./pages/Saved";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider } from "./context/AuthContext";
import UserProfile from "./pages/UserProfile";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="App">
            {/*
              Removed LanguageToggle from here to avoid duplication.
              The LanguageToggle component is already rendered inside Navbar.
            */}
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
                <Route path="/verify-otp" element={<VerifyOtp />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
                <Route path="/list-property" element={<ListProperty />} />
                <Route path="/saved" element={<Saved />} />
                <Route path="/user-profile" element={<UserProfile />} />
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
