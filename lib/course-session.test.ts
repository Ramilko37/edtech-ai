import { describe, expect, it } from "vitest";
import { createCourseSession, parseCourseSession, toggleCourseDay } from "./course-session";
import type { GeneratedCourse } from "./course";

const course: GeneratedCourse = {
  title: "Курс",
  passport: [{ label: "Цель", value: "Понять тему" }],
  whyThisRoute: "Маршрут начинается с базы.",
  days: Array.from({ length: 7 }, (_, index) => ({
    day: index + 1,
    title: `День ${index + 1}`,
    objective: "Цель",
    practice: "Практика",
  })),
  firstLesson: {
    title: "Урок",
    explanation: "Объяснение",
    task: "Задание",
    feedbackPrompt: "Проверьте ответ",
  },
  model: "openrouter/free",
  generatedAt: "2026-07-12T12:00:00.000Z",
};

describe("course session", () => {
  it("starts a new session with no completed days", () => {
    expect(createCourseSession(course)).toEqual({ version: 1, course, completedDays: [] });
  });

  it("toggles a valid course day without mutating the original session", () => {
    const initial = createCourseSession(course);

    expect(toggleCourseDay(initial, 3).completedDays).toEqual([3]);
    expect(toggleCourseDay(toggleCourseDay(initial, 3), 3).completedDays).toEqual([]);
    expect(initial.completedDays).toEqual([]);
  });

  it("rejects corrupted or obsolete session data", () => {
    expect(parseCourseSession('{"version":2}')).toBeNull();
    expect(parseCourseSession("not json")).toBeNull();
  });
});
