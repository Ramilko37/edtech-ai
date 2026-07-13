import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const originalApiKey = process.env.OPENROUTER_API_KEY;

function request() {
  return new Request("http://localhost/api/generate-course", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      topic: "AI для редактора",
      topicFamiliarity: "basic",
      learnerSnapshot: {
        role: "Редактор",
        domain: "Медиа",
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
        enabledPersonalizationSignals: ["role", "primaryGoal", "successCriterion"],
      },
    }),
  });
}

function modelPayload(days = 7) {
  return {
    title: "AI для редактора: 7 дней практики",
    passport: [{ label: "Цель", value: "проверять тексты" }],
    whyThisRoute: "Начинаем с привычных задач редактора и добавляем проверку фактов.",
    days: Array.from({ length: days }, (_, index) => ({
      day: index + 1,
      title: `День ${index + 1}`,
      objective: "Освоить небольшой навык.",
      practice: "Выполнить короткое упражнение.",
    })),
    firstLesson: {
      title: "Проверяемый запрос",
      explanation: "Начнём с контекста редакторской задачи.",
      task: "Сформулируйте один запрос для своей заметки.",
      feedbackPrompt: "Проверьте цель, ограничения и критерий качества.",
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();

  if (originalApiKey === undefined) {
    delete process.env.OPENROUTER_API_KEY;
  } else {
    process.env.OPENROUTER_API_KEY = originalApiKey;
  }
});

describe("POST /api/generate-course", () => {
  it("creates a validated course with the OpenRouter free router", async () => {
    process.env.OPENROUTER_API_KEY = "test-key";
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          model: "provider/example:free",
          choices: [{ message: { content: JSON.stringify(modelPayload()) } }],
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ course: { model: "provider/example:free" } });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://openrouter.ai/api/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer test-key" }),
      }),
    );
    const upstreamBody = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    const prompt = upstreamBody.messages[1].content as string;
    expect(prompt).toContain("Желаемый результат: применять самостоятельно");
    expect(prompt).not.toContain("Медиа");
  });

  it("accepts a JSON course wrapped in a markdown fence by a free model", async () => {
    process.env.OPENROUTER_API_KEY = "test-key";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            model: "provider/example:free",
            choices: [{ message: { content: `\`\`\`json\n${JSON.stringify(modelPayload())}\n\`\`\`` } }],
          }),
          { status: 200 },
        ),
      ),
    );

    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ course: { title: "AI для редактора: 7 дней практики" } });
  });

  it("retries once when the first free model returns an incomplete course", async () => {
    process.env.OPENROUTER_API_KEY = "test-key";
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            model: "provider/first:free",
            choices: [{ message: { content: JSON.stringify(modelPayload(6)) } }],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            model: "provider/second:free",
            choices: [{ message: { content: JSON.stringify(modelPayload()) } }],
          }),
          { status: 200 },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ course: { model: "provider/second:free" } });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("reports a missing server key without calling OpenRouter", async () => {
    delete process.env.OPENROUTER_API_KEY;

    const response = await POST(request());

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: "Генерация пока не настроена" });
  });

  it("maps a busy free-model response to a safe public error", async () => {
    process.env.OPENROUTER_API_KEY = "test-key";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("busy", { status: 429 })));

    const response = await POST(request());

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "Бесплатная модель сейчас занята. Попробуйте ещё раз.",
    });
  });

  it("rejects an incomplete course returned by the model", async () => {
    process.env.OPENROUTER_API_KEY = "test-key";
    const fetchMock = vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ choices: [{ message: { content: JSON.stringify(modelPayload(6)) } }] }),
          { status: 200 },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(request());

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: "Модель вернула неполную карту. Попробуйте ещё раз.",
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
