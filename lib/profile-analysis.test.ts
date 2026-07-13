import { describe, expect, it } from "vitest";
import { parseProfileAnalysis, validateProfileNarrative } from "./profile-analysis";

const validAnalysis = {
  summary: "Продуктовый дизайнер, который умеет исследовать пользователей и интересуется городской средой.",
  role: "Продуктовый дизайнер",
  domain: "Цифровые продукты",
  background: "Проводит исследования и проектирует пользовательские сценарии",
  interests: "городская среда, бег",
  followUpQuestion: "Какие рабочие ситуации лучше всего использовать в учебных примерах?",
  followUpOptions: [
    { id: "a", label: "Исследования", description: "Интервью, наблюдения и проверка гипотез" },
    { id: "b", label: "Проектирование", description: "Сценарии, прототипы и продуктовые решения" },
    { id: "c", label: "Метрики", description: "Данные, эксперименты и оценка результата" },
  ],
};

describe("profile analysis", () => {
  it("accepts a meaningful narrative and trims it", () => {
    expect(validateProfileNarrative(`  ${"Я проектирую цифровые продукты и люблю бег."}  `)).toBe(
      "Я проектирую цифровые продукты и люблю бег.",
    );
  });

  it("rejects a narrative that cannot provide enough context", () => {
    expect(() => validateProfileNarrative("Я дизайнер")).toThrow("Расскажите немного подробнее");
  });

  it("parses one focused follow-up with exactly three options", () => {
    expect(parseProfileAnalysis(validAnalysis)).toEqual(validAnalysis);
    expect(() => parseProfileAnalysis({ ...validAnalysis, followUpOptions: validAnalysis.followUpOptions.slice(0, 2) })).toThrow(
      "три варианта",
    );
  });
});
