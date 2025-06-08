import React from "react";
import axios from "axios";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
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
import MapPage from "./features/map/MapPage";
import Saved from "./pages/Saved";
import UserProfilePage from "./features/profile/UserProfilePage";
import AdminRoutes from "./admin/AdminRoutes";
import AdminProtectedRoute from "./components/common/AdminProtectedRoute";
import ChatPage from "./features/chat/ChatPage";
import EditPropertyPage from "./pages/EditPropertyPage";
import { theme } from "./styles/theme";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider } from "./context/AuthContext";
import { SnackbarProvider } from "./context/SnackbarContext";
import { ChatProvider } from "./features/chat/context/ChatContext";

// Global Axios Configuration
axios.defaults.baseURL = process.env.REACT_APP_API_URL || '/api';

axios.interceptors.request.use(
  (config) => {
    const idToken = localStorage.getItem('idToken');
    if (idToken) {
      config.headers['Authorization'] = `Bearer ${idToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const MainLayout = () => (
  <div
    className="App"
    style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
  >
    <Navbar />
    <main
      className="content"
      style={{
        flexGrow: 1,
        paddingTop: "64px",
      }}
    >
      <Outlet />
    </main>
    <Footer />
  </div>
);

const MapLayout = () => (
  <div
    className="App"
    style={{ display: "flex", flexDirection: "column", height: "100vh" }}
  >
    <Navbar />
    <main
      className="content"
      style={{
        flexGrow: 1,
        paddingTop: "64px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Outlet />
    </main>
  </div>
);

const BlankLayout = () => (
  <div className="App">
    <main className="content">
      <Outlet />
    </main>
  </div>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <SnackbarProvider>
          <ChatProvider>
            <Router>
              <Routes>
                <Route element={<MainLayout />}>
                  <Route index element={<Home />} />
                  <Route path="/home" element={<Home />} />
                  <Route
                    path="/properties/:mode"
                    element={<PropertiesPage />}
                  />
                  <Route
                    path="/properties/details/:propertyId"
                    element={<PropertyDetailPage />}
                  />
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/saved" element={<Saved />} />
                  <Route path="/my-listings" element={<MyListingsPage />} />
                  <Route
                    path="/edit-property/:propertyId"
                    element={<EditPropertyPage />}
                  />
                  <Route path="/user-profile" element={<UserProfilePage />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/chat/:conversationId" element={<ChatPage />} />
                </Route>

                <Route element={<MapLayout />}>
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/map/:propertyCode" element={<MapPage />} />
                </Route>

                <Route element={<BlankLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/verify-otp" element={<VerifyOtp />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/list-property" element={<ListProperty />} />
                </Route>

                <Route element={<AdminProtectedRoute />}>
                  <Route
                    path="/admin/*"
                    element={
                      <SnackbarProvider>
                        <AdminRoutes />
                      </SnackbarProvider>
                    }
                  />
                </Route>
              </Routes>
            </Router>
          </ChatProvider>
        </SnackbarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
