// Import dependencies
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


app.get("/", (req, res) => {
  res.json({ message: "CORS-enabled Express server running!" });
});

app.get("/flag/:id", (req, res) => {
  const flagId = req.params.id;

  const flags = {
    1: { question: "What HTML element is used to define a hyperlink?", hint: "It usually starts with <a>" },
    2: { question: "What CSS property is used to change text color?", hint: "It’s a basic styling property." },
    3: { question: "What keyword is used to declare a constant in JavaScript?", hint: "Introduced in ES6." },
  };

  console.log("Fetching flag for ID:", flagId);

  const flag = flags[flagId];
  if (flag) res.json({ flag });
  else res.status(404).json({ error: "Flag not found" });
});


app.post("/flag/:id", (req, res) => {
  const flagId = req.params.id;
  const answer = req.body.answer;
  console.log(`Received answer for flag ID ${flagId}:`, answer);

  const flags = {
    1: "<a> element",
    2: "color",
    3: "const",
  };

  if (flags[flagId]) {
    const correct = answer?.trim().toLowerCase() === flags[flagId].toLowerCase();
    res.json({ correct });
  } else {
    res.status(404).json({ error: "Flag not found" });
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
