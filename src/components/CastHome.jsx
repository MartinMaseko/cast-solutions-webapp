import React, { useState, useEffect } from "react";
import Slider from "react-slick"; // Import the slider component
import { ref, onValue } from "firebase/database";
import { database } from "../firebaseConfig";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function DetailsPage({ clearSubmissions }) {
  const [submissions, setSubmissions] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedDetail, setSelectedDetail] = useState(null);

  useEffect(() => {
    const submissionsRef = ref(database, "submissions");
    const unsubscribe = onValue(submissionsRef, (snapshot) => {
      const data = snapshot.val();
      const submissionsArray = data
        ? Object.entries(data).map(([id, value]) => ({ id, ...value }))
        : [];
      setSubmissions(submissionsArray);
    });

    return () => unsubscribe();
  }, []);

  const toggleFavorite = (index) => {
    if (favorites.includes(index)) {
      setFavorites(favorites.filter((fav) => fav !== index));
    } else {
      setFavorites([...favorites, index]);
    }
  };

  const handleViewDetail = (index) => {
    setSelectedDetail(submissions[index]);
  };

  const handleBackToList = () => {
    setSelectedDetail(null);
  };

  // Slider settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
  };

  return (
    <div className="details-page">
      {selectedDetail ? (
        // Render the selected detail
        <div>
          <p><strong>Name:</strong> {selectedDetail.name}</p>
          <p><strong>Surname:</strong> {selectedDetail.surname}</p>
          <p><strong>Contact:</strong> {selectedDetail.contact}</p>
          <p><strong>Social Media:</strong> {selectedDetail.socialMedia}</p>

          {/* Image Slider */}
          {selectedDetail.images && selectedDetail.images.length > 0 && (
            <Slider {...sliderSettings}>
              {selectedDetail.images.map(
                (imageUrl, index) =>
                  imageUrl && (
                    <div key={index}>
                      <img
                        src={`http://localhost:5000${imageUrl}`} // Use the local server URL
                        alt={`Uploaded ${index}`}
                        style={{ width: "100%", height: "auto", borderRadius: "10px" }}
                      />
                    </div>
                  )
              )}
            </Slider>
          )}

          {/* Video */}
          {selectedDetail.video && (
            <div style={{ marginTop: "20px" }}>
              <h4>Video:</h4>
              <video
                src={`http://localhost:5000${selectedDetail.video}`} // Use the local server URL
                controls
                style={{ width: "100%", borderRadius: "10px" }}
              />
            </div>
          )}

          <button onClick={handleBackToList} style={{ marginTop: "20px" }}>
            Back to List
          </button>
          <button onClick={() => toggleFavorite(selectedDetail.id)} style={{ marginLeft: "10px" }}>
            {favorites.includes(selectedDetail.id) ? "Remove from Favorites" : "Add to Favorites"}
          </button>
        </div>
      ) : (
        // Render the full list of submissions with images and videos
        <div>
          {submissions.map((submission, index) => (
            <div key={submission.id}>
              <p><strong>Name:</strong> {submission.name}</p>
              <p><strong>Surname:</strong> {submission.surname}</p>
              <p><strong>Contact:</strong> {submission.contact}</p>
              <p><strong>Social Media:</strong> {submission.socialMedia}</p>

              {/* Image Slider */}
              {submission.images && submission.images.length > 0 && (
                <Slider {...sliderSettings}>
                  {submission.images.map(
                    (imageUrl, idx) =>
                      imageUrl && (
                        <div key={idx}>
                          <img
                            src={`http://localhost:5000${imageUrl}`} // Use the local server URL
                            alt={`Uploaded ${idx}`}
                            style={{ width: "100%", height: "auto", borderRadius: "10px" }}
                          />
                        </div>
                      )
                  )}
                </Slider>
              )}

              {/* Video */}
              {submission.video && (
                <div style={{ marginTop: "20px" }}>
                  <h4>Video:</h4>
                  <video
                    src={`http://localhost:5000${submission.video}`} // Use the local server URL
                    controls
                    style={{ width: "100%", borderRadius: "10px" }}
                  />
                </div>
              )}

              <button onClick={() => toggleFavorite(index)}>
                {favorites.includes(index) ? "Remove from Favorites" : "Add to Favorites"}
              </button>
              <button onClick={() => handleViewDetail(index)} style={{ marginLeft: "10px" }}>
                View Details
              </button>
            </div>
          ))}
          <button onClick={clearSubmissions} style={{ marginTop: "20px" }}>
            Clear All Submissions
          </button>
        </div>
      )}
    </div>
  );
}