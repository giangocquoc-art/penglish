import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourceRoot = path.join(root, '_source', 'foundation48');
const rawRoot = path.join(sourceRoot, 'raw-normalized');
const markdownRoot = path.join(sourceRoot, 'markdown');
const sourceIndexPath = path.join(sourceRoot, 'foundation48-source-index.json');
const reportsRoot = path.join(sourceRoot, 'reports');
const jsonReportPath = path.join(reportsRoot, 'foundation48-app-source-audit.json');
const markdownReportPath = path.join(reportsRoot, 'foundation48-app-source-audit.md');

const EXPECTED_DAYS = 48;

function existsDir(target) {
  return fs.existsSync(target) && fs.statSync(target).isDirectory();
}

function readJson(target) {
  return JSON.parse(fs.readFileSync(target, 'utf8'));
}

function countFilesRecursive(dir, extensions) {
  if (!existsDir(dir)) return 0;
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      count += countFilesRecursive(fullPath, extensions);
      continue;
    }
    if (extensions.has(path.extname(entry.name).toLowerCase())) count += 1;
  }
  return count;
}

function listDayFolders(dir) {
  if (!existsDir(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^day-\d{2}\b/.test(entry.name))
    .map((entry) => entry.name)
    .sort();
}

function dayNumberFromFolder(folder) {
  const match = folder.match(/^day-(\d{2})\b/);
  return match ? Number(match[1]) : null;
}

function rel(target) {
  return path.relative(root, target).replace(/\\/g, '/');
}

fs.mkdirSync(reportsRoot, { recursive: true });

const problems = [];
if (!existsDir(rawRoot)) problems.push(`Missing raw source directory: ${rel(rawRoot)}`);
if (!existsDir(markdownRoot)) problems.push(`Missing markdown directory: ${rel(markdownRoot)}`);
if (!fs.existsSync(sourceIndexPath)) problems.push(`Missing source index: ${rel(sourceIndexPath)}`);

const sourceIndex = fs.existsSync(sourceIndexPath) ? readJson(sourceIndexPath) : [];
const rawFolders = listDayFolders(rawRoot);
const markdownFolders = listDayFolders(markdownRoot);
const indexByDay = new Map(sourceIndex.map((day) => [Number(day.dayNumber), day]));

const detectedDays = new Set([
  ...rawFolders.map(dayNumberFromFolder).filter(Boolean),
  ...markdownFolders.map(dayNumberFromFolder).filter(Boolean),
  ...sourceIndex.map((day) => Number(day.dayNumber)).filter(Boolean),
]);

const expectedDayNumbers = Array.from({ length: EXPECTED_DAYS }, (_, index) => index + 1);
const missingDayFolders = expectedDayNumbers.filter((dayNumber) => !detectedDays.has(dayNumber));

const days = expectedDayNumbers.map((dayNumber) => {
  const indexEntry = indexByDay.get(dayNumber);
  const rawFolder = rawFolders.find((folder) => dayNumberFromFolder(folder) === dayNumber);
  const markdownFolder = markdownFolders.find((folder) => dayNumberFromFolder(folder) === dayNumber);
  const rawDir = rawFolder ? path.join(rawRoot, rawFolder) : '';
  const mdDir = markdownFolder ? path.join(markdownRoot, markdownFolder) : '';
  const pdfCount = indexEntry?.pdfCount ?? countFilesRecursive(rawDir, new Set(['.pdf']));
  const markdownCount = (indexEntry?.pdfs ?? []).filter((pdf) => pdf.markdown).length || countFilesRecursive(mdDir, new Set(['.md']));
  const audioCount = indexEntry?.mp3Count ?? countFilesRecursive(rawDir, new Set(['.mp3']));
  const videoCount = indexEntry?.mp4Count ?? countFilesRecursive(rawDir, new Set(['.mp4']));

  return {
    dayNumber,
    rawFolder: rawFolder ?? null,
    markdownFolder: markdownFolder ?? null,
    pdfCount,
    markdownCount,
    audioCount,
    videoCount,
    hasSourcePdf: pdfCount > 0,
    hasMarkdown: markdownCount > 0,
    hasAudio: audioCount > 0,
    hasVideo: videoCount > 0,
    inSourceIndex: Boolean(indexEntry),
  };
});

const daysWithAudio = days.filter((day) => day.hasAudio).map((day) => day.dayNumber);
const daysWithVideo = days.filter((day) => day.hasVideo).map((day) => day.dayNumber);
const daysMissingMarkdown = days.filter((day) => !day.hasMarkdown).map((day) => day.dayNumber);
const daysMissingSourcePdfs = days.filter((day) => !day.hasSourcePdf).map((day) => day.dayNumber);
const daysMissingFromIndex = days.filter((day) => !day.inSourceIndex).map((day) => day.dayNumber);

const readyForAppIntegration =
  problems.length === 0 &&
  sourceIndex.length === EXPECTED_DAYS &&
  missingDayFolders.length === 0 &&
  daysMissingMarkdown.length === 0 &&
  daysMissingSourcePdfs.length === 0 &&
  daysMissingFromIndex.length === 0;

const totals = {
  daysDetected: detectedDays.size,
  indexedDays: sourceIndex.length,
  pdfCount: days.reduce((sum, day) => sum + day.pdfCount, 0),
  markdownCount: days.reduce((sum, day) => sum + day.markdownCount, 0),
  audioCount: days.reduce((sum, day) => sum + day.audioCount, 0),
  videoCount: days.reduce((sum, day) => sum + day.videoCount, 0),
};

const report = {
  generatedAt: new Date().toISOString(),
  sourcePaths: {
    rawNormalized: rel(rawRoot),
    markdown: rel(markdownRoot),
    sourceIndex: rel(sourceIndexPath),
  },
  expectedDays: EXPECTED_DAYS,
  totals,
  missingDayFolders,
  daysWithAudio,
  daysWithVideo,
  daysMissingMarkdown,
  daysMissingSourcePdfs,
  daysMissingFromIndex,
  readyForAppIntegration,
  problems,
  days,
};

fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2), 'utf8');

const lines = [
  '# Foundation48 App Source Audit',
  '',
  `Generated: ${report.generatedAt}`,
  '',
  '## Summary',
  '',
  `- Days detected: ${totals.daysDetected}/${EXPECTED_DAYS}`,
  `- Indexed days: ${totals.indexedDays}/${EXPECTED_DAYS}`,
  `- Source PDFs: ${totals.pdfCount}`,
  `- Markdown files: ${totals.markdownCount}`,
  `- MP3/audio files: ${totals.audioCount}`,
  `- MP4/video files: ${totals.videoCount}`,
  `- Days with audio: ${daysWithAudio.length ? daysWithAudio.join(', ') : 'none'}`,
  `- Days with video: ${daysWithVideo.length ? daysWithVideo.join(', ') : 'none'}`,
  `- Ready for app integration: ${readyForAppIntegration ? 'yes' : 'no'}`,
  '',
  '## Gaps',
  '',
  `- Missing day folders: ${missingDayFolders.length ? missingDayFolders.join(', ') : 'none'}`,
  `- Days missing Markdown: ${daysMissingMarkdown.length ? daysMissingMarkdown.join(', ') : 'none'}`,
  `- Days missing source PDFs: ${daysMissingSourcePdfs.length ? daysMissingSourcePdfs.join(', ') : 'none'}`,
  `- Days missing from source index: ${daysMissingFromIndex.length ? daysMissingFromIndex.join(', ') : 'none'}`,
  `- Path problems: ${problems.length ? problems.join('; ') : 'none'}`,
  '',
  '## Per-Day Counts',
  '',
  '| Day | PDFs | Markdown | MP3 | MP4 | In index |',
  '| --- | ---: | ---: | ---: | ---: | :---: |',
  ...days.map((day) => `| ${day.dayNumber} | ${day.pdfCount} | ${day.markdownCount} | ${day.audioCount} | ${day.videoCount} | ${day.inSourceIndex ? 'yes' : 'no'} |`),
  '',
];

fs.writeFileSync(markdownReportPath, lines.join('\n'), 'utf8');
console.log(JSON.stringify({ readyForAppIntegration, totals, daysWithAudio, daysWithVideo }, null, 2));
