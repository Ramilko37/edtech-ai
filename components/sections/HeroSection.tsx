import {
  ArrowDown,
  BrainCircuit,
  CheckCircle2,
  GraduationCap,
  Languages,
  Radar,
  Route,
  Sparkles,
  UserRound,
} from "lucide-react";
import type { CSSProperties } from "react";
import { buttonClasses } from "@/components/ui/Button";

const routeCards = [
  {
    profile: "Врач из Румынии",
    meta: "Бокс · этика · beginner",
    route: "Философия через тело, боль и достоинство",
    score: "92%",
  },
  {
    profile: "Гонщик-юрист",
    meta: "Риск · право · скорость",
    route: "Философия через свободу и ответственность",
    score: "88%",
  },
];

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-l border-white/10 pl-4 transition duration-300 hover:-translate-y-1 hover:border-cyanGlow/40 first:border-l-0 first:pl-0">
      <p className="text-2xl font-semibold leading-none text-white sm:text-3xl">
        {value}
      </p>
      <p className="mt-2 max-w-28 text-xs leading-5 text-white/68">{label}</p>
    </div>
  );
}

function RouteCard({
  profile,
  meta,
  route,
  score,
  index,
}: {
  profile: string;
  meta: string;
  route: string;
  score: string;
  index: number;
}) {
  return (
    <div
      className="motion-stagger rounded-lg border border-white/10 bg-white/[0.07] p-4 shadow-panel backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-cyanGlow/35 hover:bg-white/[0.1]"
      style={{ "--motion-delay": `${240 + index * 120}ms` } as CSSProperties}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">{profile}</p>
          <p className="mt-1 text-xs leading-5 text-white/64">{meta}</p>
        </div>
        <div className="rounded-md bg-cyanGlow/12 px-2 py-1 text-xs font-semibold text-cyanGlow">
          {score}
        </div>
      </div>
      <div className="my-4 h-px bg-white/10" />
      <div className="flex items-start gap-3">
        <CheckCircle2 aria-hidden className="mt-0.5 size-4 shrink-0 text-greenSoft" />
        <p className="text-sm font-medium leading-6 text-white/88">{route}</p>
      </div>
    </div>
  );
}

function RouteDashboard() {
  return (
    <div className="relative">
      <div className="motion-spin-slow absolute -right-6 top-10 hidden h-64 w-64 rounded-full border border-cyanGlow/25 lg:block" />
      <div className="motion-spin-slow absolute -right-1 top-28 hidden h-44 w-44 rounded-full border border-cyanGlow/15 lg:block" />

      <div className="motion-float relative rounded-lg border border-white/12 bg-deep/82 p-4 shadow-soft backdrop-blur sm:p-5">
        <div className="mb-5 flex items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyanGlow">
              live route lab
            </p>
            <p className="mt-2 text-sm text-white/72">
              profile &rarr; AI &rarr; course map
            </p>
          </div>
          <div className="motion-pulse grid size-11 place-items-center rounded-lg border border-cyanGlow/25 bg-cyanGlow/10 text-cyanGlow shadow-glow">
            <BrainCircuit aria-hidden className="size-5" />
          </div>
        </div>

        <div className="motion-scan relative rounded-lg border border-cyanGlow/20 bg-gradient-to-br from-cyanGlow/16 to-white/[0.03] p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-lg bg-white text-deep">
                <UserRound aria-hidden className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">Контекст профиля</p>
                <p className="mt-1 text-xs text-white/68">опыт, цель, язык, интересы</p>
              </div>
            </div>
            <Radar aria-hidden className="motion-spin-slow size-5 text-cyanGlow" />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {["профессия", "уровень", "культура", "мотивация"].map((item) => (
              <span
                key={item}
                className="rounded-md border border-white/10 bg-white/[0.08] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/78"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-center py-4 text-cyanGlow">
          <ArrowDown aria-hidden className="motion-bounce size-5" />
        </div>

        <div className="grid gap-3">
          {routeCards.map((card, index) => (
            <RouteCard key={card.profile} index={index} {...card} />
          ))}
        </div>

        <div className="mt-5 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-3">
          {[
            ["Depth", "same standard"],
            ["Examples", "personal context"],
            ["Language", "native clarity"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="motion-stagger rounded-lg bg-white/[0.06] p-3"
              style={{ "--motion-delay": "520ms" } as CSSProperties}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyanGlow/80">
                {label}
              </p>
              <p className="mt-1 text-sm font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="dark-grid relative min-h-screen overflow-hidden border-b border-white/10 bg-deep text-white">
      <div className="motion-gradient absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(41,200,242,0.33),transparent_28rem),linear-gradient(115deg,rgba(7,50,59,0.92),rgba(7,17,28,0.98)_58%)]" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-deep to-transparent" />

      <header className="section-shell relative z-10 flex items-center justify-between py-5">
        <a href="#top" className="flex min-h-11 items-center gap-3 font-semibold text-white">
          <span className="grid size-10 place-items-center rounded-lg border border-cyanGlow/35 bg-cyanGlow/12 text-cyanGlow">
            <GraduationCap aria-hidden className="size-5" />
          </span>
          <span className="tracking-[0.18em] text-white">CONTEXTPATH</span>
        </a>
        <nav className="hidden items-center gap-7 text-sm font-medium text-white/60 md:flex">
          <a className="transition hover:text-white" href="#solution">
            Подход
          </a>
          <a className="transition hover:text-white" href="#examples">
            Примеры
          </a>
          <a className="transition hover:text-white" href="#demo">
            Демо
          </a>
        </nav>
        <a
          className={buttonClasses(
            "secondary",
            "hidden border-white/15 bg-white/[0.07] text-white hover:border-cyanGlow hover:text-cyanGlow sm:inline-flex",
          )}
          href="#demo"
        >
          Попробовать
        </a>
      </header>

      <div
        id="top"
        className="section-shell relative z-10 grid items-center gap-10 pb-16 pt-10 lg:grid-cols-[0.92fr_1.08fr] lg:pb-20 lg:pt-20"
      >
        <div className="fade-up max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.1] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/78">
            <span className="motion-pulse size-2 rounded-full bg-greenSoft shadow-[0_0_18px_rgba(40,214,163,0.8)]" />
            AI-платформа персонального обучения
          </div>
          <h1 className="mt-8 max-w-5xl text-5xl font-semibold leading-[0.98] tracking-normal text-[#ecfbff] sm:text-6xl lg:text-7xl">
            Курс, который можно{" "}
            <span className="motion-shimmer bg-gradient-to-r from-cyanGlow via-white to-cyanGlow bg-clip-text text-transparent">
              собрать вокруг человека
            </span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/76 sm:text-xl sm:leading-9">
            ContextPath AI превращает одну образовательную цель в персональный
            маршрут: с учетом опыта, профессии, интересов, языка и культурного
            контекста.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              className={buttonClasses(
                "primary",
                "!bg-cyanGlow !text-deep shadow-glow hover:!bg-white focus-visible:outline-cyanGlow",
              )}
              href="#demo"
            >
              Собрать мой курс
              <Route aria-hidden className="size-4" />
            </a>
            <a
              className={buttonClasses(
                "secondary",
                "border-white/15 bg-white/[0.06] text-white hover:border-white/40 hover:text-white",
              )}
              href="#examples"
            >
              Посмотреть пример
            </a>
          </div>

          <div className="mt-12 grid max-w-2xl grid-cols-3 gap-5 border-t border-white/14 pt-6">
            <Metric value="1" label="цель обучения превращается в разные маршруты" />
            <Metric value="100%" label="глубина курса сохраняется для всех" />
            <Metric value="<1 мин" label="на сборку первого учебного маршрута" />
          </div>
        </div>

        <div className="fade-up-delay">
          <RouteDashboard />
        </div>
      </div>

      <div className="section-shell relative z-10 pb-8">
        <div className="flex items-center gap-3 text-sm text-white/72">
          <Languages aria-hidden className="motion-pulse size-4 text-greenSoft" />
          <span>Один предмет. Одна цель. Бесконечно разные маршруты.</span>
        </div>
      </div>
    </section>
  );
}
