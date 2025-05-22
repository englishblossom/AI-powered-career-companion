# AI-Powered-Career-Companion : One-Stop Solution for Tailored Resumes, Job Tracking, and Mock Interview Prep

## Problem statement:
Job seekers often struggle with manually tailoring resumes for each job as it is time-consuming, prone to human error and requires a deep understanding of how to align their experience with job requirements. Additionally, tracking job applications can be overwhelming, especially for those applying to multiple companies. Without a structured system, applicants may lose track of applications, forget to follow up or fail to analyze rejection patterns for future improvements.
Despite these common struggles, no existing web app seamlessly integrates AI-driven resume generation, job tracking and interview preparation. Our AI-powered platform eliminates these inefficiencies by automating resume tailoring, providing a real-time application tracker and offering an AI-driven mock interview assistant—all in one place. This unique, end-to-end job search solution enhances efficiency, improves hiring success and streamlines the entire job application process. 

## Brief project description: 

The goal of this project is to create a complete web-based platform that uses AI to personalize resumes, keep track of applications, and help people prepare for interviews. This will make the job application process easier. Through an integrated, AI-driven method, the system is meant to make job seekers more efficient, organized, and ready for work. The platform consists of three core components:
1. AI-Powered Resume Tailoring System
  I. Users can upload their portfolio or resume once, and the system will generate a customized resume for each job description they provide.
  II. The backend, developed with FastAPI, integrates with OpenAI’s API to process job descriptions and refine resumes accordingly, ensuring relevance and optimization.
  III. The generated resumes are converted into PDF format and sent to the frontend, built with React, where users can download and review them.
  IV. The system employs secure cloud storage (e.g., AWS S3, Firebase Storage) to manage and retrieve user resumes efficiently.
2. Job Application Tracking Dashboard
  I. Provides an organized interface to monitor job applications, ensuring users stay on top of their opportunities.
  II. Each entry includes: - Company Name - AI-Tailored Resume Download Link - Application Status Checkboxes: "Applied" and "Rejected"
  III. If marked as Rejected, the entry is automatically removed from the list to declutter and focus on active applications.
  IV. Backend stores tracking data using PostgreSQL or MongoDB, ensuring persistence and scalability.
  V. State management with Redux or React Context API ensures seamless data flow between components.
3. AI-Driven Mock Interview Chatbot
  I. A conversational chatbot simulates real interview scenarios, helping users prepare for job interviews.
  II. Features: - Dynamic Questioning: Adjusts questions based on job role, industry, and experience level. - Real-time Feedback: Provides suggestions on response improvement and delivery. - Performance Analytics: Tracks user progress over multiple sessions.
  III. Built using FastAPI for backend logic, WebSockets for real-time interaction, and OpenAI’s GPT-based API for natural language processing.
  IV. Chatbot UI integrates React with TailwindCSS for an intuitive and engaging user experience. 

## Tech Stack Overview:
1. Frontend: React, TypeScript, TailwindCSS, Redux/Context API
2. Backend: FastAPI, OpenAI API, WebSockets
3. Database: MySQL RDS, DynamoDb, Faiss
4. Resume Parsing: PyMuPDF, docx2txt, SpaCy
5. Messaging Queues: AWS SQS
6. AI Resume Optimization: OpenAI GPT, Langchain
7. Cloud Storage & Deployment: AWS services for hosting (AWS Lambda, S3)

## Team members

1. Sai Aparanji Nemmani
2. Haritha Injam
3. Sushma Shivani Nukala 
4. Sreenidhi Gurunathan
5. Mrunaldhar Bathula
6. Manikanta Soma Aditya Kavuluri
7. Aishwarya Policherla Venkataramanaiah
8. Abhinav Ravichandran
