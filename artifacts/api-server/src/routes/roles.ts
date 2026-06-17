import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, rolesTable } from "@workspace/db";
import {
  CreateRoleBody,
  UpdateRoleBody,
  GetRoleParams,
  UpdateRoleParams,
  DeleteRoleParams,
  GetRoleJdParams,
} from "@workspace/api-zod";
import { callClaudeJSON } from "../lib/anthropic";
import { logger } from "../lib/logger";

interface JDResult {
  title: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  skillTags: string[];
}

const router: IRouter = Router();

router.get("/roles", async (_req, res): Promise<void> => {
  const roles = await db.select().from(rolesTable).orderBy(rolesTable.createdAt);
  res.json(roles);
});

router.post("/roles", async (req, res): Promise<void> => {
  const parsed = CreateRoleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [role] = await db.insert(rolesTable).values(parsed.data).returning();
  res.status(201).json(role);
});

router.get("/roles/:id", async (req, res): Promise<void> => {
  const params = GetRoleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [role] = await db.select().from(rolesTable).where(eq(rolesTable.id, params.data.id));
  if (!role) {
    res.status(404).json({ error: "Role not found" });
    return;
  }
  res.json(role);
});

router.patch("/roles/:id", async (req, res): Promise<void> => {
  const params = UpdateRoleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateRoleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [role] = await db.update(rolesTable).set(parsed.data).where(eq(rolesTable.id, params.data.id)).returning();
  if (!role) {
    res.status(404).json({ error: "Role not found" });
    return;
  }
  res.json(role);
});

router.delete("/roles/:id", async (req, res): Promise<void> => {
  const params = DeleteRoleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [role] = await db.delete(rolesTable).where(eq(rolesTable.id, params.data.id)).returning();
  if (!role) {
    res.status(404).json({ error: "Role not found" });
    return;
  }
  res.sendStatus(204);
});

router.get("/roles/:id/jd", async (req, res): Promise<void> => {
  const params = GetRoleJdParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [role] = await db.select().from(rolesTable).where(eq(rolesTable.id, params.data.id));
  if (!role) {
    res.status(404).json({ error: "Role not found" });
    return;
  }
  try {
    const jd = await callClaudeJSON<JDResult>(
      `Generate a job description for: Role: ${role.title}, Company: ${role.company || "a tech company"}, Experience: ${role.experience}, Skills: ${role.skills}
Return ONLY valid JSON: {"title":"title","summary":"2 sentences","responsibilities":["r1","r2","r3","r4"],"requirements":["req1","req2","req3","req4"],"niceToHave":["n1","n2"],"skillTags":["t1","t2","t3","t4","t5"]}`,
    );
    res.json(jd);
  } catch (err) {
    logger.error({ err }, "Failed to generate JD");
    res.status(500).json({ error: "Failed to generate job description" });
  }
});

export default router;
