import { z } from 'zod';

import {
  type PEnglishLesson,
  pEnglishLessonCollectionSchema,
  pEnglishLessonSchema,
} from './lessonSchema';

export type LessonValidationIssue = {
  path: string;
  message: string;
};

export type LessonValidationResult =
  | {
      success: true;
      lessons: PEnglishLesson[];
      issues: [];
    }
  | {
      success: false;
      lessons: [];
      issues: LessonValidationIssue[];
    };

const toIssue = (issue: z.core.$ZodIssue): LessonValidationIssue => ({
  path: issue.path.length > 0 ? issue.path.join('.') : '<root>',
  message: issue.message,
});

export const validateLesson = (input: unknown) => pEnglishLessonSchema.safeParse(input);

export const validateLessons = (input: unknown): LessonValidationResult => {
  const result = pEnglishLessonCollectionSchema.safeParse(input);

  if (result.success) {
    return {
      success: true,
      lessons: result.data,
      issues: [],
    };
  }

  return {
    success: false,
    lessons: [],
    issues: result.error.issues.map(toIssue),
  };
};

export const formatLessonValidationIssues = (issues: LessonValidationIssue[]): string => {
  if (issues.length === 0) {
    return 'No lesson validation issues found.';
  }

  return issues.map((issue) => `- ${issue.path}: ${issue.message}`).join('\n');
};
