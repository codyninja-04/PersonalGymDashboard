"use server";

import { callAI, isAIConfigured, type AIMessage } from "@/lib/ai/providers";
import { buildUserContext, bundleToContextInput } from "@/lib/ai/buildContext";
import {
  ASK_COACH_PROMPT,
  AUTOSCALE_PROMPT,
  DAILY_BRIEFING_PROMPT,
  EXERCISE_SWAP_PROMPT,
  MEAL_SUGGESTION_PROMPT,
  STALL_DIAGNOSIS_PROMPT,
} from "@/lib/ai/prompts";
import { fetchSyncBundle } from "./fetch";

export interface AIResponse {
  ok: boolean;
  text?: string;
  provider?: string;
  error?: string;
  notConfigured?: boolean;
}

export async function aiStatusAction(): Promise<{ configured: boolean }> {
  return { configured: isAIConfigured() };
}

async function loadContext(intent?: string) {
  const bundle = await fetchSyncBundle();
  const ctx = bundleToContextInput(bundle, { intent });
  return buildUserContext(ctx);
}

export async function dailyBriefingAction(intent?: string): Promise<AIResponse> {
  if (!isAIConfigured()) return { ok: false, notConfigured: true };
  try {
    const ctx = await loadContext(intent);
    const result = await callAI(
      [{ role: "user", content: `${ctx}\n\nGive me today's briefing.` }],
      { system: DAILY_BRIEFING_PROMPT, temperature: 0.6, maxTokens: 260 },
    );
    return { ok: true, text: result.text, provider: result.provider };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function askCoachAction(question: string): Promise<AIResponse> {
  if (!isAIConfigured()) return { ok: false, notConfigured: true };
  if (!question.trim()) return { ok: false, error: "Empty question" };
  try {
    const ctx = await loadContext();
    const result = await callAI(
      [
        { role: "user", content: `${ctx}\n\n---\n\nUser question: ${question.trim()}` },
      ],
      { system: ASK_COACH_PROMPT, temperature: 0.65, maxTokens: 500 },
    );
    return { ok: true, text: result.text, provider: result.provider };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function autoScaleAction(reason: string, splitName: string): Promise<AIResponse> {
  if (!isAIConfigured()) return { ok: false, notConfigured: true };
  try {
    const ctx = await loadContext();
    const result = await callAI(
      [
        {
          role: "user",
          content: `${ctx}\n\n---\n\nToday's split: ${splitName}\nReason for scaling: ${reason.trim() || "general fatigue"}`,
        },
      ],
      { system: AUTOSCALE_PROMPT, temperature: 0.5, maxTokens: 500 },
    );
    return { ok: true, text: result.text, provider: result.provider };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function mealSuggestAction(preference?: string): Promise<AIResponse> {
  if (!isAIConfigured()) return { ok: false, notConfigured: true };
  try {
    const ctx = await loadContext();
    const result = await callAI(
      [
        {
          role: "user",
          content: `${ctx}\n\n---\n\nSuggest ONE meal that fits my remaining macros.${preference ? ` Preference: ${preference.trim()}` : ""}`,
        },
      ],
      { system: MEAL_SUGGESTION_PROMPT, temperature: 0.75, maxTokens: 360 },
    );
    return { ok: true, text: result.text, provider: result.provider };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export interface ExerciseSwap {
  name: string;
  muscle_match: string;
  why: string;
}

export interface ExerciseSwapResponse extends AIResponse {
  alternatives?: ExerciseSwap[];
}

export async function exerciseSwapAction(
  exerciseName: string,
  primaryMuscle: string,
  reason: string,
): Promise<ExerciseSwapResponse> {
  if (!isAIConfigured()) return { ok: false, notConfigured: true };
  try {
    const result = await callAI(
      [
        {
          role: "user",
          content: `Current exercise: ${exerciseName} (targets ${primaryMuscle})\nReason for swap: ${reason || "equipment unavailable"}\n\nGive 3 alternatives as JSON only.`,
        },
      ],
      { system: EXERCISE_SWAP_PROMPT, temperature: 0.5, maxTokens: 300 },
    );
    // Parse JSON from response (model might wrap in markdown fence)
    const cleaned = result.text.replace(/```json|```/g, "").trim();
    try {
      const parsed = JSON.parse(cleaned);
      return {
        ok: true,
        text: result.text,
        provider: result.provider,
        alternatives: Array.isArray(parsed.alternatives) ? parsed.alternatives : [],
      };
    } catch {
      // Fall back to text mode
      return { ok: true, text: result.text, provider: result.provider, alternatives: [] };
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function stallDiagnosisAction(): Promise<AIResponse> {
  if (!isAIConfigured()) return { ok: false, notConfigured: true };
  try {
    const ctx = await loadContext();
    const result = await callAI(
      [{ role: "user", content: `${ctx}\n\n---\n\nDiagnose any plateau and prescribe ONE specific change.` }],
      { system: STALL_DIAGNOSIS_PROMPT, temperature: 0.5, maxTokens: 320 },
    );
    return { ok: true, text: result.text, provider: result.provider };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
