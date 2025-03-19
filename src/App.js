import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Rent from "./pages/Rent";
import Buy from "./pages/Buy";
import Sold from "./pages/Sold";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import Login from "./pages/Login"; // Import the Login component
import ListProperty from "./pages/ListProperty"; // Import the ListProperty component
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider } from "./pages/AuthContext"; // Import AuthProvider
import Signup from "./pages/signup";
// Create a custom theme with your color palette
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
        {" "}
        {/* Wrap with AuthProvider */}
        <Router>
          <div className="App">
            <Navbar />
            <main className="content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/properties/rent" element={<Rent />} />
                <Route path="/properties/buy" element={<Buy />} />
                <Route path="/properties/sold" element={<Sold />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />{" "}
                {/* Added Login route */}
                <Route path="/signup" element={<Signup />} /> {/* <-- NEW */}
                <Route path="/list-property" element={<ListProperty />} />{" "}
                {/* Added ListProperty route */}
                {/* Add routes for other pages as they are created */}
                {/*
                  <Route path="/properties" element={<Properties />} />
                */}
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
