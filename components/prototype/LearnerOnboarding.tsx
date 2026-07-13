"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  BriefcaseBusiness,
  Check,
  CircleGauge,
  Clock3,
  Compass,
  GraduationCap,
  Layers3,
  Lightbulb,
  ListTree,
  LockKeyhole,
  Pencil,
  Repeat2,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  createLearnerSnapshot,
  personalizationSignals,
  type LearnerSnapshot,
  type PersonalizationSignal,
} from "@/lib/learner-snapshot";

type Props = { onComplete: (snapshot: LearnerSnapshot) => void };
type FormState = Omit<LearnerSnapshot, "version" | "enabledPersonalizationSignals">;
type Choice<T extends string> = {
  value: T;
  label: string;
  description: string;
  icon?: LucideIcon;
};

const steps = [
  { label: "Контекст", hint: "Ваша реальность", icon: Compass },
  { label: "Мотивация", hint: "Желаемый результат", icon: Target },
  { label: "Ритм", hint: "Время и ограничения", icon: Clock3 },
  { label: "Взаимодействие", hint: "Как строить занятие", icon: Layers3 },
  { label: "Учебный слепок", hint: "Проверка и согласия", icon: Sparkles },
] as const;

const focusOptions: Choice<FormState["currentFocus"]>[] = [
  { value: "work", label: "Работа", description: "Навыки для текущей роли и реальных задач", icon: BriefcaseBusiness },
  { value: "study", label: "Учёба", description: "Системно разобраться и укрепить базу", icon: GraduationCap },
  { value: "personal-project", label: "Свой проект", description: "Учиться через конкретный результат", icon: Rocket },
  { value: "transition", label: "Смена направления", description: "Перенести прошлый опыт в новую область", icon: Compass },
];

const goalOptions: Choice<string>[] = [
  { value: "Расти в профессии", label: "Расти в профессии", description: "Решать более сложные задачи и принимать решения увереннее", icon: BriefcaseBusiness },
  { value: "Сменить направление", label: "Сменить направление", description: "Собрать основу для перехода в новую сферу", icon: Compass },
  { value: "Решить практическую задачу", label: "Решить задачу", description: "Получить применимый результат без лишнего пути", icon: Target },
  { value: "Сделать личный проект", label: "Сделать проект", description: "Осваивать знания прямо в процессе создания", icon: Rocket },
  { value: "Расширить кругозор", label: "Расширить кругозор", description: "Увидеть связи и научиться мыслить глубже", icon: Lightbulb },
];

const successOptions: Choice<FormState["successCriterion"]>[] = [
  { value: "understand", label: "Понять систему", description: "Увидеть связи и общую картину" },
  { value: "apply", label: "Применять", description: "Самостоятельно решать задачи" },
  { value: "create", label: "Создать результат", description: "Сделать проект, документ или прототип" },
  { value: "explain", label: "Объяснить другому", description: "Сформулировать ясно и уверенно" },
];

const horizonOptions: Choice<FormState["goalHorizon"]>[] = [
  { value: "quick", label: "Быстрый результат", description: "Сразу к применению" },
  { value: "foundation", label: "Крепкая база", description: "Главное без пробелов" },
  { value: "systematic", label: "Системно", description: "Глубже и последовательно" },
];

const timeOptions: Choice<FormState["dailyTime"]>[] = [
  { value: "10", label: "10 минут", description: "Один ясный шаг", icon: Clock3 },
  { value: "20", label: "20 минут", description: "Объяснение и практика", icon: CircleGauge },
  { value: "40", label: "40 минут", description: "Погружение без спешки", icon: BookOpenText },
];

const frequencyOptions: Choice<FormState["studyFrequency"]>[] = [
  { value: "daily", label: "Каждый день", description: "Короткий устойчивый ритм" },
  { value: "few-times-week", label: "2–3 раза в неделю", description: "Регулярно, но не ежедневно" },
  { value: "weekly", label: "Раз в неделю", description: "Одна содержательная сессия" },
  { value: "flexible", label: "Гибко", description: "Без фиксированного графика" },
];

const barrierOptions: Choice<FormState["learningBarrier"]>[] = [
  { value: "time", label: "Не хватает времени", description: "Занятия слишком трудно встроить в день" },
  { value: "theory-overload", label: "Слишком много теории", description: "Теряется главное и связь с реальностью" },
  { value: "not-enough-practice", label: "Мало практики", description: "Понятно на словах, но сложно применить" },
  { value: "motivation", label: "Теряется мотивация", description: "Непонятно, зачем продолжать следующий шаг" },
  { value: "unclear-progress", label: "Не виден прогресс", description: "Сложно понять, что уже действительно освоено" },
];

const formatOptions: Choice<FormState["preferredFormat"]>[] = [
  { value: "explanations", label: "Сначала карта темы", description: "Увидеть структуру и место каждого понятия", icon: ListTree },
  { value: "cases", label: "Сначала близкий пример", description: "Войти в тему через знакомую ситуацию", icon: Lightbulb },
  { value: "mixed", label: "Разобрать по шагам", description: "Двигаться последовательно от простого к сложному", icon: Layers3 },
  { value: "practice", label: "Сначала попробовать", description: "Начать с небольшой задачи и разобрать результат", icon: WandSparkles },
];

const supportOptions: Choice<FormState["supportPreference"]>[] = [
  { value: "analogy", label: "Другая аналогия", description: "Объяснить через иной знакомый контекст" },
  { value: "smaller-steps", label: "Меньшие шаги", description: "Разложить сложное на короткую последовательность" },
  { value: "hint", label: "Подсказка без ответа", description: "Помочь найти решение самостоятельно" },
  { value: "more-practice", label: "Ещё одна практика", description: "Закрепить идею на другом задании" },
];

const complexityOptions: Choice<FormState["explanationComplexity"]>[] = [
  { value: "simple", label: "Ясно и без перегруза", description: "Термины вводятся только когда нужны" },
  { value: "professional", label: "Профессионально и глубже", description: "Больше нюансов, терминов и связей" },
];

const consentGroups: Array<{
  label: string;
  description: string;
  signals: PersonalizationSignal[];
}> = [
  { label: "Контекст", description: "Роль, сфера и полезный прошлый опыт", signals: ["role", "domain", "background", "currentFocus"] },
  { label: "Цель", description: "Мотивация, результат и горизонт", signals: ["primaryGoal", "successCriterion", "goalHorizon"] },
  { label: "Ритм", description: "Время, частота и реальное ограничение", signals: ["dailyTime", "studyFrequency", "learningBarrier", "dailyReality"] },
  { label: "Взаимодействие", description: "Вход в тему, помощь и плотность", signals: ["preferredFormat", "supportPreference", "explanationComplexity"] },
  { label: "Примеры", description: "Интересы и контекст, который лучше не использовать", signals: ["interests", "avoidContext"] },
];

const initialForm: FormState = {
  currentFocus: "work",
  primaryGoal: "Расти в профессии",
  successCriterion: "apply",
  goalHorizon: "foundation",
  language: "ru",
  dailyTime: "20",
  studyFrequency: "few-times-week",
  learningBarrier: "theory-overload",
  preferredFormat: "cases",
  supportPreference: "smaller-steps",
  explanationComplexity: "simple",
};

function findLabel<T extends string>(options: Choice<T>[], value: T) {
  return options.find((option) => option.value === value)?.label ?? value;
}

function ChoiceGrid<T extends string>({
  name,
  options,
  value,
  onChange,
  compact = false,
}: {
  name: string;
  options: Choice<T>[];
  value: T;
  onChange: (value: T) => void;
  compact?: boolean;
}) {
  return (
    <div className={`grid gap-3 ${compact ? "sm:grid-cols-2" : "md:grid-cols-2"}`} role="radiogroup" aria-label={name}>
      {options.map((option) => {
        const active = option.value === value;
        const Icon = option.icon;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={`group relative min-h-[5.5rem] border px-4 py-4 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page)] sm:px-5 ${
              active
                ? "border-[var(--accent)] bg-[var(--accent-tint)] shadow-[0_16px_42px_-28px_var(--accent)]"
                : "border-[var(--panel-border)] bg-[var(--pill)] hover:-translate-y-0.5 hover:border-[var(--glass-border)] hover:bg-[var(--glass)]"
            } ${compact ? "rounded-2xl" : "rounded-[1.35rem]"}`}
          >
            <span className="flex items-start gap-3">
              {Icon ? (
                <span className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl ${active ? "bg-[var(--accent)] text-white" : "bg-[var(--accent-tint)] text-[var(--accent-key)]"}`}>
                  <Icon aria-hidden className="size-4" />
                </span>
              ) : null}
              <span className="min-w-0 flex-1">
                <span className="block pr-7 text-sm font-semibold text-[var(--text)] sm:text-[0.95rem]">{option.label}</span>
                <span className="mt-1 block text-xs leading-relaxed text-[var(--text-2)] sm:text-sm">{option.description}</span>
              </span>
              <span className={`absolute right-4 top-4 grid size-5 place-items-center rounded-full border transition ${active ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-[var(--node-rest-border)] text-transparent"}`}>
                <Check aria-hidden className="size-3" strokeWidth={3} />
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function TextField({
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  hint?: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3 text-sm font-medium text-[var(--text)]">
        {label}
        {hint ? <span className="text-xs font-normal text-[var(--text-3)]">{hint}</span> : null}
      </span>
      <input
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        maxLength={240}
        placeholder={placeholder}
        className="prototype-input mt-2 min-h-12 w-full rounded-xl border border-[var(--panel-border)] bg-[var(--pill)] px-4 py-3 text-sm text-[var(--text)] outline-none transition placeholder:text-[var(--text-3)] hover:border-[var(--glass-border)] focus:border-[var(--accent)] focus:bg-[var(--glass)] focus:ring-2 focus:ring-[var(--accent-tint-2)]"
      />
    </label>
  );
}

function StepHeading({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <header className="mb-8 max-w-3xl sm:mb-10">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-key)]">{eyebrow}</p>
      <h1 className="mt-3 max-w-[18ch] text-balance text-[clamp(2rem,5vw,3.35rem)] font-semibold leading-[1.07] tracking-[-0.035em] text-[var(--text)]">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--text-2)] sm:text-base">{copy}</p>
    </header>
  );
}

export function LearnerOnboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [furthestStep, setFurthestStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [enabledSignals, setEnabledSignals] = useState<Set<PersonalizationSignal>>(
    () => new Set(personalizationSignals),
  );

  const update = <K extends keyof FormState,>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const progress = ((step + 1) / steps.length) * 100;
  const contextLabel = [form.role, form.domain].filter(Boolean).join(" · ") || findLabel(focusOptions, form.currentFocus);
  const methodLabel = findLabel(formatOptions, form.preferredFormat);
  const fingerprint = useMemo(
    () => [
      { label: "Контекст", value: contextLabel, icon: Compass },
      { label: "Цель", value: `${form.primaryGoal} · ${findLabel(successOptions, form.successCriterion)}`, icon: Target },
      { label: "Ритм", value: `${form.dailyTime} минут · ${findLabel(frequencyOptions, form.studyFrequency)}`, icon: Clock3 },
      { label: "Метод", value: methodLabel, icon: Layers3 },
      { label: "Примеры", value: form.interests || "Добавите на проверке", icon: Sparkles },
    ],
    [contextLabel, form.dailyTime, form.interests, form.primaryGoal, form.studyFrequency, form.successCriterion, methodLabel],
  );

  const learningPreview = `Короткие занятия по ${form.dailyTime} минут: ${methodLabel.toLowerCase()}, затем практика с результатом «${findLabel(successOptions, form.successCriterion).toLowerCase()}». Если станет сложно — ${findLabel(supportOptions, form.supportPreference).toLowerCase()}.`;

  const moveTo = (nextStep: number) => {
    setStep(nextStep);
    setFurthestStep((current) => Math.max(current, nextStep));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleConsentGroup = (signals: PersonalizationSignal[]) => {
    setEnabledSignals((current) => {
      const next = new Set(current);
      const allEnabled = signals.every((signal) => current.has(signal));
      signals.forEach((signal) => (allEnabled ? next.delete(signal) : next.add(signal)));
      return next;
    });
  };

  const complete = () => {
    onComplete(
      createLearnerSnapshot({
        ...form,
        enabledPersonalizationSignals: personalizationSignals.filter((signal) => enabledSignals.has(signal)),
      }),
    );
  };

  const submit = () => {
    if (step === steps.length - 1) complete();
    else moveTo(step + 1);
  };

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[var(--page)] text-[var(--text)]">
      <div aria-hidden className="pointer-events-none absolute inset-0 onboarding-grid opacity-60" />
      <div aria-hidden className="pointer-events-none absolute -left-40 top-[-18rem] size-[34rem] rounded-full bg-[var(--accent)] opacity-[0.12] blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute -right-40 bottom-[-20rem] size-[38rem] rounded-full bg-[var(--cyan)] opacity-[0.09] blur-[130px]" />

      <div className="relative mx-auto grid min-h-[100svh] w-full max-w-[92rem] lg:grid-cols-[22rem_minmax(0,1fr)] xl:grid-cols-[25rem_minmax(0,1fr)]">
        <aside className="hidden border-r border-[var(--panel-border)] bg-[var(--glass)] px-7 py-8 backdrop-blur-2xl lg:flex lg:flex-col xl:px-9">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[var(--accent-grad)] text-white shadow-[0_10px_30px_-12px_var(--accent)]">
              <Sparkles aria-hidden className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">ContextPath AI</p>
              <p className="text-xs text-[var(--text-3)]">Учебный слепок</p>
            </div>
          </div>

          <div className="mt-10 flex items-center gap-4 border-y border-[var(--panel-border)] py-5">
            <div
              className="grid size-14 shrink-0 place-items-center rounded-full"
              style={{ background: `conic-gradient(var(--accent) ${progress}%, var(--node-rest-bg) ${progress}%)` }}
            >
              <span className="grid size-11 place-items-center rounded-full bg-[var(--panel)] text-sm font-semibold">{step + 1}/5</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-3)]">Готово {Math.round(progress)}%</p>
              <p className="mt-1 text-sm font-medium">{step === 4 ? "Финальная проверка" : `Около ${3 - Math.floor(step / 2)} минут`}</p>
            </div>
          </div>

          <nav className="mt-7 space-y-1" aria-label="Шаги onboarding">
            {steps.map((item, index) => {
              const Icon = item.icon;
              const active = index === step;
              const available = index <= furthestStep;

              return (
                <button
                  key={item.label}
                  type="button"
                  disabled={!available}
                  onClick={() => available && moveTo(index)}
                  className={`flex min-h-14 w-full items-center gap-3 rounded-xl px-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                    active ? "bg-[var(--accent-tint)]" : available ? "hover:bg-[var(--pill)]" : "cursor-not-allowed opacity-45"
                  }`}
                >
                  <span className={`grid size-8 shrink-0 place-items-center rounded-lg border ${active ? "border-[var(--accent)] bg-[var(--accent)] text-white" : index < step ? "border-[var(--accent-tint-2)] bg-[var(--accent-tint)] text-[var(--accent-key)]" : "border-[var(--node-rest-border)] text-[var(--text-3)]"}`}>
                    {index < step ? <Check aria-hidden className="size-4" /> : <Icon aria-hidden className="size-4" />}
                  </span>
                  <span>
                    <span className="block text-sm font-medium">{item.label}</span>
                    <span className="mt-0.5 block text-xs text-[var(--text-3)]">{item.hint}</span>
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-8">
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-3)]">
              <Repeat2 aria-hidden className="size-3.5" />
              Живой слепок
            </p>
            <div className="space-y-2.5">
              {fingerprint.slice(0, Math.max(1, step + 1)).map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="onboarding-fingerprint flex gap-3 border-l border-[var(--accent-tint-2)] py-1 pl-3" style={{ animationDelay: `${index * 55}ms` }}>
                    <Icon aria-hidden className="mt-0.5 size-3.5 shrink-0 text-[var(--accent-key)]" />
                    <div className="min-w-0">
                      <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[var(--text-3)]">{item.label}</p>
                      <p className="mt-0.5 truncate text-xs text-[var(--text-2)]">{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="mt-6 flex items-center gap-2 text-xs leading-relaxed text-[var(--text-3)]">
            <LockKeyhole aria-hidden className="size-3.5 shrink-0" />
            Только в текущей вкладке. Без регистрации.
          </p>
        </aside>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
          className="flex min-h-[100svh] min-w-0 flex-col"
        >
          <header className="border-b border-[var(--panel-border)] bg-[var(--glass)] px-4 py-4 backdrop-blur-xl sm:px-6 lg:hidden">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-lg bg-[var(--accent-grad)] text-white"><Sparkles aria-hidden className="size-4" /></span>
                <div>
                  <p className="text-sm font-semibold">Учебный слепок</p>
                  <p className="text-[0.68rem] text-[var(--text-3)]">Шаг {step + 1} из 5 · {steps[step].label}</p>
                </div>
              </div>
              <span className="text-xs font-medium text-[var(--accent-key)]">{Math.round(progress)}%</span>
            </div>
            <div className="mt-3 grid grid-cols-5 gap-1.5" aria-hidden>
              {steps.map((item, index) => (
                <span key={item.label} className={`h-1 rounded-full transition-colors ${index <= step ? "bg-[var(--accent)]" : "bg-[var(--node-rest-bg)]"}`} />
              ))}
            </div>
          </header>

          <main className="flex-1 px-4 pb-24 pt-8 sm:px-7 sm:pb-24 sm:pt-12 lg:px-12 lg:pb-12 lg:pt-14 xl:px-20">
            <div key={step} className="onboarding-step mx-auto w-full max-w-4xl">
              {step === 0 ? (
                <>
                  <StepHeading
                    eyebrow="01 · Контекст"
                    title="В какой реальности вы сейчас учитесь?"
                    copy="Это не оценка способностей. Мы ищем знакомый язык, примеры и ситуации, через которые новая тема станет ближе."
                  />
                  <fieldset>
                    <legend className="mb-3 text-sm font-semibold">Что сейчас в фокусе?</legend>
                    <ChoiceGrid name="Текущий фокус" options={focusOptions} value={form.currentFocus} onChange={(value) => update("currentFocus", value)} />
                  </fieldset>
                  <div className="mt-8 border-t border-[var(--panel-border)] pt-7">
                    <div className="mb-4 flex items-center gap-2 text-sm font-semibold"><UserRound aria-hidden className="size-4 text-[var(--accent-key)]" /> Детали для более точных примеров <span className="font-normal text-[var(--text-3)]">· необязательно</span></div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <TextField label="Роль или занятие" value={form.role} onChange={(value) => update("role", value)} placeholder="Например, продакт-менеджер" />
                      <TextField label="Сфера" value={form.domain} onChange={(value) => update("domain", value)} placeholder="Например, финтех или дизайн" />
                      <div className="sm:col-span-2">
                        <TextField label="Опыт, на который можно опереться" hint="одной фразой" value={form.background} onChange={(value) => update("background", value)} placeholder="Например, умею проводить исследования и работать с данными" />
                      </div>
                    </div>
                  </div>
                </>
              ) : null}

              {step === 1 ? (
                <>
                  <StepHeading
                    eyebrow="02 · Мотивация"
                    title="Какое изменение вы хотите получить?"
                    copy="Конкретную тему выберете дальше. Здесь определяем, ради какого результата строить маршрут и где поставить первую победу."
                  />
                  <fieldset>
                    <legend className="mb-3 text-sm font-semibold">Зачем вы чаще всего учитесь сейчас?</legend>
                    <ChoiceGrid name="Основная цель" options={goalOptions} value={form.primaryGoal} onChange={(value) => update("primaryGoal", value)} compact />
                  </fieldset>
                  <fieldset className="mt-8 border-t border-[var(--panel-border)] pt-7">
                    <legend className="mb-3 text-sm font-semibold">По чему поймёте, что обучение сработало?</legend>
                    <ChoiceGrid name="Критерий результата" options={successOptions} value={form.successCriterion} onChange={(value) => update("successCriterion", value)} compact />
                  </fieldset>
                  <fieldset className="mt-8 border-t border-[var(--panel-border)] pt-7">
                    <legend className="mb-3 text-sm font-semibold">Какой горизонт подходит сейчас?</legend>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {horizonOptions.map((option) => {
                        const active = option.value === form.goalHorizon;
                        return <button key={option.value} type="button" role="radio" aria-checked={active} onClick={() => update("goalHorizon", option.value)} className={`min-h-16 rounded-xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${active ? "border-[var(--accent)] bg-[var(--accent-tint)]" : "border-[var(--panel-border)] bg-[var(--pill)] hover:border-[var(--glass-border)]"}`}><span className="block text-sm font-semibold">{option.label}</span><span className="mt-1 block text-xs text-[var(--text-3)]">{option.description}</span></button>;
                      })}
                    </div>
                  </fieldset>
                </>
              ) : null}

              {step === 2 ? (
                <>
                  <StepHeading
                    eyebrow="03 · Ритм"
                    title="Как обучение помещается в вашу жизнь?"
                    copy="Хороший маршрут учитывает не идеальный график, а тот, который реально можно выдержать."
                  />
                  <fieldset>
                    <legend className="mb-3 text-sm font-semibold">Комфортная длина одного занятия</legend>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {timeOptions.map((option) => {
                        const active = option.value === form.dailyTime;
                        const Icon = option.icon!;
                        return <button key={option.value} type="button" role="radio" aria-checked={active} onClick={() => update("dailyTime", option.value)} className={`min-h-28 rounded-[1.25rem] border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${active ? "border-[var(--accent)] bg-[var(--accent-tint)]" : "border-[var(--panel-border)] bg-[var(--pill)] hover:-translate-y-0.5 hover:border-[var(--glass-border)]"}`}><Icon aria-hidden className={`size-5 ${active ? "text-[var(--accent-key)]" : "text-[var(--text-3)]"}`} /><span className="mt-4 block text-base font-semibold">{option.label}</span><span className="mt-1 block text-xs text-[var(--text-3)]">{option.description}</span></button>;
                      })}
                    </div>
                  </fieldset>
                  <fieldset className="mt-8 border-t border-[var(--panel-border)] pt-7">
                    <legend className="mb-3 text-sm font-semibold">Реалистичная частота</legend>
                    <ChoiceGrid name="Частота обучения" options={frequencyOptions} value={form.studyFrequency} onChange={(value) => update("studyFrequency", value)} compact />
                  </fieldset>
                  <fieldset className="mt-8 border-t border-[var(--panel-border)] pt-7">
                    <legend className="mb-1 text-sm font-semibold">Что чаще всего мешает?</legend>
                    <p className="mb-3 text-xs leading-relaxed text-[var(--text-3)]">Маршрут будет заранее компенсировать этот барьер.</p>
                    <ChoiceGrid name="Главный барьер" options={barrierOptions} value={form.learningBarrier} onChange={(value) => update("learningBarrier", value)} compact />
                  </fieldset>
                  <div className="mt-7">
                    <TextField label="Что ещё важно учесть в графике?" hint="необязательно" value={form.dailyReality} onChange={(value) => update("dailyReality", value)} placeholder="Например, могу учиться только в дороге и без звука" />
                  </div>
                </>
              ) : null}

              {step === 3 ? (
                <>
                  <StepHeading
                    eyebrow="04 · Взаимодействие"
                    title="Как лучше вести вас через сложную тему?"
                    copy="Не ищем врождённый «тип восприятия». Выбираем удачный первый сценарий, а дальше AI сможет менять его по вашему прогрессу."
                  />
                  <fieldset>
                    <legend className="mb-1 text-sm font-semibold">Встречаете незнакомую идею. С чего начать?</legend>
                    <p className="mb-3 text-xs leading-relaxed text-[var(--text-3)]">Один и тот же материал можно открыть разными дверями.</p>
                    <ChoiceGrid name="Вход в новую тему" options={formatOptions} value={form.preferredFormat} onChange={(value) => update("preferredFormat", value)} />
                  </fieldset>
                  <fieldset className="mt-8 border-t border-[var(--panel-border)] pt-7">
                    <legend className="mb-1 text-sm font-semibold">Если объяснение не сработало, что делать дальше?</legend>
                    <p className="mb-3 text-xs leading-relaxed text-[var(--text-3)]">Это станет первой стратегией AI-тьютора, а не единственным режимом.</p>
                    <ChoiceGrid name="Помощь при затруднении" options={supportOptions} value={form.supportPreference} onChange={(value) => update("supportPreference", value)} compact />
                  </fieldset>
                  <fieldset className="mt-8 border-t border-[var(--panel-border)] pt-7">
                    <legend className="mb-3 text-sm font-semibold">Плотность объяснения</legend>
                    <ChoiceGrid name="Плотность объяснения" options={complexityOptions} value={form.explanationComplexity} onChange={(value) => update("explanationComplexity", value)} compact />
                  </fieldset>
                </>
              ) : null}

              {step === 4 ? (
                <>
                  <StepHeading
                    eyebrow="05 · Учебный слепок"
                    title="Вот как AI будет учить вас"
                    copy="Проверьте логику персонализации. Любой блок можно изменить или не передавать при генерации курса."
                  />

                  <div className="relative overflow-hidden rounded-[1.5rem] border border-[var(--accent-tint-2)] bg-[var(--accent-tint)] p-5 sm:p-7">
                    <div aria-hidden className="absolute -right-10 -top-10 size-36 rounded-full bg-[var(--accent)] opacity-10 blur-3xl" />
                    <p className="relative flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent-key)]"><WandSparkles aria-hidden className="size-4" /> Предварительный сценарий</p>
                    <p className="relative mt-4 max-w-3xl text-balance text-lg font-medium leading-relaxed sm:text-xl">{learningPreview}</p>
                  </div>

                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    {fingerprint.slice(0, 4).map((item, index) => {
                      const Icon = item.icon;
                      return <div key={item.label} className="flex min-h-24 items-start gap-3 border-b border-[var(--panel-border)] px-1 py-4"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--accent-tint)] text-[var(--accent-key)]"><Icon aria-hidden className="size-4" /></span><div className="min-w-0 flex-1"><p className="text-xs uppercase tracking-[0.12em] text-[var(--text-3)]">{item.label}</p><p className="mt-1 text-sm leading-relaxed text-[var(--text-2)]">{item.value}</p></div><button type="button" onClick={() => moveTo(index)} aria-label={`Изменить: ${item.label}`} className="grid size-9 shrink-0 place-items-center rounded-lg text-[var(--text-3)] transition hover:bg-[var(--pill)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"><Pencil aria-hidden className="size-3.5" /></button></div>;
                    })}
                  </div>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <TextField label="Что использовать в примерах?" hint="необязательно" value={form.interests} onChange={(value) => update("interests", value)} placeholder="Например, кино, бег, продукты, история" />
                    <TextField label="Что лучше не использовать?" hint="необязательно" value={form.avoidContext} onChange={(value) => update("avoidContext", value)} placeholder="Темы или контекст, которых стоит избегать" />
                  </div>

                  <section className="mt-10 border-t border-[var(--panel-border)] pt-7" aria-labelledby="consent-heading">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--accent-tint)] text-[var(--accent-key)]"><ShieldCheck aria-hidden className="size-4" /></span>
                      <div>
                        <h2 id="consent-heading" className="text-base font-semibold">Что передавать AI для персонализации</h2>
                        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[var(--text-3)] sm:text-sm">Данные остаются в этой вкладке. При генерации сервер использует только включённые группы.</p>
                      </div>
                    </div>
                    <div className="mt-5 divide-y divide-[var(--panel-border)] border-y border-[var(--panel-border)]">
                      {consentGroups.map((group) => {
                        const active = group.signals.every((signal) => enabledSignals.has(signal));
                        return <div key={group.label} className="flex min-h-[4.5rem] items-center justify-between gap-4 py-3"><div><p className="text-sm font-medium">{group.label}</p><p className="mt-1 text-xs leading-relaxed text-[var(--text-3)]">{group.description}</p></div><button type="button" role="switch" aria-checked={active} aria-label={`${active ? "Отключить" : "Включить"}: ${group.label}`} onClick={() => toggleConsentGroup(group.signals)} className={`relative h-7 w-12 shrink-0 rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${active ? "border-[var(--accent)] bg-[var(--accent)]" : "border-[var(--node-rest-border)] bg-[var(--node-rest-bg)]"}`}><span className={`absolute left-1 top-1 size-[1.125rem] rounded-full bg-white shadow transition-transform ${active ? "translate-x-5" : "translate-x-0"}`} /></button></div>;
                      })}
                    </div>
                  </section>
                </>
              ) : null}
            </div>
          </main>

          <footer className="fixed inset-x-0 bottom-0 z-10 border-t border-[var(--panel-border)] bg-[color:var(--page)]/90 px-4 py-4 backdrop-blur-xl sm:px-7 lg:sticky lg:inset-x-auto lg:px-12 xl:px-20">
            <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3">
              <button type="button" onClick={() => moveTo(Math.max(0, step - 1))} disabled={step === 0} className="inline-flex min-h-12 items-center gap-2 rounded-xl px-3 text-sm font-medium text-[var(--text-2)] transition hover:bg-[var(--pill)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:pointer-events-none disabled:opacity-0 sm:px-4"><ArrowLeft aria-hidden className="size-4" /> Назад</button>
              <div className="hidden items-center gap-2 text-xs text-[var(--text-3)] sm:flex"><LockKeyhole aria-hidden className="size-3.5" /> Сохраняется только в этой вкладке</div>
              <button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--accent-grad)] px-5 text-sm font-semibold text-white shadow-[0_14px_34px_-16px_var(--accent)] transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page)] sm:px-6">{step === steps.length - 1 ? <><span className="sm:hidden">Сохранить профиль</span><span className="hidden sm:inline">Сохранить и выбрать тему</span></> : "Продолжить"}{step === steps.length - 1 ? <Check aria-hidden className="size-4" /> : <ArrowRight aria-hidden className="size-4" />}</button>
            </div>
          </footer>
        </form>
      </div>
    </section>
  );
}
