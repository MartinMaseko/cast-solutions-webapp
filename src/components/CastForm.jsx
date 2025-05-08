import React, { useState } from "react";
import { ref, push } from "firebase/database";
import { database } from "../firebaseConfig"; 
import "./caststyle.css";
import logo from "./assets/logo.png";

export default function FormPage({ onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    contact: "",
    socialMedia: "",
    video: null,
    images: [null, null, null], // Array to store three image files
  });

  const [showThankYou, setShowThankYou] = useState(false); // State to show thank you message

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, video: e.target.files[0] });
  };

  const handleImageChange = (index, file) => {
    const updatedImages = [...formData.images];
    updatedImages[index] = file;
    setFormData({ ...formData, images: updatedImages });
  };

  const uploadToLocalServer = async (files) => {
    const formData = new FormData();
    files.images.forEach((image) => {
      formData.append("images", image);
    });
    if (files.video) {
      formData.append("video", files.video);
    }
  
    const response = await fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData,
    });
  
    if (!response.ok) {
      throw new Error("Failed to upload files to the server");
    }
  
    return await response.json(); // Return the uploaded file URLs
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const files = {
        images: formData.images.filter((image) => image !== null),
        video: formData.video,
      };
  
      const uploadedFiles = await uploadToLocalServer(files);
  
      // Save form data with file URLs to Firebase Realtime Database
      const submissionsRef = ref(database, "submissions");
      await push(submissionsRef, {
        name: formData.name,
        surname: formData.surname,
        contact: formData.contact,
        socialMedia: formData.socialMedia,
        images: uploadedFiles.images,
        video: uploadedFiles.video,
      });
  
      // Reset form data
      setFormData({
        name: "",
        surname: "",
        contact: "",
        socialMedia: "",
        video: null,
        images: [null, null, null],
      });
  
      setShowThankYou(true);
      setTimeout(() => setShowThankYou(false), 5000);
    } catch (error) {
      console.error("Error submitting form:", error.message);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="form-page">
      <img src={logo} alt="Logo" className="logo" />
      <form className="form-container" onSubmit={handleSubmit}>
        <h4>
          Name:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </h4>
        <h4>
          Surname:
          <input
            type="text"
            name="surname"
            value={formData.surname}
            onChange={handleChange}
            required
          />
        </h4>
        <h4>
          Contact Details:
          <input
            type="text"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            required
          />
        </h4>
        <h4>
          Social Media Link:
          <input
            type="text"
            name="socialMedia"
            value={formData.socialMedia}
            onChange={handleChange}
          />
        </h4>
        <h4>
          Head Shot
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(0, e.target.files[0])}
          />
        </h4>
        <h4>
          Hands Shot
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(1, e.target.files[0])}
          />
        </h4>
        <h4>
          Long Shot
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(2, e.target.files[0])}
          />
        </h4>
        <h4>
          Video Upload (Max 2 min):
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            required
          />
        </h4>
        <button type="submit">Submit</button>
      </form>
      {showThankYou && (
        <p className="thank-you-message">
          Thank you! We will be in contact with you...
        </p>
      )}
    </div>
  );
}