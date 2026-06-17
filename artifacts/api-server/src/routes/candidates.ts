import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, candidatesTable } from "@workspace/db";
import {
  CreateCandidateBody,
  UpdateCandidateBody,
  GetCandidateParams,
  UpdateCandidateParams,
  DeleteCandidateParams,
  ParseProfileBody,
} from "@workspace/api-zod";
import { callClaudeJSON } from "../lib/anthropic";
import { logger } from "../lib/logger";

interface ParsedProfile {
  name: string;
  title: string;
  experience: string;
  location: string;
  resume: string;
}

const router: IRouter = Router();

router.get("/candidates", async (req, res): Promise<void> => {
  const candidates = await db.select().from(candidatesTable).orderBy(candidatesTable.createdAt);
  res.json(candidates);
});

router.post("/candidates", async (req, res): Promise<void> => {
  const parsed = CreateCandidateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [candidate] = await db.insert(candidatesTable).values(parsed.data).returning();
  res.status(201).json(candidate);
});

router.get("/candidates/:id", async (req, res): Promise<void> => {
  const params = GetCandidateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, params.data.id));
  if (!candidate) {
    res.status(404).json({ error: "Candidate not found" });
    return;
  }
  res.json(candidate);
});

router.patch("/candidates/:id", async (req, res): Promise<void> => {
  const params = UpdateCandidateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateCandidateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [candidate] = await db.update(candidatesTable).set(parsed.data).where(eq(candidatesTable.id, params.data.id)).returning();
  if (!candidate) {
    res.status(404).json({ error: "Candidate not found" });
    return;
  }
  res.json(candidate);
});

router.delete("/candidates/:id", async (req, res): Promise<void> => {
  const params = DeleteCandidateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [candidate] = await db.delete(candidatesTable).where(eq(candidatesTable.id, params.data.id)).returning();
  if (!candidate) {
    res.status(404).json({ error: "Candidate not found" });
    return;
  }
  res.sendStatus(204);
});

router.post("/candidates/parse-profile", async (req, res): Promise<void> => {
  const parsed = ParseProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const profile = await callClaudeJSON<ParsedProfile>(
      `Parse this ${parsed.data.source} profile. Return ONLY valid JSON: {"name":"","title":"","experience":"","location":"","resume":"2-3 sentence summary"}\n\nPROFILE:\n${parsed.data.text}`,
    );
    res.json(profile);
  } catch (err) {
    logger.error({ err }, "Failed to parse profile");
    res.status(500).json({ error: "Failed to parse profile" });
  }
});

export default router;
