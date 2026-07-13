export const LEARNER_SNAPSHOT_KEY = "edtech-ai:learner-snapshot:v2";

export const personalizationSignals = [
  "role",
  "domain",
  "background",
  "currentFocus",
  "dailyReality",
  "primaryGoal",
  "successCriterion",
  "goalHorizon",
  "dailyTime",
  "studyFrequency",
  "learningBarrier",
  "preferredFormat",
  "supportPreference",
  "explanationComplexity",
  "interests",
  "avoidContext",
] as const;

export type PersonalizationSignal = (typeof personalizationSignals)[number];
export type LearnerSnapshot = {
  version: 2;
  role?: string;
  domain?: string;
  background?: string;
  currentFocus: "work" | "study" | "personal-project" | "transition";
  dailyReality?: string;
  primaryGoal: string;
  successCriterion: "understand" | "apply" | "create" | "explain";
  goalHorizon: "quick" | "foundation" | "systematic";
  language: "ru";
  dailyTime: "10" | "20" | "40";
  studyFrequency: "daily" | "few-times-week" | "weekly" | "flexible";
  learningBarrier: "time" | "theory-overload" | "not-enough-practice" | "motivation" | "unclear-progress";
  preferredFormat: "explanations" | "cases" | "practice" | "mixed";
  supportPreference: "analogy" | "smaller-steps" | "hint" | "more-practice";
  explanationComplexity: "simple" | "professional";
  interests?: string;
  avoidContext?: string;
  enabledPersonalizationSignals: PersonalizationSignal[];
};

type SnapshotInput = Omit<LearnerSnapshot, "version">;
export class LearnerSnapshotValidationError extends Error {}

const enumValues = {
  currentFocus: ["work", "study", "personal-project", "transition"],
  successCriterion: ["understand", "apply", "create", "explain"],
  goalHorizon: ["quick", "foundation", "systematic"],
  language: ["ru"],
  dailyTime: ["10", "20", "40"],
  studyFrequency: ["daily", "few-times-week", "weekly", "flexible"],
  learningBarrier: ["time", "theory-overload", "not-enough-practice", "motivation", "unclear-progress"],
  preferredFormat: ["explanations", "cases", "practice", "mixed"],
  supportPreference: ["analogy", "smaller-steps", "hint", "more-practice"],
  explanationComplexity: ["simple", "professional"],
} as const;

const promptLabels = {
  currentFocus: {
    work: "работа и профессиональные задачи",
    study: "учёба и формальное образование",
    "personal-project": "собственный проект",
    transition: "смена направления",
  },
  successCriterion: {
    understand: "понять систему и связи",
    apply: "применять самостоятельно",
    create: "создать конкретный результат",
    explain: "уверенно объяснять другому",
  },
  goalHorizon: {
    quick: "быстрый практический результат",
    foundation: "крепкая база без лишнего",
    systematic: "системное погружение",
  },
  studyFrequency: {
    daily: "коротко каждый день",
    "few-times-week": "несколько раз в неделю",
    weekly: "одна содержательная сессия в неделю",
    flexible: "гибко, без фиксированного графика",
  },
  learningBarrier: {
    time: "нехватка времени",
    "theory-overload": "перегруз теорией",
    "not-enough-practice": "недостаток практики",
    motivation: "сложно сохранять мотивацию",
    "unclear-progress": "непонятен прогресс",
  },
  preferredFormat: {
    explanations: "сначала увидеть карту темы",
    cases: "начать с близкого жизненного кейса",
    practice: "начать с небольшой практики",
    mixed: "идти по последовательным шагам",
  },
  supportPreference: {
    analogy: "дать другую аналогию",
    "smaller-steps": "разбить сложное на меньшие шаги",
    hint: "дать подсказку без готового ответа",
    "more-practice": "дать дополнительную практику",
  },
  explanationComplexity: {
    simple: "ясно и без лишней терминологии",
    professional: "профессионально и глубже",
  },
} as const;

function record(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new LearnerSnapshotValidationError("Проверьте карточку обучения");
  }

  return value as Record<string, unknown>;
}

function text(value: unknown, required = false) {
  if (value === undefined || value === null || value === "") {
    if (required) throw new LearnerSnapshotValidationError("Укажите основную цель");
    return undefined;
  }

  if (typeof value !== "string" || !value.trim() || value.trim().length > 240) {
    throw new LearnerSnapshotValidationError("Проверьте карточку обучения");
  }

  return value.trim();
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

  if (!Array.isArray(signals) || signals.some((signal) => !personalizationSignals.includes(signal as PersonalizationSignal))) {
    throw new LearnerSnapshotValidationError("Выберите корректные сигналы");
  }

  const role = text(input.role);
  const domain = text(input.domain);
  const background = text(input.background);
  const dailyReality = text(input.dailyReality);
  const interests = text(input.interests);
  const avoidContext = text(input.avoidContext);

  return {
    ...(role ? { role } : {}),
    ...(domain ? { domain } : {}),
    ...(background ? { background } : {}),
    currentFocus: option(input.currentFocus, enumValues.currentFocus, "Выберите текущий фокус"),
    ...(dailyReality ? { dailyReality } : {}),
    primaryGoal: text(input.primaryGoal, true)!,
    successCriterion: option(input.successCriterion, enumValues.successCriterion, "Выберите желаемый результат"),
    goalHorizon: option(input.goalHorizon, enumValues.goalHorizon, "Выберите горизонт цели"),
    language: option(input.language, enumValues.language, "Выберите язык"),
    dailyTime: option(input.dailyTime, enumValues.dailyTime, "Выберите доступное время"),
    studyFrequency: option(input.studyFrequency, enumValues.studyFrequency, "Выберите частоту обучения"),
    learningBarrier: option(input.learningBarrier, enumValues.learningBarrier, "Выберите главное препятствие"),
    preferredFormat: option(input.preferredFormat, enumValues.preferredFormat, "Выберите формат"),
    supportPreference: option(input.supportPreference, enumValues.supportPreference, "Выберите способ помощи"),
    explanationComplexity: option(
      input.explanationComplexity,
      enumValues.explanationComplexity,
      "Выберите сложность объяснений",
    ),
    ...(interests ? { interests } : {}),
    ...(avoidContext ? { avoidContext } : {}),
    enabledPersonalizationSignals: [...new Set(signals as PersonalizationSignal[])],
  };
}

export function createLearnerSnapshot(input: SnapshotInput): LearnerSnapshot {
  return { version: 2, ...input };
}

export function parseLearnerSnapshot(value: string | null): LearnerSnapshot | null {
  try {
    const parsed = record(JSON.parse(value ?? ""));
    if (parsed.version !== 2) return null;
    return createLearnerSnapshot(validateLearnerSnapshot(parsed));
  } catch {
    return null;
  }
}

export function formatLearnerSnapshotForPrompt(snapshot: LearnerSnapshot): string[] {
  const enabled = new Set(snapshot.enabledPersonalizationSignals);
  const lines: Partial<Record<PersonalizationSignal, string | undefined>> = {
    role: snapshot.role ? `Роль или занятие: ${snapshot.role}` : undefined,
    domain: snapshot.domain ? `Сфера: ${snapshot.domain}` : undefined,
    background: snapshot.background ? `Полезный прошлый опыт: ${snapshot.background}` : undefined,
    currentFocus: `Текущий фокус: ${promptLabels.currentFocus[snapshot.currentFocus]}`,
    dailyReality: snapshot.dailyReality ? `Ограничения реального графика: ${snapshot.dailyReality}` : undefined,
    primaryGoal: `Общая цель развития: ${snapshot.primaryGoal}`,
    successCriterion: `Желаемый результат: ${promptLabels.successCriterion[snapshot.successCriterion]}`,
    goalHorizon: `Горизонт: ${promptLabels.goalHorizon[snapshot.goalHorizon]}`,
    dailyTime: `Длительность занятия: ${snapshot.dailyTime} минут`,
    studyFrequency: `Ритм: ${promptLabels.studyFrequency[snapshot.studyFrequency]}`,
    learningBarrier: `Главный барьер: ${promptLabels.learningBarrier[snapshot.learningBarrier]}`,
    preferredFormat: `Удобный вход в тему: ${promptLabels.preferredFormat[snapshot.preferredFormat]}`,
    supportPreference: `Если стало сложно: ${promptLabels.supportPreference[snapshot.supportPreference]}`,
    explanationComplexity: `Плотность объяснения: ${promptLabels.explanationComplexity[snapshot.explanationComplexity]}`,
    interests: snapshot.interests ? `Контекст для примеров и аналогий: ${snapshot.interests}` : undefined,
    avoidContext: snapshot.avoidContext ? `Не использовать в примерах: ${snapshot.avoidContext}` : undefined,
  };

  return personalizationSignals.flatMap((signal) => {
    const line = lines[signal];
    return enabled.has(signal) && line ? [line] : [];
  });
}
