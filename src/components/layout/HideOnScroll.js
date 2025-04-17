// src/components/layout/HideOnScroll.js
import React from "react";
import { Slide, useScrollTrigger } from "@mui/material";

export default function HideOnScroll({ children }) {
  const trigger = useScrollTrigger({ threshold: 100 });
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}
