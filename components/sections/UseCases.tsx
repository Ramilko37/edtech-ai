import { Badge } from "@/components/ui/Badge";
import { useCases } from "@/lib/content";

export function UseCases() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="section-shell">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <Badge>Для кого это</Badge>
            <h2 className="mt-5 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
              Персональное обучение для людей и команд, которым нужен результат
            </h2>
          </div>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {useCases.map(({ title, icon: Icon }) => (
            <div
              key={title}
              className="flex items-center gap-4 rounded-lg border border-line bg-white p-5 transition duration-200 hover:-translate-y-1 hover:border-blueElectric/40 hover:shadow-panel"
            >
              <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-greenSoft/12 text-greenSoft">
                <Icon aria-hidden className="size-5" />
              </div>
              <h3 className="text-base font-semibold leading-6 text-ink">{title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
