import type { ShadowingAiFeedback } from './shadowingAiFeedbackSchema';
import type { ShadowingCoachLevel } from './shadowingAiRubric';

export type ShadowingAiFewShotExample = {
  level: ShadowingCoachLevel;
  targetText: string;
  learnerText: string;
  expectedFeedback: ShadowingAiFeedback;
};

export const shadowingAiFewShotExamples: ShadowingAiFewShotExample[] = [
  {
    level: 1,
    targetText: 'Hello, Mai.',
    learnerText: 'Hello my',
    expectedFeedback: {
      source: 'mock',
      summaryVi: 'Bạn nói được từ chào chính, nhưng tên `Mai` bị nghe thành `my`.',
      matchedWords: ['hello'],
      missingWords: ['mai'],
      extraWords: [],
      changedWords: [{ expected: 'mai', heard: 'my', tipVi: 'Giữ âm /ai/ trong `Mai` dài và rõ hơn một chút.' }],
      rhythmTips: ['Tách thật nhẹ: `Hello` / `Mai`.'],
      pronunciationTips: ['Đừng nuốt tên riêng ở cuối cụm.'],
      nextDrills: ['Đọc chậm 3 lần: `Hello, Mai.`'],
    },
  },
  {
    level: 2,
    targetText: 'How are you today? I am fine.',
    learnerText: 'How are today I fine',
    expectedFeedback: {
      source: 'mock',
      summaryVi: 'Bạn giữ được ý chính, nhưng bỏ sót `you` và `am`, làm câu nghe chưa tự nhiên.',
      matchedWords: ['how', 'are', 'today', 'i', 'fine'],
      missingWords: ['you', 'am'],
      extraWords: [],
      changedWords: [],
      rhythmTips: ['Chia thành 2 cụm: `How are you today?` / `I am fine.`'],
      pronunciationTips: ['Từ ngắn `you` và `am` cần được chạm nhẹ, không bỏ qua.'],
      nextDrills: ['Lặp lại 3 lần: `How are you today?`'],
    },
  },
  {
    level: 3,
    targetText: 'I wake up at six o clock.',
    learnerText: 'I wake six clock',
    expectedFeedback: {
      source: 'mock',
      summaryVi: 'Bạn nói được khung chính, nhưng thiếu `up`, `at`, và `o`, nên nhịp câu bị gãy.',
      matchedWords: ['i', 'wake', 'six', 'clock'],
      missingWords: ['up', 'at', 'o'],
      extraWords: [],
      changedWords: [],
      rhythmTips: ['Đọc theo cụm: `I wake up` / `at six o clock`.'],
      pronunciationTips: ['Giữ cụm động từ `wake up` đủ 2 từ.'],
      nextDrills: ['Luyện riêng 3 lần: `wake up at six`.'],
    },
  },
  {
    level: 4,
    targetText: 'I work in a small office near the station.',
    learnerText: 'I work small office near station',
    expectedFeedback: {
      source: 'mock',
      summaryVi: 'Ý chính còn rõ, nhưng thiếu các từ nối `in`, `a`, `the`, làm câu nghe rời rạc.',
      matchedWords: ['i', 'work', 'small', 'office', 'near', 'station'],
      missingWords: ['in', 'a', 'the'],
      extraWords: [],
      changedWords: [],
      rhythmTips: ['Chia câu: `I work in a small office` / `near the station`.'],
      pronunciationTips: ['Chạm nhẹ các từ nhỏ `in`, `a`, `the`; không cần nhấn mạnh.'],
      nextDrills: ['Đọc chậm: `in a small office` rồi nối vào cả câu.'],
    },
  },
  {
    level: 5,
    targetText: 'Could I have a small coffee, please?',
    learnerText: 'Can I have small copy please',
    expectedFeedback: {
      source: 'mock',
      summaryVi: 'Bạn giữ được tình huống gọi món, nhưng `coffee` bị nghe thành `copy` và thiếu `a`.',
      matchedWords: ['i', 'have', 'small', 'please'],
      missingWords: ['could', 'a'],
      extraWords: ['can'],
      changedWords: [{ expected: 'coffee', heard: 'copy', tipVi: 'Kéo âm đầu của `coffee` mềm hơn và giữ âm cuối nhẹ.' }],
      rhythmTips: ['Đọc cụm lịch sự trước: `Could I have` / rồi đến `a small coffee, please?`'],
      pronunciationTips: ['Phân biệt `coffee` với `copy` bằng nhịp âm cuối và trọng âm.'],
      nextDrills: ['Luyện 3 lần: `a small coffee, please`.'],
    },
  },
  {
    level: 6,
    targetText: 'Yesterday, I missed the bus and walked home slowly.',
    learnerText: 'Yesterday I miss bus and walk home slow',
    expectedFeedback: {
      source: 'mock',
      summaryVi: 'Câu chuyện còn hiểu được, nhưng các đuôi quá khứ và trạng từ bị rơi.',
      matchedWords: ['yesterday', 'i', 'bus', 'and', 'home'],
      missingWords: ['the'],
      extraWords: [],
      changedWords: [
        { expected: 'missed', heard: 'miss', tipVi: 'Giữ âm cuối nhẹ trong `missed`.' },
        { expected: 'walked', heard: 'walk', tipVi: 'Chạm âm cuối của `walked` thật ngắn.' },
        { expected: 'slowly', heard: 'slow', tipVi: 'Đọc đủ đuôi `-ly` trong `slowly`.' },
      ],
      rhythmTips: ['Tách mốc chuyện: `Yesterday` / `I missed the bus` / `and walked home slowly`.'],
      pronunciationTips: ['Các đuôi quá khứ không cần nhấn mạnh, chỉ cần chạm nhẹ.'],
      nextDrills: ['Luyện riêng: `missed the bus` / `walked home slowly`.'],
    },
  },
  {
    level: 7,
    targetText: 'I think learning English is useful because it opens new opportunities.',
    learnerText: 'I think English useful because open new opportunity',
    expectedFeedback: {
      source: 'mock',
      summaryVi: 'Ý kiến chính rõ, nhưng thiếu `learning`, `is`, `it` và phần số nhiều ở `opportunities`.',
      matchedWords: ['i', 'think', 'english', 'useful', 'because', 'new'],
      missingWords: ['learning', 'is', 'it'],
      extraWords: [],
      changedWords: [
        { expected: 'opens', heard: 'open', tipVi: 'Giữ âm cuối `s` nhẹ trong `opens`.' },
        { expected: 'opportunities', heard: 'opportunity', tipVi: 'Đọc đủ phần cuối để giữ nghĩa số nhiều.' },
      ],
      rhythmTips: ['Nhấn nhẹ 2 cụm ý: `I think learning English is useful` / `because it opens new opportunities`.'],
      pronunciationTips: ['Đừng bỏ `it` sau `because`; từ này giúp câu trôi tự nhiên.'],
      nextDrills: ['Đọc chậm: `because it opens new opportunities`.'],
    },
  },
  {
    level: 8,
    targetText: 'In my previous job, I managed customer questions and solved small problems quickly.',
    learnerText: 'In my job I manage customer question and solve small problem quick',
    expectedFeedback: {
      source: 'mock',
      summaryVi: 'Bạn giữ đúng ý công việc, nhưng thiếu `previous` và nhiều đuôi quá khứ/số nhiều.',
      matchedWords: ['in', 'my', 'job', 'i', 'customer', 'and', 'small'],
      missingWords: ['previous'],
      extraWords: [],
      changedWords: [
        { expected: 'managed', heard: 'manage', tipVi: 'Chạm đuôi quá khứ trong `managed`.' },
        { expected: 'questions', heard: 'question', tipVi: 'Giữ âm cuối `s` nhẹ vì có nhiều câu hỏi.' },
        { expected: 'solved', heard: 'solve', tipVi: 'Chạm đuôi quá khứ trong `solved`.' },
        { expected: 'problems', heard: 'problem', tipVi: 'Giữ âm cuối `s` nhẹ.' },
        { expected: 'quickly', heard: 'quick', tipVi: 'Đọc đủ `quickly` để câu tự nhiên hơn.' },
      ],
      rhythmTips: ['Chia thành 3 cụm: `In my previous job` / `I managed customer questions` / `and solved small problems quickly`.'],
      pronunciationTips: ['Các đuôi `-ed` và `-s` chỉ cần nhẹ, không cần nói quá mạnh.'],
      nextDrills: ['Luyện cụm: `managed customer questions`.'],
    },
  },
  {
    level: 9,
    targetText: 'I am going to finish it before the meeting starts.',
    learnerText: 'I gonna finish before meeting start',
    expectedFeedback: {
      source: 'mock',
      summaryVi: 'Bạn dùng nối âm tự nhiên, nhưng đã nuốt vài từ quan trọng như `it`, `the`, và âm cuối `starts`.',
      matchedWords: ['i', 'finish', 'before', 'meeting'],
      missingWords: ['am', 'going', 'to', 'it', 'the'],
      extraWords: ['gonna'],
      changedWords: [{ expected: 'starts', heard: 'start', tipVi: 'Giữ âm cuối `s` trong `starts` để đúng chủ ngữ.' }],
      rhythmTips: ['Luyện bản rõ trước: `I am going to finish it` / `before the meeting starts`.'],
      pronunciationTips: ['Có thể nối `going to`, nhưng đừng làm mất `it` và `the`.'],
      nextDrills: ['Đọc chậm rồi nhanh nhẹ: `finish it before the meeting starts`.'],
    },
  },
  {
    level: 10,
    targetText: 'Although remote work is convenient, it can reduce spontaneous communication between teammates.',
    learnerText: 'Although remote work convenient it reduce communication between team',
    expectedFeedback: {
      source: 'mock',
      summaryVi: 'Bạn giữ được ý lớn, nhưng thiếu `is`, `can`, và làm mất sắc thái ở `spontaneous communication`.',
      matchedWords: ['although', 'remote', 'work', 'convenient', 'it', 'reduce', 'communication', 'between'],
      missingWords: ['is', 'can', 'spontaneous'],
      extraWords: [],
      changedWords: [{ expected: 'teammates', heard: 'team', tipVi: '`teammates` là những thành viên trong nhóm; đọc đủ phần cuối để giữ nghĩa.' }],
      rhythmTips: ['Chia câu dài: `Although remote work is convenient` / `it can reduce spontaneous communication` / `between teammates`.'],
      pronunciationTips: ['Không cần đọc nhanh; ưu tiên giữ các từ nối nghĩa như `although`, `can`, `spontaneous`.'],
      nextDrills: ['Luyện cụm giữa: `it can reduce spontaneous communication`.'],
    },
  },
];

export function getShadowingAiFewShotExamples(level: ShadowingCoachLevel, radius = 1): ShadowingAiFewShotExample[] {
  return shadowingAiFewShotExamples.filter((example) => Math.abs(example.level - level) <= radius).slice(0, 3);
}
