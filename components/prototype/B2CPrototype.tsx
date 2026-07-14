"use client";

import {
  ArrowRight,
  Check,
  CheckCircle2,
  Moon,
  RefreshCcw,
  Send,
  Sun,
} from "lucide-react";
import type { CSSProperties, KeyboardEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { prototypeSuggestions, routeKey, type CourseKey, type PrototypePhase, type PrototypeTheme } from "@/lib/prototype";
import type { GeneratedCourse, LearnerLevel } from "@/lib/course";
import {
  COURSE_SESSION_KEY,
  createCourseSession,
  parseCourseSession,
  toggleCourseDay,
  type CourseSession,
} from "@/lib/course-session";
import { LearnerOnboarding } from "./LearnerOnboarding";
import { LEARNER_SNAPSHOT_KEY, parseLearnerSnapshot, type LearnerSnapshot } from "@/lib/learner-snapshot";

type ThemeVars = CSSProperties & Record<`--${string}`, string>;

const themeVars: Record<PrototypeTheme, ThemeVars> = {
  light: {
    "--page": "#F4F0E8",
    "--text": "#202723",
    "--text-2": "#60675F",
    "--text-3": "#8A9087",
    "--accent": "#C65F3C",
    "--accent-key": "#A94C30",
    "--accent-tint": "#F1DED3",
    "--accent-tint-2": "#D9A38E",
    "--panel": "#FFFDF8",
    "--panel-border": "#DCD6CB",
    "--pill": "#FFFDF8",
    "--node-rest-bg": "#FFFDF8",
    "--node-rest-border": "#DCD6CB",
    "--badge-bg": "#F1DED3",
    "--badge-border": "#D9A38E",
    "--course-bg": "#F4F0E8",
    "--placeholder": "#8A9087",
    "--panel-shadow": "0 8px 20px rgba(32,39,35,0.08)",
  },
  dark: {
    "--page": "#19221D",
    "--text": "#FFFDF8",
    "--text-2": "#D8D8CB",
    "--text-3": "#AEB4A9",
    "--accent": "#D97652",
    "--accent-key": "#F1A487",
    "--accent-tint": "#3E2A23",
    "--accent-tint-2": "#82503F",
    "--panel": "#202B25",
    "--panel-border": "#4A564D",
    "--pill": "#202B25",
    "--node-rest-bg": "#202B25",
    "--node-rest-border": "#4A564D",
    "--badge-bg": "#3E2A23",
    "--badge-border": "#82503F",
    "--course-bg": "#19221D",
    "--placeholder": "#AEB4A9",
    "--panel-shadow": "0 8px 20px rgba(0,0,0,0.2)",
  },
};

function ThemeToggle({ theme, onToggle }: { theme: PrototypeTheme; onToggle: () => void }) {
  const isLight = theme === "light";
  const Icon = isLight ? Moon : Sun;

  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--panel-border)] bg-[var(--panel)] px-3 text-sm font-semibold text-[var(--text-2)] transition-colors hover:border-[var(--accent)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page)]"
    >
      <Icon aria-hidden className="size-4" />
      <span className="hidden sm:inline">{isLight ? "Тёмная тема" : "Светлая тема"}</span>
    </button>
  );
}

export function B2CPrototype() {
  const [phase, setPhase] = useState<PrototypePhase>("idle");
  const [query, setQuery] = useState("");
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState<LearnerLevel>("beginner");
  const [activeCourse, setActiveCourse] = useState<CourseKey>("ai");
  const [theme, setTheme] = useState<PrototypeTheme>("light");
  const [session, setSession] = useState<CourseSession | null>(null);
  const [learnerSnapshot, setLearnerSnapshot] = useState<LearnerSnapshot | null>(null);
  const [hasHydratedSession, setHasHydratedSession] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const course = session?.course;
  const modules = useMemo(
    () => (course?.days ?? []).map((module) => ({ ...module, label: `День ${module.day}` })),
    [course],
  );

  useEffect(() => {
    const restoredSession = parseCourseSession(window.sessionStorage.getItem(COURSE_SESSION_KEY));
    const restoredSnapshot = parseLearnerSnapshot(window.sessionStorage.getItem(LEARNER_SNAPSHOT_KEY));

    if (restoredSession) {
      setSession(restoredSession);
      setPhase("course");
    }
    if (restoredSnapshot) setLearnerSnapshot(restoredSnapshot);
    setHasHydratedSession(true);
  }, []);

  useEffect(() => {
    if (!hasHydratedSession) return;
    try {
      if (session) window.sessionStorage.setItem(COURSE_SESSION_KEY, JSON.stringify(session));
      else window.sessionStorage.removeItem(COURSE_SESSION_KEY);
    } catch {
      // The prototype remains usable when browser storage is unavailable.
    }
  }, [hasHydratedSession, session]);

  useEffect(() => {
    if (!hasHydratedSession) return;
    if (learnerSnapshot) window.sessionStorage.setItem(LEARNER_SNAPSHOT_KEY, JSON.stringify(learnerSnapshot));
  }, [hasHydratedSession, learnerSnapshot]);

  const submit = async (value = query) => {
    const topic = value.trim();
    if (!topic || isGenerating || !learnerSnapshot) return;

    setGenerationError(null);
    setIsGenerating(true);
    setActiveCourse(routeKey(topic) ?? "ai");
    setPhase("assembling");

    try {
      const response = await fetch("/api/generate-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          ...(goal.trim() ? { courseGoal: goal.trim() } : {}),
          topicFamiliarity: level,
          learnerSnapshot,
        }),
      });
      const result = (await response.json()) as { course?: GeneratedCourse; error?: string };
      if (!response.ok || !result.course) throw new Error(result.error ?? "Не удалось собрать маршрут. Попробуйте ещё раз.");

      setSession(createCourseSession(result.course));
      setPhase("course");
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "Не удалось собрать маршрут. Попробуйте ещё раз.");
      setPhase("idle");
    } finally {
      setIsGenerating(false);
    }
  };

  const restart = () => {
    setQuery("");
    setGoal("");
    setLevel("beginner");
    setSession(null);
    setGenerationError(null);
    setPhase("idle");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") void submit();
  };

  const pickSuggestion = (label: string) => {
    setQuery(label);
    void submit(label);
  };

  const toggleDay = (day: number) => {
    if (session) setSession(toggleCourseDay(session, day));
  };

  const resetProfile = () => {
    window.sessionStorage.removeItem(LEARNER_SNAPSHOT_KEY);
    setSession(null);
    setLearnerSnapshot(null);
  };

  const toggleTheme = () => setTheme((current) => (current === "light" ? "dark" : "light"));

  if (hasHydratedSession && !learnerSnapshot) {
    return <main className="prototype-screen min-h-[100svh] bg-[var(--page)]" style={themeVars[theme]}><LearnerOnboarding onComplete={setLearnerSnapshot} /></main>;
  }

  return (
    <main className="prototype-screen min-h-[100svh] bg-[var(--page)] text-[var(--text)]" style={themeVars[theme]}>
      <header className="mx-auto flex w-full max-w-[1180px] items-center justify-between border-b border-[var(--panel-border)] px-4 py-5 sm:px-6 lg:px-8">
        <div>
          <p className="text-base font-semibold">ContextPath AI</p>
          <p className="mt-1 text-sm text-[var(--text-3)]">Персональное обучение</p>
        </div>
        <div className="flex items-center gap-3">
          {session ? <button type="button" onClick={() => setPhase("course")} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--panel-border)] bg-[var(--panel)] px-3 text-sm font-semibold text-[var(--text-2)] transition-colors hover:border-[var(--accent)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"><CheckCircle2 aria-hidden className="size-4" /><span className="hidden sm:inline">Мой курс</span></button> : null}
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      {phase === "idle" ? (
        <section className="mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-[1180px] items-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="w-full max-w-[47.5rem]">
            <p className="text-sm font-semibold text-[var(--accent-key)]">Персональная учебная траектория</p>
            <h1 className="prototype-display mt-5 max-w-[16ch] text-balance text-[clamp(2.75rem,7vw,5.25rem)] leading-[0.98]">Курс, который говорит на твоем языке</h1>
            <p className="mt-6 max-w-[62ch] text-base leading-7 text-[var(--text-2)]">Напиши, чему хочешь научиться. AI-методист соберёт личную траекторию, объяснения и задания под твой опыт, цель и способ мышления.</p>

            <div className="mt-10 border-y border-[var(--panel-border)] py-5">
              <label className="block text-sm font-semibold text-[var(--text-2)]" htmlFor="course-topic">Тема обучения</label>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <input id="course-topic" value={query} onChange={(event) => { setQuery(event.target.value); setGenerationError(null); }} onKeyDown={onKeyDown} placeholder="Например: хочу разобраться в AI для работы" className="prototype-input min-h-12 min-w-0 flex-1 border border-[var(--panel-border)] bg-[var(--panel)] px-4 py-3 text-base text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]" />
                <button type="button" onClick={() => void submit()} disabled={isGenerating || !query.trim()} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-key)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page)] disabled:bg-[#C8C2B8] disabled:text-[#60675F] disabled:opacity-100"><span>Собрать курс</span><Send aria-hidden className="size-4" /></button>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-[var(--text-2)]">Цель
                  <input value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="Например, применять в работе" className="prototype-input mt-2 min-h-11 w-full border-b border-[var(--panel-border)] bg-transparent py-2 text-base font-normal text-[var(--text)] outline-none focus:border-[var(--accent)]" />
                </label>
                <label className="block text-sm font-semibold text-[var(--text-2)]">Уровень
                  <select value={level} onChange={(event) => setLevel(event.target.value as LearnerLevel)} className="mt-2 min-h-11 w-full border-b border-[var(--panel-border)] bg-transparent py-2 text-base font-normal text-[var(--text)] outline-none focus:border-[var(--accent)]">
                    <option value="beginner">С нуля</option>
                    <option value="basic">Базовый</option>
                    <option value="intermediate">Продолжающий</option>
                  </select>
                </label>
              </div>
            </div>

            {generationError ? <div className="mt-5 flex items-center justify-between gap-3 border-l-2 border-[#8D3028] py-2 pl-4 text-sm leading-6 text-[#8D3028]" aria-live="polite"><span>{generationError}</span><button type="button" onClick={() => void submit()} className="min-h-11 shrink-0 rounded-lg px-3 font-semibold text-[var(--accent-key)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">Повторить</button></div> : null}

            <div className="mt-7 flex flex-wrap gap-2">
              {prototypeSuggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => pickSuggestion(suggestion)} className="min-h-11 rounded-lg border border-[var(--panel-border)] bg-transparent px-3 text-sm text-[var(--text-2)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-tint)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">{suggestion}</button>)}
            </div>
            <p className="mt-7 text-sm leading-6 text-[var(--text-3)]">Сначала — 7-дневная персональная траектория и первый адаптированный урок.</p>
          </div>
        </section>
      ) : null}

      {phase === "assembling" ? (
        <section className="mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-[1180px] items-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-[47.5rem] border-l-2 border-[var(--accent)] pl-5" role="status">
            <p className="text-sm font-semibold text-[var(--accent-key)]">Собираем курс</p>
            <h2 className="prototype-display mt-4 text-balance text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.02]">Собираю личную траекторию</h2>
            <p className="mt-5 text-base leading-7 text-[var(--text-2)]">Генерируем на бесплатной модели OpenRouter: цель, уровень, контекст, примеры, первое задание и точку проверки.</p>
          </div>
        </section>
      ) : null}

      {phase === "course" && course && session ? (
        <section className="mx-auto w-full max-w-[1180px] px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,47.5rem)_14rem] lg:justify-center">
            <div className="min-w-0">
              <section className="border-y border-[var(--panel-border)] py-6">
                <p className="text-sm font-semibold text-[var(--accent-key)]">7-дневная траектория</p>
                <h1 className="prototype-display mt-4 max-w-[18ch] text-balance text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.02]">{course.title}</h1>
                <div className="mt-8">
                  {modules.map((module) => {
                    const isComplete = session.completedDays.includes(module.day);
                    return <article key={module.day} className="grid gap-4 border-t border-[var(--panel-border)] py-5 sm:grid-cols-[3.25rem_1fr]">
                      <span className={`grid size-10 place-items-center rounded-md text-sm font-bold text-white ${isComplete ? "bg-[#52705D]" : "bg-[var(--accent)]"}`}>{isComplete ? <Check aria-label="Выполнено" className="size-4" /> : module.day}</span>
                      <div><p className="text-sm font-semibold text-[var(--text-3)]">{module.label}</p><h2 className="mt-1 text-lg font-semibold leading-7">{module.title}</h2><p className="mt-2 text-base leading-7 text-[var(--text-2)]">{module.objective}</p><p className="mt-2 text-sm leading-6 text-[var(--text-3)]">Практика: {module.practice}</p><button type="button" onClick={() => toggleDay(module.day)} className={`mt-4 min-h-11 rounded-lg border px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${isComplete ? "border-[#52705D] bg-[#52705D] text-white hover:bg-[#3D5A48]" : "border-[var(--panel-border)] bg-[var(--panel)] text-[var(--text-2)] hover:border-[var(--accent)]"}`}>{isComplete ? "Снять отметку" : "Отметить выполненным"}</button></div>
                    </article>;
                  })}
                </div>
              </section>

              <section className="mt-12 border-y border-[var(--panel-border)] py-7">
                <p className="text-sm font-semibold text-[var(--accent-key)]">Первый адаптированный урок</p>
                <h2 className="prototype-display mt-4 max-w-[24ch] text-balance text-[clamp(2.1rem,5vw,3.5rem)] leading-[1.06]">{course.firstLesson.title}</h2>
                <p className="mt-5 max-w-[65ch] text-base leading-7 text-[var(--text-2)]">{course.firstLesson.explanation}</p>
                <div className="mt-7 border-l-2 border-[var(--accent)] pl-5"><p className="text-sm font-semibold text-[var(--text-2)]">Практика</p><p className="mt-2 text-base leading-7 text-[var(--text)]">{course.firstLesson.task}</p></div>
                <div className="mt-6 border-t border-[var(--panel-border)] pt-5"><p className="text-sm font-semibold text-[var(--text-2)]">Точка проверки</p><p className="mt-2 text-base leading-7 text-[var(--text-2)]">{course.firstLesson.feedbackPrompt}</p></div>
              </section>
              <p className="mt-7 text-sm text-[var(--text-3)]">Создано с OpenRouter: {course.model}</p>
            </div>

            <aside className="lg:order-2">
              <div className="border-t border-[var(--panel-border)] pt-5 lg:sticky lg:top-8">
                <p className="text-sm font-semibold text-[var(--accent-key)]">Паспорт обучения</p>
                <h2 className="prototype-display mt-3 text-2xl leading-tight">Ваш контекст</h2>
                <dl className="mt-6">
                  {course.passport.map((item) => <div key={item.label} className="border-t border-[var(--panel-border)] py-4"><dt className="text-sm font-medium text-[var(--text-3)]">{item.label}</dt><dd className="mt-1 text-base font-semibold leading-6 text-[var(--text)]">{item.value}</dd></div>)}
                </dl>
                <section className="border-t border-[var(--panel-border)] py-5"><p className="text-sm font-semibold text-[var(--accent-key)]">Почему такой маршрут</p><p className="mt-3 text-sm leading-6 text-[var(--text-2)]">{course.whyThisRoute}</p></section>
                <section className="border-t border-[var(--panel-border)] py-5"><p className="text-base font-semibold">{session.completedDays.length} из 7 дней выполнено</p><p className="mt-2 text-sm leading-6 text-[var(--text-3)]">Карта хранится только в этой вкладке и исчезнет после её закрытия.</p></section>
                <button type="button" onClick={restart} className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[var(--panel-border)] bg-[var(--panel)] px-3 text-sm font-semibold text-[var(--text-2)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-tint)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"><RefreshCcw aria-hidden className="size-4" /> Собрать другой курс</button>
                <button type="button" onClick={resetProfile} className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-lg px-3 text-sm font-semibold text-[var(--text-2)] transition-colors hover:bg-[var(--accent-tint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">Изменить мой профиль</button>
              </div>
            </aside>
          </div>
        </section>
      ) : null}
    </main>
  );
}
