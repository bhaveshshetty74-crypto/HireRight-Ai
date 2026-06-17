import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, candidatesTable, rolesTable, screeningsTable } from "@workspace/db";

const PIPELINE_STAGES = ["Applied", "Screened", "Interview", "Offer", "Hired", "Rejected"];

const router: IRouter = Router();

router.get("/analytics/summary", async (req, res): Promise<void> => {
  const roleIdRaw = req.query.roleId as string | undefined;
  const roleId = roleIdRaw ? parseInt(roleIdRaw, 10) : undefined;

  const [allCandidates, allRoles, allScreenings] = await Promise.all([
    db.select().from(candidatesTable),
    db.select().from(rolesTable),
    db.select().from(screeningsTable),
  ]);

  const screenings = roleId ? allScreenings.filter((s) => s.roleId === roleId) : allScreenings;

  const totalScreened = screenings.length;
  const totalShortlisted = screenings.filter((s) => s.shortlisted).length;
  const avgScore = totalScreened > 0
    ? Math.round(screenings.reduce((a, b) => a + b.score, 0) / totalScreened)
    : 0;
  const shortlistRate = totalScreened > 0 ? Math.round((totalShortlisted / totalScreened) * 100) : 0;

  const verdicts = ["Strong Fit", "Good Fit", "Possible Fit", "Not a Fit"];
  const byVerdict = verdicts.map((v) => ({ label: v, count: screenings.filter((s) => s.verdict === v).length }));

  const sourceMap: Record<string, number> = {};
  for (const c of allCandidates) {
    sourceMap[c.source] = (sourceMap[c.source] || 0) + 1;
  }
  const bySource = Object.entries(sourceMap).map(([label, count]) => ({ label, count }));

  const byStage = PIPELINE_STAGES.map((stage) => ({
    label: stage,
    count: allCandidates.filter((c) => c.stage === stage).length,
  }));

  res.json({
    totalCandidates: allCandidates.length,
    totalRoles: allRoles.length,
    totalScreened,
    totalShortlisted,
    avgScore,
    shortlistRate,
    byVerdict,
    bySource,
    byStage,
  });
});

export default router;
