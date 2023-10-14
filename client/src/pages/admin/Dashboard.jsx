import { useFetchData } from "6pp";
import {
  AdminPanelSettings as AdminPanelSettingsIcon,
  Group as GroupIcon,
  Message as MessageIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import {
  Box,
  Grid,
  Container,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import moment from "moment";
import React from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { DoughnutChart, LineChart } from "../../components/specific/Charts";
import {
  CurveButton,
  SearchField,
} from "../../components/styles/StyledComponents";
import { matBlack } from "../../constants/color";
import { server } from "../../constants/config";
import { useErrors } from "../../hooks/hook";

const Dashboard = () => {
  const { loading, data, error } = useFetchData(
    `${server}/api/v1/admin/stats`,
    "dashboard-stats"
  );

  const { stats } = data || {};

  useErrors([
    {
      isError: error,
      error: error,
    },
  ]);

  const Widgets = (
    <Stack
      direction={{
        xs: "column",
        sm: "row",
      }}
      spacing="2rem"
      justifyContent="space-between"
      alignItems={"center"}
      margin={"2rem 0"}
    >
      <Widget title={"Users"} value={stats?.usersCount} Icon={<PersonIcon />} />
      <Widget
        title={"Chats"}
        value={stats?.totalChatsCount}
        Icon={<GroupIcon />}
      />
      <Widget
        title={"Messages"}
        value={stats?.messagesCount}
        Icon={<MessageIcon />}
      />
    </Stack>
  );

  return (
    <AdminLayout>
      {loading ? (
        <Skeleton />
      ) : (
        <Container component={"main"}>
          <Stack>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6}>
                <Paper
                  elevation={3}
                  sx={{
                    padding: "4rem 3.5rem",
                    borderRadius: "1rem",
                    width: "100%",
                    maxWidth: "45rem",
                    marginTop: "2rem",
                  }}
                >
                  <Typography margin={"2rem 0"} variant="h5">
                    Last Messages
                  </Typography>
                  <LineChart value={stats?.messagesChart || []} />
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper
                  elevation={3}
                  sx={{
                    padding: "4rem 3.5rem",
                    borderRadius: "1rem",
                    width: "100%",
                    maxWidth: "45rem",
                    marginTop: "2rem",
                  }}
                >
                  <Typography margin={"2rem 0"} variant="h5">
                    Last Chats
                  </Typography>
                  <LineChart value={stats?.chatsChart || []} />
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper
                  elevation={3}
                  sx={{
                    padding: "4rem 3.5rem",
                    borderRadius: "1rem",
                    width: "100%",
                    maxWidth: "45rem",
                  }}
                >
                  <Typography margin={"2rem 0"} variant="h5">
                    Last Users
                  </Typography>
                  <LineChart value={stats?.usersChart || []} />
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper
                  elevation={3}
                  sx={{
                    padding: "2.2rem 6rem 3.7rem 6rem",
                    borderRadius: "1rem",
                    width: "100%",
                    maxWidth: "45rem",
                  }}
                >
                  <DoughnutChart
                    labels={["Single Chats", "Group Chats"]}
                    value={[
                      stats?.totalChatsCount - stats?.groupsCount || 0,
                      stats?.groupsCount || 0,
                    ]}
                  />
                  <Stack
                    position={"absolute"}
                    direction={"row"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    spacing={"0.5rem"}
                    width={"100%"}
                  >
                    <GroupIcon /> <Typography>Vs </Typography>
                    <PersonIcon />
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Stack>

          {Widgets}
        </Container>
      )}
    </AdminLayout>
  );
};

const Widget = ({ title, value, Icon }) => (
  <Paper
    elevation={3}
    sx={{
      padding: "2rem",
      margin: "2rem 0",
      borderRadius: "1.5rem",
      width: "20rem",
    }}
  >
    <Stack alignItems={"center"} spacing={"1rem"}>
      <Typography
        sx={{
          borderRadius: "50%",
          border: `5px solid ${matBlack}`,
          width: "5rem",
          height: "5rem",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {value}
      </Typography>
      <Stack direction={"row"} spacing={"1rem"} alignItems={"center"}>
        {Icon}
        <Typography>{title}</Typography>
      </Stack>
    </Stack>
  </Paper>
);

export default Dashboard;
