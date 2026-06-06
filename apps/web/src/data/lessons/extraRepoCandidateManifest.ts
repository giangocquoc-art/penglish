export type ExtraRepoCandidateStatus = 'safe-direct-integration' | 'safe-workflow-adaptation' | 'resource-index-only' | 'blocked-license-risk' | 'blocked-source-unavailable';

export type ExtraRepoCandidateManifestEntry = {
  repoName: string;
  repoUrl: string;
  localSourcePath: string;
  targetFeature: string;
  status: ExtraRepoCandidateStatus;
  integrationMode: string;
  licenseFound: string;
  attributionNote: string;
  technicalRisk: string;
  safeUsePlan: string;
  filesCreatedOrPlanned: string[];
  uiAdaptationNotes: string;
};

export const extraRepoCandidateManifest: ExtraRepoCandidateManifestEntry[] = [
  {
    repoName: 'openlanguageprofiles/olp-en-cefrj',
    repoUrl: 'https://github.com/openlanguageprofiles/olp-en-cefrj.git',
    localSourcePath: 'external-sources/candidates/olp-en-cefrj',
    targetFeature: 'CEFR-J vocabulary/grammar balancing',
    status: 'safe-direct-integration',
    integrationMode: 'Use CEFR-J A1-B2 profile metadata with citation; avoid Octanove C1/C2 CC BY-SA data in this phase.',
    licenseFound: 'README terms allow CEFR-J vocabulary and grammar profile datasets for research/commercial use with proper citation; Octanove C1/C2 is CC BY-SA 4.0.',
    attributionNote: 'Cite CEFR-J Wordlist Version 1.5 and CEFR-J Grammar Profile Version 20180315; copyright Tono Laboratory at TUFS.',
    technicalRisk: 'No top-level LICENSE file; C1/C2 file has share-alike terms.',
    safeUsePlan: 'Use only as internal CEFR balancing/profile metadata and keep citation in reports/manifests.',
    filesCreatedOrPlanned: ['reports/master-06b-extra-repo-audit.md'],
    uiAdaptationNotes: 'No learner-facing repo names; use CEFR level labels only.',
  },
  {
    repoName: 'yvoronoy/awesome-english',
    repoUrl: 'https://github.com/yvoronoy/awesome-english.git',
    localSourcePath: 'external-sources/candidates/awesome-english',
    targetFeature: 'Resource Hub',
    status: 'resource-index-only',
    integrationMode: 'Use as curated resource index inspiration only.',
    licenseFound: 'CC0 1.0 Universal.',
    attributionNote: 'Source notes retained in reports/manifest.',
    technicalRisk: 'External linked sites have their own terms; avoid embedding copyrighted content.',
    safeUsePlan: 'Create concise app-authored Vietnamese summaries and selected links to legitimate free resources.',
    filesCreatedOrPlanned: ['apps/web/src/data/resources/generatedEnglishResourceHub.ts', 'apps/web/src/pages/ResourceHubPage.tsx'],
    uiAdaptationNotes: 'Show simple category cards, not long copied descriptions.',
  },
  {
    repoName: 'dnizfor/resources-for-english',
    repoUrl: 'https://github.com/dnizfor/resources-for-english.git',
    localSourcePath: 'external-sources/candidates/resources-for-english',
    targetFeature: 'Resource Hub',
    status: 'resource-index-only',
    integrationMode: 'Use resource categories/workflow as inspiration; do not import app code.',
    licenseFound: 'CC0 1.0 Universal license file; package is private.',
    attributionNote: 'Source notes retained in reports/manifest.',
    technicalRisk: 'React app stack differs from P-English and package is private.',
    safeUsePlan: 'Use original Vietnamese Resource Hub copy and safe external links only.',
    filesCreatedOrPlanned: ['apps/web/src/data/resources/generatedEnglishResourceHub.ts', 'apps/web/src/pages/ResourceHubPage.tsx'],
    uiAdaptationNotes: 'Keep resource hub small, mobile-first, and ocean/glass styled.',
  },
  {
    repoName: 'CloudBytes-Academy/English-Dictionary-Open-Source',
    repoUrl: 'https://github.com/CloudBytes-Academy/English-Dictionary-Open-Source.git',
    localSourcePath: 'external-sources/candidates/english-dictionary-open-source',
    targetFeature: 'Dictionary/definition enrichment',
    status: 'safe-direct-integration',
    integrationMode: 'Future limited curated definition enrichment with MIT attribution; no large raw dictionary import in Phase 6B.',
    licenseFound: 'MIT License, copyright UberPython 2021.',
    attributionNote: 'Retain UberPython/OPTED/Project Gutenberg lineage notes in future dictionary metadata.',
    technicalRisk: 'Old Webster 1913 data and upstream Project Gutenberg terms should be reviewed before large import.',
    safeUsePlan: 'Use selected definitions only in a later focused pass; keep current phase to metadata/reporting.',
    filesCreatedOrPlanned: ['reports/master-06b-extra-repo-audit.md'],
    uiAdaptationNotes: 'No learner-facing legal details; dictionary copy should be short and modernized if used later.',
  },
  {
    repoName: 'cdf144/english-learning-app',
    repoUrl: 'https://github.com/cdf144/english-learning-app.git',
    localSourcePath: 'external-sources/candidates/english-learning-app',
    targetFeature: 'Vocabulary UX and mini-games',
    status: 'safe-workflow-adaptation',
    integrationMode: 'Workflow ideas only; no code, database, images, or vocabulary copy.',
    licenseFound: 'No LICENSE found in root; no license metadata in pom.xml.',
    attributionNote: 'Source notes retained in audit report only.',
    technicalRisk: 'Missing license and third-party Vietnamese dictionary database provenance.',
    safeUsePlan: 'Adapt high-level ideas such as saved words, lookup history, shuffle/guess practice.',
    filesCreatedOrPlanned: ['reports/master-06b-extra-repo-audit.md'],
    uiAdaptationNotes: 'Future vocabulary games should use existing P-English generated vocabulary data.',
  },
  {
    repoName: 'furkanbingol/EnglishPronunciation-App',
    repoUrl: 'https://github.com/furkanbingol/EnglishPronunciation-App.git',
    localSourcePath: 'external-sources/candidates/english-pronunciation-app',
    targetFeature: 'Pronunciation UX research for Phase 7',
    status: 'safe-workflow-adaptation',
    integrationMode: 'Use UX/scoring flow ideas only; do not require Azure/Firebase or copy Swift code.',
    licenseFound: 'MIT License, copyright Furkan 2023.',
    attributionNote: 'Retain source note in Phase 7 planning/reporting if UX ideas are used.',
    technicalRisk: 'Azure Cognitive Speech and Firebase dependencies conflict with no-paid-API requirement.',
    safeUsePlan: 'Use browser-native/manual pronunciation feedback patterns in Phase 7.',
    filesCreatedOrPlanned: ['reports/master-06b-extra-repo-audit.md'],
    uiAdaptationNotes: 'Keep pronunciation UX as app-native web flow with fallback, no paid API requirement.',
  },
  {
    repoName: 'chippeddog/english.now',
    repoUrl: 'https://github.com/chippeddog/english.now.git',
    localSourcePath: 'external-sources/candidates/english-now',
    targetFeature: 'Learning platform architecture ideas',
    status: 'safe-workflow-adaptation',
    integrationMode: 'Architecture/workflow ideas only; no code/data copy.',
    licenseFound: 'No LICENSE found in root; package.json is private.',
    attributionNote: 'Source notes retained in audit report only.',
    technicalRisk: 'Private package and integrations rely on OpenAI, Deepgram, storage, email, and payments.',
    safeUsePlan: 'Adapt high-level ideas: Zod validation, modular content, progress tracking, not paid integrations.',
    filesCreatedOrPlanned: ['reports/master-06b-extra-repo-audit.md'],
    uiAdaptationNotes: 'Do not expose AI/payment architecture in learner Resource Hub.',
  },
  {
    repoName: 'baturyilmaz/wordpecker-app',
    repoUrl: 'https://github.com/baturyilmaz/wordpecker-app.git',
    localSourcePath: 'external-sources/candidates/wordpecker-app',
    targetFeature: 'Vocabulary workflow and light reading ideas',
    status: 'safe-workflow-adaptation',
    integrationMode: 'Use MIT-licensed workflow ideas conservatively; do not copy assets/media/code in Phase 6B.',
    licenseFound: 'MIT License, copyright Batur Arslan 2025.',
    attributionNote: 'Retain source note in audit/manifest.',
    technicalRisk: 'Many features describe LLM/voice/image generation and include media assets/videos; no paid API or copied media allowed.',
    safeUsePlan: 'Adapt simple app-native concepts: custom lists, know/don’t-know reveal, multi-question practice, light reading.',
    filesCreatedOrPlanned: ['apps/web/src/data/resources/generatedEnglishResourceHub.ts', 'reports/master-06b-extra-repo-audit.md'],
    uiAdaptationNotes: 'Keep future vocabulary UX simple and powered by existing generated P-English data.',
  },
];

export function getExtraRepoCandidateManifest() {
  return extraRepoCandidateManifest;
}
