import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Briefcase, Users, FileCheck, BarChart, Sparkles, Mail,
  MessageSquare, BookOpen, Zap, Database, ChevronRight
} from "lucide-react";

const sections = [
  {
    icon: Briefcase,
    title: "1. Create a Role",
    badge: "Start here",
    badgeVariant: "default" as const,
    steps: [
      'Go to Roles → click "+ New Role".',
      "Fill in the job title, company, required experience, and key skills.",
      'On the role detail page, click "Generate JD" to have AI write a full job description from your inputs.',
      "The role is now ready to receive candidates.",
    ],
  },
  {
    icon: Users,
    title: "2. Add Candidates",
    badge: "Two ways",
    badgeVariant: "secondary" as const,
    steps: [
      'Go to Candidates → click "+ Add Candidate".',
      "Option A — Manual: fill in the candidate's name, title, location, experience, and resume summary.",
      'Option B — AI Parse: paste a LinkedIn profile or any plain-text bio into the "Parse Profile" field and AI will extract the structured fields for you.',
      "Set the pipeline stage (Applied, Screened, Interview, Offer, Hired, or Rejected) and the source (LinkedIn, Referral, etc.).",
    ],
  },
  {
    icon: Zap,
    title: "3. Run AI Screening",
    badge: "Core feature",
    badgeVariant: "default" as const,
    steps: [
      "Open a Role detail page — you'll see all candidates listed there.",
      'Click "Screen" next to a candidate, or use "Batch Screen" to evaluate multiple candidates at once.',
      "AI (Claude) reads the candidate profile against the role requirements and returns a score (0–100), a verdict (Strong Fit / Good Fit / Possible Fit / Not a Fit), top strengths, concerns, and a one-line recommendation.",
      "Candidates who score 70+ are automatically shortlisted.",
    ],
  },
  {
    icon: FileCheck,
    title: "4. Review Screenings",
    badge: null,
    badgeVariant: "outline" as const,
    steps: [
      "The Screenings page shows every AI evaluation across all roles and candidates.",
      "Each card links back to the candidate profile and the role — click either to navigate directly.",
      "Toggle a candidate's shortlist status from their profile page using the star icon.",
    ],
  },
  {
    icon: Sparkles,
    title: "5. Generate Interview Questions",
    badge: "AI feature",
    badgeVariant: "secondary" as const,
    steps: [
      "Open a candidate's profile page.",
      'Select a role and click "Generate Questions".',
      "AI produces tailored technical questions, behavioral questions, role-specific probes, and red-flag areas to investigate — all based on the candidate's actual profile.",
    ],
  },
  {
    icon: Mail,
    title: "6. Generate Recruitment Emails",
    badge: "AI feature",
    badgeVariant: "secondary" as const,
    steps: [
      "From a candidate's profile, choose an email type: Interview Invite, Rejection, Offer, or Assessment.",
      "AI drafts a personalized subject line and email body using the candidate's name and the role details.",
      "Copy and send from your own email client.",
    ],
  },
  {
    icon: MessageSquare,
    title: "7. Generate a Job Description",
    badge: null,
    badgeVariant: "outline" as const,
    steps: [
      "Open any Role detail page.",
      'Click "Generate JD" — AI writes a full job description including summary, responsibilities, requirements, nice-to-haves, and skill tags.',
      "Copy the output for use in job boards or your careers page.",
    ],
  },
  {
    icon: BarChart,
    title: "8. Analytics",
    badge: null,
    badgeVariant: "outline" as const,
    steps: [
      "The Analytics page shows pipeline-wide stats: shortlist rate, average AI score, and candidate counts by stage and screening verdict.",
      "Use these to identify bottlenecks — e.g. a high 'Not a Fit' rate may mean the role requirements need refining.",
    ],
  },
];

const tips = [
  {
    icon: Database,
    title: "Richer profiles = better AI",
    body: "The more context in the resume/profile field, the more accurate the AI screening. Paste full LinkedIn bios or resume summaries rather than just job titles.",
  },
  {
    icon: Zap,
    title: "Batch screening saves time",
    body: "Use Batch Screen on a role to evaluate all candidates at once. Results are saved and updated — re-running a screening overwrites the previous score.",
  },
  {
    icon: BookOpen,
    title: "Use stages to track progress",
    body: "Update a candidate's stage as they move through your process (Applied → Interview → Offer). Analytics tracks counts by stage so you can see your real pipeline.",
  },
];

export default function Help() {
  return (
    <div className="space-y-10 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">How to use HireRight AI</h1>
        <p className="text-muted-foreground mt-2">
          A step-by-step guide to running AI-powered recruitment from role creation to offer.
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title} data-testid={`help-section-${section.title.replace(/\s+/g, "-").toLowerCase()}`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-base">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </span>
                  {section.title}
                  {section.badge && (
                    <Badge variant={section.badgeVariant} className="ml-auto text-xs font-normal">
                      {section.badge}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {section.steps.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Separator />

      <div>
        <h2 className="text-xl font-semibold mb-4">Tips for best results</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {tips.map((tip) => {
            const Icon = tip.icon;
            return (
              <Card key={tip.title} className="bg-muted/30">
                <CardContent className="p-5">
                  <Icon className="w-5 h-5 text-primary mb-3" />
                  <p className="font-medium text-sm mb-1">{tip.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{tip.body}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Separator />

      <div className="text-sm text-muted-foreground pb-8">
        <p className="font-medium text-foreground mb-1">AI model</p>
        <p>All AI features use <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">claude-sonnet-4-5</span> via the Anthropic API running on the backend. Your candidate data is never stored by Anthropic.</p>
      </div>
    </div>
  );
}
