import { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import Slider from "react-slick"; 
import { ref, onValue, set, get, serverTimestamp } from "firebase/database";
import { database } from "../firebaseConfig";
import Footer from "./Footer";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import banner from "./assets/castsolutions-banner.png";
import NavBar from './NavBar';

const emptyStarIcon = "https://img.icons8.com/ios/35/c52727/star--v1.png";
const filledStarIcon = "https://img.icons8.com/material-sharp/35/c52727/filled-star.png";

const API_URL = process.env.REACT_APP_API_URL;

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
export default function DetailsPage({ clearSubmissions, lists, addList }) {
  const [submissions, setSubmissions] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [newListName, setNewListName] = useState("");
  const [expandedList, setExpandedList] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [genderFilter, setGenderFilter] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  

  // Fetch lists from Firebase
  useEffect(() => {
    const listsRef = ref(database, "lists");
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
      const submissionsRef = ref(database, `lists/${expandedList}/submissions`);
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

  const handleCreateList = async () => {
    if (newListName.trim() === "") {
      alert("List name cannot be empty.");
      return;
    }

    setIsLoading(true);
    try {
      const listsRef = ref(database, `lists/${newListName}`);
      
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

  const handleViewDetail = (index) => {
    setSelectedDetail(submissions[index]);
      document.querySelector('.audition-list').scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleDeleteSubmission = async (submissionId) => {
    if (!expandedList || !submissionId) return;
    
    if (window.confirm('Are you sure you want to delete this submission?')) {
      try {
        const submissionRef = ref(database, `lists/${expandedList}/submissions/${submissionId}`);
        await set(submissionRef, null);
        console.log('Submission deleted successfully');
      } catch (error) {
        console.error('Error deleting submission:', error);
        alert('Failed to delete submission. Please try again.');
      }
    }
  };

  const handleBackToList = () => {
    setSelectedDetail(null);
  };

  const toggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((favId) => favId !== id));
    } else {
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
    return submissions.filter(submission => {
      const submissionGender = submission.gender ? submission.gender.toLowerCase() : '';
      const filterGenderLower = genderFilter.toLowerCase();
      const matchesGender = genderFilter === 'all' || submissionGender === filterGenderLower;
      const matchesFavorites = !showFavoritesOnly || favorites.includes(submission.id);
      return matchesGender && matchesFavorites;
    });
  };

  const getPaginatedSubmissions = () => {
    const filtered = getFilteredSubmissions();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      submissions: filtered.slice(startIndex, endIndex),
      totalPages: Math.ceil(filtered.length / itemsPerPage)
    };
  };


  // Slider settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
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
        <img src={banner} alt="Banner" className="banner" />
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
                      <div className="selected-detial">
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

                        {/* Image Slider */}
                        {selectedDetail.images && selectedDetail.images.length > 0 && (
                          <Slider {...sliderSettings}>
                            {selectedDetail.images.map(
                              (imageUrl, index) =>
                                imageUrl && (
                                  <div key={index}>
                                    <img
                                      src={`${API_URL}${imageUrl}`}
                                      alt={`Uploaded ${index}`}
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
                        )}

                        {/* Video */}
                        {selectedDetail.video && (
                          <div style={{ marginTop: "20px" }}>
                            <h4>Video:</h4>
                            <video
                              src={`${API_URL}${selectedDetail.video}`}
                              controls
                              style={{ width: "100%", borderRadius: "10px" }}
                            />
                          </div>
                        )}

                        <button onClick={handleBackToList} style={{ marginTop: "20px" }}>
                          Back to List
                        </button>
                        <button onClick={() => handleShare(selectedDetail.id)} style={{ marginLeft: "10px" }}>
                          Share
                        </button>
                      </div>
                    ) : (
                      // Render the full list of submissions with only name, surname, images, and videos
                      <div>
                        <div className="filters-container">
                          <div className="filter-group">
                            <label>Gender: </label>
                            <select 
                              value={genderFilter} 
                              onChange={(e) => setGenderFilter(e.target.value)}
                              className="filter-select"
                            >
                              <option value="all">All</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                          </div>
                          
                          <div className="filter-group">
                            <label>
                              <input
                                type="checkbox"
                                checked={showFavoritesOnly}
                                onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                              />
                              Show Favorites Only
                            </label>
                          </div>
                        </div>

                        {getFilteredSubmissions().map((submission, index) => (
                          <div
                            key={submission.id}
                            className="submission-item"
                          >
                            <p>
                              <strong>Name:</strong> {submission.name}
                            </p>
                            <p>
                              <strong>Surname:</strong> {submission.surname}
                            </p>

                            {/* Image Slider */}
                            {submission.images && submission.images.length > 0 && (
                              <Slider {...sliderSettings}>
                                {submission.images.map(
                                  (imageUrl, idx) =>
                                    imageUrl && (
                                      <div key={idx}>
                                        <img
                                          src={`${API_URL}${imageUrl}`}
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
                            )}

                            {/* Video */}
                            {submission.video && (
                              <div style={{ marginTop: "20px" }}>
                                <h4>Video:</h4>
                                <video
                                  src={`${API_URL}${submission.video}`}
                                  controls
                                  style={{ width: "100%", borderRadius: "10px" }}
                                />
                              </div>
                            )}
                            <div className="submission-btn-options">
                              <button
                                onClick={() => handleViewDetail(index)}
                                style={{ marginLeft: "10px" }}
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => handleDeleteSubmission(submission.id)}
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

                          </div>
                        ))}
                        <div className="bottom-controls">
                          <select
                              value={itemsPerPage}
                              onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                              }}
                              className="filter-select"
                            >
                              <option value={10}>10 per page</option>
                              <option value={20}>20 per page</option>
                            </select>
                          <div className="pagination-controls">
                            <div className="page-buttons">
                              <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="pagination-button"
                              >
                                Previous
                              </button>
                              <span className="page-info">
                                Page {currentPage} of {getPaginatedSubmissions().totalPages}
                              </span>
                              <button
                                onClick={() => setCurrentPage(prev => 
                                  Math.min(prev + 1, getPaginatedSubmissions().totalPages)
                                )}
                                disabled={currentPage === getPaginatedSubmissions().totalPages}
                                className="pagination-button"
                              >
                                Next
                              </button>
                            </div>
                          </div>

                          <button 
                            onClick={() => clearSubmissions(expandedList)} 
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