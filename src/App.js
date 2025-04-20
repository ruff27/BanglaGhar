import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// Feature/Page Imports (ensure paths are correct)
import Home from "./features/home/HomePage";
import AboutUs from "./features/static/AboutUsPage";
import Contact from "./features/static/ContactPage";
// import BangladeshMap from "./features/map/MapPage"; // Uncomment if map page exists
import Login from "./pages/Login";
import ListProperty from "./features/listing/ListPropertyPage";
import Signup from "./pages/Signup";
import VerifyOtp from "./pages/VerifyOtp";
import ForgotPassword from "./pages/ForgotPassword";
import PropertiesPage from "./features/properties/PropertiesPage"; // Renamed import for clarity
import Saved from "./pages/Saved";
import UserProfile from "./pages/UserProfile";
// *** Import the new PropertyDetailPage ***
import PropertyDetailPage from "./features/properties/pages/PropertyDetailPage"; // Adjust path if needed

// Theme and Context
import { theme } from "./styles/theme";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider } from "./context/AuthContext"; // Adjust path if needed

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
                {/* Existing Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route
                  path="/properties/:mode"
                  element={<PropertiesPage />}
                />{" "}
                {/* List page */}
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />{" "}
                {/* Corrected casing */}
                <Route path="/verify-otp" element={<VerifyOtp />} />
                <Route
                  path="/forgot-password"
                  element={<ForgotPassword />}
                />{" "}
                {/* Corrected path */}
                <Route path="/list-property" element={<ListProperty />} />
                <Route path="/saved" element={<Saved />} />
                <Route path="/user-profile" element={<UserProfile />} />
                {/* <Route path="/map" element={<BangladeshMap />} /> */}{" "}
                {/* Uncomment if map page exists */}
                {/* *** Add the New Route for Property Details *** */}
                {/* Use a distinct path like /details/ */}
                <Route
                  path="/properties/details/:propertyId"
                  element={<PropertyDetailPage />}
                />
                {/* Optional: Add a fallback route for unmatched paths */}
                {/* <Route path="*" element={<NotFoundPage />} /> */}
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
