import {
  parseProfileAnalysis,
  ProfileAnalysisValidationError,
  validateProfileNarrative,
} from "@/lib/profile-analysis";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const systemPrompt = `Ты внимательный AI-интервьюер образовательного продукта. По короткому рассказу человека собери только явно указанный учебный контекст и задай один полезный уточняющий вопрос.
Ответь только JSON-объектом без markdown:
{
  "summary": "одно точное предложение о человеке без оценки способностей",
  "role": "роль или занятие, если указано",
  "domain": "сфера, если указана",
  "background": "опыт и знакомые задачи, если указаны",
  "interests": "интересы, если указаны",
  "followUpQuestion": "один конкретный вопрос о самом важном недостающем контексте",
  "followUpOptions": [
    { "id": "a", "label": "короткий вариант", "description": "конкретное пояснение" },
    { "id": "b", "label": "короткий вариант", "description": "конкретное пояснение" },
    { "id": "c", "label": "короткий вариант", "description": "конкретное пояснение" }
  ]
}
Не диагностируй интеллект, способности, психологический тип или уровень знаний. Не выдумывай профессию, страну, возраст и чувствительные данные.
Уточняй только устойчивый контекст человека: тип знакомых ситуаций, степень самостоятельности, рабочую среду, ограничения или привычный способ решать задачи. Категорически не спрашивай, чему человек хочет научиться, какую тему или навык выбрать, какую профессиональную задачу решить обучением и какой курс ему нужен — тему он выберет отдельно после onboarding.
Варианты должны быть осмысленными именно для этого рассказа, а не универсальными формулировками.`;

function json(body: unknown, status = 200) {
  return Response.json(body, { status });
}

function parseModelJson(content: string) {
  return JSON.parse(content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, ""));
}

export async function POST(request: Request): Promise<Response> {
  let narrative: string;
  try {
    const payload = (await request.json()) as { narrative?: unknown };
    narrative = validateProfileNarrative(payload.narrative);
  } catch (error) {
    return json(
      { error: error instanceof ProfileAnalysisValidationError ? error.message : "Проверьте рассказ о себе" },
      400,
    );
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return json({ error: "AI-интервью пока не настроено" }, 503);

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    let upstream: Response;
    try {
      upstream = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openrouter/free",
          temperature: 0.35,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Рассказ ученика:\n${narrative}` },
          ],
        }),
        signal: AbortSignal.timeout(30_000),
      });
    } catch {
      return json({ error: "Не удалось связаться с AI-интервьюером. Попробуйте ещё раз." }, 503);
    }

    if (!upstream.ok) {
      if (upstream.status === 429) return json({ error: "Бесплатная модель сейчас занята. Попробуйте ещё раз." }, 503);
      return json({ error: "AI-интервьюер временно недоступен. Попробуйте ещё раз." }, 503);
    }

    try {
      const payload = (await upstream.json()) as {
        model?: unknown;
        choices?: Array<{ message?: { content?: unknown } }>;
      };
      const content = payload.choices?.[0]?.message?.content;
      if (typeof content !== "string") throw new ProfileAnalysisValidationError("В ответе модели нет содержимого");
      const analysis = parseProfileAnalysis(parseModelJson(content));
      return json({ analysis, model: typeof payload.model === "string" ? payload.model : "openrouter/free" });
    } catch (error) {
      console.error(
        `OpenRouter returned an invalid profile analysis (attempt ${attempt}/2):`,
        error instanceof Error ? error.message : "unknown validation error",
      );
    }
  }

  return json({ error: "AI не смог собрать слепок. Попробуйте ещё раз." }, 502);
}
