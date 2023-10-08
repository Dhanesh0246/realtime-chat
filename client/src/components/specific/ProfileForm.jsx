import React from "react";
import Avatar from "@mui/material/Avatar";
import Grid from "@mui/material/Grid";
import { useForm } from "react-hook-form";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import LoadingButton from "@mui/lab/LoadingButton";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import { useDispatch ,useSelector} from "react-redux";
import { useNavigate } from "react-router-dom";
import { server } from "../../constants/config";
import axios from "axios";
import { useFileHandler, useInputValidation } from "6pp";
import { usernameValidator } from "../../utils/validators";

const ProfileForm = () => {
  const { user } = useSelector((state) => state.auth);
  const bio = useInputValidation("");
  const name = useInputValidation("");
  const password = useInputValidation("");
  const avatar = useFileHandler("single");

  const [profileImageURL, setProfileImageURL] = React.useState(null);
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageURL(file);
    }
  };

  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", avatar.file);
      formData.append("bio", bio.value);
      formData.append("name", name.value);
      formData.append("password", password.value);
      formData.append("email", user.email);

      const config = {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      const response = await axios.post(
        `${server}/api/v1/user/profile`,
        formData,
        config
      );
    } catch (err) {
      console.log("Registration failed", err.message);
    }
    setLoading(false);
  };

  const [loading, setLoading] = React.useState(false);

  function Copyright(props) {
    return (
      <Typography variant="body2" align="center" {...props}>
        {"Copyright © "}
        Hub
        {` ${new Date().getFullYear()}`}
      </Typography>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        minHeight: "100%",
      }}
    >
      <Box
        sx={{
          mx: { xs: 4, sm: 8, md: 12 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <input
          type="file"
          id="image-picker"
          accept="image/*"
          style={{ display: "none" }}
          onChange={avatar.changeHandler}
        />
        <label htmlFor="image-picker">
          <Avatar
            alt="Profile Image"
            src={avatar.preview?avatar.preview:user?.avatar?.url}
            sx={{ width: "100px", height: "100px", border: "6px solid black" }}
          />
        </label>
        <Box
          component="form"
          noValidate
          onSubmit={onSubmit}
          sx={{ width: "100%" }}
        >
          <TextField
            type="text"
            sx={{ px: 0 }}
            autoComplete="name"
            name="name"
            margin="normal"
            fullWidth
            id="name"
            label="Name"
            size="small"
            autoFocus
            value={name.value?name.value:user.name}
            onChange={name.changeHandler}
          />

          <TextField
            type="text"
            margin="normal"
            fullWidth
            id="bio"
            label="Bio"
            name="bio"
            autoComplete="bio"
            size="small"
            value={bio.value?bio.value:user.bio}
            onChange={bio.changeHandler}
          />

          <TextField
            margin="normal"
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="password"
            size="small"
            value={password.value?password.value:''}
            onChange={password.changeHandler}
          />

          <LoadingButton
            type="submit"
            fullWidth
            variant="contained"
            endIcon={<LoginOutlinedIcon />}
            loading={loading}
            loadingPosition="end"
            sx={{
              mt: 2,
            }}
            color='error'
          >
            Submit
          </LoadingButton>
          <Copyright sx={{ mt: 5 }} />
        </Box>
      </Box>
    </div>
  );
};

export default ProfileForm;
