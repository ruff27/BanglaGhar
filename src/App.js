import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// Feature/Page Imports
import Home from "./features/home/HomePage";
import AboutUs from "./features/static/AboutUsPage";
import Contact from "./features/static/ContactPage";
import Login from "./pages/Login"; // Keep auth pages for now
import ListProperty from "./features/listing/ListPropertyPage";
import Signup from "./pages/Signup";
import VerifyOtp from "./pages/VerifyOtp";
import ForgotPassword from "./pages/ForgotPassword";
import PropertiesPage from "./features/properties/PropertiesPage";
import PropertyDetailPage from "./features/properties/pages/PropertyDetailPage";
import Saved from "./pages/Saved";
import UserProfilePage from "./features/profile/UserProfilePage";

// Theme and Context
import { theme } from "./styles/theme";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="App">
            <Navbar />
            <main className="content">
              <Routes>
                {/* ... other routes ... */}
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/properties/:mode" element={<PropertiesPage />} />
                <Route
                  path="/properties/details/:propertyId"
                  element={<PropertyDetailPage />}
                />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/verify-otp" element={<VerifyOtp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/list-property" element={<ListProperty />} />
                <Route path="/saved" element={<Saved />} />
                <Route path="/user-profile" element={<UserProfilePage />} />
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
