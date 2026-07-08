"use client";

import { ArrowLeft, BotMessageSquare, RefreshCcw, Send, Sparkles } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type CurrentLevel = "beginner" | "intermediate" | "advanced" | "unknown";

type LearnerProfile = {
  learningGoal: string;
  currentLevel: CurrentLevel;
  professionOrContext: string;
  interests: string;
  language: string;
};

type AgentOutput = {
  explanation: string;
  personalizedExample: string;
  checkQuestion: string;
  nextStep: string;
  teacherNote: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  output?: AgentOutput;
};

const levelLabelMap: Record<CurrentLevel, string> = {
  beginner: "beginner",
  intermediate: "intermediate",
  advanced: "advanced",
  unknown: "unknown",
};

function splitInterests(raw: string) {
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function extractTopic(message: string, goal: string) {
  const cleaned = message.trim().replace(/\?+$/, "");
  if (cleaned.length > 0 && cleaned.length < 140) {
    return cleaned;
  }

  if (goal.trim().length > 0) {
    return goal.trim();
  }

  return "выбранную тему";
}

function isFullSolutionRequest(message: string) {
  const text = message.toLowerCase();
  return /сделай|реши|подготовь|напиши|сделай\s+за\s+меня|домашн|реферат|эссе|проект|отчет|код/.test(
    text,
  );
}

function isTooBroadTopic(message: string) {
  const text = message.toLowerCase();
  return /научи\s+меня|обучи\s+меня|всех тем|весь курс|объясни все/.test(text);
}

function buildTeacherOutput(profile: LearnerProfile, userMessage: string): AgentOutput {
  const topic = extractTopic(userMessage, profile.learningGoal);
  const interests = splitInterests(profile.interests);
  const contextHint = interests.length > 0 ? interests.join(", ") : "практическими задачами";
  const profession = profile.professionOrContext.trim() || "ваш профессиональный контекст";

  if (profile.currentLevel === "unknown") {
    return {
      explanation:
        "Я не знаю твой текущий уровень ещё точно, поэтому начну с базового объяснения и затем подстрою глубину.",
      personalizedExample: `Для ${profession} я дам короткий практический каркас: 3-4 шага, без перегруза и с примерами из реальной работы.`,
      checkQuestion:
        `Какой у тебя уровень по теме «${topic}» по шкале 0–3 (0 — никогда не встречал, 3 — применял на практике)?`,
      nextStep:
        "Ответь на один уточняющий вопрос: сколько опыта по этой теме у тебя уже было и в каком контексте?",
      teacherNote:
        "Уровень неизвестен; выбрана стратегия базового старта + один уточняющий вопрос для калибровки сложности",
    };
  }

  if (isFullSolutionRequest(userMessage)) {
    return {
      explanation:
        "Я не решу задачу полностью за тебя, потому что тогда не получится перенести навык. Вместо этого дам план и помогу проверить черновик.",
      personalizedExample: `Для ${profession} часто лучше разложить задачу на 3 шага: формулировка цели, структура решения, проверка.`,
      checkQuestion:
        "С чего уже начал(а) и где конкретно возникло затруднение — в формулировке, в логике или в примерах?",
      nextStep:
        "Напиши 3 строки черновика твоего текущего решения, и мы разберем каждый шаг.",
      teacherNote:
        "Запрос распознан как просьба сделать работу полностью. Возвращен учебный режим: подход + план + проверка черновика",
    };
  }

  if (isTooBroadTopic(userMessage)) {
    return {
      explanation:
        "Запрос слишком широкий для одного ответа. Лучше двигаться маленькими блоками: сперва базовое понимание, потом углубление.",
      personalizedExample: `В сфере ${profession} это как строить маршрут: короткий первый участок, потом второй. Первым выберем практический блок из твоей области ${contextHint}.`,
      checkQuestion: `Какую конкретную подзадачу ты хочешь закрыть первой в рамках «${topic}» в ближайшие 15 минут?`,
      nextStep:
        "Назови первый мини-результат (например, \"сформировать список из 3 терминов\" или \"сделать первый пример\"), и я разбиваю его на шаги.",
      teacherNote:
        "Сначала декомпозировано сложный запрос в управляемый маршрут, чтобы не перегружать и сохранить фокус на применении",
    };
  }

  const levelHint =
    profile.currentLevel === "advanced"
      ? "детализирую связи, тонкости и ошибки"
      : profile.currentLevel === "intermediate"
        ? "покажу структуру и 1-2 опоры"
        : "дойду от простого примера к формальному определению";

  return {
    explanation: `По теме «${topic}» даю короткий разбор по схеме: сначала смысл, затем пример, потом мини-проверка. Учитываю уровень ${levelLabelMap[profile.currentLevel]}, поэтому объясняю ${levelHint}.`,
    personalizedExample: `В твоем контексте (${profession}) возьми один кейс из реальной работы и отрази его через ${contextHint}. Это ускорит перенос знания на практику.`,
    checkQuestion: `Какой из ключевых шагов по «${topic}» ты можешь применить в задаче уже сегодня, и почему именно этот?`,
    nextStep: "Сделай микро-итерацию: сформулируй 2–3 строки твоего понимания и пришли их — я дам точечную правку.",
    teacherNote: "Выполнена персонализация под цель/контекст ученика и выдан обязательный формат проверки понимания перед следующим шагом.",
  };
}

function OutputCard({ output }: { output: AgentOutput }) {
  return (
    <dl className="grid gap-3">
      <div className="rounded-xl border border-emerald-200/30 bg-emerald-50/60 p-3">
        <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slateText">explanation</dt>
        <dd className="mt-2 text-sm leading-7 text-slateText">{output.explanation}</dd>
      </div>
      <div className="rounded-xl border border-cyan-200/30 bg-cyan-50/40 p-3">
        <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slateText">personalizedExample</dt>
        <dd className="mt-2 text-sm leading-7 text-slateText">{output.personalizedExample}</dd>
      </div>
      <div className="rounded-xl border border-violet-200/30 bg-violet-50/50 p-3">
        <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slateText">checkQuestion</dt>
        <dd className="mt-2 text-sm leading-7 text-slateText">{output.checkQuestion}</dd>
      </div>
      <div className="rounded-xl border border-amber-200/35 bg-amber-50/50 p-3">
        <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slateText">nextStep</dt>
        <dd className="mt-2 text-sm leading-7 text-slateText">{output.nextStep}</dd>
      </div>
      <div className="rounded-xl border border-line bg-paper p-2">
        <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slateText">teacherNote</dt>
        <dd className="mt-1.5 text-xs leading-6 text-slateText">{output.teacherNote}</dd>
      </div>
    </dl>
  );
}

export default function TeacherAgentPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: crypto.randomUUID(),
      role: "assistant",
      text: "Я — учебный агент Преподаватель v1. Отправь запрос, и получишь ответ в формате: explanation, personalizedExample, checkQuestion, nextStep, teacherNote.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<LearnerProfile>({
    learningGoal: "SQL и анализ данных",
    currentLevel: "unknown",
    professionOrContext: "аналитик",
    interests: "бизнес, авиация, спорт",
    language: "ru",
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  const canSend = useMemo(() => inputValue.trim().length > 0 && !isLoading, [inputValue, isLoading]);

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = inputValue.trim();
    if (!canSend || !text) {
      return;
    }

    const userMessageId = crypto.randomUUID();
    const assistantMessageId = crypto.randomUUID();

    setMessages((current) => [
      ...current,
      {
        id: userMessageId,
        role: "user",
        text,
      },
    ]);
    setInputValue("");
    setIsLoading(true);

    setTimeout(() => {
      const output = buildTeacherOutput(profile, text);
      setMessages((current) => [
        ...current,
        {
          id: assistantMessageId,
          role: "assistant",
          text: "",
          output,
        },
      ]);
      setIsLoading(false);
    }, 420);
  };

  const resetConversation = () => {
    setMessages([
      {
        id: crypto.randomUUID(),
        role: "assistant",
        text: "Диалог очищен. Напиши тему, и начнем с первого шага.",
      },
    ]);
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-[#07111c] to-[#f3fbff]">
      <section className="section-shell relative z-10 px-4 pb-12 pt-8 md:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-blueCore/20 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blueCore">
              <Sparkles aria-hidden className="size-4" />
              Базовый агент Преподаватель
            </p>
            <h1 className="mt-3 text-2xl font-semibold leading-tight text-deep sm:text-4xl">
              Демо-страница чата с агентом
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slateText sm:text-base">
              Изолированный интерфейс взаимодействия без backend: профиль ученика, отправка сообщения и ответ в формате,
              который совпадает со спецификацией v1.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-deep transition hover:bg-paper"
          >
            <ArrowLeft aria-hidden className="size-4" />
            На главную
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
          <aside className="space-y-4 rounded-2xl border border-line bg-paper p-5 shadow-panel">
            <header>
              <h2 className="text-lg font-semibold text-deep">Профиль ученика</h2>
              <p className="mt-2 text-xs text-slateText">Минимальные поля контракта v1.</p>
            </header>

            <label className="grid gap-2 text-sm">
              <span className="font-medium text-deep">learningGoal</span>
              <input
                value={profile.learningGoal}
                onChange={(event) =>
                  setProfile((current) => ({
                    ...current,
                    learningGoal: event.target.value,
                  }))
                }
                className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-cyanGlow/70"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium text-deep">currentLevel</span>
              <select
                value={profile.currentLevel}
                onChange={(event) =>
                  setProfile((current) => ({
                    ...current,
                    currentLevel: event.target.value as CurrentLevel,
                  }))
                }
                className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-cyanGlow/70"
              >
                <option value="unknown">unknown</option>
                <option value="beginner">beginner</option>
                <option value="intermediate">intermediate</option>
                <option value="advanced">advanced</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium text-deep">professionOrContext</span>
              <input
                value={profile.professionOrContext}
                onChange={(event) =>
                  setProfile((current) => ({
                    ...current,
                    professionOrContext: event.target.value,
                  }))
                }
                className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-cyanGlow/70"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium text-deep">interests</span>
              <input
                value={profile.interests}
                onChange={(event) =>
                  setProfile((current) => ({
                    ...current,
                    interests: event.target.value,
                  }))
                }
                placeholder="через запятую"
                className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-cyanGlow/70"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium text-deep">language</span>
              <select
                value={profile.language}
                onChange={(event) =>
                  setProfile((current) => ({
                    ...current,
                    language: event.target.value,
                  }))
                }
                className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-cyanGlow/70"
              >
                <option value="ru">ru</option>
                <option value="en">en</option>
              </select>
            </label>

            <button
              type="button"
              onClick={resetConversation}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-blueCore/25 bg-blueCore/10 px-4 py-2 text-sm font-semibold text-deep transition hover:border-blueCore/55"
            >
              <RefreshCcw aria-hidden className="size-4" />
              Очистить чат
            </button>
            <p className="text-xs leading-6 text-slateText">
              Данные профиля живут только в текущей вкладке и не сохраняются между сессиями.
            </p>
          </aside>

          <section className="min-h-[640px] rounded-2xl border border-line bg-paper p-4 shadow-panel sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-deep">Диалог</p>
              <span className="rounded-full bg-cyanGlow/10 px-3 py-1 text-xs font-semibold text-blueCore">v1 UI</span>
            </div>

            <div className="flex h-[52vh] min-h-[430px] flex-col gap-4 overflow-y-auto rounded-xl bg-[#f4f8fb] p-3 sm:h-[54vh]">
              {messages.map((message) => (
                <article
                  key={message.id}
                  className={`max-w-[94%] rounded-xl px-4 py-3 ${
                    message.role === "user"
                      ? "ml-auto border border-blueCore/40 bg-white"
                      : "mr-auto border border-line bg-[#fdfefe]"
                  }`}
                >
                  <header className="mb-2 flex items-center gap-2">
                    <span
                      className={`grid size-7 place-items-center rounded-full ${
                        message.role === "user" ? "bg-blueCore/10 text-deep" : "bg-cyanGlow/20 text-blueCore"
                      }`}
                    >
                      {message.role === "user" ? (
                        <span className="text-xs font-semibold">U</span>
                      ) : (
                        <BotMessageSquare aria-hidden className="size-4" />
                      )}
                    </span>
                    <span className="text-xs font-semibold text-slateText">
                      {message.role === "user" ? "Ученик" : "Преподаватель"}
                    </span>
                  </header>

                  {message.text && !message.output ? <p className="text-sm text-slateText">{message.text}</p> : null}
                  {message.output ? <OutputCard output={message.output} /> : null}
                  {message.output && message.text ? <p className="mt-3 text-sm text-slateText">{message.text}</p> : null}
                </article>
              ))}

              {isLoading ? (
                <article className="mr-auto max-w-[94%] rounded-xl border border-line bg-[#fdfefe] px-4 py-3">
                  <p className="text-sm text-slateText">Агент формирует ответ…</p>
                </article>
              ) : null}

              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="mt-4 grid gap-3">
              <textarea
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="Например: объясни LEFT JOIN простыми словами"
                className="min-h-24 w-full rounded-xl border border-line px-3 py-3 text-sm outline-none focus:border-cyanGlow/70"
              />
              <button
                type="submit"
                disabled={!canSend}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blueCore px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send aria-hidden className="size-4" />
                Отправить
              </button>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}
