import { generatedReadingLessonSources } from '../../data/reading/generatedReadingLessons';
import type { GeneratedReadingCefrLevel, GeneratedReadingLessonSource } from '../../data/reading/readingTypes';
import type { EnglishLesson, FillBlankTask, LessonLevel, ListeningPracticeItem, MiniDialogue, PronunciationNote, QuizQuestion, SentenceOrderingTask, ShadowingScript, SpeakingReflexPrompt, VocabularyItem } from './lesson-content-data';

function mapLevel(level: GeneratedReadingCefrLevel): LessonLevel {
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

function estimatedTimeFor(level: GeneratedReadingCefrLevel): string {
  switch (level) {
    case 'A1':
      return '10–12 phút';
    case 'A2':
      return '12–14 phút';
    case 'B1':
      return '14–16 phút';
    case 'B2':
      return '16–18 phút';
    default:
      return '10–12 phút';
  }
}

function unitTitleFor(level: GeneratedReadingCefrLevel): string {
  switch (level) {
    case 'A1':
      return 'Reading A1 · Câu ngắn hằng ngày';
    case 'A2':
      return 'Reading A2 · Tin nhắn và tình huống thực tế';
    case 'B1':
      return 'Reading B1 · Đoạn văn đời sống';
    case 'B2':
      return 'Reading B2 · Đọc hiểu tự tin';
    default:
      return 'Reading · Luyện đọc';
  }
}

function toQuizQuestion(source: GeneratedReadingLessonSource): QuizQuestion[] {
  return source.comprehensionQuestions.map((question) => ({
    id: question.id,
    type: 'multiple-choice',
    question: `${question.questionVi} (${question.questionEn})`,
    options: question.options,
    answer: question.answer,
    explanationVi: question.explanationVi,
  }));
}

function toFillBlankTasks(source: GeneratedReadingLessonSource): FillBlankTask[] {
  return source.fillBlankTasks.map((task) => ({
    id: task.id,
    prompt: task.prompt,
    answer: task.answer,
    hint: task.hintVi,
  }));
}

function toSentenceOrderingTasks(source: GeneratedReadingLessonSource): SentenceOrderingTask[] {
  return source.sentenceOrderingTasks.map((task) => ({
    id: task.id,
    vietnamese: task.vietnamese,
    words: task.words,
    answer: task.answer,
  }));
}

function toVocabulary(source: GeneratedReadingLessonSource): VocabularyItem[] {
  return source.vocabularyFocus.map((item) => ({
    id: item.id,
    term: item.term,
    meaningVi: item.meaningVi,
    partOfSpeechOrType: item.partOfSpeechOrType,
    example: item.example,
    exampleMeaningVi: item.exampleMeaningVi,
    cefrLevel: source.level,
    visualCategory: 'reading-focus',
    usefulInSituation: source.titleVi,
    difficulty: source.level === 'A1' || source.level === 'A2' ? 'easy' : 'medium',
    tags: ['reading', source.level, item.partOfSpeechOrType],
  }));
}

function firstPassageSentence(source: GeneratedReadingLessonSource): string {
  return source.passage.split(/(?<=[.!?])\s+/).find((sentence) => sentence.trim().length > 0)?.trim() ?? source.passage;
}

function buildReadingBridge(source: GeneratedReadingLessonSource, vocabulary: VocabularyItem[]): {
  miniDialogues: MiniDialogue[];
  pronunciationNotes: PronunciationNote[];
  listeningPractice: ListeningPracticeItem[];
  speakingReflexPrompts: SpeakingReflexPrompt[];
  shadowingScript: ShadowingScript;
} {
  const primaryExample = source.sentenceFocus.examples[0] ?? { text: firstPassageSentence(source), meaningVi: source.vietnameseSetup };
  const secondExample = source.sentenceFocus.examples[1] ?? primaryExample;
  const mainWord = vocabulary[0];
  const listeningExamples = [primaryExample, secondExample].filter((example, index, examples) => examples.findIndex((item) => item.text === example.text) === index);
  const shadowLines = [primaryExample, secondExample, ...source.sentenceFocus.examples.slice(2, 4)].filter((example, index, examples) => examples.findIndex((item) => item.text === example.text) === index);
  const dialogueFocus = mainWord ? `${mainWord.term} = ${mainWord.meaningVi}` : source.sentenceFocus.pattern;

  return {
    miniDialogues: [
      {
        id: `${source.id}-reading-dialogue`,
        title: 'Poo đọc cùng bạn: bắt ý chính trước',
        lines: [
          { speaker: 'A', text: 'What is this text about?' },
          { speaker: 'B', text: primaryExample.text },
          { speaker: 'A', text: 'Which word should I remember?' },
          { speaker: 'B', text: mainWord ? mainWord.term : source.sentenceFocus.pattern },
        ],
        vietnameseTranslation: [
          'A: Đoạn này nói về điều gì vậy?',
          `B: ${primaryExample.meaningVi}`,
          'A: Mình nên nhớ từ/cụm nào?',
          `B: ${dialogueFocus}`,
        ],
        focusPhrases: [primaryExample.text, mainWord?.term ?? source.sentenceFocus.pattern, 'What is this text about?'],
        suggestedShadowingInstruction: 'Đọc hội thoại một lượt như Poo đang bơi chậm, sau đó lặp từng câu 2–3 lần để nhớ ý chính trước khi làm quiz.',
      },
    ],
    pronunciationNotes: [
      {
        id: `${source.id}-pron-reading-chunks`,
        noteVi: 'Khi đọc đoạn ngắn, hãy chia câu thành 2–3 cụm hơi thở nhỏ. Poo ưu tiên đọc rõ từ khóa hơn là đọc thật nhanh.',
        examples: listeningExamples.map((example) => example.text),
      },
    ],
    listeningPractice: listeningExamples.map((example, index) => ({
      id: `${source.id}-listening-reading-${index + 1}`,
      text: example.text,
      question: index === 0 ? 'Câu vừa nghe gần với ý nào nhất?' : 'Bạn nghe thấy câu trọng tâm nào trong bài đọc?',
      options: [example.meaningVi, primaryExample.meaningVi, source.vietnameseSetup]
        .filter((option, optionIndex, options) => option && options.indexOf(option) === optionIndex)
        .slice(0, 3),
      answer: example.meaningVi,
      explanationVi: `Câu tiếng Anh “${example.text}” tương ứng với ý: ${example.meaningVi}`,
      speechSynthesis: {
        lang: 'en-US',
        rate: source.level === 'A1' || source.level === 'A2' ? 0.84 : 0.9,
        repeatRecommended: source.level === 'A1' || source.level === 'A2' ? 3 : 2,
      },
    })),
    speakingReflexPrompts: source.sentenceFocus.examples.slice(0, 3).map((example, index) => ({
      id: `${source.id}-reflex-reading-${index + 1}`,
      promptVi: `Poo nhờ bạn nói lại ý này: ${example.meaningVi}`,
      expectedEnglish: example.text,
      acceptableAnswers: [example.text],
      hint: `Bám mẫu đọc: ${source.sentenceFocus.pattern}`,
      difficulty: source.level === 'A1' || source.level === 'A2' ? 'easy' : 'medium',
    })),
    shadowingScript: {
      id: `${source.id}-shadow-reading`,
      title: `Poo nói đuổi đoạn đọc · ${source.titleEn}`,
      lines: (shadowLines.length > 0 ? shadowLines : [primaryExample]).map((example, index) => ({
        id: `${source.id}-shadow-reading-${index + 1}`,
        text: example.text,
        meaningVi: example.meaningVi,
      })),
    },
  };
}

function adaptReadingLesson(source: GeneratedReadingLessonSource): EnglishLesson {
  const quizQuestions = toQuizQuestion(source);
  const fillBlankTasks = toFillBlankTasks(source);
  const sentenceOrderingTasks = toSentenceOrderingTasks(source);
  const vocabulary = toVocabulary(source);
  const totalQuestionCount = quizQuestions.length + fillBlankTasks.length + sentenceOrderingTasks.length;
  const bridge = buildReadingBridge(source, vocabulary);

  return {
    id: source.id,
    unitId: source.unitId,
    unitTitle: unitTitleFor(source.level),
    titleVi: source.titleVi,
    titleEn: source.titleEn,
    subtitle: source.vietnameseSetup,
    level: mapLevel(source.level),
    estimatedTime: estimatedTimeFor(source.level),
    skillTags: ['Đọc', 'Từ vựng', 'Viết', 'Nghe', 'Nói', 'Ôn tập'],
    learningObjectives: [
      'Đọc lấy ý chính trước khi nhìn đáp án.',
      'Tìm thông tin cụ thể trong đoạn đọc ngắn.',
      'Hoàn thành câu điền từ dựa trên ngữ cảnh.',
      'Sắp xếp một câu tiếng Anh tự nhiên theo nghĩa tiếng Việt.',
      'Ghi nhớ một vài từ/cụm hữu ích trong đoạn đọc.',
      'Nghe và nói đuổi 2–4 câu trọng tâm để biến bài đọc thành phản xạ nhẹ.',
    ],
    vocabulary,
    sentencePatterns: [
      {
        id: `${source.id}-sentence-focus`,
        pattern: source.sentenceFocus.pattern,
        vietnameseExplanation: source.sentenceFocus.explanationVi,
        examples: source.sentenceFocus.examples,
      },
    ],
    miniDialogues: bridge.miniDialogues,
    grammarNotes: [
      {
        id: `${source.id}-passage`,
        title: 'Đoạn đọc chính',
        explanationVi: `Đọc đoạn này theo 2 lượt: lượt 1 nắm ý chính, lượt 2 tìm chi tiết cho câu hỏi. Nội dung: ${source.passage}`,
        examples: [source.passage],
      },
      {
        id: `${source.id}-strategy`,
        title: 'Chiến lược đọc nhanh',
        explanationVi: 'Không cần dịch từng chữ. Hãy đọc câu hỏi, tìm từ khóa, rồi quay lại đúng câu trong đoạn đọc.',
        examples: source.comprehensionQuestions.map((question) => question.questionEn),
      },
    ],
    pronunciationNotes: bridge.pronunciationNotes,
    listeningPractice: bridge.listeningPractice,
    speakingReflexPrompts: bridge.speakingReflexPrompts,
    flashcards: vocabulary.map((item) => ({
      id: `flashcard-${item.id}`,
      front: item.term,
      back: item.meaningVi,
      example: item.example,
      exampleMeaningVi: item.exampleMeaningVi,
      tags: item.tags,
    })),
    quizQuestions,
    sentenceOrderingTasks,
    fillBlankTasks,
    shadowingScript: bridge.shadowingScript,
    commonMistakes: [
      {
        id: `${source.id}-mistake-translate-all`,
        mistake: 'Dịch từng từ trong cả đoạn trước khi trả lời.',
        correction: 'Đọc câu hỏi trước, tìm từ khóa rồi chỉ quay lại câu liên quan.',
        explanationVi: 'Bài đọc được thiết kế theo cấp CEFR: mục tiêu là hiểu ý và tìm thông tin, không phải dịch hoàn hảo từng chữ.',
      },
      {
        id: `${source.id}-mistake-ignore-time-linkers`,
        mistake: 'Bỏ qua từ nối hoặc mốc thời gian như then, after, at seven, because.',
        correction: 'Khoanh thầm từ nối và mốc thời gian vì chúng thường quyết định đáp án.',
        explanationVi: 'Các từ này giúp bạn hiểu thứ tự hành động, lý do hoặc vị trí thông tin trong đoạn.',
      },
    ],
    realLifeSituations: [
      {
        id: `${source.id}-reading-situation`,
        title: source.titleVi,
        scenarioVi: source.vietnameseSetup,
        usefulPhrases: [source.passage, ...source.sentenceFocus.examples.map((example) => example.text)],
      },
    ],
    gameMissions: [
      {
        id: `${source.id}-mission-comprehension`,
        title: 'Bắt ý chính như cá voi xanh',
        instructionVi: 'Đọc đoạn một lượt, trả lời câu hỏi trắc nghiệm, rồi làm câu điền từ và sắp xếp câu.',
        successCriteria: `Hoàn thành ít nhất ${Math.max(2, totalQuestionCount - 1)}/${totalQuestionCount} câu luyện đọc.`,
      },
    ],
    whaleCoachLines: source.whaleCoachLines,
    finalMiniChallenge: {
      id: `${source.id}-challenge`,
      title: 'Viết lại một ý của đoạn đọc',
      instructionVi: 'Viết một câu tiếng Anh mới dùng từ/cụm trong đoạn đọc hoặc mẫu câu trọng tâm.',
      targetOutput: source.sentenceFocus.examples.map((example) => example.text),
    },
    reviewRules: {
      newWordReviewAfterMinutes: 10,
      ifWrong: 'Nếu trả lời sai, quay lại đoạn đọc và đọc lại đúng câu chứa thông tin.',
      ifCorrectTwice: 'Nếu đúng 2 lần, chuyển sang đoạn cùng cấp CEFR nhưng bối cảnh khác.',
      ifCorrectThreeTimesAcrossSessions: 'Nếu đúng qua nhiều phiên, đánh dấu mẫu đọc là đã quen.',
      priorityRule: 'Ưu tiên ôn các đoạn có lỗi sai gần nhất và các từ khóa chưa nhớ.',
    },
    completionCriteria: {
      flashcardsReviewed: vocabulary.length,
      minimumQuizCorrect: Math.max(2, totalQuestionCount - 1),
      totalQuizQuestions: totalQuestionCount,
      minimumReflexPromptsCompleted: Math.min(2, bridge.speakingReflexPrompts.length),
      totalReflexPrompts: bridge.speakingReflexPrompts.length,
      minimumListeningOrDialogueRepeats: Math.min(2, bridge.listeningPractice.length + bridge.miniDialogues.length),
    },
  };
}

export const generatedReadingLessons: EnglishLesson[] = generatedReadingLessonSources.map(adaptReadingLesson);

export function getGeneratedReadingLessons() {
  return generatedReadingLessons;
}
