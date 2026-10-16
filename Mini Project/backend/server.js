
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: { type: String, required: true }
  })
);

const Item = mongoose.model(
  "Item",
  new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    type: { type: String, enum: ["Lost", "Found"], required: true },
    userId: { type: String, required: true }
  }, { timestamps: true })
);

function auth(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Please log in" });
    }

    req.user = jwt.verify(
      header.split(" ")[1],
      process.env.JWT_SECRET
    );

    next();
  } catch {
    return res.status(401).json({ message: "Please log in again" });
  }
}

// Test whether the backend is running
app.get("/", (req, res) => {
  res.json({ message: "CampusFind backend is running!" });
});

// Create account
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({
        message: "Enter your name, email and a password of at least 6 characters."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        message: "This email is already registered. Please log in."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword
    });

    const token = jwt.sign(
      { id: user._id.toString(), name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({ token });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({ message: "Signup failed. Please try again." });
  }
});

// Log in
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter your email and password."
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    const token = jwt.sign(
      { id: user._id.toString(), name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
});

// Get reports
app.get("/items", auth, async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error("Fetch reports error:", error.message);
    res.status(500).json({ message: "Could not load reports." });
  }
});

// Add a report
app.post("/items", auth, async (req, res) => {
  try {
    const { title, description, location, type } = req.body;

    if (!title || !description || !location ||
        !["Lost", "Found"].includes(type)) {
      return res.status(400).json({
        message: "Please complete all report fields."
      });
    }

    const item = await Item.create({
      title,
      description,
      location,
      type,
      userId: req.user.id
    });

    res.status(201).json(item);
  } catch (error) {
    console.error("Add report error:", error.message);
    res.status(500).json({ message: "Could not add report." });
  }
});

// Delete your own report
app.delete("/items/:id", auth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid report ID." });
    }

    const item = await Item.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!item) {
      return res.status(404).json({
        message: "Report not found or you cannot delete it."
      });
    }

    res.json({ message: "Report deleted." });
  } catch (error) {
    console.error("Delete report error:", error.message);
    res.status(500).json({ message: "Could not delete report." });
  }
});

// Return JSON for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: "API route not found: " + req.path });
});

async function startServer() {
  try {
    if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
      throw new Error("MONGO_URI or JWT_SECRET is missing from backend/.env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully!");

    app.listen(5000, () => {
      console.log("CampusFind backend running on http://localhost:5000");
    });
  } catch (error) {
    console.error("Backend startup failed:", error.message);
  }
}

startServer();
