import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const candidatesTable = pgTable("candidates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull().default(""),
  experience: text("experience").notNull().default(""),
  location: text("location").notNull().default(""),
  source: text("source").notNull().default("Other"),
  resume: text("resume").notNull().default(""),
  stage: text("stage").notNull().default("Applied"),
  notes: text("notes"),
  shortlisted: boolean("shortlisted").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCandidateSchema = createInsertSchema(candidatesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type Candidate = typeof candidatesTable.$inferSelect;
