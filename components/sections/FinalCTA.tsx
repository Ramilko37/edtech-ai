import { Route } from "lucide-react";
import { buttonClasses } from "@/components/ui/Button";

export function FinalCTA() {
  return (
    <section className="dark-grid bg-deep px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-lg border border-white/[0.12] bg-white/[0.07] px-5 py-12 text-center shadow-soft sm:px-8">
        <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Обучение, которое начинается с вас
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/[0.72]">
          Соберите первый курс, который говорит на языке вашего опыта.
        </p>
        <a
          className={buttonClasses(
            "primary",
            "mt-8 !bg-cyanGlow !text-deep shadow-glow hover:!bg-white",
          )}
          href="#demo"
        >
          Попробовать демо
          <Route aria-hidden className="size-4" />
        </a>
      </div>
    </section>
  );
}
