import { describe, expect, it } from "vitest";
import { createLearnerSnapshot, parseLearnerSnapshot, validateLearnerSnapshot } from "./learner-snapshot";

const snapshot = {
  role: "Аккаунт-менеджер",
  domain: "B2B SaaS",
  primaryGoal: "Развиваться в профессии",
  goalHorizon: "quick",
  language: "ru",
  dailyTime: "20",
  preferredFormat: "practice",
  explanationComplexity: "professional",
  interests: "велоспорт",
  enabledPersonalizationSignals: ["role", "primaryGoal", "preferredFormat"],
};

describe("learner snapshot", () => {
  it("accepts a voluntary learner context", () => {
    expect(validateLearnerSnapshot(snapshot)).toMatchObject({ role: "Аккаунт-менеджер", language: "ru" });
  });

  it("rejects unknown consent signals", () => {
    expect(() => validateLearnerSnapshot({ ...snapshot, enabledPersonalizationSignals: ["country"] })).toThrow("Выберите корректные сигналы");
  });

  it("restores only a current, valid session payload", () => {
    const value = JSON.stringify(createLearnerSnapshot(validateLearnerSnapshot(snapshot)));
    expect(parseLearnerSnapshot(value)).toMatchObject({ version: 1, role: "Аккаунт-менеджер" });
    expect(parseLearnerSnapshot('{"version":2}')).toBeNull();
  });
});
