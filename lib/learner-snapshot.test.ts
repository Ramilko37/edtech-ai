import { describe, expect, it } from "vitest";
import {
  createLearnerSnapshot,
  formatLearnerSnapshotForPrompt,
  parseLearnerSnapshot,
  validateLearnerSnapshot,
} from "./learner-snapshot";

const snapshot = {
  role: "Аккаунт-менеджер",
  domain: "B2B SaaS",
  currentFocus: "work",
  primaryGoal: "Развиваться в профессии",
  successCriterion: "apply",
  goalHorizon: "quick",
  language: "ru",
  dailyTime: "20",
  studyFrequency: "few-times-week",
  learningBarrier: "theory-overload",
  preferredFormat: "practice",
  supportPreference: "smaller-steps",
  explanationComplexity: "professional",
  interests: "велоспорт",
  enabledPersonalizationSignals: ["role", "primaryGoal", "successCriterion", "preferredFormat"],
};

describe("learner snapshot", () => {
  it("accepts a voluntary learner context", () => {
    expect(validateLearnerSnapshot(snapshot)).toMatchObject({ role: "Аккаунт-менеджер", language: "ru" });
  });

  it("rejects unknown consent signals", () => {
    expect(() => validateLearnerSnapshot({ ...snapshot, enabledPersonalizationSignals: ["country"] })).toThrow("Выберите корректные сигналы");
  });

  it("rejects unsupported diagnostic answers", () => {
    expect(() => validateLearnerSnapshot({ ...snapshot, learningBarrier: "low-ability" })).toThrow(
      "Выберите главное препятствие",
    );
  });

  it("formats only consented signals as readable prompt context", () => {
    const value = createLearnerSnapshot(validateLearnerSnapshot(snapshot));

    expect(formatLearnerSnapshotForPrompt(value)).toEqual([
      "Роль или занятие: Аккаунт-менеджер",
      "Общая цель развития: Развиваться в профессии",
      "Желаемый результат: применять самостоятельно",
      "Удобный вход в тему: начать с небольшой практики",
    ]);
    expect(formatLearnerSnapshotForPrompt(value).join("\n")).not.toContain("B2B SaaS");
  });

  it("restores only a current, valid session payload", () => {
    const value = JSON.stringify(createLearnerSnapshot(validateLearnerSnapshot(snapshot)));
    expect(parseLearnerSnapshot(value)).toMatchObject({ version: 2, role: "Аккаунт-менеджер" });
    expect(parseLearnerSnapshot('{"version":1}')).toBeNull();
  });
});
