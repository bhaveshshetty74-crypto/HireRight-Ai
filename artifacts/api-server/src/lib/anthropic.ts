import Anthropic from "@anthropic-ai/sdk";
import { logger } from "./logger";

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  logger.warn("ANTHROPIC_API_KEY is not set — AI features will fail");
}

export const anthropic = new Anthropic({ apiKey: apiKey ?? "missing" });

export async function callClaudeJSON<T>(prompt: string, maxTokens = 2048): Promise<T> {
  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  });
  const text = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  return JSON.parse(text.replace(/```json|```/g, "").trim()) as T;
}
