export type ShadowingSentence = {
  id: string;
  start: number;
  end: number;
  text: string;
  vi: string;
};

export type ShadowingVideo = {
  id: string;
  title: string;
  level: string;
  topic: string;
  duration: string;
  videoUrl: string;
  description: string;
  transcript: ShadowingSentence[];
};

export { generatedShadowingVideos as shadowingVideos } from './shadowingAdapter';
export type { AdaptedShadowingVideo } from './shadowingAdapter';
