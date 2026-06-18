import { steps } from "@/lib/content";

export function HowItWorks() {
  return (
    <section className="bg-ink py-20 text-white sm:py-24">
      <div className="section-shell">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
            Как это работает
          </h2>
        </div>
        <div className="mt-12 grid gap-4 lg:grid-cols-5">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative rounded-lg border border-white/[0.12] bg-white/[0.08] p-5"
            >
              <div className="mb-8 flex size-10 items-center justify-center rounded-lg bg-white text-sm font-semibold text-ink">
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
