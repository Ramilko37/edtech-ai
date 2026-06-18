"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

const defaultModules = [
  "Зачем врачу философия",
  "Стоицизм, боль и самоконтроль",
  "Этика помощи и границы вмешательства",
  "Тело как объект и как часть личности",
  "Смерть, достоинство и выбор",
];

function buildRouteTitle(values: DemoValues) {
  const who = values.who.toLowerCase();
  const experience = values.experience.toLowerCase();
  const interests = values.interests.toLowerCase();
  const topic = values.topic || "новая тема";

  if (who.includes("врач") || experience.includes("мед")) {
    return `${topic} через медицину, тело и дисциплину`;
  }

  if (who.includes("гон") || experience.includes("юрист")) {
    return `${topic} через риск, право и ответственность`;
  }

  if (interests.includes("спорт")) {
    return `${topic} через практику, ритм и самоконтроль`;
  }

  return `${topic} через ваш опыт, цель и рабочие ситуации`;
}

type DemoValues = {
  who: string;
  topic: string;
  experience: string;
  interests: string;
  locale: string;
};

export function DemoGenerator() {
  const [values, setValues] = useState<DemoValues>({
    who: "Врач",
    topic: "Философия",
    experience: "Медицина, базовый уровень философии",
    interests: "Бокс, дисциплина, этика",
    locale: "Румыния / русский и английский",
  });
  const [submitted, setSubmitted] = useState(true);

  const routeTitle = useMemo(() => buildRouteTitle(values), [values]);

  const modules = useMemo(() => {
    if (
      values.who.toLowerCase().includes("гон") ||
      values.experience.toLowerCase().includes("юрист")
    ) {
      return [
        "Свобода, выбор и ответственность",
        "Право и мораль в сложных решениях",
        "Философия риска и цена ошибки",
        "Справедливость, закон и личная воля",
        "Скорость как метафора последствий",
      ];
    }

    return defaultModules;
  }, [values.experience, values.who]);

  function updateValue(field: keyof DemoValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setSubmitted(false);
  }

  return (
    <section id="demo" className="bg-mist py-20 sm:py-24">
      <div className="section-shell">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <h2 className="text-3xl font-semibold leading-tight text-ink sm:text-4xl">
              Соберите пример маршрута
            </h2>
            <p className="mt-5 text-lg leading-8 text-slateText">
              Демо работает без backend: заполните профиль, и интерфейс покажет,
              как может выглядеть персональная траектория.
            </p>
            <form
              className="mt-8 grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                setSubmitted(true);
              }}
            >
              {[
                ["who", "Кто вы?"],
                ["topic", "Что хотите изучить?"],
                ["experience", "Ваш опыт"],
                ["interests", "Ваши интересы"],
                ["locale", "Страна / язык"],
              ].map(([field, label]) => (
                <label key={field} className="grid gap-2">
                  <span className="text-sm font-semibold text-ink">{label}</span>
                  <input
                    className="min-h-12 rounded-lg border border-line bg-white px-4 text-base text-ink outline-none transition placeholder:text-slateText/50 focus:border-blueElectric focus:ring-4 focus:ring-blueElectric/10"
                    value={values[field as keyof DemoValues]}
                    onChange={(event) =>
                      updateValue(field as keyof DemoValues, event.target.value)
                    }
                  />
                </label>
              ))}
              <Button type="submit" icon className="mt-2 w-full sm:w-fit">
                Собрать пример маршрута
              </Button>
            </form>
          </div>

          <div className="rounded-lg border border-line bg-white p-5 shadow-soft sm:p-6">
            <div className="mb-6 flex items-center justify-between gap-4 border-b border-line pb-5">
              <div>
                <p className="text-sm font-semibold text-slateText">
                  Ваш персональный маршрут
                </p>
                <h3 className="mt-2 text-2xl font-semibold leading-tight text-ink">
                  {submitted ? routeTitle : "Обновите маршрут после изменений"}
                </h3>
              </div>
              <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-blueElectric text-white">
                <Sparkles aria-hidden className="size-5" />
              </div>
            </div>
            <div className="grid gap-3">
              {modules.map((module, index) => (
                <div
                  key={module}
                  className="flex items-center gap-4 rounded-lg border border-line bg-mist p-4"
                >
                  <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-sm font-semibold text-blueCore">
                    {index + 1}
                  </div>
                  <p className="text-sm font-semibold leading-6 text-ink">
                    Модуль {index + 1}: {module}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-lg border border-blueElectric/20 bg-blueElectric/10 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-blueCore">
                <ArrowRight aria-hidden className="size-4" />
                Почему такой маршрут
              </p>
              <p className="mt-2 text-sm leading-6 text-slateText">
                Система связывает цель с вашим опытом, интересами и языковым
                контекстом, сохраняя одинаковую глубину знаний.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
