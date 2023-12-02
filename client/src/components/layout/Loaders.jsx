import { Grid, Skeleton, Stack } from "@mui/material";
import React from "react";
import { BouncingSkeleton } from "../styles/StyledComponents";

const LayoutLoader = () => {
  return (
    <Grid container height={"calc(100vh)"} spacing={"1rem"}>
      <Grid item sm={4} md={4}  height={"100%"}>
        <Skeleton animation="wave" variant="rounded" height={"100vh"} />
      </Grid>
      <Grid item sm={4} md={4} height={"100%"}>
        <Skeleton animation="wave" variant="rounded" height={"100vh"} />
      </Grid>

      <Grid item md={4}  sm={4} >
        <Skeleton animation="wave" variant="rounded" height={"100vh"} />
      </Grid>
    </Grid>
  );
};

const TypingLoader = () => {
  return (
    <Stack
      spacing={"0.5rem"}
      direction={"row"}
      padding={"0.5rem"}
      justifyContent={"center"}
    >
      <BouncingSkeleton
        variant="circular"
        width={15}
        height={15}
        style={{
          animationDelay: "0.1s",
        }}
      />
      <BouncingSkeleton
        variant="circular"
        width={15}
        height={15}
        style={{
          animationDelay: "0.2s",
        }}
      />
      <BouncingSkeleton
        variant="circular"
        width={15}
        height={15}
        style={{
          animationDelay: "0.4s",
        }}
      />
      <BouncingSkeleton
        variant="circular"
        width={15}
        height={15}
        style={{
          animationDelay: "0.6s",
        }}
      />
    </Stack>
  );
};

export { TypingLoader, LayoutLoader };
