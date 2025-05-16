import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { database } from "../firebaseConfig";
import "./caststyle.css";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

/**
 * DetailPage component displays the details of a specific submission.
 *
 * Fetches submission data from Firebase Realtime Database based on the `id` parameter from the URL.
 * Shows all available fields of the submission, including images (with a slider) and video if provided.
 * Handles loading and not-found states.
 * 
 * @component
 * @returns {JSX.Element} The rendered detail page for a submission.
 *
 * @example
 * // Used in a React Router route:
 * <Route path="/details/:id" element={<DetailPage />} />
 *
 * @dependencies
 * - React (useState, useEffect)
 * - react-router-dom (useParams, useNavigate)
 * - Firebase (ref, get, database)
 * - react-slick (Slider)
 * 
 * @remarks
 * - Requires `REACT_APP_API_URL` environment variable for image/video URLs.
 * - Expects `submission.images` to be an array of image URLs.
 * - Expects `submission.video` to be a video URL.
 */
export default function DetailPage() {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    // Search all lists for the submission with this id
    const fetchSubmission = async () => {
      setLoading(true);
      const listsRef = ref(database, "lists");
      const snapshot = await get(listsRef);
      const listsData = snapshot.val();
      if (listsData) {
        for (const listName in listsData) {
          const submissions = listsData[listName].submissions || {};
          if (submissions[id]) {
            setSubmission(submissions[id]);
            setLoading(false);
            return;
          }
        }
      }
      setSubmission(null);
      setLoading(false);
    };
    fetchSubmission();
  }, [id]);

  if (loading) return <div className="details-page">Loading...</div>;
  if (!submission) return <div className="details-page">Submission not found.</div>;

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
  };

  return (
    <div className="details-page" style={{ minHeight: "100vh", padding: "2rem" }}>
      <div className="selected-detial" style={{ maxWidth: 600, margin: "2rem auto", background: "#2A2B38", borderRadius: 10, padding: "2rem", color: "whitesmoke", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
        <h2 style={{ color: "#C52727", textAlign: "center", marginBottom: "2rem" }}>Submission Details</h2>
        <p><strong>Name:</strong> {submission.name}</p>
        <p><strong>Surname:</strong> {submission.surname}</p>
        <p><strong>Date of Birth:</strong> {submission.dateOfBirth}</p>
        <p><strong>Gender:</strong> {submission.gender}</p>
        <p><strong>Age:</strong> {submission.age}</p>
        <p><strong>Ethnicity:</strong> {submission.ethnicity}</p>
        <p><strong>Contact:</strong> {submission.contact}</p>
        <p>
        <strong>Social Media:</strong>{' '}
        {submission.socialMedia ? (
          <a
            href={submission.socialMedia.startsWith('http')
              ? submission.socialMedia
              : `https://${submission.socialMedia}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#C52727',
              textDecoration: 'none',
              wordBreak: 'break-all', // ensures long links wrap
              overflowWrap: 'anywhere',
              display: 'inline-block',
              maxWidth: '100%'
            }}
            onMouseOver={e => (e.target.style.textDecoration = 'underline')}
            onMouseOut={e => (e.target.style.textDecoration = 'none')}
          >
            {submission.socialMedia}
          </a>
        ) : (
          'Not provided'
        )}
      </p>
        <p><strong>Actor Number:</strong> {submission.actorNumber}</p>
        <p><strong>Agency:</strong> {submission.agency}</p>
        <p><strong>Agency Email:</strong> {submission.agencyEmail}</p>
        <p><strong>Height:</strong> {submission.height}</p>
        <p><strong>T-shirt Size:</strong> {submission.tshirtSize}</p>
        <p><strong>Waist Size:</strong> {submission.waistSize}</p>
        <p><strong>Pants Size:</strong> {submission.pantsSize}</p>
        <p><strong>Dress Size:</strong> {submission.dressSize}</p>
        <p><strong>Shoe Size:</strong> {submission.shoeSize}</p>
        <p><strong>Work History:</strong> {submission.workHistory}</p>
        <p><strong>Valid Work Visa:</strong> {submission.workVisa}</p>
        <p><strong>Criminal Record:</strong> {submission.criminalRecord}</p>
        <p><strong>Driver's License:</strong> {submission.driversLicense}</p>
        <p><strong>Availability:</strong> {submission.availability}</p>
        {/* Images */}
        {submission.images && submission.images.length > 0 && (
          <div style={{ margin: "2rem 0" }}>
            <h4 style={{ color: "#C52727" }}>Uploaded Images:</h4>
            <Slider {...sliderSettings}>
              {submission.images.map(
                (imgUrl, idx) =>
                  imgUrl && (
                    <div key={idx}>
                      <img
                        src={imgUrl.startsWith("http") ? imgUrl : `${API_URL}${imgUrl}`}
                        alt={`Uploaded ${idx}`}
                        style={{
                          width: "100%",
                          height: "auto",
                          borderRadius: "10px",
                        }}
                      />
                    </div>
                  )
              )}
            </Slider>
          </div>
        )}

        {submission.video && (
          <div style={{ margin: "2rem 0" }}>
            <h4 style={{ color: "#C52727" }}>Uploaded Video:</h4>
            <video
              src={submission.video.startsWith("http") ? submission.video : `${API_URL}${submission.video}`}
              controls
              style={{ width: "100%", borderRadius: "10px", background: "#000" }}
            />
          </div>
        )}
        <button
          onClick={() => navigate("/")}
          style={{
            marginTop: "20px",
            background: "#C52727",
            color: "whitesmoke",
            border: "none",
            borderRadius: "5px",
            padding: "10px 20px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Back to Home
        </button>
        <p style={{ marginTop: "20px", color: "#C52727", textAlign: "center" }}>
          <strong>Share this link:</strong>{" "}
          <a href={window.location.href} target="_blank" rel="noopener noreferrer" style={{ color: "#C52727" }}>
            {window.location.href}
          </a>
        </p>
      </div>
    </div>
  );
}