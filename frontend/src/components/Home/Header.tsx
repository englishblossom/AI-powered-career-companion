import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
// import axios from "axios";
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Typography,
  IconButton,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
const logo = require("../../images/logo.png");

const Header: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [username, setUsername] = useState<string>(""); // Placeholder for username
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  React.useEffect(() => {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    const currentPath = window.location.pathname;
    if (!token && currentPath !== "/signin" && currentPath !== "/signup") {
      navigate("/signin");
    }
  }, [navigate]);

  useEffect(() => {
    const storedUsername =
      localStorage.getItem("username") || sessionStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      // Clear tokens
      localStorage.removeItem("authToken");
      localStorage.removeItem("username");

      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("username");

      // Redirect to signin
      navigate("/signin");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        width: "100%",
        alignItems: "center",
        padding: "16px",
        backgroundColor: "rgba(250, 250, 250, 0.6)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(200, 200, 200, 0.3)",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Box
        onClick={() => navigate("/")}
        sx={{ cursor: "pointer", height: { xs: "1.5rem", sm: "3rem" } }}
      >
        <img src={logo} alt="Logo" style={{ height: "100%", width: "auto" }} />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton>
          <AccountCircleIcon
            sx={{ fontSize: { xs: 16, sm: 28 }, color: "#354336" }}
          />
        </IconButton>

        <Box
          onMouseEnter={handleMenuOpen}
          onMouseLeave={handleMenuClose}
          sx={{ position: "relative", cursor: "pointer" }}
        >
          <Typography
            sx={{
              fontWeight: "600",
              fontSize: { xs: "0.7rem", sm: "1rem" },
              color: "#354336",
              width: "max-content",
            }}
          >
            Hi, {username ? username : "Guest"}!{" "}
            <FontAwesomeIcon icon={faAngleDown} />
          </Typography>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            sx={{
              mt: 1,
              "& .MuiPaper-root": {
                backgroundColor: "#c09d7d",
                borderRadius: "12px",
                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                border: "1px solid rgba(200, 200, 200, 0.3)",
                "&:hover": {
                  backgroundColor: "#b08d6d",
                },
              },
            }}
          >
            <MenuItem
              onClick={() => {
                handleMenuClose();
                navigate("/UserProfileForm");
                // window.location.href = "/UserProfileForm"; // Updated path
              }}
              sx={{ padding: "6px 12px" }}
            >
              Profile
            </MenuItem>
          </Menu>
        </Box>

        <Button
          variant="contained"
          sx={{
            backgroundColor: "#70161F",
            color: "#FFF",
            px: 3,
            py: 1,
            borderRadius: "12px",
            "&:hover": {
              backgroundColor: "#5e121a",
            },
          }}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default Header;
