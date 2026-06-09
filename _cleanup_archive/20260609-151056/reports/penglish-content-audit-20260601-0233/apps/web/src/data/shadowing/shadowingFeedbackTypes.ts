export type ShadowingFeedbackWord = {
  id: string;
  text: string;
  targetIndex?: number;
  learnerIndex?: number;
};

export type ShadowingFeedbackChangedWord = {
  id: string;
  target: string;
  learner: string;
  targetIndex: number;
  learnerIndex: number;
  noteVi: string;
};

export type ShadowingFeedbackStatus = 'empty' | 'ready';

export type ShadowingFeedbackResult = {
  status: ShadowingFeedbackStatus;
  targetText: string;
  learnerText: string;
  normalizedTarget: string[];
  normalizedLearner: string[];
  matchedWords: ShadowingFeedbackWord[];
  missingWords: ShadowingFeedbackWord[];
  extraWords: ShadowingFeedbackWord[];
  changedWords: ShadowingFeedbackChangedWord[];
  rhythmTipsVi: string[];
  nextDrillsVi: string[];
  summaryVi: string;
};
