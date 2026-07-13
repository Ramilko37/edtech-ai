export const LEARNER_SNAPSHOT_KEY = "edtech-ai:learner-snapshot:v3";

export const personalizationSignals = [
  "profileSummary",
  "role",
  "domain",
  "background",
  "interests",
  "followUpAnswer",
  "successCriterion",
  "dailyTime",
] as const;

export type PersonalizationSignal = (typeof personalizationSignals)[number];
export type SuccessCriterion = "understand" | "apply" | "create" | "explain";
export type DailyTime = "10" | "20" | "40";

export type LearnerSnapshot = {
  version: 3;
  selfDescription: string;
  profileSummary: string;
  role?: string;
  domain?: string;
  background?: string;
  interests?: string;
  followUpQuestion: string;
  followUpAnswer: string;
  successCriterion: SuccessCriterion;
  dailyTime: DailyTime;
  language: "ru";
  enabledPersonalizationSignals: PersonalizationSignal[];
};

type SnapshotInput = Omit<LearnerSnapshot, "version">;
export class LearnerSnapshotValidationError extends Error {}

const enumValues = {
  successCriterion: ["understand", "apply", "create", "explain"],
  dailyTime: ["10", "20", "40"],
  language: ["ru"],
} as const;

const successCriterionLabels: Record<SuccessCriterion, string> = {
  understand: "понять систему и связи",
  apply: "применять самостоятельно",
  create: "создать конкретный результат",
  explain: "уверенно объяснять другому",
};

function record(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new LearnerSnapshotValidationError("Проверьте карточку обучения");
  }

  return value as Record<string, unknown>;
}

function text(value: unknown, options: { required?: boolean; min?: number; max?: number; message?: string } = {}) {
  const { required = false, min = 1, max = 240, message = "Проверьте карточку обучения" } = options;

  if (value === undefined || value === null || value === "") {
    if (required) throw new LearnerSnapshotValidationError(message);
    return undefined;
  }

  if (typeof value !== "string") throw new LearnerSnapshotValidationError(message);
  const trimmed = value.trim();

  if (trimmed.length < min || trimmed.length > max) {
    throw new LearnerSnapshotValidationError(message);
  }

  return trimmed;
}

function option<T extends readonly string[]>(value: unknown, values: T, message: string): T[number] {
  if (typeof value !== "string" || !values.includes(value)) {
    throw new LearnerSnapshotValidationError(message);
  }

  return value as T[number];
}

export function validateLearnerSnapshot(value: unknown): SnapshotInput {
  const input = record(value);
  const signals = input.enabledPersonalizationSignals;

  if (
    !Array.isArray(signals) ||
    signals.some((signal) => !personalizationSignals.includes(signal as PersonalizationSignal))
  ) {
    throw new LearnerSnapshotValidationError("Выберите корректные сигналы");
  }

  const role = text(input.role);
  const domain = text(input.domain);
  const background = text(input.background);
  const interests = text(input.interests);

  return {
    selfDescription: text(input.selfDescription, {
      required: true,
      min: 30,
      max: 800,
      message: "Расскажите о себе чуть подробнее",
    })!,
    profileSummary: text(input.profileSummary, { required: true, max: 320 })!,
    ...(role ? { role } : {}),
    ...(domain ? { domain } : {}),
    ...(background ? { background } : {}),
    ...(interests ? { interests } : {}),
    followUpQuestion: text(input.followUpQuestion, { required: true, max: 220 })!,
    followUpAnswer: text(input.followUpAnswer, { required: true, max: 240 })!,
    successCriterion: option(
      input.successCriterion,
      enumValues.successCriterion,
      "Выберите желаемый результат",
    ),
    dailyTime: option(input.dailyTime, enumValues.dailyTime, "Выберите доступное время"),
    language: option(input.language, enumValues.language, "Выберите язык"),
    enabledPersonalizationSignals: [...new Set(signals as PersonalizationSignal[])],
  };
}

export function createLearnerSnapshot(input: SnapshotInput): LearnerSnapshot {
  return { version: 3, ...validateLearnerSnapshot(input) };
}

export function parseLearnerSnapshot(value: string | null): LearnerSnapshot | null {
  try {
    const parsed = record(JSON.parse(value ?? ""));
    if (parsed.version !== 3) return null;
    return createLearnerSnapshot(validateLearnerSnapshot(parsed));
  } catch {
    return null;
  }
}

export function formatLearnerSnapshotForPrompt(snapshot: LearnerSnapshot): string[] {
  const enabled = new Set(snapshot.enabledPersonalizationSignals);
  const lines: Partial<Record<PersonalizationSignal, string | undefined>> = {
    profileSummary: `Краткий слепок: ${snapshot.profileSummary}`,
    role: snapshot.role ? `Роль или занятие: ${snapshot.role}` : undefined,
    domain: snapshot.domain ? `Сфера: ${snapshot.domain}` : undefined,
    background: snapshot.background ? `Полезный прошлый опыт: ${snapshot.background}` : undefined,
    interests: snapshot.interests ? `Контекст для примеров и аналогий: ${snapshot.interests}` : undefined,
    followUpAnswer: `Ответ на персональный вопрос: ${snapshot.followUpAnswer}`,
    successCriterion: `Желаемый результат: ${successCriterionLabels[snapshot.successCriterion]}`,
    dailyTime: `Длительность занятия: ${snapshot.dailyTime} минут`,
  };

  return personalizationSignals.flatMap((signal) => {
    const line = lines[signal];
    return enabled.has(signal) && line ? [line] : [];
  });
}
