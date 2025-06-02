import React from "react";
import { Box } from "@mui/material";
import HeroSection from "./components/HeroSection";
import HomeSearchBar from "./components/HomeSearchBar";
import FeaturedProperties from "./components/FeaturedProperties";
import HomeMapPreview from "./components/HomeMapPreview";
import CallToAction from "./components/CallToAction";
import AblyConnectionStatus from "../chat/components/AblyConnectionStatus";

const HomePage = () => {
  return (
    <Box>
      <HeroSection />
      <HomeSearchBar />
      <FeaturedProperties />
      <HomeMapPreview />
      <CallToAction />
    </Box>
  );
};

export default HomePage;
