import React, { JSX } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import Header from "./components/Home/Header";
import MenuTabs from "./components/Home/MenuTabs";
import ResumeTailoringLayout from "./components/ResumeTailoring/ResumeTailoringLayout";
import CCHomePage from "./components/Home/CCHomePage";
import SignIn from "./components/Credentials/SignIn";
import SignUp from "./components/Credentials/SignUp";
import UserProfileForm from "./components/UserProfile/UserProfileForm";
import "bootstrap/dist/css/bootstrap.min.css";
import Tracker from "./components/Tracker/Tracker";

// ✅ Utility to check for token
// const isAuthenticated = () => {
//   return (
//     !!localStorage.getItem("authToken") || !!sessionStorage.getItem("authToken")
//   );
// };

const PrivateRoute = ({ element }: { element: JSX.Element }) => {
  const token =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

  return token ? element : <Navigate to="/signin" />;
};

const LayoutWithTabs: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const location = useLocation();

  // Show MenuTabs only on Resume Tailoring and Application Tracking Dashboard
  const showTabs =
    location.pathname === "/resume-tailoring" ||
    location.pathname === "/application-tracking-dashboard";

  return (
    <div>
      <Header /> {/* Always show Header */}
      {showTabs && <MenuTabs />} {/* Conditionally render MenuTabs */}
      <div className="main-container">{children}</div>
    </div>
  );
};

function App() {
  return (
    // <Router>
    //   <Routes>
    //     {/* Home Page */}
    //     <Route path="/" element={<CCHomePage />} />

    //     {/* Authentication Routes */}
    //     <Route path="/signin" element={<SignIn />} />
    //     <Route path="/signup" element={<SignUp />} />

    //     {/* User Profile */}
    //     {/* <Route path="/UserProfileForm" element={<UserProfileForm />} /> */}

    //     {/* Pages that include MenuTabs */}
    //     <Route
    //       path="*"
    //       element={
    //         <LayoutWithTabs>
    //           <Routes>
    //             <Route
    //               path="/resume-tailoring"
    //               element={<ResumeTailoringLayout />}
    //             />
    //             <Route
    //               path="/application-tracking-dashboard"
    //               element={<p>Application Tracking Dashboard Content</p>}
    //             />
    //             <Route path="*" element={<p>404 - Page Not Found</p>} />
    //           </Routes>
    //         </LayoutWithTabs>
    //       }
    //     />
    //   </Routes>
    // </Router>

    <Router>
      <Routes>
        {/* Home Page */}
        {/* <Route path="/" element={<CCHomePage />} /> */}
        {/* ✅ Redirect / to Home or Signup based on token */}
        {/* <Route
          path="/"
          element={
            isAuthenticated() ? <CCHomePage /> : <Navigate to="/signup" />
          }
        /> */}

        <Route path="/" element={<PrivateRoute element={<CCHomePage />} />} />

        {/* Authentication Routes - DO NOT wrap in LayoutWithTabs */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* User Profile */}
        {/* <Route path="/UserProfileForm" element={<UserProfileForm />} /> */}
        <Route
          path="/UserProfileForm"
          element={<PrivateRoute element={<UserProfileForm />} />}
        />

        {/* Pages that include MenuTabs */}
        {/* <Route
          path="/resume-tailoring"
          element={
            <LayoutWithTabs>
              <ResumeTailoringLayout />
            </LayoutWithTabs>
          }
        /> */}
        <Route
          path="/resume-tailoring"
          element={
            <PrivateRoute
              element={
                <LayoutWithTabs>
                  <ResumeTailoringLayout />
                </LayoutWithTabs>
              }
            />
          }
        />

        {/* <Route
          path="/application-tracking-dashboard"
          element={
            <LayoutWithTabs> */}
        {/* <p>Application Tracking Dashboard Content</p> */}
        {/* <Tracker />
            </LayoutWithTabs>
          }
        /> */}

        <Route
          path="/application-tracking-dashboard"
          element={
            <PrivateRoute
              element={
                <LayoutWithTabs>
                  <Tracker />
                </LayoutWithTabs>
              }
            />
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<p>404 - Page Not Found</p>} />
      </Routes>
    </Router>
  );
}

export default App;
