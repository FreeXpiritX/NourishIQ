import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- Health ---
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "nourishiq-api" });
});

// --- Evidence index ---
app.get("/api/evidence", (_req, res) => {
  try {
    const dir = path.resolve(__dirname, "../data/evidence");
    if (!fs.existsSync(dir)) return res.json({ items: [] });
    const items = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""));
    res.json({ items });
  } catch (err) {
    console.error("[evidence_index_error]", err);
    res.status(500).json({ error: "evidence_index_failed" });
  }
});

// --- Evidence by id ---
app.get("/api/evidence/:id", (req, res) => {
  const file = path.resolve(__dirname, "../data/evidence", `${req.params.id}.json`);
  if (!fs.existsSync(file)) return res.status(404).json({ error: "Evidence not found" });
  try {
    const data = JSON.parse(fs.readFileSync(file, "utf-8"));
    res.json(data);
  } catch (err) {
    console.error("[evidence_read_error]", err);
    res.status(500).json({ error: "evidence_read_failed" });
  }
});

const PORT = Number(process.env.PORT || 8083);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`[API] listening on 0.0.0.0:${PORT}`);
});
