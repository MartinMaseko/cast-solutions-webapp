import { useState, useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { ref as dbRef, onValue, set, get, serverTimestamp, update, remove } from "firebase/database";
import { database } from "../firebaseConfig";
import Footer from "./Footer";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import NavBar from './NavBar';

const emptyStarIcon = "https://img.icons8.com/ios/35/c52727/star--v1.png";
const filledStarIcon = "https://img.icons8.com/material-sharp/35/c52727/filled-star.png";

/**
 * DetailsPage component for managing and displaying audition lists and their submissions.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {Function} props.clearSubmissions - Function to clear all submissions for a given list.
 * @param {string[]} props.lists - Array of audition list names.
 * @param {Function} props.addList - Function to add a new audition list.
 *
 * @returns {JSX.Element} The rendered DetailsPage component.
 *
 * @description
 * This component allows users to:
 * - Create new audition lists.
 * - View, filter, and search through existing audition lists.
 * - Expand a list to view its submissions.
 * - Filter submissions by gender and favorites.
 * - Paginate through submissions.
 * - View detailed information for a submission, including images and video.
 * - Mark submissions as favorites.
 * - Share or delete individual submissions.
 * - Clear all submissions from a list.
 *
 * State:
 * - submissions: Array of current submissions for the expanded list.
 * - favorites: Array of favorite submission IDs.
 * - selectedDetail: The currently selected submission for detail view.
 * - newListName: Name for a new audition list.
 * - expandedList: Name of the currently expanded audition list.
 * - isLoading: Loading state for creating a new list.
 * - genderFilter: Filter for submission gender.
 * - showFavoritesOnly: Whether to show only favorite submissions.
 * - itemsPerPage: Number of submissions per page.
 * - currentPage: Current page number for pagination.
 * - searchTerm: Search term for filtering lists.
 *
 * Effects:
 * - Fetches lists and submissions from Firebase.
 * - Handles navigation and scrolling to selected lists.
 *
 * Methods:
 * - handleCreateList: Creates a new audition list in Firebase.
 * - handleExpandList: Expands/collapses a list to show/hide submissions.
 * - handleViewDetail: Shows detailed view for a submission.
 * - handleDeleteSubmission: Deletes a submission from Firebase.
 * - handleBackToList: Returns to the list view from detail view.
 * - toggleFavorite: Adds/removes a submission from favorites.
 * - getFilteredLists: Returns lists filtered by search term.
 * - handleShare: Shares a submission link or copies it to clipboard.
 * - getFilteredSubmissions: Returns submissions filtered by gender and favorites.
 * - getPaginatedSubmissions: Returns paginated submissions and total page count.
 */
/**
 * DetailsPage component for managing audition lists, actor submissions, and favorites.
 * 
 * This component allows users to:
 * - Create new audition lists.
 * - View, search, and manage actor submissions for each audition.
 * - Allocate audition numbers to actors.
 * - Mark/unmark submissions as favorites.
 * - Upload images and videos for each submission.
 * - View detailed information for each actor.
 * - Share submission details.
 * - Delete individual submissions or clear all submissions for a list.
 * - Create a presentation from favorite submissions.
 * 
 * @component
 * @param {Object} props
 * @param {Function} props.clearSubmissions - Function to clear all submissions for a given audition list.
 * @param {string[]} props.lists - Array of audition list names.
 * @param {Function} props.addList - Function to add a new audition list.
 * 
 * @returns {JSX.Element} The rendered DetailsPage component.
 */
export default function DetailsPage({ clearSubmissions, lists, addList }) {
  const [submissions, setSubmissions] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [newListName, setNewListName] = useState("");
  const [expandedList, setExpandedList] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const [registrationSearch, setRegistrationSearch] = useState("");
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [mediaUploadId, setMediaUploadId] = useState(null); 
  const [mediaFiles, setMediaFiles] = useState({ images: [], video: null });
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();
  

  // Fetch all submissions once on mount
  useEffect(() => {
    const listsRef = dbRef(database, "lists");
    const unsubscribe = onValue(listsRef, (snapshot) => {
      const data = snapshot.val();
      let all = [];
      if (data) {
        Object.entries(data).forEach(([listName, listData]) => {
          if (listData.submissions) {
            Object.entries(listData.submissions).forEach(([id, value]) => {
              all.push({ id, ...value, audition: listName });
            });
          }
        });
      }
      setAllSubmissions(all);
    });
    return () => unsubscribe();
  }, []);


  // Fetch lists from Firebase
  useEffect(() => {
    const listsRef = dbRef(database, "lists");
    const unsubscribe = onValue(listsRef, (snapshot) => {
      const data = snapshot.val();
      const listsArray = data ? Object.keys(data) : [];
      console.log("Fetched lists: CastHome.jsx", listsArray); // Debugging
    });

    return () => unsubscribe();
  }, []);

  // Fetch submissions for the expanded list
  useEffect(() => {
    if (expandedList) {
      const submissionsRef = dbRef(database, `lists/${expandedList}/submissions`);
      const unsubscribe = onValue(submissionsRef, (snapshot) => {
        const data = snapshot.val();
        const submissionsArray = data
          ? Object.entries(data).map(([id, value]) => ({ id, ...value }))
          : [];
        setSubmissions(submissionsArray);
      });

      return () => unsubscribe();
    }
  }, [expandedList]);

  useEffect(() => {
    if (location.state?.selectedList) {
      setExpandedList(location.state.selectedList);

      window.history.replaceState({}, document.title);
      
      setTimeout(() => {
        const listElement = document.querySelector(`[data-list="${location.state.selectedList}"]`);
        if (listElement) {
          listElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [location.state]);

  useEffect(() => {
    const favRef = dbRef(database, "favorites");
    const unsubscribe = onValue(favRef, (snapshot) => {
      const data = snapshot.val();
      setFavorites(data ? Object.keys(data) : []);
    });
    return () => unsubscribe();
  }, []);

  const handleUploadMedia = async (submissionId, audition) => {
    setUploading(true);
    try {
      const formData = new FormData();
      mediaFiles.images.forEach(img => formData.append("images", img));
      if (mediaFiles.video) {
        formData.append("video", mediaFiles.video);
      }

      const uploadRes = await fetch("https://cast-solutions-webapp-production.up.railway.app/upload", {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!uploadRes.ok) {
        throw new Error(`Upload failed: ${uploadRes.statusText}`);
      }

      const uploadData = await uploadRes.json();
      const imageUrls = uploadData.images || [];
      const videoUrl = uploadData.video || null;

      // Save URLs to Firebase
      const submissionRef = dbRef(database, `lists/${audition}/submissions/${submissionId}`);
      await update(submissionRef, {
        images: imageUrls,
        video: videoUrl,
      });

      setMediaUploadId(null);
      setMediaFiles({ images: [], video: null });
      alert("Media uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateNumber = async (audition, actorId) => {
    const actorsInList = allSubmissions.filter(sub => sub.audition === audition);
    const takenNumbers = actorsInList
      .map(actor => actor.auditionNumber)
      .filter(num => !!num)
      .sort((a, b) => a - b);

    let nextNumber = 1;
    while (takenNumbers.includes(nextNumber)) {
      nextNumber++;
    }

    const submissionRef = dbRef(database, `lists/${audition}/submissions/${actorId}`);
    await update(submissionRef, { auditionNumber: nextNumber });
  };

  const filteredRegistrations = (actors) => {
    return actors.filter(actor =>
      (actor.name + " " + actor.surname).toLowerCase().includes(registrationSearch.toLowerCase())
    );
  };

  const handleCreateList = async () => {
    if (newListName.trim() === "") {
      alert("List name cannot be empty.");
      return;
    }

    setIsLoading(true);
    try {
      const listsRef = dbRef(database, `lists/${newListName}`);
      
      // First check if list already exists
      const snapshot = await get(listsRef);
      if (snapshot.exists()) {
        alert("A list with this name already exists.");
        return;
      }

      // Create the list in Firebase
      await set(listsRef, { 
        submissions: {},
        createdAt: serverTimestamp()
      });

      // Verify the write was successful
      const verifySnapshot = await get(listsRef);
      if (!verifySnapshot.exists()) {
        throw new Error("Failed to verify list creation");
      }
      
      setNewListName("");

    } catch (error) {
      console.error("Error creating list in Firebase:", error);
      alert("Failed to create list. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpandList = (listName) => {
    setExpandedList(expandedList === listName ? null : listName); // Toggle list expansion
    setSelectedDetail(null); // Reset selected detail when switching lists
  };

  const handleViewDetail = (submission) => {
    setSelectedDetail(submission);
    document.querySelector('.audition-list').scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleDeleteSubmission = async (submissionId) => {
    if (!expandedList || !submissionId) return;
    try {
      const submissionRef = dbRef(database, `lists/${expandedList}/submissions/${submissionId}`);
      await set(submissionRef, null);
      console.log('Submission deleted successfully');
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('Failed to delete submission. Please try again.');
    }
  };

  const handleBackToList = () => {
    setSelectedDetail(null);
  };

  const toggleFavorite = (id) => {
    const favRef = dbRef(database, `favorites/${id}`);
    if (favorites.includes(id)) {
      remove(favRef);
      setFavorites(favorites.filter((favId) => favId !== id));
    } else {
      set(favRef, true);
      setFavorites([...favorites, id]);
    }
  };

  const getFilteredLists = () => {
    return lists.filter(list => 
      list.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleShare = (id) => {
    const shareUrl = `${window.location.origin}/details/${id}`;
    if (navigator.share) {
      navigator.share({
        title: "Submission Details",
        text: "Check out this submission!",
        url: shareUrl,
      }).catch((error) => console.error("Error sharing:", error));
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    }
  };

  const getFilteredSubmissions = () => {
    return submissions.filter(submission => favorites.includes(submission.id));
  };

  return (
    <>
      
    <div className="details-page">
      <NavBar lists={lists} />

      {/* List Management */}
      <div className="list-management">
        <h3>Create a Audition</h3>
        <input
          type="text"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder="Enter audition name"
          className="audition-input"
        />
        <button 
          onClick={handleCreateList} 
          disabled={isLoading}
          className="createAudition-button"
        >
          {isLoading ? "Creating..." : "Create Audition"}
        </button>
      </div>

      {/* Render Lists */}
      <div className="main-content">
          <div className="audition-Registrations">
            <h3>Audition Registrations</h3>
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Search actor name or surname..."
                value={registrationSearch}
                onChange={e => setRegistrationSearch(e.target.value)}
                style={{ marginBottom: "1rem" }}
              />
            </div>
            {lists.map(audition => {
              const actors = allSubmissions.filter(sub => sub.audition === audition);
              const filteredActors = filteredRegistrations(actors);
              if (filteredActors.length === 0) return null;
              return (
                <div key={audition} className="audition-group">
                  <h4 style={{ color: "#C52727", margin: "1rem 0" }}>{audition}</h4>
                  <div className="table-responsive">
                    <table className="audition-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Name</th>
                          <th>Surname</th>
                          <th>Audition</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredActors.map((actor, idx) => (
                          <tr key={actor.id}>
                            <td>
                              {actor.auditionNumber || ""}
                            </td>
                            <td>{actor.name}</td>
                            <td>{actor.surname}</td>
                            <td>{audition}</td>
                            <td>
                              <button
                                className="generate-number-btn"
                                onClick={() => handleGenerateNumber(audition, actor.id)}
                                disabled={!!actor.auditionNumber}
                              >
                                {actor.auditionNumber ? "Allocated" : "Generate Number"}
                              </button>
                            </td>
                            <td>
                              <img
                                className="favorite-icon"
                                src={favorites.includes(actor.id) ? filledStarIcon : emptyStarIcon}
                                alt={favorites.includes(actor.id) ? "Filled Star" : "Empty Star"}
                                style={{ cursor: "pointer" }}
                                onClick={() => toggleFavorite(actor.id)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="audition-list">
            <h3>Auditions</h3>
            <div className="search-container">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search audition lists..."
                className="search-input"
              />
            </div>
            {getFilteredLists().map((list, index) => (
              <div 
                key={index} 
                style={{ marginBottom: "10px" }}
                data-list={list} 
              >
                <div
                  onClick={() => handleExpandList(list)}
                  className={`audition-container ${expandedList === list ? 'expanded' : ''}`}
                >
                  {list}
                </div>
                {expandedList === list && (
                  <div>
                    {selectedDetail ? (
                      // Render the selected detail
                      <div className="selected-detail">
                        <p>
                          <strong>Name:</strong> {selectedDetail.name}
                        </p>
                        <p>
                          <strong>Surname:</strong> {selectedDetail.surname}
                        </p>
                        <p>
                          <strong>Date of Birth:</strong> {selectedDetail.dateOfBirth}
                        </p>
                        <p>
                          <strong>Gender:</strong> {selectedDetail.gender}
                        </p>
                        <p>
                          <strong>Age:</strong> {selectedDetail.age}
                        </p>
                        <p>
                          <strong>Ethnicity:</strong> {selectedDetail.ethnicity}
                        </p>
                        <p>
                          <strong>Contact:</strong> {selectedDetail.contact}
                        </p>
                        <p>
                          <strong>Social Media:</strong>{' '}
                          {selectedDetail.socialMedia ? (
                            <a 
                              href={selectedDetail.socialMedia.startsWith('http') ? 
                                selectedDetail.socialMedia : 
                                `https://${selectedDetail.socialMedia}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: '#C52727',
                                textDecoration: 'none'
                              }}
                              onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                              onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                            >
                              {selectedDetail.socialMedia}
                            </a>
                          ) : (
                            'Not provided'
                          )}
                        </p>
                        <p>
                          <strong>Actor Number:</strong> {selectedDetail.actorNumber}
                        </p>
                        <p>
                          <strong>Agency:</strong> {selectedDetail.agency}
                        </p>
                        <p>
                          <strong>Agency Email:</strong> {selectedDetail.agencyEmail}
                        </p>
                        <p>
                          <strong>Height:</strong> {selectedDetail.height}
                        </p>
                        <p>
                          <strong>T-shirt Size:</strong> {selectedDetail.tshirtSize}
                        </p>
                        <p>
                          <strong>Waist Size:</strong> {selectedDetail.waistSize}
                        </p>
                        <p>
                          <strong>Pants Size:</strong> {selectedDetail.pantsSize}
                        </p>
                        <p>
                          <strong>Dress Size:</strong> {selectedDetail.dressSize}
                        </p>
                        <p>
                          <strong>Shoe Size:</strong> {selectedDetail.shoeSize}
                        </p>
                        <p>
                          <strong>Work History:</strong> {selectedDetail.workHistory}
                        </p>
                        <p>
                          <strong>Valid Work Visa:</strong> {selectedDetail.workVisa}
                        </p>
                        <p>
                          <strong>Criminal Record:</strong> {selectedDetail.criminalRecord}
                        </p>
                        <p>
                          <strong>Driver's License:</strong> {selectedDetail.driversLicense}
                        </p>
                        <p>
                          <strong>Availability:</strong> {selectedDetail.availability}
                        </p>
                        {selectedDetail.images && selectedDetail.images.length > 0 && (
                          <div className="media-slider-wrapper">
                            <Slider
                              dots={true}
                              arrows={false}
                              infinite={false}
                              speed={500}
                              slidesToShow={1}
                              slidesToScroll={1}
                            >
                              {selectedDetail.images.map((imgUrl, idx) => (
                                <div key={idx}>
                                  <img
                                    src={imgUrl}
                                    alt={`Actor Media ${idx}`}
                                    className="detail-image"
                                  />
                                </div>
                              ))}
                            </Slider>
                          </div>
                        )}

                        {selectedDetail.video && (
                          <div style={{ marginTop: "20px" }}>
                            <video
                              src={selectedDetail.video}
                              controls
                              className="detail-video"
                            />
                          </div>
                        )}
                        <div className="detail-actions">
                          <button onClick={handleBackToList} style={{ marginTop: "20px" }}>
                            Back to List
                          </button>
                          <button onClick={() => handleShare(selectedDetail.id)} style={{ marginLeft: "10px" }}>
                            Share
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Render the full list of submissions with only name, surname, images, and videos
                      <div className="favorite-list">
                        {getFilteredSubmissions().map((submission, index) => (
                          <div
                            key={submission.id}
                            className="submission-item"
                          >
                            <div className="submission-info">
                              <p>
                                {submission.auditionNumber ? `#${submission.auditionNumber}` : ""}
                              </p>
                                <p>
                                  {submission.name}
                                </p>
                                <p>
                                  {submission.surname}
                                </p>
                            </div>
                            <div className="submission-btn-options">
                              <button
                                onClick={() => handleViewDetail(submission)}
                                style={{ marginLeft: "10px" }}
                              >
                                View Details
                              </button>
                              <button onClick={() => setMediaUploadId(submission.id)}>
                                Add Media
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to delete this submission?')) {
                                    handleDeleteSubmission(submission.id);
                                  }
                                }}
                                className="delete-button"
                              >
                                Delete
                              </button>
                              <img
                              className="favorite-icon"
                                src={favorites.includes(submission.id) ? filledStarIcon : emptyStarIcon}
                                alt={favorites.includes(submission.id) ? "Filled Star" : "Empty Star"}
                                onClick={() => toggleFavorite(submission.id)}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                              />
                            </div>
                             {/* Media Upload Modal */}
                              {mediaUploadId === submission.id && (
                                <div className="media-upload-modal">
                                  <h4>Upload Images</h4>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={e => setMediaFiles(prev => ({ ...prev, images: Array.from(e.target.files) }))}
                                  />
                                  <h4>Upload Audition Video</h4>
                                  <input
                                    type="file"
                                    accept="video/*"
                                    onChange={e => setMediaFiles(prev => ({ ...prev, video: e.target.files[0] }))}
                                  />
                                  <button onClick={() => handleUploadMedia(submission.id, expandedList)} disabled={uploading}>
                                    {uploading ? "Uploading..." : "Upload"}
                                  </button>
                                  <button onClick={() => { setMediaUploadId(null); setMediaFiles({ images: [], video: null }); }}>
                                    Cancel
                                  </button>
                                </div>
                              )}
                          </div>
                        ))}
                        <div className="bottom-controls">
                          <button
                            className="create-presentation-button"
                            onClick={async () => {
                              try {
                                // Get favorite submissions for this list
                                const favsForList = submissions.filter(sub => favorites.includes(sub.id));
                                
                                // Store presentation data with full actor details
                                await set(dbRef(database, `presentations/${expandedList.trim()}`), {
                                  favorites: favsForList,
                                  createdAt: serverTimestamp(),
                                  listName: expandedList.trim()
                                });

                                // Navigate with the same data
                                navigate(`/presentation/${expandedList.trim()}`, { 
                                  state: { favorites: favsForList }
                                });
                              } catch (error) {
                                console.error("Error creating presentation:", error);
                                alert("Failed to create presentation");
                              }
                            }}
                          >
                            Create Presentation
                          </button>
                          <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to clear all submissions for ${expandedList}?`)) {
                              clearSubmissions(expandedList);
                            }
                          }}
                          className="clear-button"
                        >
                          Clear {expandedList} Submissions
                        </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <Footer />
    </div>
    </>
  );
}