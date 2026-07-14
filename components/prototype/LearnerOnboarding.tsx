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

const outcomeOptions: Array<{ value: SuccessCriterion; label: string; description: string }> = [
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

function ChoiceRow({
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
      className={`relative flex min-h-14 w-full items-start gap-3 border-b px-1 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page)] ${
        active
          ? "border-[var(--accent)] bg-[var(--accent-tint)]"
          : "border-[var(--panel-border)] bg-transparent hover:border-[var(--accent)]"
      }`}
    >
      <span
        className={`mt-1 grid size-5 shrink-0 place-items-center rounded-sm border ${
          active ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-[var(--panel-border)] text-transparent"
        }`}
      >
        <Check aria-hidden className="size-3" strokeWidth={3} />
      </span>
      <span className="block min-w-0">
        <span className="block text-base font-semibold leading-6 text-[var(--text)]">{label}</span>
        <span className="mt-1 block text-sm leading-6 text-[var(--text-2)]">{description}</span>
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
    <section className="relative min-h-[100svh] bg-[var(--page)] text-[var(--text)]">
      <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between border-b border-[var(--panel-border)] py-5">
          <div>
            <p className="text-base font-semibold">ContextPath AI</p>
            <p className="mt-1 text-sm text-[var(--text-3)]">Первое знакомство</p>
          </div>
          <p className="hidden items-center gap-2 text-sm text-[var(--text-3)] sm:flex">
            <LockKeyhole aria-hidden className="size-4" /> Только в этой вкладке
          </p>
        </header>

        <div className="grid lg:grid-cols-[14rem_minmax(0,47.5rem)] lg:justify-center lg:gap-10">
          <aside className="hidden border-r border-[var(--panel-border)] py-10 pr-7 lg:block">
            <p className="text-sm font-semibold text-[var(--text-2)]">Ваш путь</p>
            <ol className="mt-6 space-y-1">
              {stages.map((item, index) => (
                <li key={item} className={`border-l-2 py-3 pl-3 ${index <= stage ? "border-[var(--accent)]" : "border-[var(--panel-border)]"}`}>
                  <p className={`text-sm ${index === stage ? "font-semibold text-[var(--text)]" : "text-[var(--text-2)]"}`}>
                    {index < stage ? <Check aria-label="Готово" className="mr-1 inline size-3.5 text-[var(--accent)]" /> : <span className="mr-1 text-[var(--text-3)]">{index + 1}.</span>}
                    {item}
                  </p>
                  {index === stage ? <p className="mt-1 text-sm text-[var(--text-3)]">Сейчас</p> : null}
                </li>
              ))}
            </ol>

            <section className="mt-10 border-t border-[var(--panel-border)] pt-6" aria-label="Контекст, который понял AI">
              <p className="flex items-center gap-2 text-sm font-semibold text-[var(--accent-key)]">
                <BrainCircuit aria-hidden className="size-4" /> AI понимает
              </p>
              {analysis ? (
                <div className="mt-4">
                  {extractedFacts.length ? extractedFacts.map((fact) => (
                    <div key={fact.signal} className="border-t border-[var(--panel-border)] py-3 first:border-t-0 first:pt-0">
                      <p className="text-sm font-medium text-[var(--text-2)]">{fact.label}</p>
                      <p className="mt-1 text-sm leading-6 text-[var(--text-3)]">{fact.value}</p>
                    </div>
                  )) : <p className="text-sm leading-6 text-[var(--text-3)]">Контекст собран без догадок о роли и сфере.</p>}
                </div>
              ) : (
                <p className="mt-3 text-sm leading-6 text-[var(--text-3)]">Роль, опыт и интересы — только из вашего рассказа.</p>
              )}
            </section>
          </aside>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
            className="flex min-w-0 flex-col"
          >
            <div className="border-b border-[var(--panel-border)] py-4 lg:hidden">
              <div className="flex gap-2" aria-label={`Шаг ${stage + 1} из ${stages.length}`}>
                {stages.map((item, index) => <span key={item} className={`h-1 flex-1 ${index <= stage ? "bg-[var(--accent)]" : "bg-[var(--panel-border)]"}`} />)}
              </div>
              <p className="mt-2 text-sm text-[var(--text-3)]">Шаг {stage + 1} из {stages.length} · {stages[stage]}</p>
            </div>

            <main className="min-h-[calc(100svh-10rem)] px-0 pb-28 pt-10 lg:pb-10">
              <div key={stage} className="onboarding-step w-full max-w-[65ch]">
                {stage === 0 ? (
                  <>
                    <p className="text-sm font-semibold text-[var(--accent-key)]">Шаг 1 · Живой контекст</p>
                    <h1 className="prototype-display mt-5 max-w-[18ch] text-balance text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.02]">Расскажите о себе как человеку, а не анкете</h1>
                    <p className="mt-5 max-w-[62ch] text-base leading-7 text-[var(--text-2)]">Чем занимаетесь, что уже умеете и что вам по-настоящему интересно. Конкретную тему обучения выберете после знакомства.</p>

                    <div className="mt-9 border-y border-[var(--panel-border)] py-1">
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
                        className="prototype-input min-h-[13rem] w-full resize-none bg-[var(--panel)] px-4 py-5 text-base leading-7 text-[var(--text)] outline-none focus:ring-2 focus:ring-[var(--accent)] sm:px-5"
                      />
                      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm text-[var(--text-3)] sm:px-5">
                        <span>занятие · опыт · интересы</span>
                        <span className={narrative.length > 760 ? "text-[#8D3028]" : undefined}>{narrative.length}/800</span>
                      </div>
                    </div>

                    {isAnalyzing ? (
                      <div className="mt-5 border-l-2 border-[var(--accent)] py-2 pl-4" role="status">
                        <p className="flex items-center gap-2 text-base font-semibold"><BrainCircuit aria-hidden className="size-4 text-[var(--accent-key)]" /> AI собирает ваш контекст</p>
                        <p className="mt-1 text-sm leading-6 text-[var(--text-2)]">Отделяет факты от догадок и готовит один точный вопрос.</p>
                      </div>
                    ) : null}
                    {error ? <p className="mt-5 border-l-2 border-[#8D3028] py-2 pl-4 text-sm leading-6 text-[#8D3028]" role="alert">{error}</p> : null}
                    {narrative.length > 0 && narrative.trim().length < 30 ? <p className="mt-3 text-sm text-[var(--text-3)]">Добавьте ещё немного контекста — минимум 30 символов.</p> : null}
                    <p className="mt-5 flex max-w-[62ch] items-start gap-2 text-sm leading-6 text-[var(--text-3)]"><ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0" />Текст один раз обрабатывается бесплатной моделью OpenRouter, чтобы собрать слепок. Приложение не сохраняет его на сервере.</p>
                  </>
                ) : null}

                {stage === 1 && analysis ? (
                  <>
                    <p className="text-sm font-semibold text-[var(--accent-key)]">Шаг 2 · Адаптивное уточнение</p>
                    <div className="mt-6 border-l-2 border-[var(--accent)] pl-5">
                      <p className="text-sm font-semibold text-[var(--text-2)]">Что я понял</p>
                      <p className="prototype-display mt-3 text-xl leading-8 text-[var(--text)] sm:text-2xl">{analysis.summary}</p>
                    </div>
                    <div className="mt-10">
                      <p className="flex items-center gap-2 text-sm font-semibold text-[var(--text-2)]"><MessageCircleMore aria-hidden className="size-4 text-[var(--accent-key)]" /> Один вопрос для точности</p>
                      <h1 className="prototype-display mt-4 max-w-[22ch] text-balance text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.06]">{analysis.followUpQuestion}</h1>
                    </div>
                    <div className="mt-7 grid gap-x-5 md:grid-cols-3" role="radiogroup" aria-label={analysis.followUpQuestion}>
                      {analysis.followUpOptions.map((option) => <ChoiceRow key={option.id} active={selectedFollowUp === option.id && !customFollowUp} label={option.label} description={option.description} onClick={() => { setSelectedFollowUp(option.id); setCustomFollowUp(""); }} />)}
                    </div>
                    <label className="mt-7 block">
                      <span className="text-sm font-medium text-[var(--text-2)]">Или ответьте своими словами</span>
                      <input value={customFollowUp} onChange={(event) => { setCustomFollowUp(event.target.value); if (event.target.value) setSelectedFollowUp(""); }} maxLength={240} placeholder="Короткий ответ" className="prototype-input mt-2 min-h-11 w-full border border-[var(--panel-border)] bg-[var(--panel)] px-4 py-3 text-base text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]" />
                    </label>
                  </>
                ) : null}

                {stage === 2 ? (
                  <>
                    <p className="text-sm font-semibold text-[var(--accent-key)]">Шаг 3 · Учебный контракт</p>
                    <h1 className="prototype-display mt-5 max-w-[20ch] text-balance text-[clamp(2.5rem,5vw,4rem)] leading-[1.04]">Что должно измениться после обучения?</h1>
                    <p className="mt-5 max-w-[62ch] text-base leading-7 text-[var(--text-2)]">Это определит не тему, а глубину маршрута, характер практики и критерий готовности.</p>
                    <fieldset className="mt-9">
                      <legend className="text-base font-semibold">Ваш критерий результата</legend>
                      <div className="mt-3 grid gap-x-5 md:grid-cols-2" role="radiogroup">
                        {outcomeOptions.map((option) => <ChoiceRow key={option.value} active={successCriterion === option.value} label={option.label} description={option.description} onClick={() => setSuccessCriterion(option.value)} />)}
                      </div>
                    </fieldset>
                    <fieldset className="mt-9 border-t border-[var(--panel-border)] pt-7">
                      <legend className="flex items-center gap-2 text-base font-semibold"><Clock3 aria-hidden className="size-4 text-[var(--accent-key)]" /> Сколько времени реально есть на одно занятие?</legend>
                      <div className="mt-3 grid gap-x-5 md:grid-cols-3" role="radiogroup">
                        {timeOptions.map((option) => <ChoiceRow key={option.value} active={dailyTime === option.value} label={option.label} description={option.description} onClick={() => setDailyTime(option.value)} />)}
                      </div>
                    </fieldset>
                  </>
                ) : null}

                {stage === 3 && analysis && successCriterion && dailyTime ? (
                  <>
                    <p className="text-sm font-semibold text-[var(--accent-key)]">Шаг 4 · Проверка</p>
                    <h1 className="prototype-display mt-5 max-w-[18ch] text-balance text-[clamp(2.5rem,5vw,4rem)] leading-[1.04]">Вот что AI понял о вас</h1>
                    <p className="mt-5 max-w-[62ch] text-base leading-7 text-[var(--text-2)]">Этот слепок будет добавляться к запросу после выбора темы. Уберите любую деталь, которую не хотите использовать.</p>
                    <section className={`mt-9 border-y border-[var(--panel-border)] py-5 ${enabledSignals.has("profileSummary") ? "" : "text-[var(--text-3)]"}`}>
                      <div className="flex items-start justify-between gap-4">
                        <p className={`prototype-display max-w-[52ch] text-xl leading-8 sm:text-2xl ${enabledSignals.has("profileSummary") ? "" : "line-through"}`}>{analysis.summary}</p>
                        <div className="flex shrink-0 gap-2">
                          <button type="button" onClick={() => toggleSignal("profileSummary")} aria-label={enabledSignals.has("profileSummary") ? "Не использовать краткий слепок" : "Вернуть краткий слепок"} className="grid min-h-11 min-w-11 place-items-center rounded-lg border border-[var(--panel-border)] bg-[var(--panel)] text-[var(--text-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">{enabledSignals.has("profileSummary") ? <X aria-hidden className="size-4" /> : <Check aria-hidden className="size-4" />}</button>
                          <button type="button" onClick={() => moveTo(0)} aria-label="Изменить рассказ" className="grid min-h-11 min-w-11 place-items-center rounded-lg border border-[var(--panel-border)] bg-[var(--panel)] text-[var(--text-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"><Pencil aria-hidden className="size-4" /></button>
                        </div>
                      </div>
                    </section>
                    <dl className="mt-5 grid md:grid-cols-2 md:gap-x-8">
                      {[
                        ...extractedFacts,
                        { signal: "followUpAnswer" as const, label: "Важный контекст", value: followUpAnswer },
                        { signal: "successCriterion" as const, label: "Результат", value: outcomeLabel! },
                        { signal: "dailyTime" as const, label: "Ритм", value: `${dailyTime} минут на занятие` },
                      ].map((fact) => {
                        const included = enabledSignals.has(fact.signal);
                        return <div key={fact.signal} className="flex items-start justify-between gap-3 border-t border-[var(--panel-border)] py-4"><div><dt className="text-sm font-medium text-[var(--text-3)]">{fact.label}</dt><dd className={`mt-1 text-base leading-6 ${included ? "text-[var(--text-2)]" : "text-[var(--text-3)] line-through"}`}>{fact.value}</dd></div><button type="button" onClick={() => toggleSignal(fact.signal)} aria-label={included ? `Не использовать: ${signalLabels[fact.signal]}` : `Вернуть: ${signalLabels[fact.signal]}`} className="min-h-11 shrink-0 rounded-lg px-3 text-sm font-semibold text-[var(--accent-key)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">{included ? "Убрать" : "Вернуть"}</button></div>;
                      })}
                    </dl>
                    <section className="mt-8 flex items-start justify-between gap-4 border-y border-[var(--panel-border)] py-5">
                      <div className="flex min-w-0 items-start gap-3"><ShieldCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-[var(--accent-key)]" /><div><p className="text-base font-semibold">Использовать слепок для персонализации</p><p className="mt-1 text-sm leading-6 text-[var(--text-3)]">Сырой рассказ не отправляется при генерации курса. Слепок хранится только в этой вкладке.</p></div></div>
                      <button type="button" role="switch" aria-checked={usePersonalization} onClick={() => setUsePersonalization((value) => !value)} className={`relative mt-1 h-7 w-12 shrink-0 rounded-full border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${usePersonalization ? "border-[var(--accent)] bg-[var(--accent)]" : "border-[var(--panel-border)] bg-[var(--panel)]"}`}><span className={`absolute left-1 top-1 size-[1.125rem] rounded-full bg-white shadow transition-transform ${usePersonalization ? "translate-x-5" : "translate-x-0"}`} /></button>
                    </section>
                  </>
                ) : null}
              </div>
            </main>

            <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--panel-border)] bg-[var(--page)] px-4 py-3 lg:static lg:px-0">
              <div className="flex w-full max-w-[65ch] items-center justify-between gap-3">
                <button type="button" onClick={() => moveTo(Math.max(0, stage - 1) as Stage)} disabled={stage === 0 || isAnalyzing} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-[var(--text-2)] transition-colors hover:bg-[var(--accent-tint)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:invisible"><ArrowLeft aria-hidden className="size-4" /> Назад</button>
                <button type="submit" disabled={!canContinue} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-key)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page)] disabled:bg-[#C8C2B8] disabled:text-[#60675F] disabled:opacity-100">
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
