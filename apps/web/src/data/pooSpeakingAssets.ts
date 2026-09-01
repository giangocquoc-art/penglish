export type PooSpeakingAssetId =
  | 'poo-speaking-headset'
  | 'poo-jelly-listening'
  | 'poo-seahorse-fluency'
  | 'poo-octopus-feedback'
  | 'poo-crab-score'
  | 'poo-starfish-badge'
  | 'poo-turtle-retry'
  | 'poo-shell-mic'
  | 'poo-score-bubble';

export type PooSpeakingSpriteAsset = {
  id: PooSpeakingAssetId;
  label: string;
  sheet: string;
  framesPath: string;
  rows: number;
  columns: number;
  frames: number;
  frameWidth: number;
  frameHeight: number;
};

export const POO_SPEAKING_SPRITE_ASSETS: Record<PooSpeakingAssetId, PooSpeakingSpriteAsset> = {
  'poo-speaking-headset': {
    id: 'poo-speaking-headset',
    label: 'Poo cá voi đeo tai nghe - mascot ghi âm',
    sheet: '/assets/poo-speaking/sheets/poo-speaking-headset-3x3.png',
    framesPath: '/assets/poo-speaking/frames/poo-speaking-headset/',
    rows: 3,
    columns: 3,
    frames: 9,
    frameWidth: 418,
    frameHeight: 418,
  },
  'poo-jelly-listening': {
    id: 'poo-jelly-listening',
    label: 'Sứa Nghe - AI đang nghe',
    sheet: '/assets/poo-speaking/sheets/poo-jelly-listening-3x3.png',
    framesPath: '/assets/poo-speaking/frames/poo-jelly-listening/',
    rows: 3,
    columns: 3,
    frames: 9,
    frameWidth: 418,
    frameHeight: 418,
  },
  'poo-seahorse-fluency': {
    id: 'poo-seahorse-fluency',
    label: 'Cá Ngựa Tốc - điểm fluency/nhịp nói',
    sheet: '/assets/poo-speaking/sheets/poo-seahorse-fluency-3x3.png',
    framesPath: '/assets/poo-speaking/frames/poo-seahorse-fluency/',
    rows: 3,
    columns: 3,
    frames: 9,
    frameWidth: 418,
    frameHeight: 418,
  },
  'poo-octopus-feedback': {
    id: 'poo-octopus-feedback',
    label: 'Mực Mo - góp ý phát âm',
    sheet: '/assets/poo-speaking/sheets/poo-octopus-feedback-3x3.png',
    framesPath: '/assets/poo-speaking/frames/poo-octopus-feedback/',
    rows: 3,
    columns: 3,
    frames: 9,
    frameWidth: 418,
    frameHeight: 418,
  },
  'poo-crab-score': {
    id: 'poo-crab-score',
    label: 'Cua Quiz - tổng điểm',
    sheet: '/assets/poo-speaking/sheets/poo-crab-score-3x3.png',
    framesPath: '/assets/poo-speaking/frames/poo-crab-score/',
    rows: 3,
    columns: 3,
    frames: 9,
    frameWidth: 418,
    frameHeight: 418,
  },
  'poo-starfish-badge': {
    id: 'poo-starfish-badge',
    label: 'Sao Nhi - huy hiệu nói tốt',
    sheet: '/assets/poo-speaking/sheets/poo-starfish-badge-3x3.png',
    framesPath: '/assets/poo-speaking/frames/poo-starfish-badge/',
    rows: 3,
    columns: 3,
    frames: 9,
    frameWidth: 418,
    frameHeight: 418,
  },
  'poo-turtle-retry': {
    id: 'poo-turtle-retry',
    label: 'Rùa Rì - thử lại',
    sheet: '/assets/poo-speaking/sheets/poo-turtle-retry-3x3.png',
    framesPath: '/assets/poo-speaking/frames/poo-turtle-retry/',
    rows: 3,
    columns: 3,
    frames: 9,
    frameWidth: 418,
    frameHeight: 418,
  },
  'poo-shell-mic': {
    id: 'poo-shell-mic',
    label: 'Vỏ Sò Mic - nút ghi âm chính',
    sheet: '/assets/poo-speaking/sheets/poo-shell-mic-3x3.png',
    framesPath: '/assets/poo-speaking/frames/poo-shell-mic/',
    rows: 3,
    columns: 3,
    frames: 9,
    frameWidth: 418,
    frameHeight: 418,
  },
  'poo-score-bubble': {
    id: 'poo-score-bubble',
    label: 'Bọt Biển Chấm Điểm - điểm phát âm',
    sheet: '/assets/poo-speaking/sheets/poo-score-bubble-3x3.png',
    framesPath: '/assets/poo-speaking/frames/poo-score-bubble/',
    rows: 3,
    columns: 3,
    frames: 9,
    frameWidth: 418,
    frameHeight: 418,
  },
};
