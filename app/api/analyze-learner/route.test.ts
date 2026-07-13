import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const originalApiKey = process.env.OPENROUTER_API_KEY;
const narrative = "Я продуктовый дизайнер в EdTech, провожу исследования и люблю архитектуру и бег.";

const completeAnalysis = {
  summary: "Продуктовый дизайнер в EdTech с опытом исследований и интересом к архитектуре и бегу.",
  role: "Продуктовый дизайнер",
  domain: "EdTech",
  background: "Исследования пользователей",
  interests: "архитектура, бег",
  followUpQuestion: "Какие задачи из вашей работы лучше использовать в примерах?",
  followUpOptions: [
    { id: "a", label: "Исследования", description: "Интервью и проверка гипотез" },
    { id: "b", label: "Сценарии", description: "Проектирование пользовательского пути" },
    { id: "c", label: "Эксперименты", description: "Метрики и оценка изменений" },
  ],
};

function request() {
  return new Request("http://localhost/api/analyze-learner", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ narrative }),
  });
}

function upstream(content: unknown, model = "provider/example:free") {
  return new Response(
    JSON.stringify({ model, choices: [{ message: { content: JSON.stringify(content) } }] }),
    { status: 200 },
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  if (originalApiKey === undefined) delete process.env.OPENROUTER_API_KEY;
  else process.env.OPENROUTER_API_KEY = originalApiKey;
});

describe("POST /api/analyze-learner", () => {
  it("returns a validated learner analysis from the free router", async () => {
    process.env.OPENROUTER_API_KEY = "test-key";
    const fetchMock = vi.fn().mockResolvedValue(upstream(completeAnalysis));
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(request());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ analysis: completeAnalysis, model: "provider/example:free" });
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.model).toBe("openrouter/free");
    expect(body.messages[0].content).toContain("Категорически не спрашивай, чему человек хочет научиться");
    expect(body.messages[1].content).toContain(narrative);
  });

  it("retries once after a structurally incomplete analysis", async () => {
    process.env.OPENROUTER_API_KEY = "test-key";
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(upstream({ ...completeAnalysis, followUpOptions: completeAnalysis.followUpOptions.slice(0, 2) }))
      .mockResolvedValueOnce(upstream(completeAnalysis, "provider/second:free"));
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(request());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ model: "provider/second:free" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("reports a missing key without calling OpenRouter", async () => {
    delete process.env.OPENROUTER_API_KEY;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(request());

    expect(response.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not retry a rate limit", async () => {
    process.env.OPENROUTER_API_KEY = "test-key";
    const fetchMock = vi.fn().mockResolvedValue(new Response("busy", { status: 429 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(request());

    expect(response.status).toBe(503);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
