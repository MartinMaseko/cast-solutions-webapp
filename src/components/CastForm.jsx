import { useState } from "react";
import { ref, push } from "firebase/database";
import { database } from "../firebaseConfig"; 
import "./caststyle.css";
import logo from "./assets/logo.png";

export default function FormPage({ lists = [] }) {
  const [selectedList, setSelectedList] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    dateOfBirth: "",
    gender: "",
    age: "",
    ethnicity: "",
    contact: "",
    socialMedia: "",
    actorNumber: "",
    agency: "",
    agencyEmail: "",
    height: "",
    tshirtSize: "",
    waistSize: "",
    pantsSize: "",
    dressSize: "",
    shoeSize: "",
    workHistory: "", 
    workVisa: "", 
    criminalRecord: "", 
    driversLicense: "", 
    availability: "", 
    video: null, 
    images: [null, null, null], 
    date: new Date().toLocaleDateString(), 
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
    
    const API_URL = process.env.REACT_APP_API_URL;
    
    const response = await fetch(`${API_URL}/upload`, {
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

    if (!selectedList) {
      alert("Please select a list before submitting.");
      return;
    }

    try {
      const files = {
        images: formData.images.filter((image) => image !== null),
        video: formData.video,
      };
  
      const uploadedFiles = await uploadToLocalServer(files);
  
      // Save form data with file URLs to Firebase Realtime Database
      const submissionsRef = ref(database, `lists/${selectedList}/submissions`);
      await push(submissionsRef, {
        name: formData.name,
        surname: formData.surname,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        age: formData.age,
        ethnicity: formData.ethnicity,
        contact: formData.contact,
        socialMedia: formData.socialMedia,
        actorNumber: formData.actorNumber,
        agency: formData.agency,
        agencyEmail: formData.agencyEmail,
        height: formData.height,
        tshirtSize: formData.tshirtSize,
        waistSize: formData.waistSize,
        pantsSize: formData.pantsSize,
        dressSize: formData.dressSize,
        shoeSize: formData.shoeSize,
        workHistory: formData.workHistory,
        workVisa: formData.workVisa,
        criminalRecord: formData.criminalRecord,
        driversLicense: formData.driversLicense,
        availability: formData.availability,
        images: uploadedFiles.images,
        video: uploadedFiles.video,
        date: formData.date, 
      });
  
      // Reset form data
      setFormData({
        name: "",
        surname: "",
        dateOfBirth: "",
        gender: "",
        age: "",
        ethnicity: "",
        contact: "",
        socialMedia: "",
        actorNumber: "",
        agency: "",
        agencyEmail: "",
        height: "",
        tshirtSize: "",
        waistSize: "",
        pantsSize: "",
        dressSize: "",
        shoeSize: "",
        workHistory: "",
        workVisa: "",
        criminalRecord: "",
        driversLicense: "",
        availability: "",
        images: "",
        video: "",
        date: "", 
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
          Date of Birth:
          <input
            type="text"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
          />
        </h4>
        <h4>
          Gender:
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </h4>
        <h4>
          Age:
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            required
          />
        </h4>
        <h4>
          Ethnicity:
          <input
            type="text"
            name="ethnicity"
            value={formData.ethnicity}
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
          Social Media:
          <input
            type="text"
            name="socialMedia"
            value={formData.socialMedia}
            onChange={handleChange}
          />
        </h4>
        <h4>
          Actor Number:
          <input
            type="number"
            name="actorNumber"
            value={formData.actorNumber}
            onChange={handleChange}
            required
          />
        </h4>
        <h4>
          Agency:
          <input
            type="text"
            name="agency"
            value={formData.agency}
            onChange={handleChange}
          />
        </h4>
        <h4>
          Agency Email:
          <input
            type="text"
            name="agencyEmail"
            value={formData.agencyEmail}
            onChange={handleChange}
          />
        </h4>
        <h4>
          Height:
          <input
            type="number"
            name="height"
            value={formData.height}
            onChange={handleChange}
          />
        </h4>
        <h4>
          T-shirt Size:
          <input
            type="text"
            name="tshirtSize"
            value={formData.tshirtSize}
            onChange={handleChange}
          />
        </h4>
        <h4>
          Waist Size:
          <input
            type="number"
            name="waistSize"
            value={formData.waistSize}
            onChange={handleChange}
          />
        </h4>
        <h4>
          Pants Size:
          <input
            type="number"
            name="pantsSize"
            value={formData.pantsSize}
            onChange={handleChange}
          />
        </h4>
        <h4>
          Dress Size:
          <input
            type="number"
            name="dressSize"
            value={formData.dressSize}
            onChange={handleChange}
          />
        </h4>
        <h4>
          Shoe Size:
          <input
            type="number"
            name="shoeSize"
            value={formData.shoeSize}
            onChange={handleChange}
          />
        </h4>
        <h4>
          What work have you done in the last 5 years?
          <textarea
            name="workHistory"
            value={formData.workHistory}
            onChange={handleChange}
            required
          />
        </h4>
        <h4>
          If not South African, do you have a valid work visa?
          <select
            name="workVisa"
            value={formData.workVisa}
            onChange={handleChange}
            required
          >
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="SA">I'm South African</option>
          </select>
        </h4>
        <h4>
          Do you have a criminal record?
          <select
            name="criminalRecord"
            value={formData.criminalRecord}
            onChange={handleChange}
            required
          >
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </h4>
        <h4>
          Do you have a valid driver's license?
          <select
            name="driversLicense"
            value={formData.driversLicense}
            onChange={handleChange}
            required
          >
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </h4>
        <h4>
          Are you available for shoot dates?
          <select
            name="availability"
            value={formData.availability}
            onChange={handleChange}
            required
          >
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
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
        <h4>
          Select Audition:
          <select
            name="selectedList"
            value={selectedList}
            onChange={(e) => setSelectedList(e.target.value)}
            required
          >
            <option value="">Select a Audition</option>
            {lists.length === 0 ? (
              <option disabled>No Auditions available</option>
            ) : (
              lists.map((list, index) => (
                <option key={index} value={list}>
                  {list}
                </option>
              ))
            )}
          </select>
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