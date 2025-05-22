import * as React from "react";
import axios from "axios";
import api from "../../axiosInstance";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
// import CssBaseline from "@mui/material/CssBaseline";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import ForgotPassword from "./ForgotPassword";
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
import { appendFileSync } from "fs";

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
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  [theme.breakpoints.up("sm")]: {
    maxWidth: "450px",
  },
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  backgroundColor: "#C8AA8E",
  height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
  // height: "100dvh",
  // maxHeight: "100vh",
  // display: "flex", // Flex for alignment
  // flexDirection: "column", // Column layout for the form
  // justifyContent: "center", // Vertically center content
  // alignItems: "center", // Horizontally center content
  // minHeight: "100%",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
}));

export default function SignIn(props: { disableCustomTheme?: boolean }) {
  const navigate = useNavigate();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);

  const [usernameError, setUsernameError] = React.useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = React.useState("");
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");

  // ✅ Check for existing token on page load
  React.useEffect(() => {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (token) {
      navigate("/"); // Auto-login if token exists
    }
  }, [navigate]);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // ✅ Validate username & password
    const isUsernameValid = /^[a-zA-Z0-9_]{4,}$/.test(username);
    const isPasswordValid = password.length >= 6;

    if (!isUsernameValid) {
      setUsernameError(true);
      setUsernameErrorMessage(
        "Username must be at least 4 characters long and contain only letters, numbers or underscores."
      );
      return;
    } else {
      setUsernameError(false);
      setUsernameErrorMessage("");
    }

    if (!isPasswordValid) {
      setPasswordError(true);
      setPasswordErrorMessage("Password must be at least 6 characters long.");
      return;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }
    // navigate("/UserProfileForm"); // Redirect to home page
    console.log("reaching login3");
    try {
      // const response = await axios.post("http://localhost:8000/login", {
      //   username: username,
      //   password: password,
      // });

      const response = await api.post("/login", {
        username: username,
        password: password,
      });

      console.log(response.data);

      if (response.data.message === "Username not found") {
        alert("User does not exist");
      } else if (response.data.message === "User login successful") {
        const token = response.data.token; // Assuming backend returns a token
        console.log("reaching login");
        console.log("token: " + token);
        // ✅ Store token based on "Remember Me" option
        if (rememberMe) {
          localStorage.setItem("authToken", token);
          localStorage.setItem("username", username);
        } else {
          sessionStorage.setItem("authToken", token);
          sessionStorage.setItem("username", username);
        }
        console.log("reaching login2");
        navigate("/UserProfileForm"); // Redirect to home page
      } else {
        console.log("reaching login4");

        alert("Incorrect! Username and Password do not match");
      }
    } catch (err) {
      alert("Error logging in. Please try again.");
      console.error(err);
    }
  }

  return (
    // <AppTheme {...props}>
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <SignInContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <Box>
            <img src={logo} alt="Logo" style={{ height: "4rem" }} />
          </Box>
          <Typography
            component="h1"
            variant="h4"
            sx={{ textAlign: "center", color: "black" }}
          >
            Sign in
          </Typography>
          <Box
            component="form"
            onSubmit={login}
            noValidate
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              gap: 2,
            }}
          >
            <FormControl>
              {/* <FormLabel htmlFor="username">Username</FormLabel> */}
              <TextField
                error={usernameError}
                helperText={usernameErrorMessage}
                id="username"
                name="username"
                placeholder="Username"
                autoComplete="username"
                required
                fullWidth
                variant="outlined"
                sx={{
                  input: { color: "black" },
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "white",
                  },
                }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </FormControl>
            <FormControl>
              {/* <FormLabel htmlFor="password">Password</FormLabel> */}
              <TextField
                error={passwordError}
                helperText={passwordErrorMessage}
                name="password"
                placeholder="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                required
                fullWidth
                variant="outlined"
                sx={{
                  input: { color: "black" },
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "white",
                  },
                }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  color="primary"
                />
              }
              label="Remember me"
              sx={{ color: "black", width: "max-content" }}
            />
            <Button type="submit" fullWidth variant="contained">
              Sign in
            </Button>
          </Box>
          <Divider sx={{ color: "black" }}>or</Divider>
          <Typography sx={{ textAlign: "center", color: "black" }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup/" variant="body2" sx={{ color: "#354336" }}>
              Sign up
            </Link>
          </Typography>
        </Card>
      </SignInContainer>
      {/* </AppTheme> */}
    </ThemeProvider>
  );
}
