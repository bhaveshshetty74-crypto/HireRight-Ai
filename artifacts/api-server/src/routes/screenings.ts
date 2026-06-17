import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, screeningsTable, candidatesTable, rolesTable } from "@workspace/db";
import {
  CreateScreeningBody,
  BatchScreenBody,
  ToggleShortlistParams,
} from "@workspace/api-zod";
import { callClaudeJSON } from "../lib/anthropic";
import { logger } from "../lib/logger";

interface AIScreenResult {
  score: number;
  verdict: string;
  strengths: string[];
  concerns: string[];
  recommendation: string;
  assessmentQuestion: string;
}

async function runScreening(candidateId: number, roleId: number): Promise<typeof screeningsTable.$inferSelect> {
  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, candidateId));
  const [role] = await db.select().from(rolesTable).where(eq(rolesTable.id, roleId));

  if (!candidate || !role) throw new Error("Candidate or role not found");

  const aiResult = await callClaudeJSON<AIScreenResult>(
    `You are an expert recruiter. Evaluate strictly.
ROLE: ${role.title} | EXP: ${role.experience} | SKILLS: ${role.skills}
CANDIDATE: ${candidate.name}, ${candidate.title}, ${candidate.experience}, ${candidate.location}
PROFILE: ${candidate.resume}
Return ONLY valid JSON:
{"score":<0-100>,"verdict":"Strong Fit"|"Good Fit"|"Possible Fit"|"Not a Fit","strengths":["s1","s2"],"concerns":["c1"] or [],"recommendation":"one sentence","assessmentQuestion":"one technical question"}`,
  );

  const existing = await db
    .select()
    .from(screeningsTable)
    .where(and(eq(screeningsTable.candidateId, candidateId), eq(screeningsTable.roleId, roleId)));

  let screening: typeof screeningsTable.$inferSelect;
  if (existing.length > 0) {
    const [updated] = await db
      .update(screeningsTable)
      .set({ ...aiResult, shortlisted: aiResult.score >= 70 })
      .where(eq(screeningsTable.id, existing[0].id))
      .returning();
    screening = updated;
  } else {
    const [inserted] = await db
      .insert(screeningsTable)
      .values({ candidateId, roleId, ...aiResult, shortlisted: aiResult.score >= 70 })
      .returning();
    screening = inserted;
  }

  if (aiResult.score >= 70) {
    await db.update(candidatesTable).set({ shortlisted: true }).where(eq(candidatesTable.id, candidateId));
  }

  return screening;
}

const router: IRouter = Router();

router.get("/screening", async (req, res): Promise<void> => {
  const roleIdRaw = req.query.roleId as string | undefined;
  const candidateIdRaw = req.query.candidateId as string | undefined;

  const rows = await db
    .select({
      id: screeningsTable.id,
      candidateId: screeningsTable.candidateId,
      roleId: screeningsTable.roleId,
      score: screeningsTable.score,
      verdict: screeningsTable.verdict,
      strengths: screeningsTable.strengths,
      concerns: screeningsTable.concerns,
      recommendation: screeningsTable.recommendation,
      assessmentQuestion: screeningsTable.assessmentQuestion,
      shortlisted: screeningsTable.shortlisted,
      createdAt: screeningsTable.createdAt,
      updatedAt: screeningsTable.updatedAt,
      candidateName: candidatesTable.name,
      roleTitle: rolesTable.title,
    })
    .from(screeningsTable)
    .leftJoin(candidatesTable, eq(screeningsTable.candidateId, candidatesTable.id))
    .leftJoin(rolesTable, eq(screeningsTable.roleId, rolesTable.id))
    .orderBy(screeningsTable.createdAt);

  let results = rows;
  if (roleIdRaw) {
    const roleId = parseInt(roleIdRaw, 10);
    results = results.filter((r) => r.roleId === roleId);
  }
  if (candidateIdRaw) {
    const candidateId = parseInt(candidateIdRaw, 10);
    results = results.filter((r) => r.candidateId === candidateId);
  }

  res.json(results);
});

router.post("/screening", async (req, res): Promise<void> => {
  const parsed = CreateScreeningBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const result = await runScreening(parsed.data.candidateId, parsed.data.roleId);
    res.status(201).json(result);
  } catch (err) {
    logger.error({ err }, "Screening failed");
    res.status(500).json({ error: "Screening failed" });
  }
});

router.post("/screening/batch", async (req, res): Promise<void> => {
  const parsed = BatchScreenBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const results: (typeof screeningsTable.$inferSelect)[] = [];
  for (const candidateId of parsed.data.candidateIds) {
    try {
      const r = await runScreening(candidateId, parsed.data.roleId);
      results.push(r);
    } catch (err) {
      logger.error({ err, candidateId }, "Batch screening failed for candidate");
    }
  }
  res.json(results);
});

router.patch("/screening/:id/shortlist", async (req, res): Promise<void> => {
  const params = ToggleShortlistParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [existing] = await db.select().from(screeningsTable).where(eq(screeningsTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Screening not found" });
    return;
  }
  const [updated] = await db
    .update(screeningsTable)
    .set({ shortlisted: !existing.shortlisted })
    .where(eq(screeningsTable.id, params.data.id))
    .returning();
  await db
    .update(candidatesTable)
    .set({ shortlisted: !existing.shortlisted })
    .where(eq(candidatesTable.id, existing.candidateId));
  res.json(updated);
});

export default router;
