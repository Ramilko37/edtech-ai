import { AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { problems } from "@/lib/content";

export function ProblemSection() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="section-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="fade-up">
          <h2 className="max-w-3xl text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            Большинство курсов написаны для “среднего пользователя”. Но
            среднего пользователя не существует.
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {problems.map((problem) => (
            <Card
              key={problem}
              className="group p-5 transition duration-200 hover:-translate-y-1 hover:border-blueElectric/40"
            >
              <AlertCircle
                aria-hidden
                className="mb-5 size-5 text-coral transition group-hover:text-blueElectric"
              />
              <p className="text-base leading-7 text-slateText">{problem}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
