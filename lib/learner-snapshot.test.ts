import { describe, expect, it } from "vitest";
import {
  createLearnerSnapshot,
  formatLearnerSnapshotForPrompt,
  parseLearnerSnapshot,
  validateLearnerSnapshot,
} from "./learner-snapshot";

const snapshot = {
  selfDescription: "Я продуктовый дизайнер в EdTech, провожу исследования и люблю архитектуру и бег.",
  profileSummary: "Продуктовый дизайнер с опытом исследований и интересом к архитектуре и бегу.",
  role: "Продуктовый дизайнер",
  domain: "EdTech",
  background: "Исследования пользователей",
  interests: "архитектура, бег",
  followUpQuestion: "Какие рабочие ситуации лучше использовать в примерах?",
  followUpAnswer: "Проверка продуктовых гипотез",
  successCriterion: "create",
  dailyTime: "20",
  language: "ru",
  enabledPersonalizationSignals: ["profileSummary", "role", "background", "followUpAnswer", "successCriterion", "dailyTime"],
};

describe("learner snapshot v3", () => {
  it("accepts an intentional AI-interview profile", () => {
    expect(validateLearnerSnapshot(snapshot)).toMatchObject({
      role: "Продуктовый дизайнер",
      successCriterion: "create",
    });
  });

  it("rejects missing intentional choices", () => {
    expect(() => validateLearnerSnapshot({ ...snapshot, dailyTime: undefined })).toThrow("Выберите доступное время");
  });

  it("formats only consented signals as readable prompt context", () => {
    const value = createLearnerSnapshot(validateLearnerSnapshot(snapshot));
    expect(formatLearnerSnapshotForPrompt(value)).toEqual([
      "Краткий слепок: Продуктовый дизайнер с опытом исследований и интересом к архитектуре и бегу.",
      "Роль или занятие: Продуктовый дизайнер",
      "Полезный прошлый опыт: Исследования пользователей",
      "Ответ на персональный вопрос: Проверка продуктовых гипотез",
      "Желаемый результат: создать конкретный результат",
      "Длительность занятия: 20 минут",
    ]);
    expect(formatLearnerSnapshotForPrompt(value).join("\n")).not.toContain("EdTech");
  });

  it("restores only a current v3 session payload", () => {
    const value = JSON.stringify(createLearnerSnapshot(validateLearnerSnapshot(snapshot)));
    expect(parseLearnerSnapshot(value)).toMatchObject({ version: 3, role: "Продуктовый дизайнер" });
    expect(parseLearnerSnapshot(JSON.stringify({ version: 2, ...snapshot }))).toBeNull();
  });
});
