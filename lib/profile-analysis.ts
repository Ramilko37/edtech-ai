export type ProfileFollowUpOption = {
  id: string;
  label: string;
  description: string;
};

export type ProfileAnalysis = {
  summary: string;
  role?: string;
  domain?: string;
  background?: string;
  interests?: string;
  followUpQuestion: string;
  followUpOptions: ProfileFollowUpOption[];
};

export class ProfileAnalysisValidationError extends Error {}

function record(value: unknown, message = "AI вернул неполный слепок") {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ProfileAnalysisValidationError(message);
  }
  return value as Record<string, unknown>;
}

function text(value: unknown, message: string, max: number, required = true) {
  if (value === undefined || value === null || value === "") {
    if (required) throw new ProfileAnalysisValidationError(message);
    return undefined;
  }
  if (typeof value !== "string" || !value.trim() || value.trim().length > max) {
    throw new ProfileAnalysisValidationError(message);
  }
  return value.trim();
}

export function validateProfileNarrative(value: unknown) {
  if (typeof value !== "string") throw new ProfileAnalysisValidationError("Расскажите немного подробнее");
  const narrative = value.trim();
  if (narrative.length < 30) throw new ProfileAnalysisValidationError("Расскажите немного подробнее");
  if (narrative.length > 800) throw new ProfileAnalysisValidationError("Сократите рассказ до 800 символов");
  return narrative;
}

export function parseProfileAnalysis(value: unknown): ProfileAnalysis {
  const input = record(value);
  const options = input.followUpOptions;
  if (!Array.isArray(options) || options.length !== 3) {
    throw new ProfileAnalysisValidationError("AI должен предложить ровно три варианта ответа");
  }

  const parsedOptions = options.map((item) => {
    const option = record(item, "Проверьте варианты уточняющего вопроса");
    return {
      id: text(option.id, "У варианта нет идентификатора", 24)!,
      label: text(option.label, "У варианта нет названия", 80)!,
      description: text(option.description, "У варианта нет пояснения", 160)!,
    };
  });

  if (new Set(parsedOptions.map((option) => option.id)).size !== parsedOptions.length) {
    throw new ProfileAnalysisValidationError("Варианты ответа должны быть уникальны");
  }

  const role = text(input.role, "Проверьте роль", 100, false);
  const domain = text(input.domain, "Проверьте сферу", 100, false);
  const background = text(input.background, "Проверьте опыт", 240, false);
  const interests = text(input.interests, "Проверьте интересы", 200, false);

  return {
    summary: text(input.summary, "У слепка нет резюме", 320)!,
    ...(role ? { role } : {}),
    ...(domain ? { domain } : {}),
    ...(background ? { background } : {}),
    ...(interests ? { interests } : {}),
    followUpQuestion: text(input.followUpQuestion, "У слепка нет уточняющего вопроса", 220)!,
    followUpOptions: parsedOptions,
  };
}
