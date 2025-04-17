import React from "react";
import { Box } from "@mui/material";
import HeroSection from "./components/HeroSection";
import HomeSearchBar from "./components/HomeSearchBar";
import FeaturedProperties from "./components/FeaturedProperties";
import HomeMapPreview from "./components/HomeMapPreview";
import CallToAction from "./components/CallToAction";

/**
 * HomePage Component
 *
 * Acts as the main container for the home page, arranging different sections.
 * It imports and renders specialized section components.
 */
const HomePage = () => {
  return (
    <Box>
      {/* Render the Hero section */}
      <HeroSection />

      {/* Render the Search Bar section */}
      {/* Note: SearchBar now includes the map dialog logic triggered by the location field */}
      <HomeSearchBar />

      {/* Render the Featured Properties section */}
      {/* Note: FeaturedProperties now handles its own data fetching */}
      <FeaturedProperties />

      {/* Render the Map Preview section */}
      {/* Note: This section might need updates after BangladeshMap itself is refactored */}
      <HomeMapPreview />

      {/* Render the Call To Action section */}
      <CallToAction />
    </Box>
  );
};

export default HomePage;
