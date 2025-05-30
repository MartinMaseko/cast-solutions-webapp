const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Dynamic CORS setup
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:3000', 'https://cast-solutions.netlify.app'];

app.use(cors({
  origin: allowedOrigins,
}));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const getBaseUrl = () => process.env.APP_URL || `http://localhost:${PORT}`;

app.post("/upload", upload.fields([{ name: "images" }, { name: "video" }]), (req, res) => {
  const files = req.files;
  const baseUrl = getBaseUrl();
  const response = {
    images: files.images ? files.images.map((file) => `${baseUrl}/uploads/${file.filename}`) : [],
    video: files.video ? `${baseUrl}/uploads/${files.video[0].filename}` : null,
  };
  res.status(200).json(response);
});

app.listen(PORT, () => {
  console.log(`Server is running on ${getBaseUrl()}`);
});