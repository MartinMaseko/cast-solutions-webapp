import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ref, onValue, set, remove } from "firebase/database";
import { database, auth } from "./firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import Login from './components/Login';
import CastForm from "./components/CastForm";
import CastHome from "./components/CastHome";
import DetailPage from "./components/DetialPage";
import BriefDetails from "./components/BriefDetails";
import CreateBrief from "./components/CreateBrief";
import Presentation from './components/Presentation';
import spinner from './components/assets/spinner.gif';

/**
 * Main application component for the Cast Solutions App.
 *
 * Handles authentication state, list management, and routing for the app.
 * Fetches lists from Firebase, manages user authentication, and provides
 * navigation between public and protected routes.
 *
 * State:
 * - submissions: Array of form submissions.
 * - lists: Array of list names fetched from Firebase.
 * - user: Current authenticated user object or null.
 * - loading: Boolean indicating if authentication state is being determined.
 *
 * Functions:
 * - addList(newListName): Adds a new list name to the state.
 * - handleFormSubmit(formData): Adds a new submission to the state.
 * - clearSubmissions(listName): Clears all submissions from a specified list in Firebase.
 *
 * Routes:
 * - "/login": Login page (redirects to home if authenticated).
 * - "/": Home page (protected).
 * - "/create-brief": Brief creation page (protected).
 * - "/castform": Public form submission page.
 * - "/details/:id": Public details page for a submission.
 * - "/brief/:id": Brief details page (protected).
 *
 * @component
 */
function App() {
  const [submissions, setSubmissions] = useState([]);
  const [lists, setLists] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch lists from Firebase
  useEffect(() => {
    const listsRef = ref(database, "lists");
    const unsubscribe = onValue(listsRef, (snapshot) => {
      const data = snapshot.val();
      const listsArray = data ? Object.keys(data) : [];
      setLists(listsArray);
    });

    return () => unsubscribe();
  }, []);

  // Function to add a new list to the state
  const addList = (newListName) => {
    setLists((prevLists) => {
      const updatedLists = [...prevLists, newListName];
      console.log("Updated lists.App.js:", updatedLists); // Debugging
      return updatedLists;
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}>
        <img
          src={spinner}
          alt="Loading..."
          style={{
            width: 48,
            height: 48
          }}
        />
      </div>
    );
  }

  const handleFormSubmit = (formData) => {
    setSubmissions([...submissions, formData]);
  };

  const clearSubmissions = async (listName) => {
    if (!listName) return;

    if (window.confirm(`Are you sure you want to delete the entire list "${listName}" and all its submissions?`)) {
      try {
        // Delete the list and its submissions
        const listRef = ref(database, `lists/${listName}`);
        await set(listRef, null);

        const favRef = ref(database, `favorites/${listName}`);
        await remove(favRef);

        console.log(`List "${listName}" and all its submissions and favorites deleted`);
      } catch (error) {
        console.error('Error deleting list or favorites:', error);
        alert('Failed to delete list or favorites. Please try again.');
      }
    }
  };

  return (
    <Router>
        <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route
          path="/"
          element={user ? (
            <CastHome
              submissions={submissions}
              clearSubmissions={clearSubmissions}
              lists={lists}
              addList={addList}
            />
          ) : (
            <Navigate to="/login" />
          )}
        />
        <Route path="/create-brief" element={user ? <CreateBrief /> : <Navigate to="/login" />} />
        {/* Make CastForm public */}
        <Route
          path="/castform"
          element={<CastForm onSubmit={handleFormSubmit} lists={lists} />}
        />
        {/* Make details public */}
        <Route
          path="/details/:id"
          element={<DetailPage submissions={submissions} />}
        />
        <Route path="/brief/:id" element={<BriefDetails />} />
        <Route path="/presentation/:listName" element={<Presentation />} />
      </Routes>
    </Router>
  );
}

export default App;
