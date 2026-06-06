import { z } from 'zod';

export const cefrLevelSchema = z.enum(['A1', 'A2', 'B1', 'B2']);

export const sourceStatusSchema = z.enum([
  'importCandidate',
  'metadataCandidate',
  'referenceOnly',
  'original',
]);

export const sourceMetaSchema = z
  .object({
    sourceId: z.string().min(1),
    sourceName: z.string().min(1),
    sourcePath: z.string().min(1).optional(),
    license: z.string().min(1),
    licenseUrl: z.string().url().optional(),
    status: sourceStatusSchema,
    attribution: z.string().min(1).optional(),
    reviewedBy: z.string().min(1).optional(),
    reviewedAt: z.string().min(1).optional(),
    notes: z.array(z.string().min(1)).default([]),
  })
  .strict();

export const vocabularyItemSchema = z
  .object({
    id: z.string().min(1),
    term: z.string().min(1),
    meaningVi: z.string().min(1),
    pronunciation: z.string().min(1).optional(),
    partOfSpeech: z.string().min(1).optional(),
    cefrLevel: cefrLevelSchema.optional(),
    exampleEn: z.string().min(1).optional(),
    exampleVi: z.string().min(1).optional(),
    notesVi: z.string().min(1).optional(),
  })
  .strict();

export const grammarPointSchema = z
  .object({
    id: z.string().min(1),
    nameVi: z.string().min(1),
    nameEn: z.string().min(1).optional(),
    explanationVi: z.string().min(1),
    pattern: z.string().min(1).optional(),
    notesVi: z.array(z.string().min(1)).default([]),
  })
  .strict();

export const exampleSchema = z
  .object({
    id: z.string().min(1),
    english: z.string().min(1),
    vietnamese: z.string().min(1),
    contextVi: z.string().min(1).optional(),
  })
  .strict();

const baseExerciseSchema = z
  .object({
    id: z.string().min(1),
    promptVi: z.string().min(1),
    explanationVi: z.string().min(1).optional(),
    skillTags: z.array(z.string().min(1)).default([]),
  })
  .strict();

export const multipleChoiceExerciseSchema = baseExerciseSchema.extend({
  type: z.literal('multiple-choice'),
  promptEn: z.string().min(1).optional(),
  options: z.array(z.string().min(1)).min(2),
  correctAnswer: z.string().min(1),
});

export const fillBlankExerciseSchema = baseExerciseSchema.extend({
  type: z.literal('fill-blank'),
  sentenceWithBlank: z.string().min(1),
  acceptedAnswers: z.array(z.string().min(1)).min(1),
});

export const typingExerciseSchema = baseExerciseSchema.extend({
  type: z.literal('typing'),
  expectedAnswer: z.string().min(1),
  acceptedAnswers: z.array(z.string().min(1)).default([]),
});

export const matchingExerciseSchema = baseExerciseSchema.extend({
  type: z.literal('matching'),
  pairs: z
    .array(
      z
        .object({
          left: z.string().min(1),
          right: z.string().min(1),
        })
        .strict(),
    )
    .min(1),
});

export const sentenceReorderExerciseSchema = baseExerciseSchema.extend({
  type: z.literal('sentence-reorder'),
  words: z.array(z.string().min(1)).min(2),
  correctSentence: z.string().min(1),
});

export const flashcardReviewExerciseSchema = baseExerciseSchema.extend({
  type: z.literal('flashcard-review'),
  front: z.string().min(1),
  backVi: z.string().min(1),
  exampleEn: z.string().min(1).optional(),
});

export const shadowingPromptExerciseSchema = baseExerciseSchema.extend({
  type: z.literal('shadowing-prompt'),
  audioText: z.string().min(1),
  repeatCount: z.number().int().min(1).default(3),
  focusVi: z.string().min(1).optional(),
});

export const lessonExerciseSchema = z.discriminatedUnion('type', [
  multipleChoiceExerciseSchema,
  fillBlankExerciseSchema,
  typingExerciseSchema,
  matchingExerciseSchema,
  sentenceReorderExerciseSchema,
  flashcardReviewExerciseSchema,
  shadowingPromptExerciseSchema,
]);

export const keyboardHintSchema = z
  .object({
    submitVi: z.string().min(1),
    nextVi: z.string().min(1),
    multipleChoiceVi: z
      .string()
      .min(1),
  })
  .strict();

export const completionRewardSchema = z
  .object({
    xp: z.number().int().nonnegative(),
    hearts: z.number().int().nonnegative(),
    messageVi: z.string().min(1).optional(),
  })
  .strict();

export const pEnglishLessonSchema = z
  .object({
    id: z.string().min(1),
    moduleId: z.string().min(1),
    sourceMeta: sourceMetaSchema,
    cefrLevel: cefrLevelSchema,
    titleVi: z.string().min(1),
    titleEn: z.string().min(1),
    goalVi: z.string().min(1),
    explanationVi: z.string().min(1),
    vocabulary: z.array(vocabularyItemSchema).default([]),
    grammarPoint: grammarPointSchema.optional(),
    examples: z.array(exampleSchema).default([]),
    exercises: z.array(lessonExerciseSchema).min(1),
    keyboardHint: keyboardHintSchema.default({
      submitVi: 'Nhấn Enter để trả lời.',
      nextVi: 'Sau khi đúng, nhấn Enter để sang câu tiếp theo.',
      multipleChoiceVi: 'Có thể dùng A/B/C/D hoặc 1/2/3/4 để chọn đáp án.',
    }),
    completionReward: completionRewardSchema.default({
      xp: 0,
      hearts: 0,
    }),
    nextLessonId: z.string().min(1).optional(),
    needsReview: z.boolean().default(false),
    importNotes: z.array(z.string().min(1)).default([]),
  })
  .strict();

export const pEnglishLessonCollectionSchema = z.array(pEnglishLessonSchema);

export type CefrLevel = z.infer<typeof cefrLevelSchema>;
export type SourceStatus = z.infer<typeof sourceStatusSchema>;
export type SourceMeta = z.infer<typeof sourceMetaSchema>;
export type VocabularyItem = z.infer<typeof vocabularyItemSchema>;
export type GrammarPoint = z.infer<typeof grammarPointSchema>;
export type LessonExample = z.infer<typeof exampleSchema>;
export type LessonExercise = z.infer<typeof lessonExerciseSchema>;
export type KeyboardHint = z.infer<typeof keyboardHintSchema>;
export type CompletionReward = z.infer<typeof completionRewardSchema>;
export type PEnglishLesson = z.infer<typeof pEnglishLessonSchema>;
