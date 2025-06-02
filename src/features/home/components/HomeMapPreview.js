import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios"; 
import MapComponent from "../../map/components/MapComponent";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

/**
 * HomeMapPreview Component
 *
 * Displays a preview of the map on the home page, now with fetched properties.
 */
const HomeMapPreview = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPreviewProperties = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch a small number of properties for the preview
        // For example, fetch 10 available featured properties or just recent ones
        const response = await axios.get(`${API_BASE_URL}/properties`, {
          params: {
            limit: 10, 
            featured: true, 
          },
        });

        const mappableProperties = (response.data || [])
          .map((prop) => {
            const property = prop.toObject ? prop.toObject() : prop;
            if (!property.position && property.latitude && property.longitude) {
              property.position = {
                lat: property.latitude,
                lng: property.longitude,
              };
            }
            return property;
          })
          .filter((p) => p.position && p.position.lat && p.position.lng);

        setProperties(mappableProperties);
      } catch (err) {
        console.error("Error fetching preview properties:", err);
        setError(
          t(
            "map_preview_load_error",
            "Could not load properties for map preview."
          )
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPreviewProperties();
  }, [t]); 

  return (
    <Box sx={{ py: 6, backgroundColor: "#f8f9fa" }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          component="h2"
          fontWeight={600}
          gutterBottom
          align="center"
        >
          {t("explore_on_map_title", "Explore Properties on Map")}
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          align="center"
          sx={{ mb: 4 }}
        >
          {t(
            "explore_on_map_subtitle",
            "Find properties visually in your desired locations across Bangladesh."
          )}
        </Typography>
        <Paper
          elevation={3}
          sx={{
            height: { xs: "300px", sm: "400px", md: "500px" },
            width: "100%",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
            mb: 3,
            position: "relative", 
          }}
        >
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>
                {t("loading_map_preview", "Loading Map...")}
              </Typography>
            </Box>
          ) : error ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                p: 2,
              }}
            >
              <Alert severity="error" sx={{ width: "100%" }}>
                {error}
              </Alert>
            </Box>
          ) : (
            <MapComponent
              properties={properties}
              mapCenter={[23.8103, 90.4125]} // Default center for Bangladesh
              mapZoom={7} // Default zoom for a country overview
            />
          )}
        </Paper>
        <Box sx={{ textAlign: "center" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/map")}
            sx={{ borderRadius: "8px", textTransform: "none", px: 3, py: 1 }}
          >
            {t("open_full_map", "Open Full Map")}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default HomeMapPreview;
