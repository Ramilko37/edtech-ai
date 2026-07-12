import { describe, expect, it } from "vitest";
import { parseGeneratedCourse, validateGenerateCourseInput } from "./course";

const validPayload = {
  title: "AI для редактора: 7 дней практики",
  passport: [{ label: "Цель", value: "научиться проверять тексты" }],
  whyThisRoute: "Маршрут начинает с задач редактора и добавляет проверку фактов.",
  days: Array.from({ length: 7 }, (_, index) => ({
    day: index + 1,
    title: `День ${index + 1}`,
    objective: "Освоить один небольшой навык.",
    practice: "Выполнить короткое упражнение.",
  })),
  firstLesson: {
    title: "Как сформулировать проверяемый запрос",
    explanation: "Начнём с контекста редакторской задачи.",
    task: "Сформулируйте один запрос для своей заметки.",
    feedbackPrompt: "Проверьте, названы ли цель, ограничения и критерий качества.",
  },
};

describe("validateGenerateCourseInput", () => {
  it("normalises optional learner signals and accepts a non-empty topic", () => {
    expect(
      validateGenerateCourseInput({
        topic: "  AI для редактора ",
        goal: "  проверять тексты ",
        context: "  редакция ",
        level: "basic",
      }),
    ).toEqual({
      topic: "AI для редактора",
      goal: "проверять тексты",
      context: "редакция",
      level: "basic",
    });
  });

  it("rejects a missing topic and an unsupported level", () => {
    expect(() => validateGenerateCourseInput({ topic: "", level: "expert" })).toThrow(
      "Укажите тему обучения",
    );
  });
});

describe("parseGeneratedCourse", () => {
  it("accepts exactly seven ordered course days", () => {
    expect(
      parseGeneratedCourse(validPayload, "openrouter/free", "2026-07-12T12:00:00.000Z"),
    ).toMatchObject({ title: validPayload.title, model: "openrouter/free" });
  });

  it("rejects a model payload that does not contain days one through seven", () => {
    expect(() =>
      parseGeneratedCourse(
        { ...validPayload, days: validPayload.days.slice(0, 6) },
        "openrouter/free",
        "2026-07-12T12:00:00.000Z",
      ),
    ).toThrow("ровно 7 дней");
  });
});
