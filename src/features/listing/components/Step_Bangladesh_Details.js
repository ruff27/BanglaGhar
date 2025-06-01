import React from "react";
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Typography,
  Box,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
} from "@mui/material";
import { useTranslation } from "react-i18next";

const Step_Bangladesh_Details = ({ formData, errors, handleChange }) => {
  const { t } = useTranslation();
  const bdDetails = formData.bangladeshDetails || {}; 
  const bdErrors = errors || {}; 

  return (
    <Box>
      <Grid container spacing={3}>
        {/* --- Property Condition --- */}
        {/* Marked 'required' on frontend. Ensure 'required: true' in Mongoose schema and '.notEmpty()' in backend validation. */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required error={!!bdErrors.propertyCondition}>
            <InputLabel id="propertyCondition-label">
              {t("property_condition", "Property Condition")}
            </InputLabel>
            <Select
              labelId="propertyCondition-label"
              id="propertyCondition"
              name="bangladeshDetails.propertyCondition"
              value={bdDetails.propertyCondition || ""} // Good: '|| ""' for required Selects
              label={t("property_condition", "Property Condition")}
              onChange={handleChange}
            >
              <MenuItem value="new">
                {t("condition_new", "Newly Built")}
              </MenuItem>
              <MenuItem value="under_construction">
                {t("condition_uc", "Under Construction")}
              </MenuItem>
              <MenuItem value="resale">
                {t("condition_resale", "Resale")}
              </MenuItem>
            </Select>
            {bdErrors.propertyCondition && (
              <FormHelperText>{bdErrors.propertyCondition}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* --- Utilities --- */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            {t("utilities", "Utilities")}
          </Typography>
        </Grid>

        {/* Marked 'required' on frontend. Ensure 'required: true' in Mongoose schema and '.notEmpty()' in backend validation. */}
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth required error={!!bdErrors.waterSource}>
            <InputLabel id="waterSource-label">
              {t("water_source", "Water Source")}
            </InputLabel>
            <Select
              labelId="waterSource-label"
              name="bangladeshDetails.waterSource"
              value={bdDetails.waterSource || ""} // Good: '|| ""'
              label={t("water_source", "Water Source")}
              onChange={handleChange}
            >
              <MenuItem value="wasa">{t("water_wasa", "WASA")}</MenuItem>
              <MenuItem value="deep_tube_well">
                {t("water_dtw", "Deep Tube Well")}
              </MenuItem>
              <MenuItem value="both">{t("water_both", "Both")}</MenuItem>
              <MenuItem value="other">{t("water_other", "Other")}</MenuItem>
            </Select>
            {bdErrors.waterSource && (
              <FormHelperText>{bdErrors.waterSource}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* Marked 'required' on frontend. Ensure 'required: true' in Mongoose schema and '.notEmpty()' in backend validation. */}
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth required error={!!bdErrors.gasSource}>
            <InputLabel id="gasSource-label">
              {t("gas_source", "Gas Source")}
            </InputLabel>
            <Select
              labelId="gasSource-label"
              name="bangladeshDetails.gasSource"
              value={bdDetails.gasSource || ""} // Good: '|| ""'
              label={t("gas_source", "Gas Source")}
              onChange={handleChange}
            >
              <MenuItem value="piped">
                {t("gas_piped", "Piped (Titas/Other)")}
              </MenuItem>
              <MenuItem value="cylinder">
                {t("gas_cylinder", "Cylinder")}
              </MenuItem>
              <MenuItem value="none">{t("gas_none", "None")}</MenuItem>
            </Select>
            {bdErrors.gasSource && (
              <FormHelperText>{bdErrors.gasSource}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* Conditionally show "Gas Line Installed?" only if source is 'piped' */}
        {/* This is optional. Frontend defaults to "no". Backend validation .optional().isIn(["yes", "no", "na"]) is fine. */}
        {bdDetails.gasSource === "piped" && (
          <Grid item xs={12} sm={6} md={4}>
            <FormControl component="fieldset">
              <FormLabel component="legend">
                {t("gas_line_installed", "Gas Line Installed?")}
              </FormLabel>
              <RadioGroup
                row
                aria-label="gas-line-installed"
                name="bangladeshDetails.gasLineInstalled"
                value={bdDetails.gasLineInstalled || "no"} // Default to "no"
                onChange={handleChange}
              >
                <FormControlLabel
                  value="yes"
                  control={<Radio size="small" />}
                  label={t("yes", "Yes")}
                />
                <FormControlLabel
                  value="no"
                  control={<Radio size="small" />}
                  label={t("no", "No")}
                />
                {/* Schema also allows "na", consider if UI needs it or if "no" covers it */}
              </RadioGroup>
            </FormControl>
          </Grid>
        )}

        {/* Optional field. Frontend defaults to "none". Backend validation .optional().isIn([...]) should include "none". */}
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth error={!!bdErrors.backupPower}>
            <InputLabel id="backupPower-label">
              {t("backup_power", "Backup Power")}
            </InputLabel>
            <Select
              labelId="backupPower-label"
              name="bangladeshDetails.backupPower"
              value={bdDetails.backupPower || "none"} // Good: Fallback to "none"
              label={t("backup_power", "Backup Power")}
              onChange={handleChange}
            >
              <MenuItem value="none">{t("power_none", "None")}</MenuItem>
              <MenuItem value="ips">{t("power_ips", "IPS")}</MenuItem>
              <MenuItem value="generator">
                {t("power_generator", "Generator")}
              </MenuItem>
              <MenuItem value="solar">{t("power_solar", "Solar")}</MenuItem>
            </Select>
            {bdErrors.backupPower && (
              <FormHelperText>{bdErrors.backupPower}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* Optional field. Frontend defaults to "none". Backend validation .optional().isIn([...]) should include "none". */}
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth error={!!bdErrors.sewerSystem}>
            <InputLabel id="sewerSystem-label">
              {t("sewer_system", "Sewer System")}
            </InputLabel>
            <Select
              labelId="sewerSystem-label"
              name="bangladeshDetails.sewerSystem"
              value={bdDetails.sewerSystem || "none"} // Good: Fallback to "none"
              label={t("sewer_system", "Sewer System")}
              onChange={handleChange}
            >
              <MenuItem value="none">
                {t("sewer_none", "None / Unspecified")}
              </MenuItem>
              <MenuItem value="covered">
                {t("sewer_covered", "Covered Drain")}
              </MenuItem>
              <MenuItem value="open">{t("sewer_open", "Open Drain")}</MenuItem>
              <MenuItem value="septic_tank">
                {t("sewer_septic", "Septic Tank")}
              </MenuItem>
            </Select>
            {bdErrors.sewerSystem && (
              <FormHelperText>{bdErrors.sewerSystem}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* --- Location & Accessibility --- */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            {t("location_accessibility", "Location & Accessibility")}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            id="proximityToMainRoad"
            name="bangladeshDetails.proximityToMainRoad"
            label={t("proximity_main_road", "Proximity to Main Road")}
            fullWidth
            variant="outlined"
            value={bdDetails.proximityToMainRoad || ""}
            onChange={handleChange}
            helperText={t(
              "proximity_helper",
              "e.g., On main road, 100m, 5 mins walk"
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            id="publicTransport"
            name="bangladeshDetails.publicTransport"
            label={t("public_transport", "Public Transport Access")}
            fullWidth
            variant="outlined"
            value={bdDetails.publicTransport || ""}
            onChange={handleChange}
            helperText={t(
              "transport_helper",
              "e.g., Bus stop nearby, Rickshaws available, Metro 1km"
            )}
          />
        </Grid>
        {/* Optional field. Frontend defaults to "no". Backend validation .optional().isIn([...]) should include "no". */}
        <Grid item xs={12} sm={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend">
              {t("flood_prone_area", "Area Prone to Flooding/Waterlogging?")}
            </FormLabel>
            <RadioGroup
              row
              aria-label="flood-prone"
              name="bangladeshDetails.floodProne"
              value={bdDetails.floodProne || "no"} // Good: Default to "no"
              onChange={handleChange}
            >
              <FormControlLabel
                value="yes"
                control={<Radio size="small" />}
                label={t("yes", "Yes")}
              />
              <FormControlLabel
                value="no"
                control={<Radio size="small" />}
                label={t("no", "No")}
              />
              <FormControlLabel
                value="sometimes"
                control={<Radio size="small" />}
                label={t("sometimes", "Sometimes")}
              />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            id="roadWidth"
            name="bangladeshDetails.roadWidth"
            label={t("road_width", "Front Road Width (approx)")}
            fullWidth
            variant="outlined"
            value={bdDetails.roadWidth || ""}
            onChange={handleChange}
            helperText={t("road_width_helper", "e.g., 10ft, 20ft, 30ft+")}
          />
        </Grid>

        {/* --- Nearby Amenities (All optional TextFields) --- */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            {t("nearby_amenities", "Nearby Amenities")}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            name="bangladeshDetails.nearbySchools"
            label={t("nearby_schools", "Nearby Schools/Colleges")}
            fullWidth
            variant="outlined"
            value={bdDetails.nearbySchools || ""}
            onChange={handleChange}
            multiline
            minRows={2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            name="bangladeshDetails.nearbyHospitals"
            label={t("nearby_hospitals", "Nearby Hospitals/Clinics")}
            fullWidth
            variant="outlined"
            value={bdDetails.nearbyHospitals || ""}
            onChange={handleChange}
            multiline
            minRows={2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            name="bangladeshDetails.nearbyMarkets"
            label={t("nearby_markets", "Nearby Markets/Shops")}
            fullWidth
            variant="outlined"
            value={bdDetails.nearbyMarkets || ""}
            onChange={handleChange}
            multiline
            minRows={2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            name="bangladeshDetails.nearbyReligiousPlaces"
            label={t("nearby_religious", "Nearby Mosques/Temples etc.")}
            fullWidth
            variant="outlined"
            value={bdDetails.nearbyReligiousPlaces || ""}
            onChange={handleChange}
            multiline
            minRows={2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            name="bangladeshDetails.nearbyOthers"
            label={t("nearby_others", "Other Nearby (Parks, Restaurants)")}
            fullWidth
            variant="outlined"
            value={bdDetails.nearbyOthers || ""}
            onChange={handleChange}
            multiline
            minRows={2}
          />
        </Grid>

        {/* --- Safety & Infrastructure --- */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            {t("safety_infrastructure", "Safety & Infrastructure")}
          </Typography>
        </Grid>
        {/* Optional field (array of checkboxes). Ensure handleChange correctly builds an array. */}
        <Grid item xs={12} sm={6}>
          <FormControl component="fieldset" variant="standard">
            <FormLabel component="legend">
              {t("security_features", "Security Features")}
            </FormLabel>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={
                      bdDetails.securityFeatures?.includes("gated") || false
                    }
                    onChange={handleChange}
                    name="bangladeshDetails.securityFeatures"
                    value="gated"
                  />
                }
                label={t("security_gated", "Gated Community")}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={
                      bdDetails.securityFeatures?.includes("guards") || false
                    }
                    onChange={handleChange}
                    name="bangladeshDetails.securityFeatures"
                    value="guards"
                  />
                }
                label={t("security_guards", "Security Guards")}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={
                      bdDetails.securityFeatures?.includes("cctv") || false
                    }
                    onChange={handleChange}
                    name="bangladeshDetails.securityFeatures"
                    value="cctv"
                  />
                }
                label={t("security_cctv", "CCTV")}
              />
            </FormGroup>
          </FormControl>
        </Grid>
        {/* Optional field. Frontend defaults to "unknown". Backend .optional().isIn([...]) should include "unknown". */}
        <Grid item xs={12} sm={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend">
              {t(
                "earthquake_resistant",
                "Earthquake Resistant Structure (RCC)?"
              )}
            </FormLabel>
            <RadioGroup
              row
              name="bangladeshDetails.earthquakeResistance"
              value={bdDetails.earthquakeResistance || "unknown"} // Good: Default to "unknown"
              onChange={handleChange}
            >
              <FormControlLabel
                value="yes"
                control={<Radio size="small" />}
                label={t("yes", "Yes")}
              />
              <FormControlLabel
                value="no"
                control={<Radio size="small" />}
                label={t("no", "No")}
              />
              <FormControlLabel
                value="unknown"
                control={<Radio size="small" />}
                label={t("unknown", "Unknown")}
              />
            </RadioGroup>
          </FormControl>
        </Grid>

        {/* Optional field. Frontend defaults to "none". Backend .optional().isIn([...]) should include "none". */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!bdErrors.parkingType}>
            <InputLabel id="parkingType-label">
              {t("parking_type", "Parking Type")}
            </InputLabel>
            <Select
              labelId="parkingType-label"
              name="bangladeshDetails.parkingType"
              value={bdDetails.parkingType || "none"} // Good: Fallback to "none"
              label={t("parking_type", "Parking Type")}
              onChange={handleChange}
            >
              <MenuItem value="none">
                {t("parking_none", "None Available")}
              </MenuItem>
              <MenuItem value="dedicated">
                {t("parking_dedicated", "Dedicated Spot")}
              </MenuItem>
              <MenuItem value="street">
                {t("parking_street", "Street Parking")}
              </MenuItem>
              <MenuItem value="garage">
                {t("parking_garage", "Garage")}
              </MenuItem>
            </Select>
            {bdErrors.parkingType && (
              <FormHelperText>{bdErrors.parkingType}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* --- Property Specific (if applicable) --- */}
        {formData.propertyType !== "land" && (
          <>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                {t("property_specifics", "Property Specifics")}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                name="bangladeshDetails.floorNumber"
                label={t("floor_number", "Floor Number")}
                type="number"
                fullWidth
                variant="outlined"
                value={bdDetails.floorNumber || ""}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                name="bangladeshDetails.totalFloors"
                label={t("total_floors", "Total Floors")}
                type="number"
                fullWidth
                variant="outlined"
                value={bdDetails.totalFloors || ""}
                onChange={handleChange}
              />
            </Grid>
            {/* Optional field. Frontend defaults to "no". Backend .optional().isIn([...]) should include "no". */}
            <Grid item xs={6} sm={3}>
              <FormControl component="fieldset">
                <FormLabel component="legend">
                  {t("balcony_available", "Balcony?")}
                </FormLabel>
                <RadioGroup
                  row
                  name="bangladeshDetails.balcony"
                  value={bdDetails.balcony || "no"} // Good: Default to "no"
                  onChange={handleChange}
                >
                  <FormControlLabel
                    value="yes"
                    control={<Radio size="small" />}
                    label={t("yes", "Yes")}
                  />
                  <FormControlLabel
                    value="no"
                    control={<Radio size="small" />}
                    label={t("no", "No")}
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            {/* Optional field. Frontend defaults to "no". Backend .optional().isIn([...]) should include "no". */}
            <Grid item xs={6} sm={3}>
              <FormControl component="fieldset">
                <FormLabel component="legend">
                  {t("rooftop_access", "Rooftop Access?")}
                </FormLabel>
                <RadioGroup
                  row
                  name="bangladeshDetails.rooftopAccess"
                  value={bdDetails.rooftopAccess || "no"} // Good: Default to "no"
                  onChange={handleChange}
                >
                  <FormControlLabel
                    value="yes"
                    control={<Radio size="small" />}
                    label={t("yes", "Yes")}
                  />
                  <FormControlLabel
                    value="no"
                    control={<Radio size="small" />}
                    label={t("no", "No")}
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="bangladeshDetails.naturalLight"
                label={t(
                  "natural_light_ventilation",
                  "Natural Light/Ventilation"
                )}
                fullWidth
                variant="outlined"
                value={bdDetails.naturalLight || ""}
                onChange={handleChange}
                helperText={t(
                  "light_helper",
                  "e.g., Good, Average, Corner Unit"
                )}
              />
            </Grid>
          </>
        )}

        {/* --- Legal & Financial --- */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            {t("legal_financial", "Legal & Financial")}
          </Typography>
        </Grid>
        {/* Optional field. Frontend defaults to "unknown". Backend .optional().isIn([...]) should include "unknown". */}
        <Grid item xs={12} sm={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend">
              {t("ownership_papers_clear", "Ownership Papers Clear?")}
            </FormLabel>
            <RadioGroup
              row
              name="bangladeshDetails.ownershipPapers"
              value={bdDetails.ownershipPapers || "unknown"} // Good: Default to "unknown"
              onChange={handleChange}
            >
              <FormControlLabel
                value="clear"
                control={<Radio size="small" />}
                label={t("papers_clear", "Clear (Mutation, Deed etc.)")}
              />
              <FormControlLabel
                value="pending"
                control={<Radio size="small" />}
                label={t("papers_pending", "Pending")}
              />
              <FormControlLabel
                value="issue"
                control={<Radio size="small" />}
                label={t("papers_issue", "Issue/Dispute")}
              />
              <FormControlLabel
                value="unknown"
                control={<Radio size="small" />}
                label={t("unknown", "Unknown")}
              />
            </RadioGroup>
          </FormControl>
        </Grid>
        {/* Optional field. Frontend defaults to "unknown". Backend .optional().isIn([...]) MUST include "unknown". */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!bdErrors.propertyTenure}>
            <InputLabel id="propertyTenure-label">
              {t("property_tenure", "Property Tenure")}
            </InputLabel>
            <Select
              labelId="propertyTenure-label"
              name="bangladeshDetails.propertyTenure"
              value={bdDetails.propertyTenure || "unknown"} // Good: Default to "unknown" as per schema
              label={t("property_tenure", "Property Tenure")}
              onChange={handleChange}
            >
              <MenuItem value="unknown">
                {t("tenure_unknown", "Unknown / Not Specified")}
              </MenuItem>
              <MenuItem value="freehold">
                {t("tenure_freehold", "Freehold")}
              </MenuItem>
              <MenuItem value="leasehold">
                {t("tenure_leasehold", "Leasehold")}
              </MenuItem>
            </Select>
            {bdErrors.propertyTenure && (
              <FormHelperText>{bdErrors.propertyTenure}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* --- Other Details (All optional TextFields) --- */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            {t("other_details", "Other Details")}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="bangladeshDetails.recentRenovations"
            label={t("recent_renovations", "Recent Renovations (Optional)")}
            fullWidth
            variant="outlined"
            value={bdDetails.recentRenovations || ""}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="bangladeshDetails.nearbyDevelopments"
            label={t(
              "nearby_developments",
              "Nearby Upcoming Developments (Optional)"
            )}
            fullWidth
            variant="outlined"
            value={bdDetails.nearbyDevelopments || ""}
            onChange={handleChange}
          />
        </Grid>
        {formData.listingType === "buy" && (
          <Grid item xs={12}>
            <TextField
              name="bangladeshDetails.reasonForSelling"
              label={t("reason_for_selling", "Reason for Selling (Optional)")}
              fullWidth
              variant="outlined"
              value={bdDetails.reasonForSelling || ""}
              onChange={handleChange}
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Step_Bangladesh_Details;
