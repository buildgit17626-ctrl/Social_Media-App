// const http = require('http');

// const server = http.createServer((req, res) => {
//   res.writeHead(400, { 'content-type': 'text/plain' });
//   res.end("Hello from my Server");
// });

// server.listen(8000, () => {
//   console.log("Server running at http://localhost:8000");
// });

require("dotenv").config();

const connectDB = require("./config/db");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const postRoutes = require("./routes/postRoutes.js");
const userRoutes = require("./routes/userRoutes.js");

const app = express();

connectDB();

// Middleware
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);

app.use(cookieParser());

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Social Media API"
  });
});

// Health route
app.get("/health", (req, res) => {
  res.status(200).json({
    message: "Working Wonderfully"
  });
});

// Dummy users route
app.get("/users", (req, res) => {
  res.json({
    users: [
      { id: 1, name: "A" },
      { id: 2, name: "B" }
    ]
  });
});

// Dummy posts route
app.post("/posts", (req, res) => {
  console.log(req.body);

  res.status(201).json({
    message: "Requested Successfully",
    post: req.body
  });
});

// API routes
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);

// Invalid route handler
app.use((req, res) => {
  res.status(400).json({
    error: "Bad Request"
  });
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server working on http://localhost:${PORT}`);
});