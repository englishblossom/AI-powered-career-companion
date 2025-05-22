import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import api from "../../axiosInstance";
import "./userProfileForm.css";
import Header from "../Home/Header";

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  // email: yup.string().email("Invalid email").required("Email is required"),
  // portfolio: yup.string().url("Invalid URL").required("Portfolio is required"),
  // github: yup.string().url("Invalid URL").required("GitHub link is required"),
  // linkedin: yup
  //   .string()
  //   .url("Invalid URL")
  //   .required("LinkedIn URL is required"),
  // resume: yup
  //   .mixed()
  //   .required("Resume is required")
  //   .test(
  //     "fileFormat",
  //     "Only PDF files are allowed",
  //     (value) => value instanceof File && value.type === "application/pdf"
  email: yup
    .string()
    .email("Invalid email format. Please enter a valid email.")
    .required("Email is required"),
  portfolio: yup
    .string()
    .url("Invalid URL (Must start with http:// or https://)")
    .nullable(), // Optional Field
  github: yup
    .string()
    .url("Invalid URL (Must start with http:// or https://)")
    .nullable(), // Optional Field
  linkedin: yup
    .string()
    .url("Invalid URL (Must start with http:// or https://)")
    .required("LinkedIn URL is required"),
  resume: yup
    .mixed()
    .required("Resume is required")
    .test(
      "fileFormat",
      "Only PDF files are allowed",
      (value) => value instanceof File && value.type === "application/pdf"
    ),
});

type FormData = {
  name: string;
  email: string;
  portfolio?: string;
  github?: string;
  linkedin: string;
  resume: File;
};

const UserProfileForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
  });

  const [resumePreview, setResumePreview] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const onSubmit = async (data: FormData) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    // formData.append("portfolio", data.portfolio);
    // formData.append("github", data.github);
    if (data.portfolio) formData.append("portfolio", data.portfolio);
    if (data.github) formData.append("github", data.github);
    formData.append("linkedin", data.linkedin);
    formData.append("resume_pdf", data.resume);
    const username =
      localStorage.getItem("username") || sessionStorage.getItem("username");

    try {
      // const response = await axios.post(
      //   "http://localhost:8000/submit",
      //   formData,
      //   {
      //     params: { username: username },
      //     headers: { "Content-Type": "multipart/form-data" },
      //   }
      // );

      const response = await api.post("/submit", formData, {
        params: { username: username },
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Response:", response.data);
      setSuccessMessage("Profile updated successfully!");
    } catch (error) {
      console.error("Error uploading data:", error);
      setSuccessMessage(null);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue("resume", file);
      setResumePreview(URL.createObjectURL(file));
    }
  };

  const handleReset = () => {
    reset();
    setResumePreview(null);
  };

  return (
    <div>
      <Header />
      <div className="up-container">
        {/* Resume Upload Section */}
        <div className="up-resume-section">
          {resumePreview ? (
            <div className="up-resume-preview">
              <iframe src={resumePreview} title="Resume Preview"></iframe>
            </div>
          ) : (
            <p>Base resume PDF content</p>
          )}
        </div>

        {/* Profile Form Section */}
        <div className="up-form-section">
          <h2>Update your profile</h2>
          {successMessage && (
            <p style={{ color: "green", marginBottom: "1rem" }}>
              {successMessage}
            </p>
          )}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="up-form-group">
              {/* <label>Name</label>
                <input {...register("name")} /> */}
              <label>
                Name <span style={{ color: "red" }}>*</span>
              </label>
              <input {...register("name", { required: true })} />
            </div>
            <p className="error">{errors.name?.message}</p>

            <div className="up-form-group">
              <label>
                Email <span style={{ color: "red" }}>*</span>
              </label>
              <input {...register("email", { required: true })} type="email" />
            </div>
            <p className="error">{errors.email?.message}</p>

            <div className="up-form-group">
              <label>
                Portfolio
                {/* <span style={{ color: "red" }}>*</span> */}
              </label>
              <input {...register("portfolio", { required: true })} />
            </div>
            <p className="error">{errors.portfolio?.message}</p>

            <div className="up-form-group">
              <label>
                GitHub
                {/* <span style={{ color: "red" }}>*</span> */}
              </label>
              <input {...register("github", { required: true })} />
            </div>
            <p className="error">{errors.github?.message}</p>

            <div className="up-form-group">
              <label>
                LinkedIn <span style={{ color: "red" }}>*</span>
              </label>
              <input {...register("linkedin", { required: true })} />
            </div>
            <p className="error">{errors.linkedin?.message}</p>

            {/* File Upload */}
            <div className="up-file-upload-group">
              <label>
                Base Resume <span style={{ color: "red" }}>*</span>
              </label>
              {/* <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="up-file-upload"
                  id="fileInput"
                /> */}
              <input
                type="file"
                accept="application/pdf"
                id="fileInput"
                className="up-file-upload"
                {...register("resume", {
                  required: "Resume is required",
                  validate: (file: File | undefined) =>
                    file?.type === "application/pdf" ||
                    "Only PDF files are allowed",
                })}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setValue("resume", file, { shouldValidate: true });
                    setResumePreview(URL.createObjectURL(file));
                  }
                }}
              />

              <label htmlFor="fileInput" className="up-upload-label">
                Upload base resume
              </label>
            </div>
            <p className="error">{errors.resume?.message}</p>

            {/* Buttons */}
            <div className="up-buttons">
              <button type="submit">Update</button>
              <button type="button" onClick={handleReset}>
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfileForm;
