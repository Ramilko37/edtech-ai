import { CheckCircle2, FilePenLine } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { examples } from "@/lib/content";

export function PersonalizationExamples() {
  return (
    <section id="examples" className="bg-white py-20 sm:py-24">
      <div className="section-shell">
        <div className="mx-auto max-w-3xl text-center">
          <Badge>Киллер-фича</Badge>
          <h2 className="mt-5 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            Один предмет — разные маршруты
          </h2>
          <p className="mt-5 text-lg leading-8 text-slateText">
            Философия для врача-боксёра будет не такой же, как философия для
            гонщика-юриста. Потому что люди не учатся в вакууме — они учатся
            через свой опыт.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {examples.map((example) => {
            const isBlue = example.accent === "blue";
            return (
              <Card
                key={example.person}
                className="flex flex-col overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-soft"
              >
                <div
                  className={`border-b border-line p-6 ${
                    isBlue ? "bg-blueElectric/[0.08]" : "bg-coral/10"
                  }`}
                >
                  <p
                    className={`text-sm font-semibold ${
                      isBlue ? "text-blueCore" : "text-coral"
                    }`}
                  >
                    {example.course}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold leading-tight text-ink">
                    {example.person}
                  </h3>
                </div>
                <div className="grid flex-1 gap-6 p-6">
                  <div>
                    <p className="text-sm font-semibold text-ink">Фокус курса</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {example.focus.map((item) => (
                        <div key={item} className="flex gap-2 text-sm text-slateText">
                          <CheckCircle2
                            aria-hidden
                            className={`mt-0.5 size-4 shrink-0 ${
                              isBlue ? "text-blueElectric" : "text-coral"
                            }`}
                          />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg border border-line bg-mist p-5">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
                      <FilePenLine aria-hidden className="size-4 text-greenSoft" />
                      Пример задания
                    </div>
                    <p className="text-base leading-7 text-slateText">{example.task}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
