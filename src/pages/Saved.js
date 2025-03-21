import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
} from "@mui/material";
import { useAuth } from "./AuthContext";
import axios from "axios";

const Saved = () => {
  const { isLoggedIn, user } = useAuth();
  const [savedProperties, setSavedProperties] = useState([]);

  useEffect(() => {
    if (isLoggedIn && user) {
      axios
        .get(`http://localhost:5001/api/users/${user}/wishlist`)
        .then((response) => {
          setSavedProperties(response.data.wishlist);
        });
    }
  }, [isLoggedIn, user]);

  if (!isLoggedIn) {
    return (
      <Container>
        <Typography variant="h5" sx={{ mt: 4 }}>
          Please log in to view your saved properties.
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Saved Properties
      </Typography>
      <Grid container spacing={3}>
        {savedProperties.map((property) => (
          <Grid item xs={12} sm={6} md={4} key={property._id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={
                  property.images && property.images[0]
                    ? `/pictures/${property.images[0]}`
                    : "/pictures/placeholder.png"
                }
                alt={property.title}
              />
              <CardContent>
                <Typography variant="h6">{property.title}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {property.location}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  ৳{property.price}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  onClick={() =>
                    (window.location.href = `/properties/${property._id}`)
                  }
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Saved;
