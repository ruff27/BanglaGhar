import React from "react";
import { Grid, Button, Box, Typography, Divider } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import LockIcon from "@mui/icons-material/Lock";
import DeleteIcon from "@mui/icons-material/Delete";
import { styled } from "@mui/material/styles";

const ActionButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1, 2), // Adjusted padding
  borderRadius: theme.shape.borderRadius,
  textTransform: "none",
  fontWeight: 500, // Normal weight
}));

const ProfileActions = ({ onEditName, onChangePassword, onDeleteAccount }) => {
  return (
    <Box sx={{ width: "100%", mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 1.5 }}>
        Manage Account
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <ActionButton
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={onEditName}
            fullWidth
          >
            Edit Name
          </ActionButton>
        </Grid>
        <Grid item xs={12} sm={6}>
          <ActionButton
            variant="outlined"
            startIcon={<LockIcon />}
            onClick={onChangePassword}
            fullWidth
          >
            Change Password
          </ActionButton>
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <ActionButton
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={onDeleteAccount}
            fullWidth
          >
            Delete Account
          </ActionButton>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfileActions;
