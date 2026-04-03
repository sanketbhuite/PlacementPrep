const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const readJSON = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
const writeJSON = (path, data) => fs.writeFileSync(path, JSON.stringify(data, null, 2));

const USERS = "./data/users.json";
const QUESTIONS = "./data/questions.json";
const ANNOUNCEMENTS = "./data/announcements.json";

const MOCK_DURATION = path.join(__dirname, "data", "mockDuration.json");
const MOCKTIME = path.join(__dirname, "data", "mockEndTime.json");

app.get("/", (req, res) => res.send("Placement Prep Mock API is running ✅"));

// === AUTH ===
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const users = readJSON(USERS);
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  res.json(user);
});

app.post("/api/auth/signup", (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }
    const users = readJSON(USERS);
    if (users.some((u) => u.email === email)) {
      return res.status(409).json({ error: "Email already exists" });
    }
    const newUser = {
      id: Date.now(),
      name,
      email,
      password, // plaintext for mock; hash in real app
      scores: [],
    };
    users.push(newUser);
    writeJSON(USERS, users);
    // Return the user object that the frontend will store
    return res.status(201).json(newUser);
  } catch (e) {
    console.error("Signup error:", e);
    return res.status(500).json({ error: "Server error" });
  }
});


app.post("/api/auth/signup", (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }
    const users = readJSON(USERS);
    if (users.some((u) => u.email === email)) {
      return res.status(409).json({ error: "Email already exists" });
    }
    const newUser = {
      id: Date.now(),
      name,
      email,
      password, // plaintext for mock; hash in real app
      scores: [],
    };
    users.push(newUser);
    writeJSON(USERS, users);
    // Return the user object that the frontend will store
    return res.status(201).json(newUser);
  } catch (e) {
    console.error("Signup error:", e);
    return res.status(500).json({ error: "Server error" });
  }
});

// (Keep your /api/auth/login route etc.)
// --- USERS API ---
// get all users
app.get("/api/auth/users", (req, res) => {
  const users = readJSON(USERS);
  res.json(users);
});

// delete a user
app.delete("/api/auth/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const users = readJSON(USERS).filter((u) => u.id !== id);
  writeJSON(USERS, users);
  res.json({ success: true });
});

// === UPDATE USER SCORE ===
app.post("/api/auth/updateScore", (req, res) => {
  try {
    const { userId, score } = req.body;
    if (!userId || typeof score !== "number") {
      return res.status(400).json({ error: "Invalid data" });
    }

    const users = readJSON(USERS);
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) return res.status(404).json({ error: "User not found" });

    // append new score
    const user = users[idx];
    user.scores = [...(user.scores || []), score];
    users[idx] = user;

    writeJSON(USERS, users);
    res.json(user);
  } catch (e) {
    console.error("Score update error:", e);
    res.status(500).json({ error: "Failed to update score" });
  }
});


// === QUESTIONS ===
// get questions
app.get("/api/questions", (req, res) => {
  res.json(readJSON(QUESTIONS));
});

// add or update question
app.post("/api/questions", (req, res) => {
  const { id, question, options, answer } = req.body;
  const qlist = readJSON(QUESTIONS);
  if (id) {
    const idx = qlist.findIndex((q) => q.id === id);
    if (idx !== -1) qlist[idx] = { id, question, options, answer };
  } else {
    qlist.push({
      id: Date.now(),
      question,
      options,
      answer,
    });
  }
  writeJSON(QUESTIONS, qlist);
  res.json(qlist[qlist.length - 1]);
});

// === DELETE QUESTION ===
app.delete("/api/questions/:id", (req, res) => {
  try {
    const id = Number(req.params.id);
    const questions = readJSON(QUESTIONS);
    const updated = questions.filter((q) => q.id !== id);
    writeJSON(QUESTIONS, updated);
    res.json({ success: true });
  } catch (e) {
    console.error("Delete question error:", e);
    res.status(500).json({ error: "Failed to delete question" });
  }
});


// === SCORES ===
app.post("/api/attempts", (req, res) => {
  const { userId, score } = req.body;
  const users = readJSON(USERS);
  const user = users.find((u) => u.id === userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  user.scores.push(score);
  writeJSON(USERS, users);
  res.json({ success: true });
});

// === ANNOUNCEMENTS ===
app.get("/api/announcements", (req, res) => {
  res.json(readJSON(ANNOUNCEMENTS));
});

app.post("/api/announcements", (req, res) => {
  const ann = readJSON(ANNOUNCEMENTS);
  const newAnn = {
    id: Date.now(),
    title: req.body.title,
    message: req.body.message,
    date: new Date().toLocaleDateString(),
  };
  ann.push(newAnn);
  writeJSON(ANNOUNCEMENTS, ann);
  res.json(newAnn);
});

app.delete("/api/announcements/:id", (req, res) => {
  const ann = readJSON(ANNOUNCEMENTS).filter(
    (a) => a.id !== parseInt(req.params.id)
  );
  writeJSON(ANNOUNCEMENTS, ann);
  res.json({ success: true });
});


// === GET mock end time ===
app.get("/api/mock-endtime", (req, res) => {
  try {
    if (!fs.existsSync(MOCKTIME))
      fs.writeFileSync(MOCKTIME, JSON.stringify({ endTime: "" }));
    const data = JSON.parse(fs.readFileSync(MOCKTIME, "utf8"));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to read end time" });
  }
});

// === POST mock end time ===
app.post("/api/mock-endtime", (req, res) => {
  try {
    const { endTime } = req.body;
    fs.writeFileSync(MOCKTIME, JSON.stringify({ endTime }, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save end time" });
  }
});

// === GET mock test duration ===
app.get("/api/mock-duration", (req, res) => {
  try {
    if (!fs.existsSync(MOCK_DURATION))
      fs.writeFileSync(MOCK_DURATION, JSON.stringify({ hours: "", minutes: "" }));
    const data = JSON.parse(fs.readFileSync(MOCK_DURATION, "utf8"));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to read duration" });
  }
});

// === POST mock test duration ===
app.post("/api/mock-duration", (req, res) => {
  try {
    const { hours, minutes } = req.body;
    fs.writeFileSync(
      MOCK_DURATION,
      JSON.stringify({ hours, minutes }, null, 2)
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save duration" });
  }
});


const PORT = 5000;
app.listen(PORT, () =>
  console.log(`✅ Mock API running at http://localhost:${PORT}`)
);
