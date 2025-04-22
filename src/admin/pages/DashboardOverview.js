// src/admin/pages/DashboardOverview.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Icon,
  Card,
  CardContent,
  Avatar,
} from "@mui/material";
import {
  HomeWork as HomeWorkIcon, // Property Listings
  PersonOutline as PersonOutlineIcon, // Total Users
  HourglassEmpty as HourglassEmptyIcon, // Pending Users
  NewReleases as NewReleasesIcon, // Recent Listings
  PersonAddAlt1 as PersonAddAlt1Icon, // Recent Users
} from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext"; // Adjust path if needed

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

// Helper component for statistic cards
const StatCard = ({ title, value, icon, color = "primary", loading }) => (
  <Card elevation={3} sx={{ display: "flex", alignItems: "center", p: 2 }}>
    <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56, mr: 2 }}>
      {icon}
    </Avatar>
    <Box>
      <Typography variant="h6" component="div">
        {loading ? <CircularProgress size={24} /> : value ?? "N/A"}
      </Typography>
      <Typography color="text.secondary" variant="body2">
        {title}
      </Typography>
    </Box>
  </Card>
);

const DashboardOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { idToken } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      if (!idToken) {
        setError("Authentication token not available.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        setStats(response.data);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError(
          err.response?.data?.message || "Failed to fetch dashboard stats."
        );
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [idToken]);

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mt: 2, mb: 4 }}>
        Admin Dashboard Overview
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Total Active Listings */}
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Active Listings"
            value={stats?.totalActiveListings}
            icon={<HomeWorkIcon />}
            color="success"
            loading={loading}
          />
        </Grid>

        {/* Pending Approval Users */}
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Users Pending Approval"
            value={stats?.pendingUsersCount}
            icon={<HourglassEmptyIcon />}
            color="warning"
            loading={loading}
          />
        </Grid>

        {/* Total Registered Users */}
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Registered Users"
            value={stats?.totalUsersCount}
            icon={<PersonOutlineIcon />}
            color="info"
            loading={loading}
          />
        </Grid>

        {/* Optional: Recent Listings (Last 7 Days) */}
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="New Listings (Last 7 Days)"
            value={stats?.recentListingsCount}
            icon={<NewReleasesIcon />}
            color="secondary"
            loading={loading}
          />
        </Grid>

        {/* Optional: Recent Users (Last 7 Days) */}
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="New Users (Last 7 Days)"
            value={stats?.recentUsersCount}
            icon={<PersonAddAlt1Icon />}
            color="secondary" // Use another color if desired
            loading={loading}
          />
        </Grid>

        {/* Add more stats cards here if needed */}
      </Grid>

      {/* You could add charts or other widgets below */}
    </Container>
  );
};

export default DashboardOverview;
