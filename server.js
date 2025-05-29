const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"],
  })
);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Image upload endpoint
app.post(
  "/api/upload/images",
  upload.array("images", 5),
  (req, res) => {
    try {
      const urls = req.files.map(
        (file) => `${process.env.APP_URL}/uploads/${file.filename}`
      );
      res.json({ urls });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Video upload endpoint
app.post("/api/upload/video", upload.single("video"), (req, res) => {
  try {
    const url = `${process.env.APP_URL}/uploads/${req.file.filename}`;
    res.json({ url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});