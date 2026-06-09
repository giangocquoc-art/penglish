export type SourceIntelligenceSafetyStatus =
  | 'runtime-safe-direct-data'
  | 'runtime-safe-profile-data'
  | 'runtime-safe-adapted-workflow'
  | 'resource-index-only'
  | 'license-review-required'
  | 'blocked-license-risk'
  | 'blocked-source-unavailable';

export type SourceIntelligenceUsageType =
  | 'vocabulary-data'
  | 'grammar-profile'
  | 'reading-profile'
  | 'shadowing-workflow'
  | 'pronunciation-workflow'
  | 'resource-hub-index'
  | 'dictionary-enrichment'
  | 'vocabulary-ux-workflow'
  | 'platform-architecture-reference'
  | 'blocked-reference-only';

export type SourceIntelligenceEntry = {
  id: string;
  repoName: string;
  repoUrl: string;
  localSourcePath: string;
  sourceGroup: 'primary-external-source' | 'candidate-source' | 'newly-observed-source';
  targetFeature: string;
  safetyStatus: SourceIntelligenceSafetyStatus;
  usageType: SourceIntelligenceUsageType;
  licenseObservation: string;
  safeUsePlan: string;
  attributionPlan: string;
  runtimeRule: string;
  learnerUiRule: string;
  riskLevel: 'low' | 'medium' | 'high';
  nextBatchUse: 'Batch 1' | 'Batch 2' | 'Batch 3' | 'Batch 4' | 'Batch 5' | 'Blocked' | 'Future review';
};

const RUNTIME_METADATA_ONLY = 'Runtime app code may import this manifest metadata, but must not import files directly from external-sources.';
const LEARNER_UI_CLEAN = 'Keep repository/license details out of learner-facing cards; show Vietnamese-first P-English labels and concise learning guidance.';

export const sourceIntelligenceManifest: SourceIntelligenceEntry[] = [
  {
    id: 'words-cefr-dataset',
    repoName: 'Words-CEFR-Dataset',
    repoUrl: 'https://github.com/Maximax67/Words-CEFR-Dataset',
    localSourcePath: 'external-sources/words-cefr-dataset',
    sourceGroup: 'primary-external-source',
    targetFeature: 'CEFR vocabulary, flashcards, review pools, dashboard counts',
    safetyStatus: 'runtime-safe-direct-data',
    usageType: 'vocabulary-data',
    licenseObservation: 'MIT License, copyright (c) 2024 Belikov Maxim.',
    safeUsePlan: 'Continue using normalized CEFR word data in generated vocabulary modules with source metadata retained in reports/manifests.',
    attributionPlan: 'Retain MIT attribution in source reports and generated metadata where appropriate.',
    runtimeRule: RUNTIME_METADATA_ONLY,
    learnerUiRule: LEARNER_UI_CLEAN,
    riskLevel: 'low',
    nextBatchUse: 'Batch 1',
  },
  {
    id: 'olp-en-cefrj-primary',
    repoName: 'Open Language Profiles — English CEFR-J',
    repoUrl: 'https://github.com/openlanguageprofiles/olp-en-cefrj',
    localSourcePath: 'external-sources/olp-en-cefrj',
    sourceGroup: 'primary-external-source',
    targetFeature: 'Vocabulary profile enrichment and grammar profile ordering',
    safetyStatus: 'runtime-safe-profile-data',
    usageType: 'grammar-profile',
    licenseObservation: 'README permits CEFR-J vocabulary/grammar profile use for research/commercial purposes with citation; avoid Octanove C1/C2 CC BY-SA data for this A1-B2 phase.',
    safeUsePlan: 'Use A1-B2 CEFR-J profile metadata for ordering and balancing; do not import C1/C2 ShareAlike data in this pass.',
    attributionPlan: 'Cite CEFR-J Wordlist Version 1.5 and CEFR-J Grammar Profile Version 20180315; copyright Tono Laboratory at TUFS.',
    runtimeRule: RUNTIME_METADATA_ONLY,
    learnerUiRule: LEARNER_UI_CLEAN,
    riskLevel: 'medium',
    nextBatchUse: 'Batch 1',
  },
  {
    id: 'fluentcards-grammar',
    repoName: 'fluentcards-grammar',
    repoUrl: 'https://github.com/katspaugh/fluentcards-grammar',
    localSourcePath: 'external-sources/fluentcards-grammar',
    sourceGroup: 'primary-external-source',
    targetFeature: 'Grammar lessons and quiz cards',
    safetyStatus: 'runtime-safe-adapted-workflow',
    usageType: 'grammar-profile',
    licenseObservation: 'MIT-style license/copyright observed in project metadata/reporting.',
    safeUsePlan: 'Adapt grammar topic ideas and card structure into Vietnamese-first P-English lessons and typed practice data.',
    attributionPlan: 'Retain source note in grammar reports/manifests.',
    runtimeRule: RUNTIME_METADATA_ONLY,
    learnerUiRule: LEARNER_UI_CLEAN,
    riskLevel: 'low',
    nextBatchUse: 'Batch 1',
  },
  {
    id: 'cefr-sp',
    repoName: 'CEFR-SP',
    repoUrl: 'https://github.com/yukiar/CEFR-SP',
    localSourcePath: 'external-sources/cefr-sp',
    sourceGroup: 'primary-external-source',
    targetFeature: 'Reading and CEFR sentence practice',
    safetyStatus: 'license-review-required',
    usageType: 'reading-profile',
    licenseObservation: 'README provides citation requirements, but no top-level license file was observed.',
    safeUsePlan: 'Use only limited normalized difficulty/profile ideas until license terms are clarified; avoid copying large corpus text.',
    attributionPlan: 'If used, cite Arase, Uchida, and Kajiwara CEFR-SP papers in reports/source metadata.',
    runtimeRule: RUNTIME_METADATA_ONLY,
    learnerUiRule: LEARNER_UI_CLEAN,
    riskLevel: 'medium',
    nextBatchUse: 'Future review',
  },
  {
    id: 'shadowing-private',
    repoName: 'shadowing',
    repoUrl: 'https://github.com/nhs000/shadowing',
    localSourcePath: 'external-sources/shadowing',
    sourceGroup: 'primary-external-source',
    targetFeature: 'Shadowing practice flow',
    safetyStatus: 'license-review-required',
    usageType: 'shadowing-workflow',
    licenseObservation: 'No license file found in top-level inspection; package is private.',
    safeUsePlan: 'Use workflow concepts only: lag time, transcript panel, repeat cues, learner-provided transcript support. Do not copy code/media/transcripts.',
    attributionPlan: 'Keep as source note in reports only unless license is clarified.',
    runtimeRule: RUNTIME_METADATA_ONLY,
    learnerUiRule: LEARNER_UI_CLEAN,
    riskLevel: 'high',
    nextBatchUse: 'Future review',
  },
  {
    id: 'shadowing-generator',
    repoName: 'shadowing_generator',
    repoUrl: 'https://github.com/Skywalker-Harrison/shadowing_generator',
    localSourcePath: 'external-sources/shadowing-generator',
    sourceGroup: 'primary-external-source',
    targetFeature: 'Shadowing segmentation and repeat workflow',
    safetyStatus: 'runtime-safe-adapted-workflow',
    usageType: 'shadowing-workflow',
    licenseObservation: 'README badge indicates MIT; no separate top-level license file observed.',
    safeUsePlan: 'Adapt segmentation/repetition workflow into app-native scripts; do not bundle sample media, generated videos, or sample transcript text.',
    attributionPlan: 'Credit repository in shadowing reports/manifests for workflow inspiration.',
    runtimeRule: RUNTIME_METADATA_ONLY,
    learnerUiRule: LEARNER_UI_CLEAN,
    riskLevel: 'medium',
    nextBatchUse: 'Batch 2',
  },
  {
    id: 'speech-pronunciation',
    repoName: 'speech',
    repoUrl: 'https://github.com/huytd/speech',
    localSourcePath: 'external-sources/speech-pronunciation',
    sourceGroup: 'primary-external-source',
    targetFeature: 'English Speed and pronunciation feedback',
    safetyStatus: 'runtime-safe-adapted-workflow',
    usageType: 'pronunciation-workflow',
    licenseObservation: 'BSD 3-Clause License, copyright (c) 2023, Huy.',
    safeUsePlan: 'Use browser-native speech/manual fallback patterns, deterministic similarity scoring, and app-authored prompts.',
    attributionPlan: 'Retain BSD attribution and non-endorsement note in reports/source metadata.',
    runtimeRule: RUNTIME_METADATA_ONLY,
    learnerUiRule: LEARNER_UI_CLEAN,
    riskLevel: 'low',
    nextBatchUse: 'Batch 2',
  },
  {
    id: 'awesome-english',
    repoName: 'yvoronoy/awesome-english',
    repoUrl: 'https://github.com/yvoronoy/awesome-english',
    localSourcePath: 'external-sources/candidates/awesome-english',
    sourceGroup: 'candidate-source',
    targetFeature: 'Resource Hub',
    safetyStatus: 'resource-index-only',
    usageType: 'resource-hub-index',
    licenseObservation: 'CC0 1.0 Universal license file observed.',
    safeUsePlan: 'Use as resource discovery/index inspiration only; create concise Vietnamese summaries and link to legitimate free resources.',
    attributionPlan: 'Retain source notes in Resource Hub reports/manifests.',
    runtimeRule: RUNTIME_METADATA_ONLY,
    learnerUiRule: LEARNER_UI_CLEAN,
    riskLevel: 'low',
    nextBatchUse: 'Batch 4',
  },
  {
    id: 'resources-for-english',
    repoName: 'dnizfor/resources-for-english',
    repoUrl: 'https://github.com/dnizfor/resources-for-english',
    localSourcePath: 'external-sources/candidates/resources-for-english',
    sourceGroup: 'candidate-source',
    targetFeature: 'Resource Hub',
    safetyStatus: 'resource-index-only',
    usageType: 'resource-hub-index',
    licenseObservation: 'CC0 1.0 Universal license file observed; package is private.',
    safeUsePlan: 'Use category/workflow inspiration only, not React app code. Keep Resource Hub entries original and compact.',
    attributionPlan: 'Retain source notes in Resource Hub reports/manifests.',
    runtimeRule: RUNTIME_METADATA_ONLY,
    learnerUiRule: LEARNER_UI_CLEAN,
    riskLevel: 'low',
    nextBatchUse: 'Batch 4',
  },
  {
    id: 'english-dictionary-open-source',
    repoName: 'CloudBytes-Academy/English-Dictionary-Open-Source',
    repoUrl: 'https://github.com/CloudBytes-Academy/English-Dictionary-Open-Source',
    localSourcePath: 'external-sources/candidates/english-dictionary-open-source',
    sourceGroup: 'candidate-source',
    targetFeature: 'Dictionary/definition enrichment',
    safetyStatus: 'runtime-safe-direct-data',
    usageType: 'dictionary-enrichment',
    licenseObservation: 'MIT License observed; old Webster/Project Gutenberg lineage requires review before large import.',
    safeUsePlan: 'Future limited curated definition enrichment only; do not perform large raw dictionary import in this autopilot batch.',
    attributionPlan: 'Retain UberPython/OPTED/Project Gutenberg lineage notes in future dictionary metadata.',
    runtimeRule: RUNTIME_METADATA_ONLY,
    learnerUiRule: LEARNER_UI_CLEAN,
    riskLevel: 'medium',
    nextBatchUse: 'Future review',
  },
  {
    id: 'wordpecker-app',
    repoName: 'baturyilmaz/wordpecker-app',
    repoUrl: 'https://github.com/baturyilmaz/wordpecker-app',
    localSourcePath: 'external-sources/candidates/wordpecker-app',
    sourceGroup: 'candidate-source',
    targetFeature: 'Vocabulary workflow and light reading ideas',
    safetyStatus: 'runtime-safe-adapted-workflow',
    usageType: 'vocabulary-ux-workflow',
    licenseObservation: 'MIT License, copyright Batur Arslan 2025.',
    safeUsePlan: 'Adapt simple workflow ideas only: custom lists, reveal states, know/don’t-know self-check, multi-question practice. Do not copy assets/media/code.',
    attributionPlan: 'Retain source note in audit/manifest.',
    runtimeRule: RUNTIME_METADATA_ONLY,
    learnerUiRule: LEARNER_UI_CLEAN,
    riskLevel: 'medium',
    nextBatchUse: 'Batch 2',
  },
  {
    id: 'english-pronunciation-app',
    repoName: 'furkanbingol/EnglishPronunciation-App',
    repoUrl: 'https://github.com/furkanbingol/EnglishPronunciation-App',
    localSourcePath: 'external-sources/candidates/english-pronunciation-app',
    sourceGroup: 'candidate-source',
    targetFeature: 'Pronunciation UX research',
    safetyStatus: 'runtime-safe-adapted-workflow',
    usageType: 'pronunciation-workflow',
    licenseObservation: 'MIT License, copyright Furkan 2023.',
    safeUsePlan: 'Use UX/scoring flow ideas only; do not require Azure/Firebase, paid API keys, or copy Swift code.',
    attributionPlan: 'Retain source note in pronunciation reports if UX ideas are used.',
    runtimeRule: RUNTIME_METADATA_ONLY,
    learnerUiRule: LEARNER_UI_CLEAN,
    riskLevel: 'medium',
    nextBatchUse: 'Batch 2',
  },
  {
    id: 'casualenglish',
    repoName: 'casualenglish',
    repoUrl: 'https://github.com/ChristopheCode/casualenglish',
    localSourcePath: 'external-sources/casualenglish',
    sourceGroup: 'newly-observed-source',
    targetFeature: 'Casual English workflow/content review',
    safetyStatus: 'runtime-safe-adapted-workflow',
    usageType: 'vocabulary-ux-workflow',
    licenseObservation: 'MIT License, copyright (c) 2025-2026 ChristopheCode; README observed.',
    safeUsePlan: 'Treat as a safe workflow/content-shape candidate for future review; do not import large content until structure is inspected in a focused pass.',
    attributionPlan: 'Retain MIT source note in future report if used.',
    runtimeRule: RUNTIME_METADATA_ONLY,
    learnerUiRule: LEARNER_UI_CLEAN,
    riskLevel: 'medium',
    nextBatchUse: 'Future review',
  },
  {
    id: 'librelingo',
    repoName: 'LibreLingo',
    repoUrl: 'https://github.com/LibreLingo/LibreLingo',
    localSourcePath: 'external-sources/librelingo',
    sourceGroup: 'newly-observed-source',
    targetFeature: 'Course workflow reference',
    safetyStatus: 'blocked-license-risk',
    usageType: 'blocked-reference-only',
    licenseObservation: 'GNU Affero General Public License Version 3 observed.',
    safeUsePlan: 'Do not copy code/content into P-English unless the project explicitly accepts AGPL obligations. Treat only as blocked workflow reference in reports.',
    attributionPlan: 'No learner-facing use. Keep license-risk note in source intelligence reports.',
    runtimeRule: RUNTIME_METADATA_ONLY,
    learnerUiRule: LEARNER_UI_CLEAN,
    riskLevel: 'high',
    nextBatchUse: 'Blocked',
  },
  {
    id: 'english-exercises',
    repoName: 'English-exercises',
    repoUrl: 'https://github.com/Areso/English-exercises',
    localSourcePath: 'external-sources/english-exercises',
    sourceGroup: 'primary-external-source',
    targetFeature: 'Supplemental grammar exercise patterns',
    safetyStatus: 'blocked-license-risk',
    usageType: 'blocked-reference-only',
    licenseObservation: 'GNU Affero General Public License v3.0 observed.',
    safeUsePlan: 'No direct code or exercise text copy unless AGPL obligations are explicitly accepted.',
    attributionPlan: 'No learner-facing use. Keep license-risk note in reports.',
    runtimeRule: RUNTIME_METADATA_ONLY,
    learnerUiRule: LEARNER_UI_CLEAN,
    riskLevel: 'high',
    nextBatchUse: 'Blocked',
  },
  {
    id: 'cefr-j-readme-only',
    repoName: 'cefr-j',
    repoUrl: 'local checkout; upstream not confirmed in this pass',
    localSourcePath: 'external-sources/cefr-j',
    sourceGroup: 'newly-observed-source',
    targetFeature: 'CEFR/J profile review',
    safetyStatus: 'license-review-required',
    usageType: 'grammar-profile',
    licenseObservation: 'README observed, but no top-level LICENSE file found during Batch 0 inspection.',
    safeUsePlan: 'Do not import content until upstream identity and license terms are confirmed. Prefer already-reviewed olp-en-cefrj for CEFR-J metadata.',
    attributionPlan: 'Future review required before any use.',
    runtimeRule: RUNTIME_METADATA_ONLY,
    learnerUiRule: LEARNER_UI_CLEAN,
    riskLevel: 'high',
    nextBatchUse: 'Future review',
  },
  {
    id: 'simple-english-dictionary-unavailable',
    repoName: 'simple-english-dictionary',
    repoUrl: 'https://github.com/nightblade9/simple-english-dictionary',
    localSourcePath: 'external-sources/simple-english-dictionary',
    sourceGroup: 'primary-external-source',
    targetFeature: 'Simple English definitions for vocabulary',
    safetyStatus: 'blocked-source-unavailable',
    usageType: 'blocked-reference-only',
    licenseObservation: 'No README, license, or usable content visible in the local folder during inspection.',
    safeUsePlan: 'Do not import or infer definitions from this source. Use app-authored short definitions paired with safe CEFR words.',
    attributionPlan: 'No source attribution required until usable source files/license are available.',
    runtimeRule: RUNTIME_METADATA_ONLY,
    learnerUiRule: LEARNER_UI_CLEAN,
    riskLevel: 'high',
    nextBatchUse: 'Blocked',
  },
  {
    id: 'english-learning-app-missing-license',
    repoName: 'cdf144/english-learning-app',
    repoUrl: 'https://github.com/cdf144/english-learning-app',
    localSourcePath: 'external-sources/candidates/english-learning-app',
    sourceGroup: 'candidate-source',
    targetFeature: 'Vocabulary UX and mini-games',
    safetyStatus: 'license-review-required',
    usageType: 'vocabulary-ux-workflow',
    licenseObservation: 'README observed; no LICENSE found in root.',
    safeUsePlan: 'Workflow ideas only; no code, database, images, or vocabulary copy.',
    attributionPlan: 'Keep source notes in audit/report only.',
    runtimeRule: RUNTIME_METADATA_ONLY,
    learnerUiRule: LEARNER_UI_CLEAN,
    riskLevel: 'high',
    nextBatchUse: 'Future review',
  },
  {
    id: 'english-now-private',
    repoName: 'chippeddog/english.now',
    repoUrl: 'https://github.com/chippeddog/english.now',
    localSourcePath: 'external-sources/candidates/english-now',
    sourceGroup: 'candidate-source',
    targetFeature: 'Learning platform architecture ideas',
    safetyStatus: 'license-review-required',
    usageType: 'platform-architecture-reference',
    licenseObservation: 'README and package.json observed; no LICENSE found and package is private.',
    safeUsePlan: 'Architecture/workflow ideas only. Do not copy code/data or paid integration patterns.',
    attributionPlan: 'Keep source notes in audit/report only.',
    runtimeRule: RUNTIME_METADATA_ONLY,
    learnerUiRule: LEARNER_UI_CLEAN,
    riskLevel: 'high',
    nextBatchUse: 'Future review',
  },
];

export function getSourceIntelligenceManifest() {
  return sourceIntelligenceManifest;
}

export function getSourceIntelligenceByStatus(status: SourceIntelligenceSafetyStatus) {
  return sourceIntelligenceManifest.filter((entry) => entry.safetyStatus === status);
}

export function getRuntimeSafeSourceEntries() {
  return sourceIntelligenceManifest.filter((entry) =>
    entry.safetyStatus === 'runtime-safe-direct-data' ||
    entry.safetyStatus === 'runtime-safe-profile-data' ||
    entry.safetyStatus === 'runtime-safe-adapted-workflow' ||
    entry.safetyStatus === 'resource-index-only'
  );
}

export function getSourceIntelligenceForBatch(batch: SourceIntelligenceEntry['nextBatchUse']) {
  return sourceIntelligenceManifest.filter((entry) => entry.nextBatchUse === batch);
}

export function getBlockedOrReviewSourceEntries() {
  return sourceIntelligenceManifest.filter((entry) =>
    entry.safetyStatus === 'blocked-license-risk' ||
    entry.safetyStatus === 'blocked-source-unavailable' ||
    entry.safetyStatus === 'license-review-required'
  );
}
