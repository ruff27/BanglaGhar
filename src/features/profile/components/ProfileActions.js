import React from "react";
import { Grid, Button, Box, Typography, Divider } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import LockIcon from "@mui/icons-material/Lock";
import DeleteIcon from "@mui/icons-material/Delete";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next"; // Import useTranslation

const ActionButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  borderRadius: theme.shape.borderRadius,
  textTransform: "none",
  fontWeight: 500,
}));

const ProfileActions = ({ onEditName, onChangePassword, onDeleteAccount }) => {
  const { t } = useTranslation(); // Initialize translation

  return (
    <Box sx={{ width: "100%", mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 1.5 }}>
        Manage Account {/* <-- Kept as is, no key found */}
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
            {t("edit_name")} {/* Applied translation */}
          </ActionButton>
        </Grid>
        <Grid item xs={12} sm={6}>
          <ActionButton
            variant="outlined"
            startIcon={<LockIcon />}
            onClick={onChangePassword}
            fullWidth
          >
            {t("change_password")} {/* Applied translation */}
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
            {t("delete_account")} {/* Applied translation */}
          </ActionButton>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfileActions;
