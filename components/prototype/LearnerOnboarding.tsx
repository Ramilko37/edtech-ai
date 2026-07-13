"use client";

import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Check,
  Clock3,
  LockKeyhole,
  MessageCircleMore,
  Pencil,
  ShieldCheck,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  createLearnerSnapshot,
  personalizationSignals,
  type DailyTime,
  type LearnerSnapshot,
  type PersonalizationSignal,
  type SuccessCriterion,
} from "@/lib/learner-snapshot";
import type { ProfileAnalysis } from "@/lib/profile-analysis";

type Props = { onComplete: (snapshot: LearnerSnapshot) => void };
type Stage = 0 | 1 | 2 | 3;

const stages = ["Ваш контекст", "Один вопрос", "Учебный контракт", "Ваш слепок"] as const;

const outcomeOptions: Array<{
  value: SuccessCriterion;
  label: string;
  description: string;
}> = [
  { value: "understand", label: "Разобраться в системе", description: "Понять логику, связи и общую картину" },
  { value: "apply", label: "Применять самостоятельно", description: "Уверенно решать реальные задачи" },
  { value: "create", label: "Создать результат", description: "Сделать проект, документ или прототип" },
  { value: "explain", label: "Объяснять другим", description: "Формулировать ясно и отвечать на вопросы" },
];

const timeOptions: Array<{ value: DailyTime; label: string; description: string }> = [
  { value: "10", label: "10 минут", description: "Один точный шаг" },
  { value: "20", label: "20 минут", description: "Разбор и практика" },
  { value: "40", label: "40 минут", description: "Глубокое занятие" },
];

const signalLabels: Record<PersonalizationSignal, string> = {
  profileSummary: "Краткий слепок",
  role: "Роль",
  domain: "Сфера",
  background: "Опыт",
  interests: "Интересы",
  followUpAnswer: "Важный контекст",
  successCriterion: "Результат",
  dailyTime: "Ритм",
};

function ChoiceCard({
  active,
  label,
  description,
  onClick,
}: {
  active: boolean;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={`group relative min-h-[5.75rem] rounded-[1.25rem] border p-4 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] sm:p-5 ${
        active
          ? "border-[var(--accent)] bg-[var(--accent-tint)] shadow-[0_18px_55px_-36px_var(--accent)]"
          : "border-[var(--panel-border)] bg-[var(--pill)] hover:-translate-y-0.5 hover:border-[var(--glass-border)] hover:bg-[var(--glass)]"
      }`}
    >
      <span className="block pr-8 text-sm font-semibold text-[var(--text)] sm:text-[0.95rem]">{label}</span>
      <span className="mt-1.5 block text-xs leading-relaxed text-[var(--text-2)] sm:text-sm">{description}</span>
      <span
        className={`absolute right-4 top-4 grid size-5 place-items-center rounded-full border transition ${
          active ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-[var(--node-rest-border)] text-transparent"
        }`}
      >
        <Check aria-hidden className="size-3" strokeWidth={3} />
      </span>
    </button>
  );
}

export function LearnerOnboarding({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>(0);
  const [narrative, setNarrative] = useState("");
  const [analysis, setAnalysis] = useState<ProfileAnalysis | null>(null);
  const [selectedFollowUp, setSelectedFollowUp] = useState("");
  const [customFollowUp, setCustomFollowUp] = useState("");
  const [successCriterion, setSuccessCriterion] = useState<SuccessCriterion | null>(null);
  const [dailyTime, setDailyTime] = useState<DailyTime | null>(null);
  const [enabledSignals, setEnabledSignals] = useState<Set<PersonalizationSignal>>(
    () => new Set(personalizationSignals),
  );
  const [usePersonalization, setUsePersonalization] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const followUpAnswer = useMemo(() => {
    if (customFollowUp.trim()) return customFollowUp.trim();
    const option = analysis?.followUpOptions.find((item) => item.id === selectedFollowUp);
    return option ? `${option.label} — ${option.description}` : "";
  }, [analysis, customFollowUp, selectedFollowUp]);

  const outcomeLabel = outcomeOptions.find((item) => item.value === successCriterion)?.label;
  const extractedFacts = analysis
    ? [
        analysis.role && { signal: "role" as const, label: "Роль", value: analysis.role },
        analysis.domain && { signal: "domain" as const, label: "Сфера", value: analysis.domain },
        analysis.background && { signal: "background" as const, label: "Опыт", value: analysis.background },
        analysis.interests && { signal: "interests" as const, label: "Интересы", value: analysis.interests },
      ].filter(Boolean) as Array<{ signal: PersonalizationSignal; label: string; value: string }>
    : [];

  const moveTo = (next: Stage) => {
    setError("");
    setStage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const analyzeNarrative = async () => {
    if (narrative.trim().length < 30 || isAnalyzing) return;
    setIsAnalyzing(true);
    setError("");

    try {
      const response = await fetch("/api/analyze-learner/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ narrative }),
      });
      const payload = (await response.json()) as { analysis?: ProfileAnalysis; error?: string };
      if (!response.ok || !payload.analysis) throw new Error(payload.error || "AI не смог собрать слепок");

      setAnalysis(payload.analysis);
      setSelectedFollowUp("");
      setCustomFollowUp("");
      moveTo(1);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Не удалось связаться с AI. Попробуйте ещё раз.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleSignal = (signal: PersonalizationSignal) => {
    setEnabledSignals((current) => {
      const next = new Set(current);
      if (next.has(signal)) next.delete(signal);
      else next.add(signal);
      return next;
    });
  };

  const complete = () => {
    if (!analysis || !followUpAnswer || !successCriterion || !dailyTime) return;
    onComplete(
      createLearnerSnapshot({
        selfDescription: narrative,
        profileSummary: analysis.summary,
        ...(analysis.role ? { role: analysis.role } : {}),
        ...(analysis.domain ? { domain: analysis.domain } : {}),
        ...(analysis.background ? { background: analysis.background } : {}),
        ...(analysis.interests ? { interests: analysis.interests } : {}),
        followUpQuestion: analysis.followUpQuestion,
        followUpAnswer,
        successCriterion,
        dailyTime,
        language: "ru",
        enabledPersonalizationSignals: usePersonalization
          ? personalizationSignals.filter((signal) => enabledSignals.has(signal))
          : [],
      }),
    );
  };

  const canContinue =
    stage === 0
      ? narrative.trim().length >= 30 && !isAnalyzing
      : stage === 1
        ? Boolean(followUpAnswer)
        : stage === 2
          ? Boolean(successCriterion && dailyTime)
          : Boolean(analysis && followUpAnswer && successCriterion && dailyTime);

  const submit = () => {
    if (!canContinue) return;
    if (stage === 0) void analyzeNarrative();
    else if (stage === 1) moveTo(2);
    else if (stage === 2) moveTo(3);
    else complete();
  };

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[var(--page)] text-[var(--text)]">
      <div aria-hidden className="pointer-events-none absolute inset-0 onboarding-grid opacity-60" />
      <div aria-hidden className="pointer-events-none absolute -left-56 top-[-20rem] size-[42rem] rounded-full bg-[var(--accent)] opacity-[0.13] blur-[140px]" />
      <div aria-hidden className="pointer-events-none absolute -right-48 bottom-[-18rem] size-[38rem] rounded-full bg-[var(--cyan)] opacity-[0.09] blur-[140px]" />

      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-[92rem] flex-col">
        <header className="flex items-center justify-between border-b border-[var(--panel-border)] px-4 py-4 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[var(--accent-grad)] text-white shadow-[0_12px_32px_-14px_var(--accent)]">
              <Sparkles aria-hidden className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">ContextPath AI</p>
              <p className="text-xs text-[var(--text-3)]">Первое знакомство</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-xs text-[var(--text-3)] sm:flex">
            <LockKeyhole aria-hidden className="size-3.5" /> Только в этой вкладке
          </div>
        </header>

        <div className="grid flex-1 lg:grid-cols-[18rem_minmax(0,1fr)] xl:grid-cols-[21rem_minmax(0,1fr)]">
          <aside className="hidden border-r border-[var(--panel-border)] bg-[var(--glass)] px-7 py-9 backdrop-blur-xl lg:block xl:px-9">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-3)]">Как это работает</p>
            <div className="mt-7 space-y-6">
              {stages.map((item, index) => (
                <div key={item} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border text-xs font-semibold transition ${
                      index < stage
                        ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                        : index === stage
                          ? "border-[var(--accent)] bg-[var(--accent-tint)] text-[var(--accent-key)]"
                          : "border-[var(--node-rest-border)] text-[var(--text-3)]"
                    }`}
                  >
                    {index < stage ? <Check aria-hidden className="size-3.5" /> : index + 1}
                  </span>
                  <div>
                    <p className={`text-sm font-medium ${index === stage ? "text-[var(--text)]" : "text-[var(--text-2)]"}`}>{item}</p>
                    {index === stage ? <p className="mt-1 text-xs leading-relaxed text-[var(--text-3)]">Сейчас</p> : null}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 border-t border-[var(--panel-border)] pt-7">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent-key)]">
                <BrainCircuit aria-hidden className="size-4" /> AI понимает
              </p>
              {analysis ? (
                <div className="mt-4 space-y-3">
                  {extractedFacts.length ? extractedFacts.map((fact) => (
                    <div key={fact.signal} className="onboarding-fingerprint border-l border-[var(--accent-tint-2)] pl-3">
                      <p className="text-[0.65rem] uppercase tracking-[0.12em] text-[var(--text-3)]">{fact.label}</p>
                      <p className="mt-1 text-xs leading-relaxed text-[var(--text-2)]">{fact.value}</p>
                    </div>
                  )) : <p className="text-xs leading-relaxed text-[var(--text-3)]">Контекст собран без догадок о роли и сфере.</p>}
                </div>
              ) : (
                <p className="mt-3 text-xs leading-relaxed text-[var(--text-3)]">Роль, опыт и интересы — только из вашего рассказа, без психологических тестов.</p>
              )}
            </div>
          </aside>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
            className="flex min-w-0 flex-col"
          >
            <div className="border-b border-[var(--panel-border)] px-4 py-4 sm:px-8 lg:px-12">
              <div className="mx-auto flex max-w-4xl gap-2" aria-label={`Шаг ${stage + 1} из ${stages.length}`}>
                {stages.map((item, index) => (
                  <div key={item} className="flex-1">
                    <div className={`h-1 rounded-full transition-colors ${index <= stage ? "bg-[var(--accent)]" : "bg-[var(--node-rest-bg)]"}`} />
                    <p className={`mt-2 hidden text-[0.68rem] sm:block ${index === stage ? "font-semibold text-[var(--text)]" : "text-[var(--text-3)]"}`}>{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <main className="flex-1 px-4 pb-28 pt-9 sm:px-8 sm:pt-14 lg:px-12 lg:pb-12 xl:px-20">
              <div key={stage} className="onboarding-step mx-auto w-full max-w-4xl">
                {stage === 0 ? (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-key)]">Шаг 1 · Живой контекст</p>
                    <h1 className="mt-4 max-w-[18ch] text-balance text-[clamp(2.2rem,5.4vw,4.35rem)] font-semibold leading-[1.02] tracking-[-0.045em]">
                      Расскажите о себе как человеку, а не анкете
                    </h1>
                    <p className="mt-5 max-w-2xl text-sm leading-relaxed text-[var(--text-2)] sm:text-base">
                      Чем занимаетесь, что уже умеете и что вам по-настоящему интересно. Конкретную тему обучения выберете после знакомства.
                    </p>

                    <div className="relative mt-8 overflow-hidden rounded-[1.65rem] border border-[var(--panel-border)] bg-[var(--glass)] p-1 shadow-[0_28px_90px_-62px_var(--accent)] backdrop-blur-xl sm:mt-10">
                      <textarea
                        autoFocus
                        value={narrative}
                        onChange={(event) => {
                          setNarrative(event.target.value);
                          setError("");
                        }}
                        maxLength={800}
                        rows={7}
                        aria-label="Рассказ о себе"
                        placeholder="Например: я руковожу небольшой командой, часто работаю с исследованиями и данными. В свободное время бегаю и интересуюсь городской архитектурой..."
                        className="prototype-input min-h-[13rem] w-full resize-none rounded-[1.4rem] bg-[var(--pill)] px-5 py-5 text-base leading-relaxed text-[var(--text)] outline-none transition focus:bg-[var(--glass)] sm:px-6 sm:py-6 sm:text-lg"
                      />
                      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
                        <div className="flex flex-wrap gap-2 text-xs text-[var(--text-3)]">
                          <span>занятие</span><span aria-hidden>·</span><span>опыт</span><span aria-hidden>·</span><span>интересы</span>
                        </div>
                        <span className={`text-xs ${narrative.length > 760 ? "text-[var(--warning)]" : "text-[var(--text-3)]"}`}>{narrative.length}/800</span>
                      </div>
                    </div>

                    {isAnalyzing ? (
                      <div className="mt-5 rounded-2xl border border-[var(--accent-tint-2)] bg-[var(--accent-tint)] p-4" role="status">
                        <div className="flex items-center gap-3">
                          <span className="relative grid size-9 place-items-center rounded-xl bg-[var(--accent)] text-white">
                            <BrainCircuit aria-hidden className="size-4 prototype-pulse" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold">AI собирает ваш контекст</p>
                            <p className="mt-1 text-xs text-[var(--text-2)]">Отделяет факты от догадок и готовит один точный вопрос…</p>
                          </div>
                        </div>
                      </div>
                    ) : null}
                    {error ? <p className="mt-4 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-400" role="alert">{error}</p> : null}
                    {narrative.length > 0 && narrative.trim().length < 30 ? <p className="mt-3 text-xs text-[var(--text-3)]">Добавьте ещё немного контекста — минимум 30 символов.</p> : null}
                    <p className="mt-4 flex max-w-2xl items-start gap-2 text-xs leading-relaxed text-[var(--text-3)]"><ShieldCheck aria-hidden className="mt-0.5 size-3.5 shrink-0" />Текст один раз обрабатывается бесплатной моделью OpenRouter, чтобы собрать слепок. Приложение не сохраняет его на сервере.</p>
                  </>
                ) : null}

                {stage === 1 && analysis ? (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-key)]">Шаг 2 · Адаптивное уточнение</p>
                    <div className="mt-5 flex items-start gap-3 sm:gap-4">
                      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[var(--accent-grad)] text-white"><Sparkles aria-hidden className="size-5" /></span>
                      <div className="min-w-0 rounded-e-[1.5rem] rounded-bl-[1.5rem] border border-[var(--accent-tint-2)] bg-[var(--accent-tint)] p-5 sm:p-7">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent-key)]">Что я понял</p>
                        <p className="mt-3 text-base font-medium leading-relaxed sm:text-xl">{analysis.summary}</p>
                      </div>
                    </div>

                    <div className="mt-9">
                      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-3)]"><MessageCircleMore aria-hidden className="size-4" /> Один вопрос для точности</p>
                      <h1 className="mt-3 max-w-3xl text-balance text-[clamp(1.8rem,4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.035em]">{analysis.followUpQuestion}</h1>
                    </div>

                    <div className="mt-7 grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label={analysis.followUpQuestion}>
                      {analysis.followUpOptions.map((option) => (
                        <ChoiceCard
                          key={option.id}
                          active={selectedFollowUp === option.id && !customFollowUp}
                          label={option.label}
                          description={option.description}
                          onClick={() => {
                            setSelectedFollowUp(option.id);
                            setCustomFollowUp("");
                          }}
                        />
                      ))}
                    </div>

                    <label className="mt-5 block">
                      <span className="text-xs font-medium text-[var(--text-2)]">Или ответьте своими словами</span>
                      <input
                        value={customFollowUp}
                        onChange={(event) => {
                          setCustomFollowUp(event.target.value);
                          if (event.target.value) setSelectedFollowUp("");
                        }}
                        maxLength={240}
                        placeholder="Короткий ответ"
                        className="prototype-input mt-2 min-h-12 w-full rounded-xl border border-[var(--panel-border)] bg-[var(--pill)] px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-tint-2)]"
                      />
                    </label>
                  </>
                ) : null}

                {stage === 2 ? (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-key)]">Шаг 3 · Учебный контракт</p>
                    <h1 className="mt-4 max-w-[19ch] text-balance text-[clamp(2.1rem,5vw,3.8rem)] font-semibold leading-[1.04] tracking-[-0.04em]">Что должно измениться после обучения?</h1>
                    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--text-2)] sm:text-base">Это определит не тему, а глубину маршрута, характер практики и критерий готовности.</p>

                    <fieldset className="mt-8">
                      <legend className="mb-3 text-sm font-semibold">Ваш критерий результата</legend>
                      <div className="grid gap-3 sm:grid-cols-2" role="radiogroup">
                        {outcomeOptions.map((option) => <ChoiceCard key={option.value} active={successCriterion === option.value} label={option.label} description={option.description} onClick={() => setSuccessCriterion(option.value)} />)}
                      </div>
                    </fieldset>

                    <fieldset className="mt-9 border-t border-[var(--panel-border)] pt-7">
                      <legend className="mb-3 flex items-center gap-2 text-sm font-semibold"><Clock3 aria-hidden className="size-4 text-[var(--accent-key)]" /> Сколько времени реально есть на одно занятие?</legend>
                      <div className="grid gap-3 sm:grid-cols-3" role="radiogroup">
                        {timeOptions.map((option) => <ChoiceCard key={option.value} active={dailyTime === option.value} label={option.label} description={option.description} onClick={() => setDailyTime(option.value)} />)}
                      </div>
                    </fieldset>
                  </>
                ) : null}

                {stage === 3 && analysis && successCriterion && dailyTime ? (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-key)]">Шаг 4 · Проверка</p>
                    <h1 className="mt-4 max-w-[18ch] text-balance text-[clamp(2.2rem,5vw,4rem)] font-semibold leading-[1.03] tracking-[-0.045em]">Вот что AI понял о вас</h1>
                    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--text-2)] sm:text-base">Этот слепок будет добавляться к запросу после выбора темы. Уберите любую деталь, которую не хотите использовать.</p>

                    <div className={`mt-8 overflow-hidden rounded-[1.6rem] border border-[var(--accent-tint-2)] bg-[var(--accent-tint)] p-5 transition sm:p-7 ${enabledSignals.has("profileSummary") ? "" : "opacity-45"}`}>
                      <div className="flex items-start justify-between gap-4">
                        <p className={`max-w-3xl text-balance text-lg font-medium leading-relaxed sm:text-2xl ${enabledSignals.has("profileSummary") ? "" : "line-through"}`}>{analysis.summary}</p>
                        <div className="flex shrink-0 gap-2">
                          <button type="button" onClick={() => toggleSignal("profileSummary")} aria-label={enabledSignals.has("profileSummary") ? "Не использовать краткий слепок" : "Вернуть краткий слепок"} className="grid size-10 place-items-center rounded-xl bg-[var(--pill)] text-[var(--text-2)] transition hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">{enabledSignals.has("profileSummary") ? <X aria-hidden className="size-4" /> : <Check aria-hidden className="size-4" />}</button>
                          <button type="button" onClick={() => moveTo(0)} aria-label="Изменить рассказ" className="grid size-10 place-items-center rounded-xl bg-[var(--pill)] text-[var(--text-2)] transition hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"><Pencil aria-hidden className="size-4" /></button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      {[
                        ...extractedFacts,
                        { signal: "followUpAnswer" as const, label: "Важный контекст", value: followUpAnswer },
                        { signal: "successCriterion" as const, label: "Результат", value: outcomeLabel! },
                        { signal: "dailyTime" as const, label: "Ритм", value: `${dailyTime} минут на занятие` },
                      ].map((fact) => {
                        const included = enabledSignals.has(fact.signal);
                        return (
                          <div key={fact.signal} className={`flex min-h-20 items-start gap-3 rounded-2xl border p-4 transition ${included ? "border-[var(--panel-border)] bg-[var(--pill)]" : "border-[var(--panel-border)] opacity-45"}`}>
                            <div className="min-w-0 flex-1"><p className="text-[0.67rem] uppercase tracking-[0.13em] text-[var(--text-3)]">{fact.label}</p><p className={`mt-1 text-sm leading-relaxed ${included ? "text-[var(--text-2)]" : "line-through text-[var(--text-3)]"}`}>{fact.value}</p></div>
                            <button type="button" onClick={() => toggleSignal(fact.signal)} aria-label={included ? `Не использовать: ${signalLabels[fact.signal]}` : `Вернуть: ${signalLabels[fact.signal]}`} className={`shrink-0 rounded-lg text-[var(--text-3)] transition hover:bg-[var(--accent-tint)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${included ? "grid size-8 place-items-center" : "px-2 py-1 text-xs font-medium"}`}>{included ? <X aria-hidden className="size-3.5" /> : "Вернуть"}</button>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-8 flex items-start justify-between gap-4 rounded-[1.4rem] border border-[var(--panel-border)] bg-[var(--glass)] p-5 sm:p-6">
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--accent-tint)] text-[var(--accent-key)]"><ShieldCheck aria-hidden className="size-4" /></span>
                        <div><p className="text-sm font-semibold">Использовать слепок для персонализации</p><p className="mt-1 text-xs leading-relaxed text-[var(--text-3)] sm:text-sm">Сырой рассказ не отправляется при генерации курса. Слепок хранится только в этой вкладке.</p></div>
                      </div>
                      <button type="button" role="switch" aria-checked={usePersonalization} onClick={() => setUsePersonalization((value) => !value)} className={`relative mt-1 h-7 w-12 shrink-0 rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${usePersonalization ? "border-[var(--accent)] bg-[var(--accent)]" : "border-[var(--node-rest-border)] bg-[var(--node-rest-bg)]"}`}><span className={`absolute left-1 top-1 size-[1.125rem] rounded-full bg-white shadow transition-transform ${usePersonalization ? "translate-x-5" : "translate-x-0"}`} /></button>
                    </div>
                  </>
                ) : null}
              </div>
            </main>

            <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--panel-border)] bg-[color:var(--page)]/90 px-4 py-4 backdrop-blur-xl sm:px-8 lg:sticky lg:inset-x-auto lg:px-12 xl:px-20">
              <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3">
                <button type="button" onClick={() => moveTo(Math.max(0, stage - 1) as Stage)} disabled={stage === 0 || isAnalyzing} className="inline-flex min-h-12 items-center gap-2 rounded-xl px-3 text-sm font-medium text-[var(--text-2)] transition hover:bg-[var(--pill)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:pointer-events-none disabled:opacity-0"><ArrowLeft aria-hidden className="size-4" /> Назад</button>
                <button type="submit" disabled={!canContinue} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--accent-grad)] px-5 text-sm font-semibold text-white shadow-[0_14px_34px_-16px_var(--accent)] transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page)] disabled:pointer-events-none disabled:opacity-40 sm:px-7">
                  {stage === 0 ? (isAnalyzing ? "Собираю слепок…" : "Собрать мой слепок") : stage === 3 ? "Сохранить и выбрать тему" : "Продолжить"}
                  {stage === 3 ? <Check aria-hidden className="size-4" /> : <ArrowRight aria-hidden className="size-4" />}
                </button>
              </div>
            </footer>
          </form>
        </div>
      </div>
    </section>
  );
}
