const express = require("express");
const cors = require("cors");
const fs = require("fs");
const csvParser = require("csv-parser");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

// ================== CONFIG ==================
const app = express();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  })
);
app.use(express.json());

// ================== CSV SETUP ==================
const csvFilePath = "./lands.csv";

// Create file if not exists with header
if (!fs.existsSync(csvFilePath)) {
  fs.writeFileSync(
    csvFilePath,
    "Land ID,Water Condition,Status,Created At,Updated At\n"
  );
}

// Function to read CSV into memory
const readCSV = async () => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(csvFilePath)
      .pipe(csvParser())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
};

// Function to write all data back to CSV
const writeCSV = async (records) => {
  const csvWriter = createCsvWriter({
    path: csvFilePath,
    header: [
      { id: "landId", title: "Land ID" },
      { id: "waterCondition", title: "Water Condition" },
      { id: "status", title: "Status" },
      { id: "createdAt", title: "Created At" },
      { id: "updatedAt", title: "Updated At" },
    ],
  });
  await csvWriter.writeRecords(records);
};

// ================== ROUTES ==================
app.use((req, res, next) => {
  console.log(
    `${new Date().toISOString()} ${req.ip} ${req.method} ${req.originalUrl}`
  );
  next();
});

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Local CSV-based server running!" });
});

// POST — Add or update land data
app.post("/land/waterCondition", async (req, res) => {
  try {
    const { landId, waterCondition, status } = req.body;

    if (!landId || !waterCondition || !status) {
      return res
        .status(400)
        .json({ error: "landId, waterCondition, and status are required" });
    }

    let records = await readCSV();

    // Find existing record
    const existingIndex = records.findIndex((r) => r["Land ID"] === landId);

    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      // Update existing record
      records[existingIndex] = {
        landId,
        waterCondition,
        status,
        createdAt: records[existingIndex]["Created At"],
        updatedAt: now,
      };
      console.log(`✅ Updated existing land ${landId}`);
    } else {
      // Add new record
      records.push({
        landId,
        waterCondition,
        status,
        createdAt: now,
        updatedAt: now,
      });
      console.log(`✅ Added new land ${landId}`);
    }

    // Write updated records back to CSV
    await writeCSV(records);

    res.json({
      message: "Land data saved locally to CSV",
      land: { landId, waterCondition, status },
    });
  } catch (error) {
    console.error("❌ Error in POST /land/waterCondition:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET — Fetch all land records
app.get("/land/waterCondition", async (req, res) => {
  try {
    const rec = await readCSV();
    
    // 1. Transform data keys to match front-end expectations (camelCase)
    //    and add a sequential 'id' property.
    let records = rec.map((record, index) => ({
      // Add a sequential ID for React list key usage
      id: index + 1, 
      
      // Map the original CSV keys (using bracket notation for spaces) 
      // to the new, front-end friendly camelCase keys:
      landId: record["Land ID"],
      waterCondition: record["Water Condition"],
      status: record["Status"],
      createdAt: record["Created At"],
      updatedAt: record["Updated At"],
    }));
    
    // 2. Fix the previous console.log ReferenceError by accessing .length 
    //    *after* 'records' has been initialized.
    console.log(`✅ Fetched ${records.length} land records`);

    res.json(records);
  } catch (error) {
    console.error("❌ Error reading CSV:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ================== START SERVER ==================
const PORT = 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Local CSV server running at http://localhost:${PORT}`);
});
