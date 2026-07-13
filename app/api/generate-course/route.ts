import {
  CourseValidationError,
  parseGeneratedCourse,
  validateGenerateCourseInput,
  type GenerateCourseInput,
} from "@/lib/course";
import { formatLearnerSnapshotForPrompt } from "@/lib/learner-snapshot";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const systemPrompt = `Ты AI-методист. Создай персональную, но не выдумывающую факты 7-дневную карту обучения на русском языке.
Ответь только JSON-объектом без markdown. Используй ровно эту форму:
{
  "title": "строка",
  "passport": [{ "label": "строка", "value": "строка" }],
  "whyThisRoute": "строка",
  "days": [{ "day": 1, "title": "строка", "objective": "строка", "practice": "строка" }],
  "firstLesson": { "title": "строка", "explanation": "строка", "task": "строка", "feedbackPrompt": "строка" }
}
Требования: ровно 7 дней с номерами от 1 до 7; от 1 до 4 пунктов паспорта; объясни, почему порядок подходит сигналам ученика; используй только добровольно переданный контекст; не запрашивай и не выдумывай чувствительные данные; задания помогают ученику понять и выполнить небольшую практику самостоятельно, а не делают работу за него. Не давай медицинских, юридических или финансовых рекомендаций.`;

function json(body: unknown, status = 200) {
  return Response.json(body, { status });
}

function userPrompt(input: GenerateCourseInput) {
  const profile = formatLearnerSnapshotForPrompt(input.learnerSnapshot);

  return [
    `Тема: ${input.topic}`,
    input.courseGoal ? `Цель курса: ${input.courseGoal}` : "Цель курса: понять и применить основы",
    input.topicFamiliarity ? `Знакомство с темой: ${input.topicFamiliarity}` : "Знакомство с темой: начинающий",
    `Разрешённый контекст ученика:\n${profile.join("\n") || "не указан"}`,
  ].join("\n");
}

function parseModelJson(content: string) {
  const withoutCodeFence = content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");

  return JSON.parse(withoutCodeFence);
}

export async function POST(request: Request): Promise<Response> {
  let input;

  try {
    input = validateGenerateCourseInput(await request.json());
  } catch (error) {
    if (error instanceof CourseValidationError) {
      return json({ error: error.message }, 400);
    }

    return json({ error: "Проверьте данные для генерации" }, 400);
  }

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return json({ error: "Генерация пока не настроена" }, 503);
  }

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    let upstream: Response;

    try {
      upstream = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openrouter/free",
          temperature: 0.5,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt(input) },
          ],
        }),
        signal: AbortSignal.timeout(30_000),
      });
    } catch {
      return json({ error: "Не удалось связаться с бесплатной моделью. Попробуйте ещё раз." }, 503);
    }

    if (!upstream.ok) {
      if (upstream.status === 429) {
        return json({ error: "Бесплатная модель сейчас занята. Попробуйте ещё раз." }, 503);
      }

      return json({ error: "Бесплатная модель временно недоступна. Попробуйте ещё раз." }, 503);
    }

    try {
      const payload = (await upstream.json()) as {
        model?: unknown;
        choices?: Array<{ message?: { content?: unknown } }>;
      };
      const content = payload.choices?.[0]?.message?.content;

      if (typeof content !== "string") {
        throw new CourseValidationError("У модели нет содержимого ответа");
      }

      const course = parseGeneratedCourse(
        parseModelJson(content),
        typeof payload.model === "string" ? payload.model : "openrouter/free",
        new Date().toISOString(),
      );

      return json({ course });
    } catch (error) {
      console.error(
        `OpenRouter returned an invalid course payload (attempt ${attempt}/2):`,
        error instanceof Error ? error.message : "unknown validation error",
      );
    }
  }

  return json({ error: "Модель вернула неполную карту. Попробуйте ещё раз." }, 502);
}
