import React from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function DetailPage({ submissions }) {
  const { id } = useParams(); // Get the selected detail's index from the URL
  const navigate = useNavigate();
  const submission = submissions[id]; // Fetch the submission based on the index

  if (!submission) {
    return <p>Detail not found</p>; // Handle invalid or missing submissions
  }

  return (
    <div style={{ border: "1px solid black", margin: "10px", padding: "10px" }}>
      <h2>Submission Details</h2>
      <p><strong>Name:</strong> {submission.name}</p>
      <p><strong>Surname:</strong> {submission.surname}</p>
      <p><strong>Contact:</strong> {submission.contact}</p>
      <p><strong>Social Media:</strong> {submission.socialMedia}</p>
      {submission.video && (
        <div>
          <h4>Uploaded Video:</h4>
          <video
            src={URL.createObjectURL(submission.video)}
            controls
            style={{ width: "100%" }}
          />
        </div>
      )}
      <button onClick={() => navigate("/")} style={{ marginTop: "10px" }}>
        Back to Home
      </button>
      <p style={{ marginTop: "10px" }}>
        <strong>Share this link:</strong>{" "}
        <a href={window.location.href} target="_blank" rel="noopener noreferrer">
          {window.location.href}
        </a>
      </p>
    </div>
  );
}