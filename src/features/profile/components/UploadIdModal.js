// src/features/profile/components/UploadIdModal.js
// Polished Upload Modal with compact, professional UX
// citeturn2file0

import React, { useState, useCallback } from "react";
import axios from "axios";
import { styled, alpha } from "@mui/material/styles";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Typography,
  Alert,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DescriptionIcon from "@mui/icons-material/Description";
import { useAuth } from "../../../context/AuthContext";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

const HiddenInput = styled("input")({ display: "none" });

const DropZone = styled(Paper)(({ theme, isDragging }) => ({
  border: `1px dashed ${
    isDragging ? theme.palette.primary.main : theme.palette.divider
  }`,
  backgroundColor: isDragging
    ? alpha(theme.palette.primary.light, 0.05)
    : theme.palette.background.paper,
  padding: theme.spacing(3),
  textAlign: "center",
  cursor: "pointer",
  transition: "background-color 0.2s, border-color 0.2s",
  borderRadius: theme.shape.borderRadius,
  minHeight: 120,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  "&:hover": {
    borderColor: theme.palette.primary.main,
  },
}));

export default function UploadIdModal({ open, onClose }) {
  const { idToken, checkAuthState } = useAuth();
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (f) => {
    if (f.size > 5 * 1024 * 1024) return "Max size: 5MB.";
    if (!["image/jpeg", "image/png", "application/pdf"].includes(f.type))
      return "Only JPG, PNG or PDF.";
    return null;
  };

  const selectFile = (f) => {
    const err = validateFile(f);
    if (err) {
      setError(err);
      return;
    }
    setFile(f);
    setError("");
  };

  const handleFileChange = (e) => {
    e.preventDefault();
    const f = e.target.files?.[0];
    if (f) selectFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) selectFile(f);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);

  const handleUpload = useCallback(async () => {
    if (!file) return setError("Select a file.");
    if (!idToken) return setError("Session expired.");
    setIsLoading(true);
    setError("");
    const form = new FormData();
    form.append("govtId", file);
    try {
      await axios.post(`${API_BASE_URL}/user-profiles/me/upload-id`, form, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (checkAuthState) checkAuthState();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed.");
    } finally {
      setIsLoading(false);
    }
  }, [file, idToken, checkAuthState, onClose]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ fontWeight: 600 }}>Upload Government ID</DialogTitle>
      <DialogContent>
        <DialogContentText
          sx={{
            mb: 2,
            color: "text.primary",
            opacity: 0.75,
            fontSize: 14,
          }}
        >
          Provide a clear JPG, PNG, or PDF (max 5MB) of your government ID.
        </DialogContentText>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          mb={3}
        >
          <HiddenInput
            id="upload-file"
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            onChange={handleFileChange}
          />
          <label htmlFor="upload-file">
            <DropZone isDragging={isDragging} elevation={0}>
              <CloudUploadIcon sx={{ fontSize: 36, color: "primary.main" }} />
              <Typography sx={{ mt: 1, fontSize: 14 }}>
                {file ? file.name : "Drag & drop or click to browse"}
              </Typography>
            </DropZone>
          </label>
        </Box>
        {file && (
          <Chip
            icon={<DescriptionIcon />}
            label={file.name}
            onDelete={() => setFile(null)}
            sx={{ mb: 2 }}
          />
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button
          onClick={onClose}
          disabled={isLoading}
          sx={{ textTransform: "none" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={!file || isLoading}
          startIcon={isLoading ? <CircularProgress size={18} /> : null}
          sx={{ textTransform: "none" }}
        >
          {isLoading ? "Uploading..." : "Upload & Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
