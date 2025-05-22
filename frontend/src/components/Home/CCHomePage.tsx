import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import Header from "./Header";
// import Footer from "./Footer";

const overviewImage = require("../../images/overview1.png");
const feature1Image = require("../../images/feature1.png");
const feature2Image = require("../../images/feature2.png");
const feature3Image = require("../../images/feature3.png");

const CCHomePage: React.FC = () => {
  return (
    <Box sx={{ paddingBottom: { xs: "200px", sm: "20px" } }}>
      <Header />
      {/* Overview Section */}
      <Container className="text-center py-5">
        <Row className="align-items-center">
          <Col md={6}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
            >
              <Typography
                variant="h3"
                fontWeight="bold"
                color="#354336"
                gutterBottom
              >
                Your AI-Powered Job Search Assistant
              </Typography>
              <Typography variant="h6" color="#354336">
                Automate your job search with AI-driven resume tailoring, job
                tracking, and mock interview preparation—all in one platform.
              </Typography>
            </motion.div>
          </Col>
          <Col md={6}>
            <motion.img
              src={overviewImage}
              alt="Overview"
              className="img-fluid"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
            />
          </Col>
        </Row>
      </Container>

      {/* Features Section */}
      <Container className="py-5">
        <Typography
          variant="h4"
          className="text-center mb-4"
          fontWeight="bold"
          color="#354336"
        >
          Key Features
        </Typography>

        {/* Feature 1 */}
        <Row className="align-items-center my-4">
          <Col md={6}>
            <motion.img
              src={feature1Image}
              alt="Feature 1"
              className="img-fluid"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
            />
          </Col>
          <Col md={6}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
            >
              <Typography variant="h5" fontWeight="bold" color="#354336">
                AI-Powered Resume Tailoring
              </Typography>
              <Typography color="#354336">
                Upload your resume once, and our AI refines it for each job,
                ensuring alignment with job descriptions.
              </Typography>
            </motion.div>
          </Col>
        </Row>

        {/* Feature 2 */}
        <Row className="align-items-center my-4 flex-md-row-reverse">
          <Col md={6}>
            <motion.img
              src={feature2Image}
              alt="Feature 2"
              className="img-fluid"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
            />
          </Col>
          <Col md={6}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
            >
              <Typography variant="h5" fontWeight="bold" color="#354336">
                Job Application Tracker
              </Typography>
              <Typography color="#354336">
                Keep track of your applications, monitor progress, and analyze
                rejection patterns to improve your job search.
              </Typography>
            </motion.div>
          </Col>
        </Row>

        {/* Feature 3 */}
        <Row className="align-items-center my-4">
          <Col md={6}>
            <motion.img
              src={feature3Image}
              alt="Feature 3"
              className="img-fluid"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
            />
          </Col>
          <Col md={6}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
            >
              <Typography variant="h5" fontWeight="bold" color="#354336">
                AI-Driven Mock Interview Assistant
              </Typography>
              <Typography color="#354336">
                Prepare for interviews with real-time AI-generated questions,
                feedback, and performance tracking.
              </Typography>
            </motion.div>
          </Col>
        </Row>
      </Container>

      {/* Navigation Button */}
      <Container className="text-center my-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <Button
            style={{
              backgroundColor: "#70161F",
              borderColor: "#70161F",
              color: "#FFF",
              padding: "12px 24px",
              fontSize: "1.2rem",
              fontWeight: "bold",
            }}
            size="lg"
            href="/resume-tailoring"
          >
            Start Tailoring Your Resume
          </Button>
        </motion.div>
      </Container>

      {/* Footer */}
      {/* <Footer /> */}
    </Box>
  );
};

export default CCHomePage;
