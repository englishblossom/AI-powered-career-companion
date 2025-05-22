import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

export default function MenuTabs() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine which tab is active based on the current URL
  const getTabIndex = () => {
    if (location.pathname === "/resume-tailoring") return 0;
    if (location.pathname === "/application-tracking-dashboard") return 1;
    return 0; // Default to Resume Tailoring
  };

  const [value, setValue] = React.useState(getTabIndex);

  // Handle tab change and navigate accordingly
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    if (newValue === 0) {
      navigate("/resume-tailoring");
    } else if (newValue === 1) {
      navigate("/application-tracking-dashboard");
    }
  };

  return (
    <Box sx={{ maxWidth: "100%", mx: "auto", mt: 5 }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="customized tabs"
          sx={{
            display: "flex",
            maxWidth: "100%",
            "& .MuiTabs-flexContainer": {
              justifyContent: "space-between",
            },
            "& .MuiTabs-indicator": {
              display: "none",
            },
          }}
        >
          <Tab
            label="Resume Tailoring"
            sx={{
              flex: 1,
              color: "white",
              marginLeft: 3,
              backgroundColor: "#8FA69B",
              borderTopLeftRadius: "20px",
              borderTopRightRadius: "20px",
              "&.Mui-selected": {
                fontWeight: "bold",
                color: "white",
                backgroundColor: "#354336",
                boxShadow: "0px -2px 4px rgba(0, 0, 0, 0.2)",
              },
            }}
          />
          <Tab
            label="Application Tracking Dashboard"
            sx={{
              flex: 1,
              backgroundColor: "#8D9A8E",
              marginRight: 3,
              color: "white",
              borderTopLeftRadius: "20px",
              borderTopRightRadius: "20px",
              "&.Mui-selected": {
                fontWeight: "bold",
                color: "white",
                backgroundColor: "#354336",
                boxShadow: "0px -2px 4px rgba(0, 0, 0, 0.2)",
              },
            }}
          />
        </Tabs>
      </Box>
    </Box>
  );
}
