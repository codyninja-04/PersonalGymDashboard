import type { CoachMessage, CoachMessageType } from "@/types/metrics";

let counter = 0;
export function buildMessage(type: CoachMessageType, text: string): CoachMessage {
  counter += 1;
  return {
    id: `m-${Date.now()}-${counter}`,
    type,
    text,
    timestamp: new Date().toISOString(),
  };
}

export const COACH_BOOT_SEQUENCE: CoachMessage[] = [
  buildMessage("SYSTEM", "Booting forge.os — coach module engaged"),
  buildMessage("SYSTEM", "Loading composition vectors..."),
  buildMessage("SYSTEM", "Reading sleep · steps · macros..."),
  buildMessage("DIRECTIVE", "Recovery looks acceptable. You're cleared to push intensity today."),
];
