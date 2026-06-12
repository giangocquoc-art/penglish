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
const preferredPosePath = cleanPosePath;
const sourceSheetPath = (folder: string, file: string) => `/ocean/mascots/${folder}/${file}.png`;

export const oceanMascots = {
  poo: {
    folder: '/ocean/mascots/poo/',
    cleanPoseFolder: '/ocean/mascots/poo/poses-clean/',
    sourceSheets: [sourceSheetPath('poo', 'poo-sheet-simple'), sourceSheetPath('poo', 'poo-sheet-full')],
    defaultPose: 'idle',
    poses: {
      idle: preferredPosePath('poo', 'poo-pose-01'),
      happy: preferredPosePath('poo', 'poo-pose-04'),
      reward: preferredPosePath('poo', 'poo-pose-04'),
      rest: preferredPosePath('poo', 'poo-pose-06'),
      coach: preferredPosePath('poo', 'poo-pose-02'),
    },
    alt: 'Poo, linh vậtừ vựnglish',
  },
  mucMo: {
    folder: '/ocean/mascots/muc-mo/',
    cleanPoseFolder: '/ocean/mascots/muc-mo/poses-clean/',
    sourceSheets: [sourceSheetPath('muc-mo', 'poo-sheet-simple')],
    defaultPose: 'teacher',
    poses: {
      teacher: preferredPosePath('muc-mo', 'muc-mo-pose-01'),
      hint: preferredPosePath('muc-mo', 'muc-mo-pose-02'),
      explain: preferredPosePath('muc-mo', 'muc-mo-pose-03'),
      idle: preferredPosePath('muc-mo', 'muc-mo-pose-04'),
      happy: preferredPosePath('muc-mo', 'muc-mo-pose-05'),
    },
    alt: 'Mực Mơ, trợ lý giải thích ngữ pháp',
  },
  ruaRi: {
    folder: '/ocean/mascots/rua-ri/',
    cleanPoseFolder: '/ocean/mascots/rua-ri/poses-clean/',
    sourceSheets: [sourceSheetPath('rua-ri', 'rua-ri-sheet')],
    defaultPose: 'map',
    poses: {
      map: preferredPosePath('rua-ri', 'rua-ri-pose-01'),
      guide: preferredPosePath('rua-ri', 'rua-ri-pose-02'),
      point: preferredPosePath('rua-ri', 'rua-ri-pose-03'),
      idle: preferredPosePath('rua-ri', 'rua-ri-pose-04'),
    },
    alt: 'Rùa Rì, bạn dẫn đường lộ trình CEFR',
  },
  cuaQuiz: {
    folder: '/ocean/mascots/cua-quiz/',
    cleanPoseFolder: '/ocean/mascots/cua-quiz/poses-clean/',
    sourceSheets: [sourceSheetPath('cua-quiz', 'cua-quiz-sheet')],
    defaultPose: 'quiz',
    poses: {
      quiz: preferredPosePath('cua-quiz', 'cua-quiz-pose-01'),
      choice: preferredPosePath('cua-quiz', 'cua-quiz-pose-02'),
      happy: preferredPosePath('cua-quiz', 'cua-quiz-pose-03'),
      coach: preferredPosePath('cua-quiz', 'cua-quiz-pose-04'),
      celebrate: preferredPosePath('cua-quiz', 'cua-quiz-pose-05'),
    },
    alt: 'Cua Quiz, bạn hỗ trợ câu hỏi luyện tập',
  },
  suaNghe: {
    folder: '/ocean/mascots/sua-nghe/',
    cleanPoseFolder: '/ocean/mascots/sua-nghe/poses-clean/',
    sourceSheets: [sourceSheetPath('sua-nghe', 'sua-nghe-sheet')],
    defaultPose: 'listen',
    poses: {
      listen: preferredPosePath('sua-nghe', 'sua-nghe-pose-01'),
      wave: preferredPosePath('sua-nghe', 'sua-nghe-pose-02'),
      record: preferredPosePath('sua-nghe', 'sua-nghe-pose-03'),
      coach: preferredPosePath('sua-nghe', 'sua-nghe-pose-04'),
      happy: preferredPosePath('sua-nghe', 'sua-nghe-pose-05'),
    },
    alt: 'Sứa Nghe, bạn hỗ trợ luyện nghe và shadowing',
  },
  caNguaToc: {
    folder: '/ocean/mascots/ca-ngua-toc/',
    cleanPoseFolder: '/ocean/mascots/ca-ngua-toc/poses-clean/',
    sourceSheets: [sourceSheetPath('ca-ngua-toc', 'ca-ngua-toc-sheet')],
    defaultPose: 'dash',
    poses: {
      dash: preferredPosePath('ca-ngua-toc', 'ca-ngua-toc-pose-01'),
      speed: preferredPosePath('ca-ngua-toc', 'ca-ngua-toc-pose-02'),
      pronounce: preferredPosePath('ca-ngua-toc', 'ca-ngua-toc-pose-03'),
      coach: preferredPosePath('ca-ngua-toc', 'ca-ngua-toc-pose-04'),
      focus: preferredPosePath('ca-ngua-toc', 'ca-ngua-toc-pose-05'),
      happy: preferredPosePath('ca-ngua-toc', 'ca-ngua-toc-pose-06'),
    },
    alt: 'Cá Ngựa Tốc, bạn hỗ trợ English Speed',
  },
  saoNhi: {
    folder: '/ocean/mascots/sao-nhi/',
    cleanPoseFolder: '/ocean/mascots/sao-nhi/poses-clean/',
    sourceSheets: [sourceSheetPath('sao-nhi', 'sao-nhi-sheet')],
    defaultPose: 'sparkle',
    poses: {
      sparkle: preferredPosePath('sao-nhi', 'sao-nhi-pose-01'),
      reward: preferredPosePath('sao-nhi', 'sao-nhi-pose-02'),
      badge: preferredPosePath('sao-nhi', 'sao-nhi-pose-03'),
      happy: preferredPosePath('sao-nhi', 'sao-nhi-pose-04'),
      mastery: preferredPosePath('sao-nhi', 'sao-nhi-pose-05'),
    },
    alt: 'Sao Nhí, bạn chúc mừng thành quả học tập',
  },
} as const;

export type OceanBackgroundVariant = keyof Omit<typeof oceanBackgrounds, 'roadmapAlt'>;
export type OceanMascotName = keyof typeof oceanMascots;
export type OceanMascotPoseName<TMascot extends OceanMascotName = OceanMascotName> = keyof (typeof oceanMascots)[TMascot]['poses'];

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

export function getOceanMascotSheet(mascot: OceanMascotName) {
  return oceanMascots[mascot].sourceSheets[0];
}
