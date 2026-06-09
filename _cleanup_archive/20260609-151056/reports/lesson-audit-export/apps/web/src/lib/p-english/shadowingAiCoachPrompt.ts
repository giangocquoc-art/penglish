import { shadowingAiFeedbackJsonSchema, type ShadowingAiFeedback } from '../../data/shadowing/shadowingAiFeedbackSchema';
import { getShadowingAiFewShotExamples } from '../../data/shadowing/shadowingAiFewShotExamples';
import { resolveShadowingCoachLevel, shadowingAiCoachRole, shadowingAiFeedbackPriority, shadowingAiLevelGuidance, type ShadowingCoachLevel } from '../../data/shadowing/shadowingAiRubric';

export type ShadowingAiLocalErrorMap = Partial<Pick<ShadowingAiFeedback, 'matchedWords' | 'missingWords' | 'extraWords' | 'changedWords' | 'rhythmTips' | 'pronunciationTips' | 'nextDrills'>> & {
  summaryVi?: string;
};

export type BuildShadowingAiCoachPromptInput = {
  targetText: string;
  learnerText: string;
  lessonTitle?: string;
  level?: ShadowingCoachLevel | number | string;
  localErrorMap?: ShadowingAiLocalErrorMap | null;
};

export type ShadowingAiCoachPrompt = {
  systemInstruction: string;
  userTaskPrompt: string;
  localErrorMapSummary: string;
  levelGuidance: string;
  fewShotExamples: string;
  jsonSchema: typeof shadowingAiFeedbackJsonSchema;
};

function asList(title: string, items: readonly string[]) {
  return `${title}\n${items.map((item) => `- ${item}`).join('\n')}`;
}

function summarizeLocalErrorMap(localErrorMap?: ShadowingAiLocalErrorMap | null) {
  if (!localErrorMap) return 'Không có local error map. Hãy tự so sánh targetText và learnerText.';

  const changed = localErrorMap.changedWords?.map((item) => `${item.expected || '(trống)'} -> ${item.heard || '(trống)'}: ${item.tipVi}`).join('; ') || 'không có';

  return [
    localErrorMap.summaryVi ? `Tóm tắt local: ${localErrorMap.summaryVi}` : 'Tóm tắt local: chưa có.',
    `Matched: ${(localErrorMap.matchedWords ?? []).join(', ') || 'không có'}`,
    `Missing: ${(localErrorMap.missingWords ?? []).join(', ') || 'không có'}`,
    `Extra: ${(localErrorMap.extraWords ?? []).join(', ') || 'không có'}`,
    `Changed: ${changed}`,
    `Rhythm tips local: ${(localErrorMap.rhythmTips ?? []).join(' | ') || 'không có'}`,
    `Pronunciation tips local: ${(localErrorMap.pronunciationTips ?? []).join(' | ') || 'không có'}`,
    `Next drills local: ${(localErrorMap.nextDrills ?? []).join(' | ') || 'không có'}`,
  ].join('\n');
}

function buildLevelGuidance(level: ShadowingCoachLevel) {
  const guidance = shadowingAiLevelGuidance[level];
  return [
    `Level ${guidance.level}: ${guidance.label}`,
    `CEFR hint: ${guidance.cefrHint}`,
    `Focus: ${guidance.focusVi.join(', ')}`,
    `Maximum useful notes: ${guidance.maxNotes}`,
    `Drill style: ${guidance.drillStyleVi}`,
  ].join('\n');
}

function buildFewShotBlock(level: ShadowingCoachLevel) {
  return getShadowingAiFewShotExamples(level)
    .map((example) =>
      [
        `Example level ${example.level}`,
        `Target: ${example.targetText}`,
        `Learner: ${example.learnerText}`,
        `Expected JSON: ${JSON.stringify(example.expectedFeedback)}`,
      ].join('\n'),
    )
    .join('\n\n');
}

export function buildShadowingAiCoachPrompt(input: BuildShadowingAiCoachPromptInput): ShadowingAiCoachPrompt {
  const level = resolveShadowingCoachLevel(input.level);
  const localErrorMapSummary = summarizeLocalErrorMap(input.localErrorMap);
  const levelGuidance = buildLevelGuidance(level);
  const fewShotExamples = buildFewShotBlock(level);

  const systemInstruction = [
    `Bạn là ${shadowingAiCoachRole.name} của ${shadowingAiCoachRole.product}.`,
    shadowingAiCoachRole.roleVi,
    asList('Luôn làm:', shadowingAiCoachRole.mustDoVi),
    asList('Không được làm:', shadowingAiCoachRole.mustNotDoVi),
    asList('Thứ tự ưu tiên phản hồi:', shadowingAiFeedbackPriority.map((item, index) => `${index + 1}. ${item.labelVi}: ${item.instructionVi}`)),
    'Output bắt buộc: chỉ trả về JSON hợp lệ, không markdown, không giải thích ngoài JSON.',
    'Trường source trong phản hồi Gemini phải là "gemini".',
    'summaryVi, rhythmTips, pronunciationTips, nextDrills phải viết tiếng Việt. Chỉ dùng tiếng Anh trong cụm mục tiêu hoặc ví dụ luyện.',
    'Không chẩn đoán bệnh lý/giọng nói. Không chấm điểm /10 trước. Không làm người học xấu hổ.',
  ].join('\n\n');

  const userTaskPrompt = [
    'Hãy phân tích một lần Shadowing của người học.',
    `Lesson title: ${input.lessonTitle?.trim() || 'Shadowing practice'}`,
    `Target text: ${input.targetText}`,
    `Learner text: ${input.learnerText}`,
    '',
    'Level-specific guidance:',
    levelGuidance,
    '',
    'Local error map summary:',
    localErrorMapSummary,
    '',
    'Relevant few-shot examples:',
    fewShotExamples || 'Không có ví dụ phù hợp.',
    '',
    'Return strict JSON matching this TypeScript shape:',
    '{ source: "gemini" | "local-disabled" | "local-fallback" | "mock", summaryVi: string, matchedWords: string[], missingWords: string[], extraWords: string[], changedWords: Array<{ expected: string, heard: string, tipVi: string }>, rhythmTips: string[], pronunciationTips: string[], nextDrills: string[] }',
    '',
    'Giới hạn: summaryVi 1 câu ngắn; rhythmTips tối đa 2; pronunciationTips tối đa 2; nextDrills 1–3; changedWords tối đa 4.',
  ].join('\n');

  return {
    systemInstruction,
    userTaskPrompt,
    localErrorMapSummary,
    levelGuidance,
    fewShotExamples,
    jsonSchema: shadowingAiFeedbackJsonSchema,
  };
}
