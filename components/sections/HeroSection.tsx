import {
  ArrowDown,
  BrainCircuit,
  GraduationCap,
  Languages,
  Route,
  UserRound,
} from "lucide-react";
import { buttonClasses } from "@/components/ui/Button";

function ProfileRoute({
  profile,
  path,
  tone,
}: {
  profile: string;
  path: string;
  tone: "blue" | "coral";
}) {
  const toneClasses =
    tone === "blue"
      ? "border-blueElectric/25 bg-blueElectric/[0.08] text-blueCore"
      : "border-coral/30 bg-coral/10 text-coral";

  return (
    <div className="grid gap-3">
      <div className="rounded-lg border border-line bg-white p-4 shadow-panel">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
          <UserRound aria-hidden className="size-4 text-blueElectric" />
          Profile
        </div>
        <p className="text-sm leading-6 text-slateText">{profile}</p>
      </div>
      <div className="flex justify-center text-blueElectric">
        <ArrowDown aria-hidden className="size-5" />
      </div>
      <div className="rounded-lg border border-blueElectric/25 bg-blueElectric px-4 py-3 text-center text-sm font-semibold text-white shadow-panel">
        Context-Aware AI
      </div>
      <div className="flex justify-center text-blueElectric">
        <ArrowDown aria-hidden className="size-5" />
      </div>
      <div className={`rounded-lg border p-4 text-sm font-semibold ${toneClasses}`}>
        {path}
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen border-b border-line/80">
      <header className="section-shell flex items-center justify-between py-5">
        <a href="#top" className="flex items-center gap-3 font-semibold text-ink">
          <span className="grid size-9 place-items-center rounded-lg bg-blueElectric text-white">
            <GraduationCap aria-hidden className="size-5" />
          </span>
          <span>ContextPath AI</span>
        </a>
        <nav className="hidden items-center gap-7 text-sm font-medium text-slateText md:flex">
          <a className="transition hover:text-blueCore" href="#solution">
            Подход
          </a>
          <a className="transition hover:text-blueCore" href="#examples">
            Примеры
          </a>
          <a className="transition hover:text-blueCore" href="#demo">
            Демо
          </a>
        </nav>
        <a className={buttonClasses("secondary", "hidden sm:inline-flex")} href="#demo">
          Попробовать
        </a>
      </header>

      <div
        id="top"
        className="section-shell grid items-center gap-10 pb-14 pt-8 lg:grid-cols-[0.95fr_1.05fr] lg:pb-20 lg:pt-14"
      >
        <div className="fade-up max-w-3xl">
          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-normal text-ink sm:text-5xl lg:text-6xl">
            Курс, который строится вокруг вас
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slateText">
            AI-платформа создаёт персональную траекторию обучения с учётом
            вашего опыта, образования, профессии, интересов, языка и культурного
            контекста.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a className={buttonClasses("primary")} href="#demo">
              Собрать мой курс
              <Route aria-hidden className="size-4" />
            </a>
            <a className={buttonClasses("secondary")} href="#examples">
              Посмотреть пример
            </a>
          </div>
          <p className="mt-8 max-w-xl text-base font-medium leading-7 text-ink">
            Не пользователь адаптируется под курс. Курс адаптируется под
            пользователя.
          </p>
        </div>

        <div className="fade-up-delay relative">
          <div className="relative rounded-lg border border-line bg-white/90 p-4 shadow-soft backdrop-blur sm:p-5">
            <div className="mb-5 flex items-center justify-between gap-4 border-b border-line pb-4">
              <div>
                <p className="text-sm font-semibold text-ink">Personal route lab</p>
                <p className="text-xs text-slateText">profile &rarr; AI &rarr; route</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blueCore">
                <BrainCircuit aria-hidden className="size-4" />
                Live context
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <ProfileRoute
                tone="blue"
                profile="Doctor · Romania · Boxing · Beginner in philosophy"
                path="Philosophy through body, pain, ethics and discipline"
              />
              <ProfileRoute
                tone="coral"
                profile="Racer · Russia · Legal background"
                path="Philosophy through risk, law, freedom and responsibility"
              />
            </div>
            <div className="mt-5 grid gap-3 border-t border-line pt-5 sm:grid-cols-3">
              {[
                ["Depth", "same standard"],
                ["Examples", "personal context"],
                ["Language", "native clarity"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-mist p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slateText">
                    {label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="section-shell pb-8">
        <div className="flex items-center gap-3 text-sm text-slateText">
          <Languages aria-hidden className="size-4 text-greenSoft" />
          <span>Один предмет. Одна цель. Бесконечно разные маршруты.</span>
        </div>
      </div>
    </section>
  );
}
