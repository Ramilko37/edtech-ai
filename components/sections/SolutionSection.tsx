import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { solutionCards } from "@/lib/content";

export function SolutionSection() {
  return (
    <section id="solution" className="bg-mist py-20 sm:py-24">
      <div className="section-shell">
        <div className="max-w-3xl">
          <Badge>Context-aware learning</Badge>
          <h2 className="mt-5 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            Мы меняем не знания. Мы меняем маршрут к ним.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slateText">
            Платформа берёт одну и ту же образовательную цель и строит разные
            пути к ней. Содержание остаётся глубоким, но примеры, задания, темп
            и объяснения адаптируются под человека.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {solutionCards.map(({ title, text, icon: Icon }) => (
            <Card
              key={title}
              className="group p-5 transition duration-200 hover:-translate-y-1 hover:shadow-soft"
            >
              <div className="mb-5 grid size-11 place-items-center rounded-lg bg-blueElectric/10 text-blueCore transition group-hover:bg-blueElectric group-hover:text-white">
                <Icon aria-hidden className="size-5" />
              </div>
              <h3 className="text-lg font-semibold text-ink">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slateText">{text}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
