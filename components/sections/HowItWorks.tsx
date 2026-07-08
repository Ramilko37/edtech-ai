import type { CSSProperties } from "react";
import { steps } from "@/lib/content";

export function HowItWorks() {
  return (
    <section className="dark-grid bg-deep py-20 text-white sm:py-24">
      <div className="section-shell">
        <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-10 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-amberSignal">
              как это устроено
            </p>
            <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
              Как это работает
            </h2>
          </div>
          <p className="max-w-xl text-base leading-7 text-white/58">
            Вся логика маршрута остается объяснимой: профиль, диагностика,
            материалы и перестройка прогресса видны как единая цепочка.
          </p>
        </div>
        <div className="mt-12 grid gap-4 lg:grid-cols-5">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="motion-stagger relative rounded-lg border border-white/[0.12] bg-white/[0.06] p-5 transition duration-300 hover:-translate-y-1 hover:border-cyanGlow/35 hover:bg-white/[0.09]"
              style={{ "--motion-delay": `${index * 95}ms` } as CSSProperties}
            >
              <div className="motion-pulse mb-8 flex size-10 items-center justify-center rounded-lg bg-cyanGlow text-sm font-semibold text-deep shadow-glow">
                {index + 1}
              </div>
              <h3 className="text-lg font-semibold leading-7">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/[0.72]">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
