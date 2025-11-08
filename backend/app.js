const express = require("express");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  })
);

app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.ip} ${req.method} ${req.originalUrl}`);
  next();
});

// Root
app.get("/", (req, res) => {
  res.json({ message: "CORS-enabled Express server running!" });
});

// Flags data
const flagsData = {
  1: { question: "What HTML element is used to define a hyperlink?", hint: "It usually starts with <a>", answer: "<a> element" },
  2: { question: "What CSS property is used to change text color?", hint: "It’s a basic styling property.", answer: "color" },
  3: { question: "What keyword is used to declare a constant in JavaScript?", hint: "Introduced in ES6.", answer: "const" },
};

// GET flag
app.get("/flag/:id", (req, res) => {
  const flagId = req.params.id;
  const flag = flagsData[flagId];

  console.log("Fetching flag for ID:", flagId);

  if (flag) res.json({ flag, status: true, flagId });
  else res.status(404).json({ error: "Flag not found" });
});

// POST answer
app.post("/flag/:id", (req, res) => {
  const flagId = req.params.id;
  const answer = req.body.answer;

  const flag = flagsData[flagId];
  if (!flag) return res.status(404).json({ error: "Flag not found" });

  const correct = answer?.trim().toLowerCase() === flag.answer.toLowerCase();
  console.log(`Answer for Flag ${flagId}: ${answer} → ${correct ? "Correct" : "Incorrect"}`);
  res.json({ correct });
});

// Start server
const PORT = 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
