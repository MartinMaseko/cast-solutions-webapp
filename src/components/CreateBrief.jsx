import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { ref, push, onValue, set } from "firebase/database";
import { database } from "../firebaseConfig";
import { Editor } from "@tinymce/tinymce-react";
import NavBar from "./NavBar";
import Footer from "./Footer";
import "./caststyle.css";

/**
 * CreateBrief component allows users to create and manage casting briefs.
 *
 * Features:
 * - Displays a list of existing briefs with options to view or delete.
 * - Provides a form to create a new casting brief, including fields for title, agency, shoot details, callback, wardrobe, media usage, venue, date, notes, roles, rate, and reference images.
 * - Integrates a rich text editor for detailed brief content.
 * - Handles image uploads and saves brief data to Firebase.
 * - Generates and displays a shareable link for each created brief.
 *
 * State:
 * - briefData: Object containing all form fields for the brief.
 * - content: String for the rich text editor content.
 * - loading: Boolean indicating if the form is submitting.
 * - briefLink: String containing the generated link for the created brief.
 * - lists: Array of available lists from Firebase.
 * - briefs: Array of existing briefs from Firebase.
 *
 * Side Effects:
 * - Fetches lists and briefs from Firebase on mount and updates state in real-time.
 *
 * @component
 * @returns {JSX.Element} The CreateBrief component UI.
 */
export default function CreateBrief() {
  const [briefData, setBriefData] = useState({
    title: "",
    agency: "",
    shoot: "",
    callBack: "",
    wardrobe: "",
    media: "",
    venue: "",
    date: "",
    notes: "",
    roles: "",
    rate: "",
    images: [],
  });
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [briefLink, setBriefLink] = useState('')
  const [lists, setLists] = useState([]);
  const [briefs, setBriefs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const listsRef = ref(database, "lists");
    const unsubscribe = onValue(listsRef, (snapshot) => {
      const data = snapshot.val();
      const listsArray = data ? Object.keys(data) : [];
      setLists(listsArray);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const briefsRef = ref(database, "briefs");
    const unsubscribe = onValue(briefsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
        const briefsArray = Object.entries(data).map(([id, brief]) => ({
            id,
            ...brief
        }));
        setBriefs(briefsArray);
        } else {
        setBriefs([]);
        }
    });

    return () => unsubscribe();
    }, []);

  const handleDeleteBrief = async (briefId) => {
    if (window.confirm('Are you sure you want to delete this brief?')) {
        try {
        await set(ref(database, `briefs/${briefId}`), null);
        alert('Brief deleted successfully');
        } catch (error) {
        console.error('Error deleting brief:', error);
        alert('Failed to delete brief');
        }
    }
    };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setBriefData({ ...briefData, images: files });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create FormData for image uploads
      const formData = new FormData();
      briefData.images.forEach((image) => {
        formData.append("images", image);
      });

      // Upload images to your server
      const API_URL = process.env.REACT_APP_API_URL;
      const uploadResponse = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const uploadedFiles = await uploadResponse.json();

      // Save brief to Firebase
      const briefsRef = ref(database, "briefs");
      const newBrief = await push(briefsRef, {
        ...briefData,
        content,
        images: uploadedFiles.images,
        createdAt: new Date().toISOString(),
      });
      
      const link = `${window.location.origin}/brief/${newBrief.key}`;
      setBriefLink(link);
      navigate(`/brief/${newBrief.key}`);
      alert(`Brief created! Share using: ${window.location.origin}/brief/${newBrief.key}`);
      setBriefData({
        title: "",
        agency: "",
        shoot: "",
        callBack: "",
        wardrobe: "",
        media: "",
        venue: "",
        date: "",
        notes: "",
        roles: "",
        rate: "",
        images: [],
      });
      setContent("");
    } catch (error) {
      console.error("Error creating brief:", error);
      alert("Failed to create brief. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <NavBar lists={lists} />
    <div className="form-page">
      
      <div className="form-container">
        <div className="briefs-list">
            <h3>Casting Briefs</h3>
            {briefs.length > 0 ? (
                <div className="briefs-container">
                {briefs.map((brief) => (
                    <div key={brief.id} className="brief-item">
                    <div className="brief-info">
                        <h4>{brief.title}</h4>
                        <p>Created: {new Date(brief.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="brief-actions">
                        <button
                        onClick={() => navigate(`/brief/${brief.id}`)}
                        className="view-button"
                        >
                        View
                        </button>
                        <button
                        onClick={() => handleDeleteBrief(brief.id)}
                        className="delete-button"
                        >
                        Delete
                        </button>
                    </div>
                    </div>
                ))}
                </div>
            ) : (
                <p>No briefs created yet</p>
            )}
            </div>
        <h2>Create Casting Brief</h2>
        <form onSubmit={handleSubmit}>
        <h4>Title:
          <input
            type="text"
            value={briefData.title}
            onChange={(e) => setBriefData({...briefData, title: e.target.value})}
            required
            placeholder="Enter brief title"
          />
        </h4>

        <h4>Agency:
          <input
            type="text"
            value={briefData.agency}
            onChange={(e) => setBriefData({...briefData, agency: e.target.value})}
            required
            placeholder="Agency name"
          />
        </h4>

        <h4>Shoot:
          <input
            type="text"
            value={briefData.shoot}
            onChange={(e) => setBriefData({...briefData, shoot: e.target.value})}
            required
            placeholder="Shoot details"
          />
        </h4>

        <h4>Callback:
          <input
            type="text"
            value={briefData.callBack}
            onChange={(e) => setBriefData({...briefData, callBack: e.target.value})}
            placeholder="Callback details"
          />
        </h4>

        <h4>Wardrobe Requirements:
          <input
            type="text"
            value={briefData.wardrobe}
            onChange={(e) => setBriefData({...briefData, wardrobe: e.target.value})}
            placeholder="Wardrobe specifications"
          />
        </h4>

        <h4>Media Usage:
          <input
            type="text"
            value={briefData.media}
            onChange={(e) => setBriefData({...briefData, media: e.target.value})}
            placeholder="Media usage details"
          />
        </h4>

        <h4>Venue:
          <input
            type="text"
            value={briefData.venue}
            onChange={(e) => setBriefData({...briefData, venue: e.target.value})}
            placeholder="Casting venue"
          />
        </h4>

        <h4>Date:
          <input
            type="date"
            value={briefData.date}
            onChange={(e) => setBriefData({...briefData, date: e.target.value})}
            required
          />
        </h4>

        <h4>Additional Notes:
          <textarea
            value={briefData.notes}
            onChange={(e) => setBriefData({...briefData, notes: e.target.value})}
            placeholder="Additional casting notes"
            rows="4"
          />
        </h4>

        <h4>Roles Required:
          <textarea
            value={briefData.roles}
            onChange={(e) => setBriefData({...briefData, roles: e.target.value})}
            placeholder="Describe the roles needed"
            rows="4"
            required
          />
        </h4>

        <h4>Rate:
          <input
            type="text"
            value={briefData.rate}
            onChange={(e) => setBriefData({...briefData, rate: e.target.value})}
            placeholder="e.g., R6500 per day - no usage"
          />
        </h4>

        <h4 className="editor-label">Brief Content:</h4>
        <Editor
            apiKey={process.env.REACT_APP_TINYMCE_API_KEY}
            init={{
                height: 300,
                menubar: true,
                branding: false,
                promotion: false,
                readonly: false,
                forced_root_block: 'div',
                inline: false,
                plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                    'preview', 'searchreplace', 'fullscreen', 'table', 'wordcount'
                ],
                toolbar: 'undo redo | formatselect | ' +
                        'bold italic backcolor | alignleft aligncenter ' +
                        'alignright alignjustify | bullist numlist outdent indent | ' +
                        'removeformat | help',
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                setup: (editor) => {
                    editor.on('init', () => {
                        const editorBody = editor.getBody();
                        editorBody.setAttribute('contenteditable', 'true');
                        editor.setContent(content || '');
                    });
                },
            }}
            value={content}
            onEditorChange={(newContent) => setContent(newContent)}
            disabled={false}
            className="editor"
        />
        <h4>Reference Images:
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
          />
        </h4>

        <button 
          type="submit" 
          disabled={loading}
          className="submit-button"
        >
          {loading ? "Creating..." : "Create Brief"}
        </button>
      </form>
      {briefLink && (
          <div className="brief-link-container">
            <h4>Created Brief Link:</h4>
            <div className="brief-link">
              <a href={briefLink} target="_blank" rel="noopener noreferrer">
                {briefLink}
              </a>
              <button
                type="button"
                className="copy-link-button"
                onClick={() => {
                  navigator.clipboard.writeText(briefLink);
                  alert("Link copied to clipboard!");
                }}
              >
                Copy Link
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
    </>
  );
}