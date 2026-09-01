import { generatedGrammarLessonSources } from '../../data/grammar/generatedGrammarLessons';
import type { GeneratedGrammarExercise, GeneratedGrammarLevel, GeneratedGrammarLessonSource } from '../../data/grammar/grammarTypes';
import type { EnglishLesson, LessonLevel, QuizQuestion, SentenceOrderingTask, FillBlankTask, MiniDialogue, PronunciationNote, ListeningPracticeItem, SpeakingReflexPrompt, EnglishSpeedPrompt, ShadowingScript, VocabularyItem } from './lesson-content-data';

type GrammarExample = {
  text: string;
  meaningVi: string;
};

function getGrammarExamples(source: GeneratedGrammarLessonSource): GrammarExample[] {
  const sentenceOrderExamples = source.exercises
    .filter((exercise) => exercise.type === 'sentence-order' && typeof exercise.answer === 'string')
    .map((exercise) => ({
      text: exercise.answer as string,
      meaningVi: exercise.promptVi.replace(/^Sắp xếp\s*:\s*/i, '').trim(),
    }));
  const candidates = [...source.examples, ...sentenceOrderExamples];
  const seen = new Set<string>();

  return candidates.filter((example) => {
    const normalized = example.text.toLowerCase().replace(/[.!?]+$/g, '').replace(/\s+/g, ' ').trim();
    if (!normalized || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

function mapLevel(level: GeneratedGrammarLevel): LessonLevel {
  switch (level) {
    case 'A1':
      return 'Beginner / A1';
    case 'A2':
      return 'Elementary / A2';
    case 'B1':
      return 'Intermediate / B1';
    case 'B2':
      return 'Upper-intermediate / B2';
    default:
      return 'Beginner / A1';
  }
}

function toQuizQuestion(exercise: GeneratedGrammarExercise): QuizQuestion | null {
  if (exercise.type !== 'multiple-choice') return null;
  return {
    id: exercise.id,
    type: 'multiple-choice',
    question: exercise.promptVi,
    options: exercise.options ?? [],
    answer: exercise.answer,
    explanationVi: exercise.explanationVi,
  };
}

function toFillBlankTask(exercise: GeneratedGrammarExercise): FillBlankTask | null {
  if (exercise.type !== 'fill-blank') return null;
  return {
    id: exercise.id,
    prompt: exercise.promptEn ?? exercise.promptVi,
    answer: String(exercise.answer),
    hint: exercise.hintVi,
  };
}

function toSentenceOrderingTask(exercise: GeneratedGrammarExercise): SentenceOrderingTask | null {
  if (exercise.type !== 'sentence-order') return null;
  return {
    id: exercise.id,
    vietnamese: exercise.promptVi,
    words: exercise.words ?? String(exercise.answer).split(' '),
    answer: String(exercise.answer),
  };
}

function buildGrammarVocabulary(source: GeneratedGrammarLessonSource): VocabularyItem[] {
  const examples = getGrammarExamples(source);
  const safeExamples = examples.length > 0 ? examples : [{ text: source.sourcePatternTitle, meaningVi: source.vietnameseExplanation }];
  const patternTerm = source.sourcePatternTitle.replace(/\s+/g, ' ').trim();
  const patternVocabulary: VocabularyItem = {
    id: `${source.id}-vocab-pattern`,
    term: patternTerm,
    meaningVi: source.sourcePatternSummary || source.vietnameseExplanation,
    partOfSpeechOrType: 'grammar chunk',
    example: safeExamples[0]?.text ?? patternTerm,
    exampleMeaningVi: safeExamples[0]?.meaningVi ?? source.vietnameseExplanation,
    cefrLevel: source.level,
    visualCategory: 'grammar-ocean-pattern',
    animatedSceneHint: 'Poo cá voi kéo mẫu câu thành từng cụm nhỏ trên mặt biển để người học không phải dịch từng chữ.',
    usefulInSituation: `Dùng khi luyện mẫu ${source.titleVi}.`,
    confusionNoteVi: 'Đây là mẫu/cụm ngữ pháp để nhận diện nhanh trong câu, không phải từ vựng đơn lẻ.',
    difficulty: source.level === 'A1' || source.level === 'A2' ? 'easy' : 'medium',
    tags: ['grammar', source.level, source.source.sourcePatternId, 'pattern'],
  };
  const exampleVocabulary = safeExamples.slice(0, 5).map((example, index): VocabularyItem => ({
    id: `${source.id}-vocab-chunk-${index + 1}`,
    term: example.text,
    meaningVi: example.meaningVi,
    partOfSpeechOrType: 'sentence chunk',
    example: example.text,
    exampleMeaningVi: example.meaningVi,
    cefrLevel: source.level,
    visualCategory: 'grammar-example-shell',
    animatedSceneHint: 'Poo cá voi thổi bong bóng quanh câu mẫu để người học đọc theo cụm.',
    usefulInSituation: source.titleVi,
    confusionNoteVi: `Hãy nghe/đọc cả cụm theo mẫu “${patternTerm}”, không tách từng từ khi phản xạ.`,
    difficulty: source.level === 'A1' || source.level === 'A2' ? 'easy' : 'medium',
    tags: ['grammar', source.level, source.source.sourcePatternId, 'chunk'],
  }));

  return [patternVocabulary, ...exampleVocabulary];
}

function buildGrammarBridge(source: GeneratedGrammarLessonSource): {
  miniDialogues: MiniDialogue[];
  pronunciationNotes: PronunciationNote[];
  listeningPractice: ListeningPracticeItem[];
  speakingReflexPrompts: SpeakingReflexPrompt[];
  englishSpeedPrompts: EnglishSpeedPrompt[];
  shadowingScript: ShadowingScript;
} {
  const bridgeExamples = getGrammarExamples(source);
  const dialogueFirst = bridgeExamples[0] ?? { text: 'I can use this grammar today.', meaningVi: 'Tôi có thể dùng mẫu ngữ pháp này hôm nay.' };
  const dialogueSecond = bridgeExamples[1] ?? dialogueFirst;
  const transferExample = bridgeExamples.at(-2) ?? dialogueSecond;
  const challengeExample = bridgeExamples.at(-1) ?? transferExample;
  const patternLabel = source.sourcePatternTitle.replace(/\s+/g, ' ').trim();
  const isCoreA2 = source.level === 'A2';
  const shadowingExamples = bridgeExamples.slice(0, source.level === 'A1' ? 3 : 4);
  const listeningExamples = bridgeExamples.slice(-2);
  const reflexExamples = isCoreA2 ? bridgeExamples.slice(0, 4) : bridgeExamples.slice(0, 2);
  const hasDistinctTransferPair = transferExample.text.trim().toLowerCase() !== challengeExample.text.trim().toLowerCase();
  const transferPrompt = {
    text: 'Can you make another sentence with this pattern?',
    meaningVi: 'Bạn có thể đặt một câu khác với mẫu này không?',
  };

  return {
    miniDialogues: [
      {
        id: `${source.id}-dialogue-bridge`,
        title: 'Hội thoại nối bài: nghe rồi nói theo mẫu',
        lines: [
          { speaker: 'A', text: dialogueFirst.text },
          { speaker: 'B', text: dialogueSecond.text },
        ],
        vietnameseTranslation: [dialogueFirst.meaningVi, dialogueSecond.meaningVi],
        focusPhrases: bridgeExamples.slice(0, 3).map((example) => example.text),
        suggestedShadowingInstruction: 'Nghe từng câu 2 lần, đọc theo nhịp tự nhiên, sau đó đổi vai A/B và nói lại không nhìn chữ.',
      },
      ...(bridgeExamples.length >= 3
        ? [
            {
              id: `${source.id}-dialogue-transfer`,
              title: 'Hội thoại đổi ý: giữ mẫu, thay ngữ cảnh',
              lines: [
                { speaker: 'A' as const, text: hasDistinctTransferPair ? transferExample.text : transferPrompt.text },
                { speaker: 'B' as const, text: challengeExample.text },
              ],
              vietnameseTranslation: [hasDistinctTransferPair ? transferExample.meaningVi : transferPrompt.meaningVi, challengeExample.meaningVi],
              focusPhrases: hasDistinctTransferPair ? [transferExample.text, challengeExample.text] : [challengeExample.text],
              suggestedShadowingInstruction: 'Lượt 1 nghe hiểu, lượt 2 nói theo cụm, lượt 3 thay thông tin bằng kế hoạch hoặc trải nghiệm của bạn.',
            },
          ]
        : []),
    ],
    pronunciationNotes: [
      {
        id: `${source.id}-pronunciation-bridge`,
        noteVi: `Đọc theo cụm của mẫu “${patternLabel}”: dừng rất ngắn giữa chủ ngữ, cụm động từ và phần bổ sung; không đọc rời từng từ.`,
        examples: bridgeExamples.slice(0, 3).map((example) => example.text),
      },
      {
        id: `${source.id}-pronunciation-transfer`,
        noteVi: isCoreA2
          ? 'A2 cần nói thành câu trọn ý: nhấn nhẹ từ thời gian/so sánh/phủ định, rồi đọc lại câu ở tốc độ hội thoại chậm.'
          : 'Đọc lần đầu theo cụm chậm, rồi đọc lại liền mạch và nhấn từ mang nghĩa chính; không tăng tốc nếu câu chưa rõ.',
        examples: [transferExample.text, challengeExample.text],
      },
    ],
    listeningPractice: listeningExamples.map((example, index) => ({
      id: `${source.id}-listening-bridge-${index + 1}`,
      text: example.text,
      question: index === 0 ? `Bạn nghe thấy câu nào dùng mẫu “${patternLabel}”?` : 'Câu vừa nghe phù hợp với nghĩa tiếng Việt nào?',
      options: [example.text, dialogueFirst.text === example.text ? dialogueSecond.text : dialogueFirst.text, 'I will review this sentence slowly.']
        .filter((option, optionIndex, options) => option && options.indexOf(option) === optionIndex)
        .slice(0, 3),
      answer: example.text,
      explanationVi: `Câu đúng là ví dụ nguyên vẹn của bài: ${example.meaningVi}`,
      speechSynthesis: {
        lang: 'en-US',
        rate: source.level === 'A1' || source.level === 'A2' ? 0.82 : 0.9,
        repeatRecommended: isCoreA2 ? 4 : 3,
      },
    })),
    speakingReflexPrompts: reflexExamples.map((example, index) => ({
      id: `${source.id}-reflex-bridge-${index + 1}`,
      promptVi: example.meaningVi,
      expectedEnglish: example.text,
      acceptableAnswers: [example.text],
      hint: `Dùng mẫu: ${patternLabel}; nói cả câu trong ${isCoreA2 ? '3' : '4'} giây.`,
      difficulty: source.level === 'A1' || source.level === 'A2' ? 'easy' : 'medium',
    })),
    englishSpeedPrompts: bridgeExamples.slice(0, source.level === 'A1' ? 2 : 3).map((example, index) => ({
      id: `${source.id}-speed-bridge-${index + 1}`,
      promptVi: example.meaningVi,
      expectedEnglish: example.text,
      hint: `Nói liền theo cụm “${patternLabel}” ở tốc độ vừa sức, không dịch từng từ.`,
    })),
    shadowingScript: {
      id: `${source.id}-shadow-bridge`,
      title: `Poo nói đuổi ngữ pháp · ${source.titleEn}`,
      lines: shadowingExamples.map((example, index) => ({
        id: `${source.id}-shadow-line-${index + 1}`,
        text: example.text,
        meaningVi: example.meaningVi,
      })),
    },
  };
}

function buildGrammarMistakes(source: GeneratedGrammarLessonSource): EnglishLesson['commonMistakes'] {
  const [first] = source.examples;
  if (!first) return undefined;
  const words = first.text.split(/\s+/).filter(Boolean);
  const swapIndex = words.length > 2 ? 2 : words.length - 1;
  const wrongWordOrder = [...words];
  [wrongWordOrder[swapIndex - 1], wrongWordOrder[swapIndex]] = [wrongWordOrder[swapIndex], wrongWordOrder[swapIndex - 1]];
  const coreWord = words[1] ?? words[0];
  return [
    {
      id: `${source.id}-mistake-word-order`,
      mistake: `Viết sai thứ tự cụm: "${wrongWordOrder.join(' ')}" thay vì "${first.text}".`,
      correction: `Giữ đúng thứ tự mẫu: "${first.text}".`,
      explanationVi: `Mẫu "${source.sourcePatternTitle}" có trật tự cố định. Thay đổi vị trí từ sẽ khiến câu sai ngữ pháp hoặc sai nghĩa.`,
    },
    {
      id: `${source.id}-mistake-form-meaning`,
      mistake: `Chọn từ "${coreWord}" theo nghĩa tiếng Việt chỉ đúng.`,
      correction: `Đối chiếu cả dạng từ, vị trí và nghĩa của "${coreWord}" trong mẫu "${source.sourcePatternTitle}".`,
      explanationVi: source.vietnameseExplanation.split(/[.!]/)[0].trim() || 'Ngữ pháp tiếng Anh phụ thuộc dạng từ và trật tự câu, không chỉ nghĩa.'.trim(),
    },
  ];
}

function adaptGrammarLesson(source: GeneratedGrammarLessonSource): EnglishLesson {
  const quizQuestions = source.exercises.map(toQuizQuestion).filter((question): question is QuizQuestion => Boolean(question));
  const fillBlankTasks = source.exercises.map(toFillBlankTask).filter((task): task is FillBlankTask => Boolean(task));
  const sentenceOrderingTasks = source.exercises.map(toSentenceOrderingTask).filter((task): task is SentenceOrderingTask => Boolean(task));
  const bridge = buildGrammarBridge(source);
  const grammarVocabulary = buildGrammarVocabulary(source);
  const exampleFlashcards = grammarVocabulary.map((item) => ({
    id: `flashcard-${item.id}`,
    front: item.term,
    back: item.meaningVi,
    example: item.example,
    exampleMeaningVi: item.exampleMeaningVi,
    tags: item.tags,
  }));

  return {
    id: source.id,
    unitId: source.unitId,
    unitTitle: `Ngữ pháp · ${source.level}`,
    titleVi: source.titleVi,
    titleEn: source.titleEn,
    subtitle: source.subtitleVi,
    level: mapLevel(source.level),
    estimatedTime: source.estimatedTime,
    skillTags: ['Ngữ pháp', 'Ôn tập', 'Viết', 'Nghe', 'Nói'],
    learningObjectives: [
      `Hiểu mẫu: ${source.titleVi}.`,
      'Nhận diện vị trí bị che trong câu luyện.',
      'Chọn hoặc gõ đáp án đúng trong câu ngắn.',
      'Tự sửa lỗi bằng gợi ý tiếng Việt sau mỗi câu.',
    ],
    vocabulary: grammarVocabulary,
    sentencePatterns: [
      {
        id: `${source.id}-pattern-core`,
        pattern: source.sourcePatternTitle,
        vietnameseExplanation: source.vietnameseExplanation,
        examples: source.examples.map((example) => ({ text: example.text, meaningVi: example.meaningVi })),
      },
      {
        id: `${source.id}-pattern-form`,
        pattern: source.sourcePatternDescription,
        vietnameseExplanation: `Nhận diện hình thức trước, sau đó đối chiếu nghĩa: ${source.sourcePatternSummary}`,
        examples: source.examples.slice(0, 3).map((example) => ({ text: example.text, meaningVi: example.meaningVi })),
      },
      {
        id: `${source.id}-pattern-context`,
        pattern: source.sourcePatternSummary,
        vietnameseExplanation: 'Giữ khung ngữ pháp, nhưng đổi người, thời gian hoặc tình huống để tạo câu của riêng bạn.',
        examples: source.examples.slice(2, 5).map((example) => ({ text: example.text, meaningVi: example.meaningVi })),
      },
      {
        id: `${source.id}-pattern-transfer`,
        pattern: `Giữ mẫu “${source.sourcePatternTitle}” → thay thông tin cuối câu`,
        vietnameseExplanation: 'Bước chuyển từ nhận biết sang sử dụng: nói một câu tương tự nhưng đúng với đời sống của bạn.',
        examples: source.examples.slice(-2).map((example) => ({ text: example.text, meaningVi: example.meaningVi })),
      },
    ],
    miniDialogues: bridge.miniDialogues,
    grammarNotes: [
      {
        id: `${source.id}-note`,
        title: source.titleVi,
        explanationVi: `${source.vietnameseExplanation} Bài này dùng dạng điền chỗ trống: tìm mẫu ngữ pháp trong câu, che phần cần luyện, rồi yêu cầu người học chọn hoặc gõ đáp án.`,
        examples: source.examples.map((example) => example.text),
      },
    ],
    pronunciationNotes: bridge.pronunciationNotes,
    listeningPractice: bridge.listeningPractice,
    speakingReflexPrompts: bridge.speakingReflexPrompts,
    flashcards: exampleFlashcards,
    englishSpeedPrompts: bridge.englishSpeedPrompts,
    shadowingScript: bridge.shadowingScript,
    quizQuestions,
    sentenceOrderingTasks,
    fillBlankTasks,
    matchPairs: grammarVocabulary.slice(0, 6).map((item) => ({
      id: `${source.id}-match-${item.id}`,
      left: item.term,
      right: item.meaningVi,
    })),
    commonMistakes: [
      {
        id: `${source.id}-mistake`,
        mistake: 'Dịch từng từ rồi chọn đáp án theo tiếng Việt.',
        correction: 'Nhìn loại từ và vị trí trong câu trước, sau đó chọn theo mẫu tiếng Anh.',
        explanationVi: 'Các bài ngữ pháp đi theo mẫu câu, nên bạn cần nhận diện cấu trúc thay vì đoán nghĩa từng từ.',
      },
      ...(buildGrammarMistakes(source) ?? []),
    ],
    realLifeSituations: [
      {
        id: `${source.id}-situation`,
        title: 'Dùng trong câu ngắn hằng ngày',
        scenarioVi: 'Gặp mẫu này trong bài đọc, tin nhắn, lớp học hoặc khi tự viết câu ngắn.',
        usefulPhrases: source.examples.map((example) => example.text),
      },
      {
        id: `${source.id}-situation-transfer`,
        title: 'Đổi thông tin để nói về bạn',
        scenarioVi: 'Sau khi nhận ra mẫu trong câu có sẵn, thay một chi tiết để tạo câu mới đúng với kế hoạch, thói quen hoặc trải nghiệm của bạn.',
        usefulPhrases: source.examples.slice(-3).map((example) => example.text),
      },
    ],
    gameMissions: [
      {
        id: `${source.id}-mission`,
        title: 'Điền chỗ trống không dịch từng chữ',
        instructionVi: 'Đọc cả câu, xác định vị trí bị che, dùng phím A/B/C/D hoặc Enter để hoàn thành nhanh.',
        successCriteria: 'Trả lời đúng ít nhất 2/3 câu luyện tập của bài.',
      },
    ],
    whaleCoachLines: [
      'Nhìn mẫu trước, dịch sau.',
      'Nếu sai, đọc lại cụm trước và sau chỗ trống.',
      'Enter để kiểm tra; khi đúng, Enter tiếp để sang câu mới.',
    ],
    finalMiniChallenge: {
      id: `${source.id}-challenge`,
      title: 'Tự tạo một câu mới',
      instructionVi: 'Viết một câu rất ngắn dùng đúng mẫu ngữ pháp vừa học.',
      targetOutput: source.examples.slice(0, 2).map((example) => example.text),
    },
    reviewRules: {
      newWordReviewAfterMinutes: 10,
      ifWrong: 'Nếu trả lời sai, đọc lại giải thích và làm lại câu điền chỗ trống ngay trong phiên học.',
      ifCorrectTwice: 'Nếu đúng 2 lần, chuyển sang câu cùng mẫu nhưng ngữ cảnh khác.',
      ifCorrectThreeTimesAcrossSessions: 'Nếu đúng qua nhiều phiên, đánh dấu mẫu ngữ pháp là đã quen.',
      priorityRule: 'Ưu tiên mẫu có lỗi sai gần nhất và mẫu cùng cấp CEFR.',
    },
    completionCriteria: {
      flashcardsReviewed: exampleFlashcards.length,
      minimumQuizCorrect: Math.max(2, quizQuestions.length + fillBlankTasks.length + sentenceOrderingTasks.length - 1),
      totalQuizQuestions: quizQuestions.length + fillBlankTasks.length + sentenceOrderingTasks.length,
      minimumReflexPromptsCompleted: Math.min(source.level === 'A2' ? 2 : 1, bridge.speakingReflexPrompts.length),
      totalReflexPrompts: bridge.speakingReflexPrompts.length,
      minimumListeningOrDialogueRepeats: Math.min(source.level === 'A2' ? 2 : 1, bridge.listeningPractice.length + bridge.miniDialogues.length),
    },
  };
}

export const generatedGrammarLessons: EnglishLesson[] = generatedGrammarLessonSources.map(adaptGrammarLesson);

export function getGeneratedGrammarLessons() {
  return generatedGrammarLessons;
}
