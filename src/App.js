import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ref, onValue, set } from "firebase/database";
import { database, auth } from "./firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import Login from './components/Login';
import CastForm from "./components/CastForm";
import CastHome from "./components/CastHome";
import DetailPage from "./components/DetialPage";

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
    return <div>Loading...</div>;
  }

  const handleFormSubmit = (formData) => {
    setSubmissions([...submissions, formData]);
  };

  const clearSubmissions = async (listName) => {
  if (!listName) return;

  if (window.confirm(`Are you sure you want to clear all submissions from "${listName}"?`)) {
    try {
      const listRef = ref(database, `lists/${listName}/submissions`);
      await set(listRef, null);
      console.log(`All submissions cleared from ${listName}`);
    } catch (error) {
      console.error('Error clearing submissions:', error);
      alert('Failed to clear submissions. Please try again.');
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

        {/* Form page (CastForm) */}
        <Route
          path="/castform"
          element={<CastForm onSubmit={handleFormSubmit} lists={lists} />}
        />

        {/* Detail page for individual submissions */}
        <Route
          path="/details/:id"
          element={<DetailPage submissions={submissions} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
