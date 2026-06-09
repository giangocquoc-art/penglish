import { generatedShadowingCatalog, getGeneratedShadowingItemById } from '../../data/shadowing/generatedShadowingCatalog';
import type { GeneratedShadowingItem, ShadowingRepeatStep } from '../../data/shadowing/shadowingTypes';
import type { ShadowingSentence, ShadowingVideo } from './shadowing-data';

export const DEFAULT_GENERATED_SHADOWING_VIDEO_URL = '';

export type AdaptedShadowingVideo = ShadowingVideo & {
  titleEn: string;
  repeatPlan: ShadowingRepeatStep[];
  learnerTipsVi: string[];
  whaleCoachLines: string[];
};

function adaptGeneratedShadowingItem(item: GeneratedShadowingItem): AdaptedShadowingVideo {
  const transcript: ShadowingSentence[] = item.chunks.map((chunk) => ({
    id: chunk.id,
    start: chunk.start,
    end: chunk.end,
    text: chunk.text,
    vi: chunk.vi,
  }));

  const videoUrl = item.referenceVideoUrl ?? DEFAULT_GENERATED_SHADOWING_VIDEO_URL;

  return {
    id: item.id,
    title: item.titleVi,
    titleEn: item.titleEn,
    level: item.level,
    topic: item.topic,
    duration: item.estimatedTime,
    videoUrl,
    description: item.descriptionVi,
    transcript,
    transcriptLines: transcript,
    youtubeId: '',
    embedAllowed: false,
    focusNotes: item.learnerTipsVi,
    referenceVideoTitle: item.referenceVideoTitle,
    referenceVideoUrl: item.referenceVideoUrl,
    repeatPlan: item.repeatPlan,
    learnerTipsVi: item.learnerTipsVi,
    whaleCoachLines: item.whaleCoachLines,
  };
}

export const generatedShadowingVideos: AdaptedShadowingVideo[] = generatedShadowingCatalog.map(adaptGeneratedShadowingItem);

export function getGeneratedShadowingCatalog() {
  return generatedShadowingCatalog;
}

export function getShadowingItemById(id: string) {
  return getGeneratedShadowingItemById(id);
}

export function getAdaptedShadowingVideoById(id: string) {
  return generatedShadowingVideos.find((item) => item.id === id) ?? null;
}
