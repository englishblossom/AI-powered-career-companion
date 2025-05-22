import * as React from "react";
import axios from "axios";
import api from "../../axiosInstance";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
// import CssBaseline from "@mui/material/CssBaseline";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import AppTheme from "./theme/AppTheme";

import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { inputsCustomizations } from "./theme/customizations/inputs";
import { dataDisplayCustomizations } from "./theme/customizations/dataDisplay";
import { feedbackCustomizations } from "./theme/customizations/feedback";
import { navigationCustomizations } from "./theme/customizations/navigation";
import { surfacesCustomizations } from "./theme/customizations/surfaces";
import {
  colorSchemes,
  typography,
  shadows,
  shape,
} from "./theme/themePrimitives";

const logo = require("../../images/logo.png");

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: "data-mui-color-scheme",
    cssVarPrefix: "template",
  },
  colorSchemes,
  typography,
  shadows,
  shape,
  components: {
    ...inputsCustomizations,
    ...dataDisplayCustomizations,
    ...feedbackCustomizations,
    ...navigationCustomizations,
    ...surfacesCustomizations,
  },
});

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(2, 5, 10, 5),
  gap: theme.spacing(2),
  margin: "auto",
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  [theme.breakpoints.up("sm")]: {
    width: "450px",
  },
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
  minHeight: "100%",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: -1,
    inset: 0,
    backgroundColor: "#C8AA8E",
    // backgroundImage:
    //   "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
    backgroundImage: "#C8AA8E",
    backgroundRepeat: "no-repeat",
    ...theme.applyStyles("dark", {
      backgroundColor: "#C8AA8E",
      // backgroundImage:
      //   "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
      // backgroundImage: "#F5F5F5",
    }),
  },
}));

export default function SignUp(props: { disableCustomTheme?: boolean }) {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const navigate = useNavigate();

  const [usernameError, setUsernameError] = React.useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = React.useState("");

  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");

  React.useEffect(() => {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (token) {
      navigate("/"); // redirect to homepage if already signed in
    }
  }, [navigate]);

  const validateUsername = () => {
    if (!username.trim()) {
      setUsernameError(true);
      setUsernameErrorMessage("Username is required.");
      return false;
    } else if (!/^[a-zA-Z0-9_]{4,}$/.test(username)) {
      setUsernameError(true);
      setUsernameErrorMessage(
        "Username must be at least 4 characters long and contain only letters, numbers, or underscores."
      );
      return false;
    }
    setUsernameError(false);
    setUsernameErrorMessage("");
    return true;
  };

  const validatePassword = () => {
    if (!password.trim()) {
      setPasswordError(true);
      setPasswordErrorMessage("Password is required.");
      return false;
    } else if (password.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage("Password must be at least 6 characters long.");
      return false;
    }
    setPasswordError(false);
    setPasswordErrorMessage("");
    return true;
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const isUsernameValid = validateUsername();
    const isPasswordValid = validatePassword();

    if (!isUsernameValid || !isPasswordValid) {
      return;
    }

    try {
      // const response = await axios.post("http://localhost:8000/register", {
      //   username: username,
      //   password: password,
      // });

      const response = await api.post("/register", {
        username: username,
        password: password,
      });

      if (response.status === 200 || response.status === 201) {
        console.log("Response: ", response.data.token);

        // navigate("/signin");

        // Auto sign in user after registration
        localStorage.setItem("authToken", response.data.token); // set real token if your backend supports it
        localStorage.setItem("username", username);
        alert("User Registration Successful");
        navigate("/UserProfileForm");
      } else {
        alert("Unexpected response from the server. Please try again.");
      }
    } catch (err: any) {
      if (err.response) {
        alert(
          `Error: ${
            err.response.data.message || "An error occurred while signing up."
          }`
        );
      } else if (err.request) {
        alert(
          "No response from server. Please check your internet connection."
        );
      } else {
        alert("Request failed. Please try again.");
      }
    }
  }

  return (
    // <AppTheme {...props}>
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <SignUpContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <Box>
            <img src={logo} alt="Logo" style={{ height: "4rem" }} />
          </Box>
          <Typography
            component="h1"
            variant="h4"
            sx={{ textAlign: "center", color: "black" }}
          >
            Sign up
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <FormControl>
              <TextField
                name="username"
                required
                fullWidth
                id="username"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={validateUsername}
                error={usernameError}
                helperText={usernameErrorMessage}
                sx={{
                  input: { color: "black" },
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "white",
                  },
                }}
              />
            </FormControl>
            <FormControl>
              <TextField
                name="password"
                required
                fullWidth
                type="password"
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={validatePassword}
                error={passwordError}
                helperText={passwordErrorMessage}
                sx={{
                  input: { color: "black" },
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "white",
                  },
                }}
              />
            </FormControl>
            <Button type="submit" fullWidth variant="contained">
              Sign up
            </Button>
          </Box>
          <Typography sx={{ textAlign: "center", color: "black" }}>
            Already have an account?{" "}
            <Link href="/signin/" variant="body2">
              Sign in
            </Link>
          </Typography>
        </Card>
      </SignUpContainer>
      {/* </AppTheme> */}
    </ThemeProvider>
  );
}
