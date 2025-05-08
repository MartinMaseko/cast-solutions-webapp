import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CastForm from "./components/CastForm";
import CastHome from "./components/CastHome";
import DetailPage from "./components/DetialPage";

function App() {
  const [submissions, setSubmissions] = useState([]);

  const handleFormSubmit = (formData) => {
    setSubmissions([...submissions, formData]);
  };

  const clearSubmissions = () => {
    setSubmissions([]);
  };

  return (
    <Router>
      <Routes>
        {/* Main page (CastHome) */}
        <Route
          path="/"
          element={
            <CastHome
              submissions={submissions}
              clearSubmissions={clearSubmissions}
            />
          }
        />

        {/* Form page (CastForm) */}
        <Route
          path="/castform"
          element={<CastForm onSubmit={handleFormSubmit} />}
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
