export type GitHubRepoIntegrationStatus =
  | 'selected-for-real-integration'
  | 'selected-with-license-review-required'
  | 'blocked-license-risk'
  | 'blocked-source-unavailable';

export type GitHubRepoIntegrationMode =
  | 'direct-data-import'
  | 'profile-data-import'
  | 'adapted-logic-and-data-shape'
  | 'adapter-pattern-only'
  | 'blocked';

export type GitHubRepoIntegrationManifestEntry = {
  repoName: string;
  repoUrl: string;
  localSourcePath: string;
  targetFeature: string;
  status: GitHubRepoIntegrationStatus;
  integrationMode: GitHubRepoIntegrationMode;
  licenseFound: string;
  attributionNote: string;
  filesCreatedOrPlanned: string[];
  technicalRisk: string;
  uiAdaptationNotes: string;
};

export const githubRepoIntegrationManifest: GitHubRepoIntegrationManifestEntry[] = [
  {
    repoName: 'Words-CEFR-Dataset',
    repoUrl: 'https://github.com/Maximax67/Words-CEFR-Dataset',
    localSourcePath: 'external-sources/words-cefr-dataset',
    targetFeature: 'Vocabulary and flashcards',
    status: 'selected-for-real-integration',
    integrationMode: 'direct-data-import',
    licenseFound: 'MIT License, copyright (c) 2024 Belikov Maxim.',
    attributionNote: 'Vocabulary CEFR source metadata retained in generated data and reports; learner-facing UI shows P-English labels only.',
    filesCreatedOrPlanned: [
      'apps/web/src/data/vocabulary/vocabularyTypes.ts',
      'apps/web/src/data/vocabulary/generatedCefrVocabulary.ts',
      'apps/web/src/lib/p-english/vocabularyAdapter.ts',
      'reports/master-03-vocabulary-flashcards.md',
    ],
    technicalRisk: 'Low. Source CSV is simple and permissively licensed; generated app data must include enough examples/hints without overfitting old handcrafted lessons.',
    uiAdaptationNotes: 'Use as the primary CEFR word pool for flashcards, review, and dashboard counts. Keep repo name out of learner cards.',
  },
  {
    repoName: 'Open Language Profiles — English CEFR-J',
    repoUrl: 'https://github.com/openlanguageprofiles/olp-en-cefrj',
    localSourcePath: 'external-sources/olp-en-cefrj',
    targetFeature: 'Vocabulary profile enrichment and grammar profile ordering',
    status: 'selected-for-real-integration',
    integrationMode: 'profile-data-import',
    licenseFound: 'README terms permit research and commercial use with proper citation for CEFR-J vocabulary and grammar profile datasets; copyright belongs to Tono Laboratory at TUFS. C1/C2 Octanove data is CC BY-SA 4.0 and will be avoided for A1-B2 import.',
    attributionNote: 'Cite CEFR-J Wordlist Version 1.5 and CEFR-J Grammar Profile Version 20180315 in reports/source metadata.',
    filesCreatedOrPlanned: [
      'apps/web/src/data/vocabulary/generatedCefrVocabulary.ts',
      'apps/web/src/data/grammar/generatedGrammarLessons.ts',
      'reports/master-03-vocabulary-flashcards.md',
      'reports/master-04-grammar.md',
    ],
    technicalRisk: 'Medium. Profile rows require normalization and citation handling; avoid C1/C2 ShareAlike data unless future licensing policy explicitly accepts it.',
    uiAdaptationNotes: 'Use CEFR-J profile entries to balance levels and grammar topic sequence while Vietnamese explanations remain P-English-authored.',
  },
  {
    repoName: 'simple-english-dictionary',
    repoUrl: 'https://github.com/nightblade9/simple-english-dictionary',
    localSourcePath: 'external-sources/simple-english-dictionary',
    targetFeature: 'Simple English definitions for vocabulary',
    status: 'blocked-source-unavailable',
    integrationMode: 'blocked',
    licenseFound: 'No README, license, or usable content was visible in the local source folder; only .git was listed.',
    attributionNote: 'No learner-facing or generated content will be copied from this source until files and license are available.',
    filesCreatedOrPlanned: ['reports/master-02-real-github-integration-plan.md'],
    technicalRisk: 'High. Source content is unavailable in the local checkout, so direct import would require guessing or inventing data.',
    uiAdaptationNotes: 'Definitions for the first generated batch will be short app-authored learner definitions paired with CEFR-sourced words, not copied from this repository.',
  },
  {
    repoName: 'fluentcards-grammar',
    repoUrl: 'https://github.com/katspaugh/fluentcards-grammar',
    localSourcePath: 'external-sources/fluentcards-grammar',
    targetFeature: 'Grammar lessons and quiz cards',
    status: 'selected-for-real-integration',
    integrationMode: 'adapted-logic-and-data-shape',
    licenseFound: 'MIT-style license, copyright (c) 2021 katspaugh.',
    attributionNote: 'Grammar topic/source metadata retained in generated data and reports; learner-facing UI uses Vietnamese P-English explanations.',
    filesCreatedOrPlanned: [
      'apps/web/src/data/grammar/grammarTypes.ts',
      'apps/web/src/data/grammar/generatedGrammarLessons.ts',
      'apps/web/src/lib/p-english/grammarAdapter.ts',
      'reports/master-04-grammar.md',
    ],
    technicalRisk: 'Low to medium. MIT license is compatible; content needs transformation into Vietnamese-first lessons and accessible keyboard practice.',
    uiAdaptationNotes: 'Use source grammar card ideas as real grammar modules, then present as short Vietnamese explanations, examples, and answerable practice cards.',
  },
  {
    repoName: 'English-exercises',
    repoUrl: 'https://github.com/Areso/English-exercises',
    localSourcePath: 'external-sources/english-exercises',
    targetFeature: 'Supplemental grammar exercise patterns',
    status: 'blocked-license-risk',
    integrationMode: 'blocked',
    licenseFound: 'GNU Affero General Public License v3.0.',
    attributionNote: 'No direct code or exercise text will be copied unless the project explicitly accepts AGPL obligations.',
    filesCreatedOrPlanned: ['reports/master-02-real-github-integration-plan.md'],
    technicalRisk: 'High. Direct incorporation into a web app may trigger AGPL source distribution obligations for derivative work.',
    uiAdaptationNotes: 'Use only as a blocked source note in reports; grammar implementation will rely on permissive/citation-compatible sources and app-authored Vietnamese explanations.',
  },
  {
    repoName: 'CEFR-SP',
    repoUrl: 'https://github.com/yukiar/CEFR-SP',
    localSourcePath: 'external-sources/cefr-sp',
    targetFeature: 'Reading and CEFR sentence practice',
    status: 'selected-with-license-review-required',
    integrationMode: 'profile-data-import',
    licenseFound: 'README provides citation requirements, but no top-level license was found during inspection.',
    attributionNote: 'Cite Arase, Uchida, and Kajiwara CEFR-SP papers in reports/source metadata if data is used.',
    filesCreatedOrPlanned: [
      'apps/web/src/data/reading/readingTypes.ts',
      'apps/web/src/data/reading/generatedReadingLessons.ts',
      'apps/web/src/lib/p-english/readingAdapter.ts',
      'reports/master-05-reading-sentence-practice.md',
    ],
    technicalRisk: 'Medium to high until license terms are confirmed. The integration should use limited normalized sentence metadata only after confirming usable corpus files and terms.',
    uiAdaptationNotes: 'Use CEFR sentence difficulty levels to create reading/sentence cards; do not expose research repo names in learner UI.',
  },
  {
    repoName: 'shadowing',
    repoUrl: 'https://github.com/nhs000/shadowing',
    localSourcePath: 'external-sources/shadowing',
    targetFeature: 'Shadowing practice flow',
    status: 'selected-with-license-review-required',
    integrationMode: 'adapter-pattern-only',
    licenseFound: 'No license file found in inspected top-level files; package is private.',
    attributionNote: 'No direct source code or bundled video/transcript content will be copied unless license is clarified.',
    filesCreatedOrPlanned: [
      'apps/web/src/data/shadowing/shadowingTypes.ts',
      'apps/web/src/data/shadowing/generatedShadowingCatalog.ts',
      'apps/web/src/lib/p-english/shadowingAdapter.ts',
      'reports/master-06-shadowing.md',
    ],
    technicalRisk: 'Medium to high. The workflow is useful, but direct copying is blocked by missing license and video/caption copyright risk.',
    uiAdaptationNotes: 'Adapt the real practice concept: lag time, transcript panel, keyboard play/pause cues, and learner-provided transcripts. Generated catalog will avoid copyrighted videos.',
  },
  {
    repoName: 'shadowing_generator',
    repoUrl: 'https://github.com/Skywalker-Harrison/shadowing_generator',
    localSourcePath: 'external-sources/shadowing-generator',
    targetFeature: 'Shadowing segmentation and repeat workflow',
    status: 'selected-for-real-integration',
    integrationMode: 'adapted-logic-and-data-shape',
    licenseFound: 'README badge indicates MIT; no separate license file was observed in top-level listing.',
    attributionNote: 'Credit repository in reports for segmentation/repetition workflow. Do not bundle sample video, output video, or sample transcript text.',
    filesCreatedOrPlanned: [
      'apps/web/src/data/shadowing/shadowingTypes.ts',
      'apps/web/src/data/shadowing/generatedShadowingCatalog.ts',
      'apps/web/src/lib/p-english/shadowingAdapter.ts',
      'reports/master-06-shadowing.md',
    ],
    technicalRisk: 'Medium. Workflow can be adapted, but sample media/transcripts are not safe to bundle as learner content.',
    uiAdaptationNotes: 'Implement short app-native shadowing scripts with repeat counts, segment timings, and transcript-import helpers inspired by the repository workflow.',
  },
  {
    repoName: 'speech',
    repoUrl: 'https://github.com/huytd/speech',
    localSourcePath: 'external-sources/speech-pronunciation',
    targetFeature: 'English Speed and pronunciation feedback',
    status: 'selected-for-real-integration',
    integrationMode: 'adapted-logic-and-data-shape',
    licenseFound: 'BSD 3-Clause License, copyright (c) 2023, Huy.',
    attributionNote: 'Retain BSD attribution and non-endorsement note in reports/source metadata.',
    filesCreatedOrPlanned: [
      'apps/web/src/data/speech/speechTypes.ts',
      'apps/web/src/data/speech/generatedSpeechPrompts.ts',
      'apps/web/src/lib/p-english/speechAdapter.ts',
      'reports/master-07-english-speed-pronunciation.md',
    ],
    technicalRisk: 'Low to medium. Browser SpeechRecognition availability varies, so a manual fallback and deterministic similarity scoring are required.',
    uiAdaptationNotes: 'Replace old multiple-choice speed game with speak/listen/retry cards, Vietnamese feedback, keyboard shortcuts, and fallback typing mode.',
  },
];

export const realIntegrationStatement = 'Repos are selected for real integration, not reference-only.';

export function getManifestEntriesByFeature(targetFeature: string) {
  return githubRepoIntegrationManifest.filter((entry) => entry.targetFeature === targetFeature);
}

export function getSelectedRealIntegrationEntries() {
  return githubRepoIntegrationManifest.filter((entry) => entry.status === 'selected-for-real-integration');
}
