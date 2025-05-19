const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors"); // Import the cors middleware

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://cast-solutions.netlify.app'
  ]
}));

// Create a storage directory if it doesn't exist
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files to the "uploads" directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Add a timestamp to the file name
  },
});

const upload = multer({ storage });

// Middleware to parse JSON
app.use(express.json());

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Endpoint for file uploads
app.post("/upload", upload.fields([{ name: "images" }, { name: "video" }]), (req, res) => {
  const files = req.files;
  const response = {
    images: files.images ? files.images.map((file) => `/uploads/${file.filename}`) : [],
    video: files.video ? `/uploads/${files.video[0].filename}` : null,
  };
  res.status(200).json(response);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});