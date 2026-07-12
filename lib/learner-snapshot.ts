export const LEARNER_SNAPSHOT_KEY = "edtech-ai:learner-snapshot:v1";

export const personalizationSignals = [
  "role",
  "domain",
  "background",
  "dailyReality",
  "primaryGoal",
  "goalHorizon",
  "dailyTime",
  "preferredFormat",
  "explanationComplexity",
  "interests",
] as const;

export type PersonalizationSignal = (typeof personalizationSignals)[number];
export type LearnerSnapshot = {
  version: 1;
  role?: string;
  domain?: string;
  background?: string;
  dailyReality?: string;
  primaryGoal: string;
  goalHorizon: "quick" | "foundation" | "systematic";
  language: "ru";
  dailyTime: "10" | "20" | "40";
  preferredFormat: "explanations" | "cases" | "practice" | "mixed";
  explanationComplexity: "simple" | "professional";
  interests?: string;
  enabledPersonalizationSignals: PersonalizationSignal[];
};

type SnapshotInput = Omit<LearnerSnapshot, "version">;
export class LearnerSnapshotValidationError extends Error {}

const enumValues = {
  goalHorizon: ["quick", "foundation", "systematic"],
  language: ["ru"],
  dailyTime: ["10", "20", "40"],
  preferredFormat: ["explanations", "cases", "practice", "mixed"],
  explanationComplexity: ["simple", "professional"],
} as const;

function record(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new LearnerSnapshotValidationError("Проверьте карточку обучения");
  return value as Record<string, unknown>;
}

function text(value: unknown, required = false) {
  if (value === undefined || value === null || value === "") {
    if (required) throw new LearnerSnapshotValidationError("Укажите основную цель");
    return undefined;
  }
  if (typeof value !== "string" || !value.trim() || value.trim().length > 180) throw new LearnerSnapshotValidationError("Проверьте карточку обучения");
  return value.trim();
}

function option<T extends readonly string[]>(value: unknown, values: T, message: string): T[number] {
  if (typeof value !== "string" || !values.includes(value)) throw new LearnerSnapshotValidationError(message);
  return value as T[number];
}

export function validateLearnerSnapshot(value: unknown): SnapshotInput {
  const input = record(value);
  const signals = input.enabledPersonalizationSignals;
  if (!Array.isArray(signals) || signals.some((signal) => !personalizationSignals.includes(signal as PersonalizationSignal))) {
    throw new LearnerSnapshotValidationError("Выберите корректные сигналы");
  }
  return {
    ...(text(input.role) ? { role: text(input.role) } : {}),
    ...(text(input.domain) ? { domain: text(input.domain) } : {}),
    ...(text(input.background) ? { background: text(input.background) } : {}),
    ...(text(input.dailyReality) ? { dailyReality: text(input.dailyReality) } : {}),
    primaryGoal: text(input.primaryGoal, true)!,
    goalHorizon: option(input.goalHorizon, enumValues.goalHorizon, "Выберите горизонт цели"),
    language: option(input.language, enumValues.language, "Выберите язык"),
    dailyTime: option(input.dailyTime, enumValues.dailyTime, "Выберите доступное время"),
    preferredFormat: option(input.preferredFormat, enumValues.preferredFormat, "Выберите формат"),
    explanationComplexity: option(input.explanationComplexity, enumValues.explanationComplexity, "Выберите сложность объяснений"),
    ...(text(input.interests) ? { interests: text(input.interests) } : {}),
    enabledPersonalizationSignals: [...new Set(signals as PersonalizationSignal[])],
  };
}

export function createLearnerSnapshot(input: SnapshotInput): LearnerSnapshot {
  return { version: 1, ...input };
}

export function parseLearnerSnapshot(value: string | null): LearnerSnapshot | null {
  try {
    const parsed = record(JSON.parse(value ?? ""));
    if (parsed.version !== 1) return null;
    return createLearnerSnapshot(validateLearnerSnapshot(parsed));
  } catch { return null; }
}
