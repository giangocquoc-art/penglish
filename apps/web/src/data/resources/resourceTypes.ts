export type EnglishResourceCategory = 'Từ vựng' | 'Ngữ pháp' | 'Đọc' | 'Nghe' | 'Shadowing' | 'Phát âm' | 'Tự học miễn phí';

export type EnglishResourceCefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'All';

export type EnglishResourceSkillTag = EnglishResourceCategory;

export type EnglishResourceSource = {
  repoName: string;
  repoUrl: string;
  localSourcePath: string;
  licenseFound: string;
  integrationMode: string;
};

export type EnglishResourceItem = {
  id: string;
  titleVi: string;
  category: EnglishResourceCategory;
  cefrLevels: EnglishResourceCefrLevel[];
  skillTags: EnglishResourceSkillTag[];
  levelHint: string;
  summaryVi: string;
  whenToUseVi: string;
  pEnglishFirstVi: string;
  actionLabelVi: string;
  url: string;
  isFree: boolean;
  learnerNoteVi: string;
  searchTerms: string[];
  source: EnglishResourceSource;
};
