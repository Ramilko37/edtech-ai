export type LearnerLevel = "beginner" | "basic" | "intermediate";

export type GenerateCourseInput = {
  topic: string;
  goal?: string;
  context?: string;
  level?: LearnerLevel;
};

export type CoursePassportItem = {
  label: string;
  value: string;
};

export type CourseDay = {
  day: number;
  title: string;
  objective: string;
  practice: string;
};

export type GeneratedCourse = {
  title: string;
  passport: CoursePassportItem[];
  whyThisRoute: string;
  days: CourseDay[];
  firstLesson: {
    title: string;
    explanation: string;
    task: string;
    feedbackPrompt: string;
  };
  model: string;
  generatedAt: string;
};

export class CourseValidationError extends Error {}

const levels: LearnerLevel[] = ["beginner", "basic", "intermediate"];
const MAX_TOPIC_LENGTH = 240;
const MAX_OPTIONAL_LENGTH = 160;
const MAX_CONTENT_LENGTH = 1_200;

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new CourseValidationError("Неверный формат данных курса");
  }

  return value as Record<string, unknown>;
}

function optionalString(value: unknown, maxLength: number, message: string) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new CourseValidationError(message);
  }

  const trimmed = value.trim();

  if (!trimmed || trimmed.length > maxLength) {
    throw new CourseValidationError(message);
  }

  return trimmed;
}

function requiredString(value: unknown, message: string, maxLength = MAX_CONTENT_LENGTH) {
  const result = optionalString(value, maxLength, message);

  if (!result) {
    throw new CourseValidationError(message);
  }

  return result;
}

export function validateGenerateCourseInput(value: unknown): GenerateCourseInput {
  const input = asRecord(value);
  const topic = requiredString(input.topic, "Укажите тему обучения", MAX_TOPIC_LENGTH);
  const goal = optionalString(input.goal, MAX_OPTIONAL_LENGTH, "Проверьте цель обучения");
  const context = optionalString(input.context, MAX_OPTIONAL_LENGTH, "Проверьте контекст обучения");

  if (input.level !== undefined && !levels.includes(input.level as LearnerLevel)) {
    throw new CourseValidationError("Выберите корректный уровень");
  }

  return {
    topic,
    ...(goal ? { goal } : {}),
    ...(context ? { context } : {}),
    ...(input.level ? { level: input.level as LearnerLevel } : {}),
  };
}

function parsePassport(value: unknown): CoursePassportItem[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 4) {
    throw new CourseValidationError("Карта должна содержать от 1 до 4 пунктов профиля");
  }

  return value.map((item) => {
    const record = asRecord(item);

    return {
      label: requiredString(record.label, "В профиле не хватает названия", 80),
      value: requiredString(record.value, "В профиле не хватает значения", 240),
    };
  });
}

function parseDays(value: unknown): CourseDay[] {
  if (!Array.isArray(value) || value.length !== 7) {
    throw new CourseValidationError("Карта должна содержать ровно 7 дней");
  }

  const days = value.map((item) => {
    const record = asRecord(item);

    if (!Number.isInteger(record.day) || (record.day as number) < 1 || (record.day as number) > 7) {
      throw new CourseValidationError("Дни курса должны быть пронумерованы от 1 до 7");
    }

    return {
      day: record.day as number,
      title: requiredString(record.title, "У дня курса нет названия"),
      objective: requiredString(record.objective, "У дня курса нет цели"),
      practice: requiredString(record.practice, "У дня курса нет практики"),
    };
  });

  const orderedDays = [...days].sort((left, right) => left.day - right.day);

  if (orderedDays.some((item, index) => item.day !== index + 1)) {
    throw new CourseValidationError("Дни курса должны быть уникальны и идти от 1 до 7");
  }

  return orderedDays;
}

export function parseGeneratedCourse(value: unknown, model: string, generatedAt: string): GeneratedCourse {
  const course = asRecord(value);
  const firstLesson = asRecord(course.firstLesson);

  return {
    title: requiredString(course.title, "У карты нет названия"),
    passport: parsePassport(course.passport),
    whyThisRoute: requiredString(course.whyThisRoute, "У карты нет объяснения маршрута"),
    days: parseDays(course.days),
    firstLesson: {
      title: requiredString(firstLesson.title, "У первого урока нет названия"),
      explanation: requiredString(firstLesson.explanation, "У первого урока нет объяснения"),
      task: requiredString(firstLesson.task, "У первого урока нет задания"),
      feedbackPrompt: requiredString(firstLesson.feedbackPrompt, "У первого урока нет критерия проверки"),
    },
    model: requiredString(model, "Неизвестная модель", 160),
    generatedAt: requiredString(generatedAt, "Неизвестное время генерации", 80),
  };
}
