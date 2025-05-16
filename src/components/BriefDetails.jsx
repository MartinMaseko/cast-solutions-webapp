import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { database } from "../firebaseConfig";
import "./caststyle.css";
import logo from "./assets/logo.png";

/**
 * Displays the details of a specific brief, including reference images, roles, notes, and other information.
 * Fetches brief data from the database using the ID from the URL parameters.
 * Provides an image slider for reference images, and actions to submit an audition or share the brief link.
 *
 * @component
 *
 * @returns {JSX.Element} The rendered brief details page.
 *
 * @example
 * // Usage in a route
 * <Route path="/brief/:id" element={<BriefDetails />} />
 */
export default function BriefDetails() {
  const { id } = useParams();
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBrief = async () => {
      const briefRef = ref(database, `briefs/${id}`);
      const snapshot = await get(briefRef);
      if (snapshot.exists()) {
        setBrief(snapshot.val());
      }
      setLoading(false);
    };
    fetchBrief();
  }, [id]);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === brief.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const previousImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? brief.images.length - 1 : prevIndex - 1
    );
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  if (loading) return <div className="details-page">Loading...</div>;
  if (!brief) return <div className="details-page">Brief not found.</div>;

  return (
    <div className="details-page">
      <img src={logo} alt="Logo" className="logo" />
      
      <div className="brief-details">
        <h2>{brief.title}</h2>
        
        <div className="brief-info">
          <p><strong>Agency:</strong> {brief.agency}</p>
          <p><strong>Shoot:</strong> {brief.shoot}</p>
          <p><strong>Callback:</strong> {brief.callBack || 'Not specified'}</p>
          <p><strong>Wardrobe Requirements:</strong> {brief.wardrobe || 'Not specified'}</p>
          <p><strong>Media Usage:</strong> {brief.media || 'Not specified'}</p>
          <p><strong>Venue:</strong> {brief.venue}</p>
          <p><strong>Date:</strong> {new Date(brief.date).toLocaleDateString()}</p>
          <p><strong>Rate:</strong> {brief.rate}</p>
        </div>

        {brief.images && brief.images.length > 0 && (
          <div className="image-slider">
            <h3>Reference Images</h3>
            <div className="slider-container">
              {brief.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img.startsWith('http') ? img : `${process.env.REACT_APP_API_URL}${img}`}
                  alt={`Reference ${idx + 1}`}
                  className={`slider-image ${idx === currentImageIndex ? 'active' : ''}`}
                />
              ))}
              <button className="slider-button prev-button" onClick={previousImage}>
                &#8249;
              </button>
              <button className="slider-button next-button" onClick={nextImage}>
                &#8250;
              </button>
            </div>
            <div className="slider-dots">
              {brief.images.map((_, idx) => (
                <span
                  key={idx}
                  className={`dot ${idx === currentImageIndex ? 'active' : ''}`}
                  onClick={() => goToImage(idx)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="brief-sections">
          <div className="section">
            <h3>Roles Required</h3>
            <div className="content-box">
              {brief.roles}
            </div>
          </div>

          <div className="section">
            <h3>Additional Notes</h3>
            <div className="content-box">
              {brief.notes || 'No additional notes'}
            </div>
          </div>

          <div className="section">
            <h3>Detailed Brief</h3>
            <div 
              className="brief-content content-box"
              dangerouslySetInnerHTML={{ __html: brief.content }}
            />
          </div>
        </div>

        <div className="brief-actions">
          <button onClick={() => navigate('/castform')}>
            Submit Audition
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Link copied to clipboard!");
            }}
          >
            Share Brief
          </button>
        </div>
      </div>
    </div>
  );
}