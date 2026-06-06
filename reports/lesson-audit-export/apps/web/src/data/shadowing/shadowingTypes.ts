export type ShadowingCefrLevel = 'A1' | 'A2' | 'B1' | 'B2';

export type ShadowingMode = 'listen' | 'repeat' | 'chunk' | 'record' | 'compare';

export type ShadowingSourceMetadata = {
  repoName: string;
  repoUrl: string;
  localSourcePath: string;
  license: string;
  attribution: string;
  integrationMode: string;
  licenseRiskNote: string;
};

export type ShadowingChunk = {
  id: string;
  text: string;
  vi: string;
  start: number;
  end: number;
  mode: ShadowingMode;
};

export type ShadowingRepeatStep = {
  mode: ShadowingMode;
  labelVi: string;
  instructionVi: string;
};

export type GeneratedShadowingItem = {
  id: string;
  titleVi: string;
  titleEn: string;
  level: ShadowingCefrLevel;
  topic: string;
  descriptionVi: string;
  estimatedTime: string;
  transcript: string;
  chunks: ShadowingChunk[];
  repeatPlan: ShadowingRepeatStep[];
  learnerTipsVi: string[];
  whaleCoachLines: string[];
  source: ShadowingSourceMetadata;
};
