import React from "react";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import Header from "../components/layout/Header";
import ProfileForm from "../components/specific/ProfileForm";

import profile1 from "../assets/profile1.svg";
import profile2 from "../assets/profile2.svg";
export default function Profile() {
  const theme = useTheme();

  return (
    <Box sx={{ flexGrow: 1 }}>
            <Header/>

      <Grid container component="main" sx={{ minHeight: "calc(100vh - 64px)" }}>

        <Grid
          item
          xs={false}
          sm={6}
          md={6}
          sx={{
            backgroundImage: `url(${
              theme.palette.mode === "light" ? profile1 : profile2
            })`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "90% 90%", 
          }}
        />
        <Grid item xs={12} sm={6} md={6} component={Paper} elevation={6} square>
          <ProfileForm />
        </Grid>
      </Grid>
    </Box>
  );
}
