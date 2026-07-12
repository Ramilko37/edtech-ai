import { parseGeneratedCourse, type GeneratedCourse } from "./course";

export const COURSE_SESSION_KEY = "edtech-ai:course-session:v1";

export type CourseSession = {
  version: 1;
  course: GeneratedCourse;
  completedDays: number[];
};

export function createCourseSession(course: GeneratedCourse): CourseSession {
  return { version: 1, course, completedDays: [] };
}

export function toggleCourseDay(session: CourseSession, day: number): CourseSession {
  if (!Number.isInteger(day) || !session.course.days.some((item) => item.day === day)) {
    return session;
  }

  const completed = new Set(session.completedDays);

  if (completed.has(day)) {
    completed.delete(day);
  } else {
    completed.add(day);
  }

  return {
    ...session,
    completedDays: [...completed].sort((left, right) => left - right),
  };
}

export function parseCourseSession(value: string | null): CourseSession | null {
  if (!value) {
    return null;
  }

  try {
    const candidate = JSON.parse(value) as Record<string, unknown>;

    if (!candidate || candidate.version !== 1 || !Array.isArray(candidate.completedDays)) {
      return null;
    }

    const courseCandidate = candidate.course as Record<string, unknown>;
    const course = parseGeneratedCourse(
      courseCandidate,
      typeof courseCandidate?.model === "string" ? courseCandidate.model : "",
      typeof courseCandidate?.generatedAt === "string" ? courseCandidate.generatedAt : "",
    );
    const completedDays = candidate.completedDays;

    if (
      completedDays.some(
        (day) => !Number.isInteger(day) || !course.days.some((courseDay) => courseDay.day === day),
      )
    ) {
      return null;
    }

    const uniqueDays = [...new Set(completedDays as number[])].sort((left, right) => left - right);

    if (uniqueDays.length !== completedDays.length) {
      return null;
    }

    return { version: 1, course, completedDays: uniqueDays };
  } catch {
    return null;
  }
}
