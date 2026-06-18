import { Badge } from "@/components/ui/Badge";
import { privacyItems } from "@/lib/content";

export function PrivacySection() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="section-shell">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Badge>Trust & privacy</Badge>
            <h2 className="mt-5 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
              Ваш контекст — под вашим контролем
            </h2>
            <p className="mt-5 text-lg leading-8 text-slateText">
              Персонализация объясняет сложные темы через знакомые ситуации. Она
              не делает выводы о способностях человека по происхождению или
              чувствительным параметрам.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {privacyItems.map(({ title, text, icon: Icon }) => (
              <div key={title} className="rounded-lg border border-line bg-mist p-5">
                <Icon aria-hidden className="mb-5 size-5 text-blueElectric" />
                <h3 className="text-lg font-semibold text-ink">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slateText">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
