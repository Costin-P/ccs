const path = require("path");
const os = require("os");
const decrypt_middleware = require("./middleware/decrypt_middleware");
const encrypt_middleware = require("./middleware/encrypt_middleware");

const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000; // Use PORT from .env or default to 3000

// Middleware
app.use(
 cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
 })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "views" directory
app.use(express.static(path.join(__dirname, "views")));

// MongoDB connection
mongoose
 .connect(process.env.MONGO_URI)
 .then(() => console.log("MongoDB Connected"))
 .catch((err) => console.error("MongoDB connection error:", err));

app.use(decrypt_middleware());
app.use(encrypt_middleware());

app.get("/", async (req, res) => {
 res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.use("/api/", require(__dirname + "/routes/api"));

app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}/`));
