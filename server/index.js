import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import fetch from "node-fetch";
import csv from "csvtojson";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CORS CONFIGURATION ---
// List of allowed origins (your frontend URL)
const allowedOrigins = [
  'https://club-admin-six.vercel.app',
  'http://localhost:5173', // Example for local development (Vite)
  'http://localhost:3000'  // Example for local development (Create React App)
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
};

// Use the configured CORS middleware
app.use(cors(corsOptions));

// --- OTHER MIDDLEWARE ---
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Message Schema
const messageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  club: { type: String, required: true },
  sentBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const Message = mongoose.model("Message", messageSchema);

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// 🔹 Cache for clubs + student emails
let cachedData = { clubs: [], responses: [], lastFetched: 0 };

// 🔹 Utility: fetch responses once & cache
async function getResponses() {
  const now = Date.now();

  if (
    cachedData.responses.length > 0 &&
    now - cachedData.lastFetched < 5 * 60 * 1000 // 5 minutes cache
  ) {
    return cachedData;
  }

  try {
    const csvText = await fetch(process.env.RESPONSES_SHEET_URL).then((r) =>
      r.text()
    );
    const responses = await csv().fromString(csvText);

    // Extract clubs safely
    const clubs = new Set();
    responses.forEach((r) => {
      if (r["Club 1"]) clubs.add(r["Club 1"].trim());
      if (r["Club 2"]) clubs.add(r["Club 2"].trim());
    });

    cachedData = {
      clubs: Array.from(clubs),
      responses,
      lastFetched: Date.now(),
    };

    return cachedData;
  } catch (err) {
    console.error("❌ Error fetching Google Sheet:", err);
    throw err;
  }
}

//  Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

// Config route (frontend uses this for dropdowns)
app.get("/api/config", async (req, res) => {
  try {
    const { clubs } = await getResponses();
    res.json({
      responsesSheetUrl: process.env.RESPONSES_SHEET_URL,
      studentsSheetUrl: process.env.STUDENTS_SHEET_URL,
      formUrl: process.env.FORM_URL,
      clubs,
      senders: [
        "Genral Secretary",
        "Technical Secretary",
        "Cultural Secretary",
        "Coding Club Secretary",
        "Esports Arena Secretary",
        "Publicity Club Secretary",
        "Chroma Club Secretary",
        "Literary and Arts Club Secretary",
        "Film and Photography Club Secretary",
        "Music Club Secretary",
        "Cosplay Club Secretary",
        "Robotics club (RoboForge) Secretary",
        "Entrepreneurship Club (E-Cell) Secretary",
        "Digital Art Secretary",
        "Performance Club Secretary",
      ],
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch config" });
  }
});

// POST: Send message to students of selected club/board/all
app.post("/api/messages", async (req, res) => {
  const { text, club, sentBy } = req.body;

  if (!text || !sentBy || !club) {
    return res
      .status(400)
      .json({ error: "Text, club, and sentBy are required" });
  }

  try {
    const { responses } = await getResponses();

    // Group definitions
    const technicalClubs = [
      "Coding Club ( Codessey)",
      "Robotics club ( RoboForge )",
      "E-Entrepreneurship Club ( E-Cell )",
      "Digital Art",
      "Esports Arena",
    ];
    const culturalClubs = [
      "Music Club",
      "Film and Photography Club",
      "Publicity Club",
      "Chroma Club",
      "Literary and Arts Club",
      "Film and Photography Club",
      "Performance Club",
      "Cosplay Club",
    ];

    let targetStudents = [];

    if (club === "All Students") {
      targetStudents = responses;
    } else if (club === "Technical Board") {
      targetStudents = responses.filter(
        (r) =>
          technicalClubs.includes(r["Club 1"]?.trim()) ||
          technicalClubs.includes(r["Club 2"]?.trim())
      );
    } else if (club === "Cultural Board") {
      targetStudents = responses.filter(
        (r) =>
          culturalClubs.includes(r["Club 1"]?.trim()) ||
          culturalClubs.includes(r["Club 2"]?.trim())
      );
    } else {
      // individual club
      targetStudents = responses.filter(
        (r) => r["Club 1"]?.trim() === club || r["Club 2"]?.trim() === club
      );
    }

    const emails = targetStudents
      .map((r) => r["Email address"])
      .filter(Boolean);

    if (emails.length === 0) {
      return res.status(404).json({ error: `No students found in ${club}` });
    }

    // Save in DB
    const message = await Message.create({ text, club, sentBy });

    // Send mails
    await Promise.allSettled(
      emails.map((email) =>
        transporter.sendMail({
          from: `"${sentBy}" <${process.env.EMAIL}>`,
          to: email,
          subject: `📢 Message from ${sentBy} (${club})`,
          text,
          html: `<p>${text}</p>`,
        })
      )
    );

    res.json({ success: true, message, recipients: emails.length });
  } catch (err) {
    console.error("❌ Error sending message:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

//  Message history
app.get("/api/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Start server
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
