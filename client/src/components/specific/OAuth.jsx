import GoogleIcon from "@mui/icons-material/Google";
import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
import { app } from "../../firebase";
import { useDispatch } from "react-redux";
import { signInSuccess } from "../../redux/reducers/auth";
import { useNavigate } from "react-router-dom";
import { Button, TextField } from "@mui/material";
import { server } from "../../constants/config";
import { userExists } from "../../redux/reducers/auth";
import axios from "axios";

export default function OAuth() {
  const auth = getAuth(app);
  const dispatch = useDispatch();
  const handleGoogleClick = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      const resultsFromGoogle = await signInWithPopup(auth, provider);
      const res = await axios.post(
        `${server}/api/v1/user/google`,
        {
          name: resultsFromGoogle.user.displayName,
          email: resultsFromGoogle.user.email,
          googlePhotoUrl: resultsFromGoogle.user.photoURL,
        },
        {
          withCredentials: true,

          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (res) {
        dispatch(userExists(res.data.user));
      } 
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Button
      sx={{ marginTop: "4px" }}
      variant="contained"
      fullWidth
      onClick={handleGoogleClick}                   color="error"

    >
      <GoogleIcon sx={{marginRight: "4px"}}/>
      Continue with Google
    </Button>
  );
}
