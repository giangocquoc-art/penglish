export const oceanBackgrounds = {
  login: '/ocean/backgrounds/bg-login-ocean.png',
  dashboard: '/ocean/backgrounds/bg-dashboard-ocean.png',
  shadowing: '/ocean/backgrounds/bg-shadowing-ocean.png',
  speed: '/ocean/backgrounds/bg-speed-ocean.png',
  vocab: '/ocean/backgrounds/bg-vocab-ocean.png',
  roadmap: '/ocean/backgrounds/bg-roadmap-ocean.png',
  roadmapAlt: '/ocean/backgrounds/bg-roadmap-ocean-alt.png',
} as const;

const sourcePosePath = (folder: string, file: string) => `/ocean/mascots/${folder}/poses/${file}.png`;
const cleanPosePath = (folder: string, file: string) => `/ocean/mascots/${folder}/poses-clean/${file}.png`;
const refinedPosePath = (file: string) => `/ocean/mascots/refined/${file}.webp`;
const sourceSheetPath = (folder: string, file: string) => `/ocean/mascots/${folder}/${file}.png`;

export const oceanMascots = {
  poo: {
    folder: '/ocean/mascots/poo/',
    cleanPoseFolder: '/ocean/mascots/poo/poses-clean/',
    sourceSheets: [sourceSheetPath('poo', 'poo-sheet-simple'), sourceSheetPath('poo', 'poo-sheet-full')],
    defaultPose: 'idle',
    poses: {
      idle: refinedPosePath('poo-coach'),
      happy: refinedPosePath('poo-celebrate'),
      reward: refinedPosePath('poo-celebrate'),
      rest: refinedPosePath('poo-think'),
      coach: refinedPosePath('poo-coach'),
      think: refinedPosePath('poo-think'),
      listen: refinedPosePath('poo-listen'),
      celebrate: refinedPosePath('poo-celebrate'),
    },
    alt: 'Poo, linh vật cá voi P-English',
  },
  mucMo: {
    folder: '/ocean/mascots/muc-mo/',
    cleanPoseFolder: '/ocean/mascots/muc-mo/poses-clean/',
    sourceSheets: [sourceSheetPath('muc-mo', 'poo-sheet-simple')],
    defaultPose: 'teacher',
    poses: {
      teacher: refinedPosePath('muc-mo'),
      hint: refinedPosePath('muc-mo'),
      explain: refinedPosePath('muc-mo'),
      idle: refinedPosePath('muc-mo'),
      happy: refinedPosePath('muc-mo'),
    },
    alt: 'Mực Mơ, trợ lý giải thích ngữ pháp',
  },
  ruaRi: {
    folder: '/ocean/mascots/rua-ri/',
    cleanPoseFolder: '/ocean/mascots/rua-ri/poses-clean/',
    sourceSheets: [sourceSheetPath('rua-ri', 'rua-ri-sheet')],
    defaultPose: 'map',
    poses: {
      map: refinedPosePath('rua-ri'),
      guide: refinedPosePath('rua-ri'),
      point: refinedPosePath('rua-ri'),
      idle: refinedPosePath('rua-ri'),
    },
    alt: 'Rùa Rì, bạn dẫn đường lộ trình CEFR',
  },
  cuaQuiz: {
    folder: '/ocean/mascots/cua-quiz/',
    cleanPoseFolder: '/ocean/mascots/cua-quiz/poses-clean/',
    sourceSheets: [sourceSheetPath('cua-quiz', 'cua-quiz-sheet')],
    defaultPose: 'quiz',
    poses: {
      quiz: refinedPosePath('cua-quiz'),
      choice: refinedPosePath('cua-quiz'),
      match: refinedPosePath('cua-quiz-match'),
      happy: refinedPosePath('cua-quiz'),
      coach: refinedPosePath('cua-quiz'),
      celebrate: refinedPosePath('cua-quiz'),
    },
    alt: 'Cua Quiz, bạn hỗ trợ câu hỏi luyện tập',
  },
  suaNghe: {
    folder: '/ocean/mascots/sua-nghe/',
    cleanPoseFolder: '/ocean/mascots/sua-nghe/poses-clean/',
    sourceSheets: [sourceSheetPath('sua-nghe', 'sua-nghe-sheet')],
    defaultPose: 'listen',
    poses: {
      listen: refinedPosePath('sua-nghe'),
      wave: refinedPosePath('sua-nghe'),
      record: refinedPosePath('sua-nghe'),
      coach: refinedPosePath('sua-nghe'),
      happy: refinedPosePath('sua-nghe'),
    },
    alt: 'Sứa Nghe, bạn hỗ trợ luyện nghe và shadowing',
  },
  caNguaToc: {
    folder: '/ocean/mascots/ca-ngua-toc/',
    cleanPoseFolder: '/ocean/mascots/ca-ngua-toc/poses-clean/',
    sourceSheets: [sourceSheetPath('ca-ngua-toc', 'ca-ngua-toc-sheet')],
    defaultPose: 'dash',
    poses: {
      dash: refinedPosePath('ca-ngua-toc'),
      speed: refinedPosePath('ca-ngua-toc'),
      pronounce: refinedPosePath('ca-ngua-toc'),
      coach: refinedPosePath('ca-ngua-toc'),
      focus: refinedPosePath('ca-ngua-toc'),
      happy: refinedPosePath('ca-ngua-toc'),
    },
    alt: 'Cá Ngựa Tốc, bạn hỗ trợ English Speed',
  },
  saoNhi: {
    folder: '/ocean/mascots/sao-nhi/',
    cleanPoseFolder: '/ocean/mascots/sao-nhi/poses-clean/',
    sourceSheets: [sourceSheetPath('sao-nhi', 'sao-nhi-sheet')],
    defaultPose: 'sparkle',
    poses: {
      sparkle: refinedPosePath('sao-nhi'),
      reward: refinedPosePath('sao-nhi'),
      badge: refinedPosePath('sao-nhi'),
      happy: refinedPosePath('sao-nhi'),
      mastery: refinedPosePath('sao-nhi'),
    },
    alt: 'Sao Nhí, bạn chúc mừng thành quả học tập',
  },
  botBien: {
    folder: '/ocean/mascots/bot-bien/',
    cleanPoseFolder: '/ocean/mascots/bot-bien/poses-clean/',
    sourceSheets: [refinedPosePath('bot-bien')],
    defaultPose: 'buddy',
    poses: {
      buddy: refinedPosePath('bot-bien'),
      wave: refinedPosePath('bot-bien-wave'),
      encourage: refinedPosePath('bot-bien-bubbles'),
      rest: refinedPosePath('bot-bien-rest'),
    },
    alt: 'Bọt Biển, bạn động viên khi luyện tập',
  },
} as const;

export type OceanBackgroundVariant = keyof Omit<typeof oceanBackgrounds, 'roadmapAlt'>;
export type OceanMascotName = keyof typeof oceanMascots;
export type OceanMascotPoseName<TMascot extends OceanMascotName = OceanMascotName> = keyof (typeof oceanMascots)[TMascot]['poses'];

const fallbackPoseFiles: Record<OceanMascotName, Record<string, string>> = {
  poo: { idle: 'poo-pose-01', happy: 'poo-pose-04', reward: 'poo-pose-04', rest: 'poo-pose-06', coach: 'poo-pose-02', think: 'poo-pose-02', listen: 'poo-pose-03', celebrate: 'poo-pose-04' },
  mucMo: { teacher: 'muc-mo-pose-01', hint: 'muc-mo-pose-02', explain: 'muc-mo-pose-03', idle: 'muc-mo-pose-04', happy: 'muc-mo-pose-05' },
  ruaRi: { map: 'rua-ri-pose-01', guide: 'rua-ri-pose-02', point: 'rua-ri-pose-03', idle: 'rua-ri-pose-04' },
  cuaQuiz: { quiz: 'cua-quiz-pose-01', choice: 'cua-quiz-pose-02', match: 'cua-quiz-pose-02', happy: 'cua-quiz-pose-03', coach: 'cua-quiz-pose-04', celebrate: 'cua-quiz-pose-05' },
  suaNghe: { listen: 'sua-nghe-pose-01', wave: 'sua-nghe-pose-02', record: 'sua-nghe-pose-03', coach: 'sua-nghe-pose-04', happy: 'sua-nghe-pose-05' },
  caNguaToc: { dash: 'ca-ngua-toc-pose-01', speed: 'ca-ngua-toc-pose-02', pronounce: 'ca-ngua-toc-pose-03', coach: 'ca-ngua-toc-pose-04', focus: 'ca-ngua-toc-pose-05', happy: 'ca-ngua-toc-pose-06' },
  saoNhi: { sparkle: 'sao-nhi-pose-01', reward: 'sao-nhi-pose-02', badge: 'sao-nhi-pose-03', happy: 'sao-nhi-pose-04', mastery: 'sao-nhi-pose-05' },
  botBien: {},
};

export const oceanAssets = {
  backgrounds: oceanBackgrounds,
  mascots: oceanMascots,
  cleanPosePath,
  sourcePosePath,
  sourceSheetPath,
} as const;

export function getOceanBackgroundPath(variant: OceanBackgroundVariant) {
  return oceanBackgrounds[variant];
}

export function getOceanMascotPose<TMascot extends OceanMascotName>(mascot: TMascot, pose?: OceanMascotPoseName<TMascot>) {
  const asset = oceanMascots[mascot];
  const poses = asset.poses as Record<string, string>;
  const poseKey = String(pose ?? asset.defaultPose);
  return poses[poseKey] ?? sourcePosePath(asset.folder.replace('/ocean/mascots/', '').replaceAll('/', ''), poseKey);
}

export function getOceanMascotFallbackPose<TMascot extends OceanMascotName>(mascot: TMascot, pose?: OceanMascotPoseName<TMascot>) {
  const poseKey = String(pose ?? oceanMascots[mascot].defaultPose);
  // The transparent bubble pose has a same-family fallback without the bubble layer.
  // Other Bọt Biển poses already use that base image, so they need no second request.
  if (mascot === 'botBien' && poseKey !== 'buddy') return getOceanMascotPose('botBien', 'buddy');
  const file = fallbackPoseFiles[mascot][poseKey];
  return file ? cleanPosePath(mascotFolderName[mascot], file) : undefined;
}

const mascotFolderName: Record<OceanMascotName, string> = {
  poo: 'poo', mucMo: 'muc-mo', ruaRi: 'rua-ri', cuaQuiz: 'cua-quiz', suaNghe: 'sua-nghe', caNguaToc: 'ca-ngua-toc', saoNhi: 'sao-nhi', botBien: 'bot-bien',
};

export function getOceanMascotSheet(mascot: OceanMascotName) {
  return oceanMascots[mascot].sourceSheets[0];
}
