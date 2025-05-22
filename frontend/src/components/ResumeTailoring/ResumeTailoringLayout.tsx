import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import api from "../../axiosInstance";
import { motion } from "framer-motion";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Row, Col, Spinner } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ResumeTailoringLayout.css";
import FeedbackPopup from "./FeedbackPopup";
import FormHelperText from "@mui/material/FormHelperText";

//  Validation Schema using Yup
const schema = yup.object().shape({
  jobRole: yup.string().required("Job role is required"),
  companyName: yup.string().required("Company name is required"),
  jobDescription: yup.string().required("Job description is required"),
});

//  Define TypeScript types for the form
type FormData = {
  jobRole: string;
  companyName: string;
  jobDescription: string;
};

const ResumeTailoringLayout: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: "onChange", // real-time validation
  });

  // const [jobdescId, setJobdescId] = useState<string | null>(null);
  // const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isBlob, setIsBlob] = useState<boolean>(false);
  const [pdfFilename, setPdfFilename] = useState<string>("updated_resume.tex");
  const [showPopup, setShowPopup] = useState<boolean>(false);
  //loading
  const [loading, setLoading] = useState(false);
  const [texContent, setTexContent] = useState<string | null>(null);

  const username =
    localStorage.getItem("username") || sessionStorage.getItem("username");

  // poll status function
  const pollStatus = async (jobdescId: string) => {
    const maxRetries = 10; // 60 seconds max (3s * 20)
    let attempt = 0;

    const intervalId = setInterval(async () => {
      attempt += 1;
      try {
        const response = await api.get("/checkStatus", {
          params: { jobdesc_id: jobdescId },
          responseType: "blob",
        });

        const status = response.headers["file-status"];
        // const status = response.headers.get("status");
        console.log("Polling status:", status);
        // console.log("response:", response.data);
        if (status === "completed") {
          // if (response && response.data.status === "completed") {
          clearInterval(intervalId);

          const contentDisposition = response.headers["content-disposition"];
          const filenameMatch = contentDisposition?.match(/filename="?(.+)"?/);
          const extractedFilename = filenameMatch
            ? filenameMatch[1]
            : "updated_resume.tex";

          // const blobUrl = URL.createObjectURL(response.data);
          const blob = response.data;
          const text = await blob.text(); // read content
          const blobUrl = URL.createObjectURL(blob);
          setPdfUrl(blobUrl);
          setTexContent(text);
          setPdfUrl(blobUrl);
          setPdfFilename(extractedFilename);
          setIsBlob(true);
          setLoading(false);
        }
      } catch (error: any) {
        // Ignore expected 202 or 206 responses (still processing)
        if (!error?.response || error?.response?.status >= 400) {
          console.error("Polling error:", error);
          clearInterval(intervalId);
          setLoading(false);
        }
      }

      if (attempt >= maxRetries) {
        console.warn("Polling timed out after 60 seconds.");
        clearInterval(intervalId);
        setLoading(false);
        // Optionally notify user here
        alert("The request is taking longer than expected. Please try again.");
      }
    }, 30000);
  };

  //  Function to handle form submission and PDF generation
  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setPdfUrl(null);
      // ==============
      const formData = new FormData();
      formData.append("job_description", data.jobDescription);
      formData.append("job_role", data.jobRole);
      formData.append("company_name", data.companyName);

      // const response = await axios.post(
      //   "http://localhost:8000/generate",
      //   formData,
      //   {
      //     params: { username: username },
      //     headers: {
      //       "Content-Type": "multipart/form-data",
      //     },
      //     responseType: "blob",
      //   }
      // );

      //old code

      // const response = await api.post("/generate", formData, {
      //   params: { username: username },
      //   headers: {
      //     "Content-Type": "multipart/form-data",
      //   },
      //   responseType: "blob",
      // });

      const response = await api.post("/generate", formData, {
        params: { username },
      });

      // Extract filename from Content-Disposition header
      //   const contentDisposition = response.headers["content-disposition"];
      //   const filenameMatch = contentDisposition?.match(/filename="?(.+)"?/);
      //   const extractedFilename = filenameMatch
      //     ? filenameMatch[1]
      //     : "updated_resume.pdf";
      //   console.log(extractedFilename);
      //   const blobUrl = URL.createObjectURL(response.data);
      //   setPdfUrl(blobUrl);
      //   setPdfFilename(extractedFilename);
      //   setIsBlob(true);
      // } catch (error) {
      //   console.error("Error generating or fetching PDF:", error);
      // }
      const jobdescId = response.data.jobdesc_id;
      if (jobdescId) {
        pollStatus(jobdescId);
      } else {
        throw new Error("No jobdesc_id returned");
      }
    } catch (error) {
      console.error("Error during /generate:", error);
      setLoading(false);
    }
  };

  //  Function to reset form & clear PDF preview
  const handleReset = () => {
    reset();
    if (pdfUrl && isBlob) {
      URL.revokeObjectURL(pdfUrl);
    }
    setPdfUrl(null);
    setIsBlob(false);
    setPdfFilename("updated_resume.tex");
    setLoading(false);
  };

  return (
    <div className="rt-container">
      <Row className="rt-layout-container">
        {/*  Left Side: Job Description Form */}
        <Col md={6} className="rt-left-section">
          <h2 className="rt-input-title">
            Job Role: <span style={{ color: "red" }}>*</span>
          </h2>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Enter Job Role (required)"
            {...register("jobRole")}
            sx={{ backgroundColor: "white", borderRadius: "4px" }}
          />
          <FormHelperText error>{errors.jobRole?.message}</FormHelperText>

          <h2 className="rt-input-title">
            Company Name: <span style={{ color: "red" }}>*</span>
          </h2>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Enter Company Name (required)"
            {...register("companyName")}
            sx={{ backgroundColor: "white", borderRadius: "4px" }}
          />
          <FormHelperText error>{errors.companyName?.message}</FormHelperText>

          <h2 className="rt-input-title">
            Job Description: <span style={{ color: "red" }}>*</span>
          </h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              placeholder="Enter Job Description (required)"
              multiline
              rows={6}
              fullWidth
              variant="outlined"
              {...register("jobDescription")}
              sx={{
                backgroundColor: "white",
                borderRadius: "4px",
              }}
            />
            <FormHelperText error>
              {errors.jobDescription?.message}
            </FormHelperText>

            <div className="rt-button-group">
              <Button
                variant="contained"
                type="submit"
                disabled={!isValid}
                sx={{
                  backgroundColor: isValid ? "#70161F" : "#ccc",
                  fontWeight: "bold",
                  color: isValid ? "white" : "#888",
                  padding: "10px 24px",
                  borderRadius: "8px",
                  cursor: isValid ? "pointer" : "not-allowed",
                  "&:hover": { backgroundColor: isValid ? "#5e121a" : "#ccc" },
                }}
              >
                {pdfUrl ? "Resubmit" : "Submit"}
              </Button>

              <Button
                variant="outlined"
                type="button"
                onClick={handleReset}
                sx={{
                  fontWeight: "bold",
                  padding: "10px 24px",
                  borderRadius: "8px",
                  marginLeft: "10px",
                  color: "#354336",
                  borderColor: "#354336",
                  "&:hover": {
                    backgroundColor: "#f1f5f2",
                    borderColor: "#354336",
                  },
                }}
              >
                Reset
              </Button>
            </div>
          </form>
        </Col>

        {/*  Right Side: PDF Preview */}
        <Col md={6} className="rt-right-section">
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="rt-pdf-preview"
          >
            {/* {pdfUrl ? (
              <iframe
                src={pdfUrl}
                title="Generated Resume"
                className="rt-pdf-iframe"
              />
            ) : (
              <div className="rt-pdf-placeholder">Generated PDF content</div>
            )} */}
            {loading ? (
              <div className="rt-pdf-loading">
                <Spinner animation="border" variant="danger" />
                <p>Generating your LaTeX resume...</p>
              </div>
            ) : pdfUrl ? (
              <iframe
                src={pdfUrl}
                title="Generated LaTeX Resume"
                className="rt-pdf-iframe"
              />
            ) : texContent ? (
              <pre className="rt-tex-viewer">{texContent}</pre>
            ) : (
              <div className="rt-pdf-placeholder">
                Generated LaTeX content will appear here.
              </div>
            )}
            <div className="rt-download-wrapper">
              <Button
                variant="contained"
                className="rt-download-btn"
                disabled={!pdfUrl}
                onClick={() => {
                  if (pdfUrl) {
                    const link = document.createElement("a");
                    link.href = pdfUrl;
                    link.download = pdfFilename;
                    link.click();

                    // Show the feedback popup after download
                    setShowPopup(true);
                  }
                }}
                sx={{
                  backgroundColor: pdfUrl ? "#70161F" : "#d3d3d3",
                  color: pdfUrl ? "white" : "#555555",
                  fontWeight: "bold",
                  padding: "10px 24px",
                  borderRadius: "8px",
                  marginTop: "20px",
                  cursor: pdfUrl ? "pointer" : "not-allowed",
                  "&:hover": {
                    backgroundColor: pdfUrl ? "#5e121a" : "#d3d3d3",
                  },
                }}
              >
                Download File
              </Button>
            </div>
            {showPopup && (
              <>
                <div className="ff-overlay" />
                <FeedbackPopup />
              </>
            )}
          </motion.div>
        </Col>
      </Row>
    </div>
  );
};

export default ResumeTailoringLayout;
