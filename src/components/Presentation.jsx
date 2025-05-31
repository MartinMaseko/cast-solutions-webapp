import { useLocation, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { ref as dbRef, get } from "firebase/database";
import { database } from "../firebaseConfig";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import logo from "./assets/logo.png";
import spinner from './assets/spinner.gif';

function isImage(url) {
  return /\.(jpe?g|png|gif|bmp|webp)$/i.test(url);
}

function isVideo(url) {
  return /\.(mp4|webm|ogg|mov)$/i.test(url);
}

export default function Presentation() {
  const { listName } = useParams();
  const location = useLocation();
  const [favorites, setFavorites] = useState(location.state?.favorites || []);
  const [loading, setLoading] = useState(!location.state?.favorites);
  const [selectedDetail, setSelectedDetail] = useState(null);

  useEffect(() => {
    // Only fetch if not coming from navigation
    if (!location.state?.favorites) {
      (async () => {
        setLoading(true);
        // 1. Get all favorite IDs
        const favSnapshot = await get(dbRef(database, "favorites"));
        const favIds = favSnapshot.exists() ? Object.keys(favSnapshot.val()) : [];

        // 2. Get all submissions for this list
        const subsSnapshot = await get(dbRef(database, `lists/${listName}/submissions`));
        const allSubs = subsSnapshot.exists() ? subsSnapshot.val() : {};

        // 3. Filter submissions to only those in favorites
        const favActors = Object.entries(allSubs)
          .filter(([id]) => favIds.includes(id))
          .map(([id, data]) => ({ id, ...data }));

        setFavorites(favActors);
        setLoading(false);
      })();
    }
  }, [listName, location.state]);

  const handleViewDetail = (actor) => {
    setSelectedDetail(actor);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToList = () => {
    setSelectedDetail(null);
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "40vh" }}>
      <img src={spinner} alt="Loading..." style={{ width: 60, height: 60 }} />
    </div>
  );

  return (
    <div className="details-page presentation-page">
      <img src={logo} alt="Logo" className="logo presentation-logo" />
      <h2 className="presentation-title">Shortlisted Actors: {listName}</h2>
      <h3 className="company-title">Cast Solutions</h3>
      <h4 className="company-number"> 082 323 4569</h4>
      <h4 className="company-email">info@castsolutions.com</h4>
      <div className="presentation-list">
        {favorites.length === 0 && (
          <p className="presentation-empty">No favorites selected for this list.</p>
        )}

        {selectedDetail ? (
          <div className="presentation-card selected-detial">
            <h3 className="presentation-actor-name">{selectedDetail.name} {selectedDetail.surname}</h3>
            <p><strong>Date of Birth:</strong> {selectedDetail.dateOfBirth}</p>
            <p><strong>Gender:</strong> {selectedDetail.gender}</p>
            <p><strong>Age:</strong> {selectedDetail.age}</p>
            <p><strong>Ethnicity:</strong> {selectedDetail.ethnicity}</p>
            <p><strong>Contact:</strong> {selectedDetail.contact}</p>
            <p><strong>Social Media:</strong> {selectedDetail.socialMedia || "Not provided"}</p>
            <p><strong>Actor Number:</strong> {selectedDetail.auditionNumber || "—"}</p>
            <p><strong>Agency:</strong> {selectedDetail.agency}</p>
            <p><strong>Agency Email:</strong> {selectedDetail.agencyEmail}</p>
            <p><strong>Height:</strong> {selectedDetail.height}</p>
            <p><strong>T-shirt Size:</strong> {selectedDetail.tshirtSize}</p>
            <p><strong>Waist Size:</strong> {selectedDetail.waistSize}</p>
            <p><strong>Pants Size:</strong> {selectedDetail.pantsSize}</p>
            <p><strong>Dress Size:</strong> {selectedDetail.dressSize}</p>
            <p><strong>Shoe Size:</strong> {selectedDetail.shoeSize}</p>
            <p><strong>Work History:</strong> {selectedDetail.workHistory}</p>
            <p><strong>Valid Work Visa:</strong> {selectedDetail.workVisa}</p>
            <p><strong>Criminal Record:</strong> {selectedDetail.criminalRecord}</p>
            <p><strong>Driver's License:</strong> {selectedDetail.driversLicense}</p>
            <p><strong>Availability:</strong> {selectedDetail.availability}</p>
            {selectedDetail.images && selectedDetail.images.filter(isImage).length > 0 && (
              <Slider
                dots={true}
                arrows={false}
                infinite={false}
                speed={500}
                slidesToShow={1}
                slidesToScroll={1}
                className="presentation-slider"
              >
                {selectedDetail.images.filter(isImage).map((img, idx) => (
                  <div key={idx}>
                    <img
                      src={img}
                      alt={`Actor ${selectedDetail.name} ${idx + 1}`}
                      className="presentation-image"
                    />
                  </div>
                ))}
              </Slider>
            )}
            {selectedDetail.video && isVideo(selectedDetail.video) && (
              <div className="presentation-video-wrapper">
                <video
                  src={selectedDetail.video}
                  controls
                  className="presentation-video"
                />
              </div>
            )}
            <button onClick={handleBackToList} style={{ marginTop: "20px" }}>
              Back to Presentation
            </button>
          </div>
        ) : (
          favorites.map(actor => (
            <div className="presentation-card" key={actor.id}>
              <h3 className="presentation-actor-name">{actor.name} {actor.surname}</h3>
              <p className="presentation-actor-info"><strong>Actor Number:</strong> {actor.auditionNumber || "—"}</p>
              <p className="presentation-actor-info"><strong>Height:</strong> {actor.height ? `${actor.height} cm` : "—"}</p>
              <button
                className="presentation-view-btn"
                style={{ marginBottom: "1rem" }}
                onClick={() => handleViewDetail(actor)}
              >
                View Details
              </button>
              <div className="presentation-images">
                {actor.images && actor.images.filter(isImage).length > 0 && (
                  <Slider
                    dots={true}
                    arrows={false}
                    infinite={false}
                    speed={500}
                    slidesToShow={1}
                    slidesToScroll={1}
                    className="presentation-slider"
                  >
                    {actor.images.filter(isImage).map((img, idx) => (
                      <div key={idx}>
                        <img
                          src={img}
                          alt={`Actor ${actor.name} ${idx + 1}`}
                          className="presentation-image"
                        />
                      </div>
                    ))}
                  </Slider>
                )}
              </div>
              {actor.video && isVideo(actor.video) && (
                <div className="presentation-video-wrapper">
                  <video
                    src={actor.video}
                    controls
                    className="presentation-video"
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "center", margin: "2rem 0" }}>
        <button
          className="presentation-share-btn"
          onClick={() => {
            const url = window.location.href;
            if (navigator.share) {
              navigator.share({
                title: `Shortlisted Actors: ${listName}`,
                url,
              });
            } else {
              navigator.clipboard.writeText(url);
              alert("Presentation link copied to clipboard!");
            }
          }}
        >
          Share Presentation
        </button>
    </div>
    </div>
  );
}