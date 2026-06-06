export type SpeechCefrLevel = 'A1' | 'A2' | 'B1' | 'B2';

export type SpeechPromptType = 'word' | 'phrase' | 'sentence' | 'mini-dialogue';

export type SpeechSourceMetadata = {
  repoName: string;
  repoUrl: string;
  localSourcePath: string;
  license: string;
  attribution: string;
  integrationMode: string;
  licenseRiskNote: string;
};

export type GeneratedSpeechPrompt = {
  id: string;
  level: SpeechCefrLevel;
  type: SpeechPromptType;
  titleVi: string;
  promptText: string;
  vietnameseMeaning: string;
  focusSounds: string[];
  slowHintVi: string;
  commonMistakesVi: string[];
  targetWords: string[];
  retryTipsVi: string[];
  whaleCoachLines: string[];
  source: SpeechSourceMetadata;
};
