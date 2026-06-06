/// <reference types="node" />

import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { allPEnglishLessons } from '../apps/web/src/lib/p-english/lesson-content-data.ts';
import { getUnifiedContentDepthSnapshot, getUnifiedLessonContentDepth } from '../apps/web/src/lib/p-english/unifiedLessonEngine.ts';
import { validateLessonContent, summarizeLessonValidation, type LessonContentValidationWarning } from '../apps/web/src/lib/p-english/lesson-content-validation.ts';

type LessonDepthAudit = NonNullable<ReturnType<typeof getUnifiedLessonContentDepth>>;
type LayerKey = LessonDepthAudit['depthLayers'][number]['key'];

type WeakestLayerFinding = {
  lessonId: string;
  layer: LayerKey;
  labelVi: string;
  score: number;
  itemCount: number;
  actionVi: string;
};

function groupWarnings(warnings: LessonContentValidationWarning[]) {
  return warnings.reduce<Record<string, LessonContentValidationWarning[]>>((groups, warning) => {
    const key = `${warning.severity}:${warning.area}`;
    groups[key] = [...(groups[key] ?? []), warning];
    return groups;
  }, {});
}

function getLayerStats(depths: LessonDepthAudit[]) {
  const layerKeys = new Set<LayerKey>();
  depths.forEach((depth) => depth.depthLayers.forEach((layer) => layerKeys.add(layer.key)));

  return Array.from(layerKeys).reduce<Record<string, { averageScore: number; weakLessonCount: number; zeroItemLessonCount: number }>>((stats, layerKey) => {
    const layers = depths
      .map((depth) => depth.depthLayers.find((layer) => layer.key === layerKey))
      .filter((layer): layer is LessonDepthAudit['depthLayers'][number] => Boolean(layer));
    const totalScore = layers.reduce((sum, layer) => sum + layer.score, 0);
    stats[layerKey] = {
      averageScore: layers.length > 0 ? Math.round(totalScore / layers.length) : 0,
      weakLessonCount: layers.filter((layer) => layer.score < 46).length,
      zeroItemLessonCount: layers.filter((layer) => layer.itemCount === 0).length,
    };
    return stats;
  }, {});
}

function getWeakestLayers(depths: LessonDepthAudit[]): WeakestLayerFinding[] {
  return depths
    .map((depth): WeakestLayerFinding | null => {
      const weakestLayer = depth.weakestLayer ?? depth.depthLayers.slice().sort((a, b) => a.score - b.score)[0];
      if (!weakestLayer) return null;
      return {
        lessonId: depth.lessonId,
        layer: weakestLayer.key,
        labelVi: weakestLayer.labelVi,
        score: weakestLayer.score,
        itemCount: weakestLayer.itemCount,
        actionVi: weakestLayer.actionVi,
      };
    })
    .filter((item): item is WeakestLayerFinding => Boolean(item))
    .sort((a, b) => a.score - b.score || a.itemCount - b.itemCount || a.lessonId.localeCompare(b.lessonId))
    .slice(0, 40);
}

function createReport() {
  const lessonWarnings = allPEnglishLessons.flatMap((lesson) => validateLessonContent(lesson));
  const lessonValidationSummary = summarizeLessonValidation(lessonWarnings);
  const lessonDepths = allPEnglishLessons
    .map((lesson) => getUnifiedLessonContentDepth(lesson.id))
    .filter((depth): depth is LessonDepthAudit => Boolean(depth));
  const layerStats = getLayerStats(lessonDepths);
  const weakestLayers = getWeakestLayers(lessonDepths);
  const contentDepthSnapshot = getUnifiedContentDepthSnapshot();
  const thinLessons = lessonDepths
    .filter((depth) => depth.depthScore < 46)
    .sort((a, b) => a.depthScore - b.depthScore || a.lessonId.localeCompare(b.lessonId));
  const shallowLayerLessons = lessonDepths
    .map((depth) => ({
      ...depth,
      safeWeakestLayer: depth.weakestLayer ?? depth.depthLayers.slice().sort((a, b) => a.score - b.score)[0],
    }))
    .filter((depth) => depth.strongLayerCount < 4 && Boolean(depth.safeWeakestLayer))
    .sort((a, b) => a.strongLayerCount - b.strongLayerCount || a.depthScore - b.depthScore || a.lessonId.localeCompare(b.lessonId))
    .slice(0, 25);

  return {
    generatedAt: new Date().toISOString(),
    lessonCount: allPEnglishLessons.length,
    lessonValidationSummary,
    lessonWarnings,
    warningGroups: groupWarnings(lessonWarnings),
    layerStats,
    weakestLayers,
    thinLessons: thinLessons.map((depth) => ({
      lessonId: depth.lessonId,
      depthScore: depth.depthScore,
      depthLabelVi: depth.depthLabelVi,
      missingSkills: depth.missingSkills,
      weakestLayer: depth.weakestLayer,
      nextLayerActionVi: depth.nextLayerActionVi,
    })),
    shallowLayerLessons: shallowLayerLessons.map((depth) => ({
      lessonId: depth.lessonId,
      depthScore: depth.depthScore,
      strongLayerCount: depth.strongLayerCount,
      weakestLayer: depth.safeWeakestLayer,
      nextLayerActionVi: depth.nextLayerActionVi,
    })),
    contentDepthSnapshot,
    recommendedFixStrategy: lessonValidationSummary.errorCount > 0
      ? 'Fix runtime validation errors first because they can break lesson release readiness.'
      : lessonValidationSummary.warningCount > 0
        ? 'Fix runtime warnings, then refresh weakest depth layers.'
        : 'No blocking runtime errors. Continue content development by strengthening the weakest depth layers: shadowing/speed multimodal practice, common mistakes, and output prompts for A2 grammar lessons.',
  };
}

function toMarkdown(report: ReturnType<typeof createReport>) {
  const weakestRows = report.weakestLayers
    .slice(0, 15)
    .map((item) => `| ${item.lessonId} | ${item.labelVi} | ${item.score} | ${item.itemCount} | ${item.actionVi} |`)
    .join('\n');
  const layerRows = Object.entries(report.layerStats)
    .map(([key, value]) => `| ${key} | ${value.averageScore} | ${value.weakLessonCount} | ${value.zeroItemLessonCount} |`)
    .join('\n');
  const shallowRows = report.shallowLayerLessons
    .slice(0, 15)
    .map((item) => `| ${item.lessonId} | ${item.depthScore} | ${item.strongLayerCount} | ${item.weakestLayer?.labelVi ?? 'N/A'} | ${item.nextLayerActionVi} |`)
    .join('\n');

  return `# P-English runtime lesson depth check

Generated: ${report.generatedAt}

## Runtime validation

- Lessons: ${report.lessonCount}
- Errors: ${report.lessonValidationSummary.errorCount}
- Warnings: ${report.lessonValidationSummary.warningCount}
- Info: ${report.lessonValidationSummary.infoCount}

## Recommended fix strategy

${report.recommendedFixStrategy}

## Layer stats

| Layer | Average score | Weak lessons | Zero-item lessons |
|---|---:|---:|---:|
${layerRows}

## Weakest lesson layers

| Lesson | Weakest layer | Score | Items | Recommended action |
|---|---:|---:|---:|---|
${weakestRows}

## Lessons needing more strong layers

| Lesson | Depth score | Strong layers | Weakest layer | Next action |
|---|---:|---:|---|---|
${shallowRows}

## Content depth snapshot

- Average unit depth score: ${report.contentDepthSnapshot.averageDepthScore}
- Deep units: ${report.contentDepthSnapshot.deepUnitCount}/${report.contentDepthSnapshot.totalUnits}
- Thin units: ${report.contentDepthSnapshot.thinUnitCount}/${report.contentDepthSnapshot.totalUnits}
- Total lessons in path: ${report.contentDepthSnapshot.totalLessons}
- Next data action: ${report.contentDepthSnapshot.nextDataActionVi}
`;
}

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reportDir = path.join(rootDir, 'reports');
const jsonReportPath = path.join(reportDir, 'penglish-runtime-lesson-depth-check.json');
const markdownReportPath = path.join(reportDir, 'penglish-runtime-lesson-depth-check.md');

mkdirSync(reportDir, { recursive: true });

const report = createReport();
writeFileSync(jsonReportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
writeFileSync(markdownReportPath, toMarkdown(report), 'utf8');

console.log(JSON.stringify({
  lessonCount: report.lessonCount,
  lessonValidationSummary: report.lessonValidationSummary,
  shallowLayerLessonCount: report.shallowLayerLessons.length,
  thinLessonCount: report.thinLessons.length,
  weakestLayerTop5: report.weakestLayers.slice(0, 5),
}, null, 2));

if (report.lessonValidationSummary.errorCount > 0) {
  process.exitCode = 1;
}
