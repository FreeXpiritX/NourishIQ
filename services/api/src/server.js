import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8082;
const HOST = process.env.HOST || "0.0.0.0";

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.get("/api/users", async (_req, res) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
    res.json({ users });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const email = req.body?.email || `user+${Date.now()}@nourishiq.org`;
    const user = await prisma.user.create({ data: { email } });
    res.status(201).json({ user });
  } catch (e) {
    res.status(400).json({ error: String(e) });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`[API] Listening on http://${HOST}:${PORT}`);
});
