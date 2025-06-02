import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  useMediaQuery,
  TextField,
  Button,
  Paper,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Facebook,
  Instagram,
  Twitter,
  LinkedIn,
  LocationOn,
  Phone,
  Email,
  KeyboardArrowUp,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const theme = useTheme();
  const { t } = useTranslation(); // Initialize translation
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#0B1F23",
        color: "#fff",
        mt: 8,
        position: "relative",
        pt: 6,
        pb: 3,
      }}
    >
      {/* Wave-like SVG separator at the top of footer */}
      <Box
        sx={{
          position: "absolute",
          top: -50,
          left: 0,
          width: "100%",
          height: "50px",
          overflow: "hidden",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          style={{ display: "block", width: "100%", height: "100%" }}
        >
          <path
            fill="#0B1F23"
            fillOpacity="1"
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V120H0Z"
          ></path>
        </svg>
      </Box>

      <Box
        sx={{
          position: "absolute",
          top: -25,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1,
        }}
      >
        <IconButton
          onClick={scrollToTop}
          sx={{
            bgcolor: "#2B7B8C",
            color: "white",
            width: "48px",
            height: "48px",
            transition: "all 0.3s ease-in-out",
            "&:hover": {
              bgcolor: "#8FBFBF",
              transform: "translateY(-5px)",
            },
            boxShadow: "0 4px 10px rgba(43, 123, 140, 0.3)",
          }}
          aria-label="back to top"
        >
          <KeyboardArrowUp fontSize="medium" />
        </IconButton>
      </Box>

      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="h5"
                component="div"
                sx={{
                  fontWeight: "bold",
                  background:
                    "linear-gradient(90deg, #2B7B8C 0%, #8FBFBF 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  mb: 1,
                  display: "flex",
                  alignItems: "center",
                  textShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                }}
              >
                BanglaGhor
                <Box
                  component="span"
                  sx={{
                    display: "inline-block",
                    ml: 1,
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #2B7B8C 0%, #8FBFBF 100%)",
                    boxShadow: "0 0 8px rgba(143, 191, 191, 0.6)",
                  }}
                />
              </Typography>
              <Typography variant="body2" sx={{ color: "#BFBBB8" }}>
                Finding your dream home in Bangladesh has never been easier.
                Expert property solutions since 2020.{" "}
              </Typography>
            </Box>
            <Box sx={{ mt: 3 }}>
              <Typography
                variant="body2"
                sx={{ mb: 1, color: "#EFF9FE", fontWeight: "medium" }}
              >
                {t("connect_with_us")}
              </Typography>
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <IconButton
                  /* Facebook */ component="a"
                  href="https://facebook.com/banglaghor"
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  sx={{
                    color: "#EFF9FE",
                    p: 0.8,
                    bgcolor: "rgba(255, 255, 255, 0.05)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      color: "#2B7B8C",
                      bgcolor: "rgba(255, 255, 255, 0.15)",
                      transform: "translateY(-3px)",
                      boxShadow: "0 5px 10px rgba(0, 0, 0, 0.2)",
                    },
                  }}
                  aria-label="Facebook"
                >
                  {" "}
                  <Facebook fontSize="small" />{" "}
                </IconButton>
                <IconButton
                  /* Instagram */ component="a"
                  href="https://instagram.com/banglaghor"
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  sx={{
                    color: "#EFF9FE",
                    p: 0.8,
                    bgcolor: "rgba(255, 255, 255, 0.05)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      color: "#2B7B8C",
                      bgcolor: "rgba(255, 255, 255, 0.15)",
                      transform: "translateY(-3px)",
                      boxShadow: "0 5px 10px rgba(0, 0, 0, 0.2)",
                    },
                  }}
                  aria-label="Instagram"
                >
                  {" "}
                  <Instagram fontSize="small" />{" "}
                </IconButton>
                <IconButton
                  /* Twitter */ component="a"
                  href="https://twitter.com/banglaghor"
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  sx={{
                    color: "#EFF9FE",
                    p: 0.8,
                    bgcolor: "rgba(255, 255, 255, 0.05)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      color: "#2B7B8C",
                      bgcolor: "rgba(255, 255, 255, 0.15)",
                      transform: "translateY(-3px)",
                      boxShadow: "0 5px 10px rgba(0, 0, 0, 0.2)",
                    },
                  }}
                  aria-label="Twitter"
                >
                  {" "}
                  <Twitter fontSize="small" />{" "}
                </IconButton>
                <IconButton
                  /* LinkedIn */ component="a"
                  href="https://linkedin.com/company/banglaghor"
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  sx={{
                    color: "#EFF9FE",
                    p: 0.8,
                    bgcolor: "rgba(255, 255, 255, 0.05)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      color: "#2B7B8C",
                      bgcolor: "rgba(255, 255, 255, 0.15)",
                      transform: "translateY(-3px)",
                      boxShadow: "0 5px 10px rgba(0, 0, 0, 0.2)",
                    },
                  }}
                  aria-label="LinkedIn"
                >
                  {" "}
                  <LinkedIn fontSize="small" />{" "}
                </IconButton>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: "bold",
                position: "relative",
                "&:after": {
                  content: '""',
                  position: "absolute",
                  bottom: -8,
                  left: 0,
                  width: "40px",
                  height: "3px",
                  background:
                    "linear-gradient(90deg, #2B7B8C 0%, #8FBFBF 100%)",
                  borderRadius: "3px",
                },
              }}
            >
              Quick Links
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Link
                component={RouterLink}
                to="/"
                sx={{
                  color: "#BFBBB8",
                  textDecoration: "none",
                  mb: 1,
                  "&:hover": {
                    color: "#8FBFBF",
                    transform: "translateX(5px)",
                    transition: "all 0.3s ease-in-out",
                  },
                  transition: "all 0.3s ease-in-out",
                }}
              >
                {t("nav_home")}
              </Link>
              <Link
                component={RouterLink}
                to="/properties/buy"
                sx={{
                  color: "#BFBBB8",
                  textDecoration: "none",
                  mb: 1,
                  "&:hover": {
                    color: "#8FBFBF",
                    transform: "translateX(5px)",
                    transition: "transform 0.3s ease-in-out",
                  },
                }}
              >
                {t("nav_buy")}
              </Link>
              <Link
                component={RouterLink}
                to="/properties/rent"
                sx={{
                  color: "#BFBBB8",
                  textDecoration: "none",
                  mb: 1,
                  "&:hover": {
                    color: "#8FBFBF",
                    transform: "translateX(5px)",
                    transition: "transform 0.3s ease-in-out",
                  },
                }}
              >
                {t("nav_rent")}
              </Link>
              <Link
                component={RouterLink}
                to="/properties/sold"
                sx={{
                  color: "#BFBBB8",
                  textDecoration: "none",
                  mb: 1,
                  "&:hover": {
                    color: "#8FBFBF",
                    transform: "translateX(5px)",
                    transition: "transform 0.3s ease-in-out",
                  },
                }}
              >
                {t("nav_sold")}
              </Link>
              <Link
                component={RouterLink}
                to="/about"
                sx={{
                  color: "#BFBBB8",
                  textDecoration: "none",
                  "&:hover": {
                    color: "#8FBFBF",
                    transform: "translateX(5px)",
                    transition: "transform 0.3s ease-in-out",
                  },
                }}
              >
                {t("nav_about")}
              </Link>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: "bold",
                position: "relative",
                "&:after": {
                  content: '""',
                  position: "absolute",
                  bottom: -8,
                  left: 0,
                  width: "40px",
                  height: "3px",
                  bgcolor: "#2B7B8C",
                },
              }}
            >
              {t("contact_us")}
            </Typography>
            <Box>
              <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
                <LocationOn
                  sx={{ color: "#2B7B8C", mr: 1, fontSize: 20, mt: 0.3 }}
                />
                <Box>
                  <Typography variant="body2" sx={{ color: "#BFBBB8" }}>
                    {" "}
                    House #42, Road #11, Banani{" "}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#BFBBB8" }}>
                    {" "}
                    Dhaka 1213, Bangladesh{" "}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
                <Phone
                  sx={{ color: "#2B7B8C", mr: 1, fontSize: 20, mt: 0.3 }}
                />
                <Box>
                  <Typography variant="body2" sx={{ color: "#BFBBB8" }}>
                    {" "}
                    +880 1234-567890{" "}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#BFBBB8" }}>
                    {" "}
                    +880 1987-654321{" "}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                <Email
                  sx={{ color: "#2B7B8C", mr: 1, fontSize: 20, mt: 0.3 }}
                />
                <Box>
                  <Typography variant="body2" sx={{ color: "#BFBBB8" }}>
                    {" "}
                    info@banglaghor.com{" "}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#BFBBB8" }}>
                    {" "}
                    sales@banglaghor.com{" "}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: "bold",
                position: "relative",
                "&:after": {
                  content: '""',
                  position: "absolute",
                  bottom: -8,
                  left: 0,
                  width: "40px",
                  height: "3px",
                  bgcolor: "#2B7B8C",
                },
              }}
            >
              Newsletter
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: "#BFBBB8" }}>
              Subscribe to get the latest property listings and market updates.{" "}
            </Typography>
            <Box
              component="form"
              sx={{
                display: "flex",
                flexDirection: "column",
              }}
              noValidate
            >
              <TextField
                placeholder={t("email")}
                variant="outlined"
                size="small"
                sx={{
                  mb: 1,
                  ".MuiOutlinedInput-root": {
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                    color: "#EFF9FE",
                    borderRadius: "4px",
                    "& fieldset": { borderColor: "rgba(255, 255, 255, 0.2)" },
                    "&:hover fieldset": { borderColor: "#2B7B8C" },
                    "&.Mui-focused fieldset": { borderColor: "#2B7B8C" },
                  },
                  "& input::placeholder": { color: "#BFBBB8", opacity: 1 },
                }}
              />
              <Button
                variant="contained"
                sx={{
                  bgcolor: "#2B7B8C",
                  "&:hover": { bgcolor: "#8FBFBF" },
                  color: "#EFF9FE",
                }}
              >
                Subscribe
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Divider
          sx={{
            my: 4,
            height: "1px",
            background:
              "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)",
          }}
        />

        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "center" : "flex-start",
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: "#BFBBB8", mb: isMobile ? 1 : 0 }}
          >
            © {new Date().getFullYear()} BanglaGhor. All rights reserved.{" "}
          </Typography>
          <Box>
            <Link
              href="#"
              sx={{
                color: "#BFBBB8",
                mx: 1,
                textDecoration: "none",
                "&:hover": { color: "#8FBFBF" },
              }}
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              sx={{
                color: "#BFBBB8",
                mx: 1,
                textDecoration: "none",
                "&:hover": { color: "#8FBFBF" },
              }}
            >
              Terms of Service
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
