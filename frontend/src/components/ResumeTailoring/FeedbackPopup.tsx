import React, { useEffect, useState } from "react";
import "./FeedbackPopup.css";
import axios from "axios";
import api from "../../axiosInstance";

type MoodType = "happy" | "sad" | null;

const FeedbackPopup: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<MoodType>(null);
  // const [savedToTracker, setSavedToTracker] = useState<boolean>(false);
  // const [showTrackerPrompt, setShowTrackerPrompt] = useState<boolean>(false);
  // const [showFeedbackBox, setShowFeedbackBox] = useState<boolean>(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  // const [canClose, setCanClose] = useState(false);
  const username =
    localStorage.getItem("username") || sessionStorage.getItem("username");
  // useEffect(() => {
  //   if (selectedMood === "happy") {
  //     setCanClose(true);
  //   } else if (selectedMood === "sad" && feedbackText.trim().length > 0) {
  //     // Post only when sad and has feedback
  //     axios
  //       .post(
  //         `http://localhost:8000/feedback?username=${username}`,
  //         new FormData().append("message", feedbackText)
  //       )
  //       .then(() => {
  //         setCanClose(true);
  //       })
  //       .catch((err) => {
  //         console.error("Error sending feedback:", err);
  //       });
  //   } else {
  //     setCanClose(false);
  //   }
  // }, [selectedMood, feedbackText]);
  useEffect(() => {
    if (submitted) {
      const timeout = setTimeout(() => {
        window.location.reload(); // or use props to close modal
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [submitted]);

  const handleMoodSelect = (mood: MoodType) => {
    setSelectedMood(mood);
    // setSavedToTracker(false);
    if (mood === "happy") {
      // setShowTrackerPrompt(true);
      // setShowFeedbackBox(false);
      // } else if (mood === "sad") {
      // setShowTrackerPrompt(false);
      // setShowFeedbackBox(true);
      setSubmitted(true);
    }
  };

  // const handleTrackerSave = (): void => {
  //   setSavedToTracker(true);
  // };
  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) return;

    try {
      const formData = new FormData();
      formData.append("message", feedbackText);
      // await axios.post(
      //   `http://localhost:8000/feedback?username=${username}`,
      //   formData
      // );

      await api.post(`/feedback?username=${username}`, formData);

      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  return (
    // <div className="ff-popup">
    //   {canClose && (
    //     <button
    //       className="ff-close-btn"
    //       aria-label="Close feedback popup"
    //       onClick={() => window.location.reload()}
    //     >
    //       ✖
    //     </button>
    //   )}

    //   <h2 className="ff-heading">Feedback</h2>
    //   <p className="ff-question">
    //     Are you satisfied with your optimized resume?
    //   </p>

    //   <div className="ff-emojis">
    //     <div
    //       className={`ff-emoji-wrapper ${
    //         selectedMood === "happy" ? "ff-selected" : ""
    //       }`}
    //       onClick={() => handleMoodSelect("happy")}
    //       aria-label="Satisfied"
    //       role="button"
    //       tabIndex={0}
    //     >
    //       <span className="ff-emoji">😊</span>
    //       {selectedMood === "happy" && <span className="ff-checkmark">✔️</span>}
    //     </div>

    //     <div
    //       className={`ff-emoji-wrapper ${
    //         selectedMood === "sad" ? "ff-selected" : ""
    //       }`}
    //       onClick={() => handleMoodSelect("sad")}
    //       aria-label="Not satisfied"
    //       role="button"
    //       tabIndex={0}
    //     >
    //       <span className="ff-emoji">😟</span>
    //       {selectedMood === "sad" && <span className="ff-checkmark">✔️</span>}
    //     </div>
    //   </div>

    //   {showTrackerPrompt && (
    //     <div className="ff-tracker-box">
    //       <p className="ff-subquestion">
    //         Would you like to save this resume to your tracker?
    //       </p>
    //       <div className="ff-tracker-buttons">
    //         <button onClick={handleTrackerSave} className="ff-btn ff-btn-yes">
    //           Yes ✅
    //         </button>
    //         <button className="ff-btn ff-btn-no">No ❌</button>
    //       </div>
    //       {savedToTracker && (
    //         <p className="ff-success-msg">
    //           Resume has been added to your tracker.
    //         </p>
    //       )}
    //     </div>
    //   )}

    //   {showFeedbackBox && (
    //     <div className="ff-feedback-box">
    //       <label htmlFor="ff-feedback-text" className="ff-label">
    //         We’d appreciate your feedback.
    //       </label>
    //       <textarea
    //         id="ff-feedback-text"
    //         className="ff-textarea"
    //         placeholder="What can we improve? (required)"
    //         value={feedbackText}
    //         onChange={(e) => setFeedbackText(e.target.value)}
    //         required
    //         aria-label="Feedback text area"
    //       />
    //       <p className="ff-thank-msg">
    //         Thank you for your input. We’re always working to improve.
    //       </p>
    //     </div>
    //   )}
    // </div>
    <>
      <div className="ff-overlay" />
      <div className="ff-popup">
        {!submitted ? (
          <>
            <h2 className="ff-heading">Feedback</h2>
            <p className="ff-question">
              Are you satisfied with your optimized resume?
            </p>

            <div className="ff-emojis">
              <div
                className={`ff-emoji-wrapper ${
                  selectedMood === "happy" ? "ff-selected" : ""
                }`}
                onClick={() => handleMoodSelect("happy")}
              >
                <span className="ff-emoji">😊</span>
              </div>
              <div
                className={`ff-emoji-wrapper ${
                  selectedMood === "sad" ? "ff-selected" : ""
                }`}
                onClick={() => handleMoodSelect("sad")}
              >
                <span className="ff-emoji">😟</span>
              </div>
            </div>

            {selectedMood === "sad" && (
              <div className="ff-feedback-box">
                <label htmlFor="ff-feedback-text" className="ff-label">
                  What can we improve?
                </label>
                <textarea
                  id="ff-feedback-text"
                  className="ff-textarea"
                  placeholder="Enter your feedback"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                />
                <button
                  className="ff-btn-submit"
                  onClick={handleSubmitFeedback}
                  disabled={!feedbackText.trim()}
                >
                  Submit Feedback
                </button>
              </div>
            )}
          </>
        ) : (
          <p
            className="ff-thank-msg"
            style={{ textAlign: "center", fontWeight: "bold" }}
          >
            🎉 Thanks for your feedback!
          </p>
        )}
      </div>
    </>
  );
};

export default FeedbackPopup;
