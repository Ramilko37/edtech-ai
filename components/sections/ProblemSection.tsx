import { AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { problems } from "@/lib/content";

export function ProblemSection() {
  return (
    <section className="bg-deep py-20 text-white sm:py-24">
      <div className="section-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="fade-up">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-amberSignal">
            где ломается обычный курс
          </p>
          <h2 className="max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-4xl">
            Большинство курсов написаны для “среднего пользователя”. Но
            среднего пользователя не существует.
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {problems.map((problem) => (
            <Card
              key={problem}
              className="group border-white/10 bg-white/[0.06] p-5 shadow-none transition duration-200 hover:-translate-y-1 hover:border-cyanGlow/40"
            >
              <AlertCircle
                aria-hidden
                className="mb-5 size-5 text-amberSignal transition group-hover:text-cyanGlow"
              />
              <p className="text-base leading-7 text-white/68">{problem}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
