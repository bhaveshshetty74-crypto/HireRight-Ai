import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, candidatesTable, rolesTable } from "@workspace/db";
import {
  GenerateInterviewQuestionsBody,
  GenerateEmailBody,
  GenerateJdBody,
} from "@workspace/api-zod";
import { callClaudeJSON } from "../lib/anthropic";
import { logger } from "../lib/logger";

interface InterviewQs {
  technical: string[];
  behavioral: string[];
  roleSpecific: string[];
  redFlags: string[];
}

interface EmailDraft {
  subject: string;
  body: string;
}

interface JDResult {
  title: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  skillTags: string[];
}

const router: IRouter = Router();

router.post("/ai/interview-questions", async (req, res): Promise<void> => {
  const parsed = GenerateInterviewQuestionsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, parsed.data.candidateId));
  const [role] = await db.select().from(rolesTable).where(eq(rolesTable.id, parsed.data.roleId));
  if (!candidate || !role) {
    res.status(404).json({ error: "Candidate or role not found" });
    return;
  }
  try {
    const qs = await callClaudeJSON<InterviewQs>(
      `Generate tailored interview questions for this candidate.
ROLE: ${role.title} | SKILLS: ${role.skills}
CANDIDATE: ${candidate.name}, ${candidate.title}, ${candidate.experience}
PROFILE: ${candidate.resume}
Return ONLY valid JSON:
{"technical":["q1","q2","q3","q4"],"behavioral":["q1","q2","q3"],"roleSpecific":["q1","q2","q3"],"redFlags":["thing to probe 1","thing to probe 2"]}`,
    );
    res.json(qs);
  } catch (err) {
    logger.error({ err }, "Failed to generate interview questions");
    res.status(500).json({ error: "Failed to generate questions" });
  }
});

router.post("/ai/email", async (req, res): Promise<void> => {
  const parsed = GenerateEmailBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, parsed.data.candidateId));
  const [role] = await db.select().from(rolesTable).where(eq(rolesTable.id, parsed.data.roleId));
  if (!candidate || !role) {
    res.status(404).json({ error: "Candidate or role not found" });
    return;
  }
  const prompts: Record<string, string> = {
    invite: `Write a professional interview invite email for ${candidate.name} (${candidate.title}) for the ${role.title} role at ${role.company || "our company"}. Warm, concise, professional.`,
    reject: `Write a respectful rejection email for ${candidate.name} who applied for ${role.title} at ${role.company || "our company"}. Kind, brief, leaves door open.`,
    offer: `Write an exciting job offer email for ${candidate.name} for the ${role.title} role at ${role.company || "our company"}. Enthusiastic and professional.`,
    assessment: `Write an email to ${candidate.name} asking them to complete a technical assessment for ${role.title} at ${role.company || "our company"}. Friendly and clear.`,
  };
  try {
    const email = await callClaudeJSON<EmailDraft>(
      `${prompts[parsed.data.emailType]}\nReturn ONLY valid JSON: {"subject":"email subject","body":"full email body"}`,
    );
    res.json(email);
  } catch (err) {
    logger.error({ err }, "Failed to generate email");
    res.status(500).json({ error: "Failed to generate email" });
  }
});

router.post("/ai/generate-jd", async (req, res): Promise<void> => {
  const parsed = GenerateJdBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const jd = await callClaudeJSON<JDResult>(
      `Generate a job description for: Role: ${parsed.data.title}, Company: ${parsed.data.company || "a tech company"}, Experience: ${parsed.data.experience || ""}, Skills: ${parsed.data.skills || ""}
Return ONLY valid JSON: {"title":"title","summary":"2 sentences","responsibilities":["r1","r2","r3","r4"],"requirements":["req1","req2","req3","req4"],"niceToHave":["n1","n2"],"skillTags":["t1","t2","t3","t4","t5"]}`,
    );
    res.json(jd);
  } catch (err) {
    logger.error({ err }, "Failed to generate JD");
    res.status(500).json({ error: "Failed to generate job description" });
  }
});

export default router;
