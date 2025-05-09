// src/App.js
import React from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom"; // Import Outlet

import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

// Layout Components
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// Feature/Page Imports
import Home from "./features/home/HomePage";
import AboutUs from "./features/static/AboutUsPage";
import Contact from "./features/static/ContactPage";
import MyListingsPage from "./pages/MyListingsPage";
import Login from "./pages/Login";
import ListProperty from "./features/listing/ListPropertyPage";
import Signup from "./pages/Signup";
import ChangePassword from "./pages/ChangePassword";
import VerifyOtp from "./pages/VerifyOtp";
import ForgotPassword from "./pages/ForgotPassword";
import PropertiesPage from "./features/properties/PropertiesPage";
import PropertyDetailPage from "./features/properties/pages/PropertyDetailPage";
import Saved from "./pages/Saved";
import UserProfilePage from "./features/profile/UserProfilePage";
import AdminRoutes from "./admin/AdminRoutes"; // Import the file defining admin routes
import AdminProtectedRoute from "./components/common/AdminProtectedRoute"; // Import the guard

// Theme and Context
import { theme } from "./styles/theme"; // Adjust path if needed
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider } from "./context/AuthContext"; // Adjust path if needed
import { SnackbarProvider } from "./context/SnackbarContext"; // Adjust path if needed

// --- Create Layout Components ---

// Layout for main user-facing pages (includes Navbar and Footer)
const MainLayout = () => (
  <div
    className="App"
    style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
  >
    <Navbar />
    {/* Use flexGrow to make main content take available space */}
    <main
      className="content"
      style={{
        flexGrow: 1,
        paddingTop: "64px" /* Adjust if Navbar height is different */,
      }}
    >
      <Outlet /> {/* Nested routes render here */}
    </main>
    <Footer />
  </div>
);

// Layout for pages without Navbar/Footer (e.g., Login, Signup)
// Also used as base for Admin section before AdminLayout takes over
const BlankLayout = () => (
  <div
    className="App"
    style={
      {
        /* Basic styling if needed */
      }
    }
  >
    <main className="content">
      <Outlet />
    </main>
  </div>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Analytics />
      <SpeedInsights />
      <CssBaseline />
      <AuthProvider>
        <SnackbarProvider>
          <Router>
            {/* Routes are defined here */}
            <Routes>
              {/* Routes using the MainLayout (Navbar/Footer) */}
              <Route element={<MainLayout />}>
                <Route index element={<Home />} /> {/* Default route */}
                <Route path="/home" element={<Home />} />
                <Route path="/properties/:mode" element={<PropertiesPage />} />
                <Route
                  path="/properties/details/:propertyId"
                  element={<PropertyDetailPage />}
                />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/saved" element={<Saved />} />
                <Route path="/my-listings" element={<MyListingsPage />} />
                <Route path="/user-profile" element={<UserProfilePage />} />
                {/* Add other main pages here */}
              </Route>

              {/* Routes using the BlankLayout (No Navbar/Footer) */}
              <Route element={<BlankLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/change-password" element={<ChangePassword />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/verify-otp" element={<VerifyOtp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/list-property" element={<ListProperty />} />
                {/* Add other full-page routes without main nav/footer here */}
              </Route>

              {/* --- Admin Routes --- */}
              {/* Wrap the admin routes in the protective component */}
              <Route element={<AdminProtectedRoute />}>
                {/* Render the AdminRoutes component for any path starting with /admin */}
                {/* AdminRoutes itself contains the AdminLayout and specific admin page routes */}
                {/* Wrap AdminRoutes with SnackbarProvider */}
                <Route
                  path="/admin/*"
                  element={
                    <SnackbarProvider>
                      <AdminRoutes />
                    </SnackbarProvider>
                  }
                />
              </Route>
              {/* --- End Admin Routes --- */}

              {/* Optional: Catch-all 404 Not Found Route */}
              {/* <Route path="*" element={<NotFoundPage />} /> */}
            </Routes>
          </Router>
        </SnackbarProvider>
        {/* Optional: Add a global Snackbar or Toast component here if needed */}
        {/* <SnackbarComponent /> */}
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
