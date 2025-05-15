import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick"; 
import { ref, onValue, set, get, serverTimestamp } from "firebase/database";
import { database } from "../firebaseConfig";
import { getAuth, signOut } from 'firebase/auth';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import logo from "./assets/logo.png";
import banner from "./assets/castsolutions-banner.png"
const emptyStarIcon = "https://img.icons8.com/ios/35/c52727/star--v1.png";
const filledStarIcon = "https://img.icons8.com/material-sharp/35/c52727/filled-star.png";

const API_URL = process.env.REACT_APP_API_URL;

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  

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

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Submission Details",
          text: `Check out this submission: ${selectedDetail.name} ${selectedDetail.surname}`,
          url: window.location.href,
        })
        .catch((error) => console.error("Error sharing:", error));
    } else {
      alert("Sharing is not supported on this browser.");
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

  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const menuStyles = {
    container: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      zIndex: 1000,
    },
    dropdownMenu: {
      position: 'absolute',
      top: '40px',
      right: '0',
      backgroundColor: '#2A2B38',
      borderRadius: '5px',
      padding: '10px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      display: isMenuOpen ? 'block' : 'none',
    },
    menuItem: {
      color: 'whitesmoke',
      padding: '8px 15px',
      cursor: 'pointer',
      display: 'block',
      textDecoration: 'none',
      whiteSpace: 'nowrap',
      transition: 'all 0.3s ease',
      fontSize: '22px',
    },
    subMenu: {
      paddingLeft: '15px',
      borderLeft: '2px solid #C52727',
    },
    userProfile: {
      borderTop: '1px solid #C52727',
      marginTop: '10px',
      paddingTop: '10px',
      color: 'whitesmoke',
      fontSize: '0.9rem'
    }
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
    <div className="details-page">
      <nav>
        <img src={logo} alt="Logo" className="Homelogo" />
        <div style={menuStyles.container}>
          <img
          className="menu-icon"
            width="35"
            height="35"
            src="https://img.icons8.com/material-outlined/35/F5F5F5/menu--v1.png"
            alt="menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{ cursor: 'pointer' }}
          />
          <div style={menuStyles.dropdownMenu}>
            <div style={menuStyles.menuItem}>
              <div
                style={menuStyles.menuItem}
                onClick={() => navigate('/castform')}
                onMouseOver={(e) => e.target.style.backgroundColor = '#1E1F28'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Submit Audition
              </div>
            </div>
            <div style={menuStyles.menuItem}>
              Audition Lists
              <div style={menuStyles.subMenu}>
                {lists.map((list, index) => (
                  <div
                    key={index}
                    style={menuStyles.menuItem}
                    onClick={() => {
                      handleExpandList(list);
                      setIsMenuOpen(false);
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#1E1F28'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    {list}
                  </div>
                ))}
              </div>
            </div>
            {auth.currentUser && (
              <div style={menuStyles.userProfile}>
                <div>{auth.currentUser.email}</div>
                <div 
                  style={menuStyles.menuItem}
                  onClick={handleLogout}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#1E1F28'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  Logout
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

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
              <div key={index} style={{ marginBottom: "10px" }}>
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
                        <button onClick={handleShare} style={{ marginLeft: "10px" }}>
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
    </div>
  );
}