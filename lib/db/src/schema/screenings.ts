import { pgTable, serial, timestamp, integer, boolean, text, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { rolesTable } from "./roles";
import { candidatesTable } from "./candidates";

export const screeningsTable = pgTable("screenings", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id").notNull().references(() => candidatesTable.id, { onDelete: "cascade" }),
  roleId: integer("role_id").notNull().references(() => rolesTable.id, { onDelete: "cascade" }),
  score: integer("score").notNull().default(0),
  verdict: text("verdict").notNull().default(""),
  strengths: jsonb("strengths").$type<string[]>().notNull().default([]),
  concerns: jsonb("concerns").$type<string[]>().notNull().default([]),
  recommendation: text("recommendation").notNull().default(""),
  assessmentQuestion: text("assessment_question").notNull().default(""),
  shortlisted: boolean("shortlisted").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertScreeningSchema = createInsertSchema(screeningsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertScreening = z.infer<typeof insertScreeningSchema>;
export type Screening = typeof screeningsTable.$inferSelect;
