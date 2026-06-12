import type { ShadowingFeedbackChangedWord, ShadowingFeedbackResult, ShadowingFeedbackWord } from '../../data/shadowing/shadowingFeedbackTypes';
import { tokenizeSpeechTextForComparison } from './speechTextNormalizer';

const EMPTY_INPUT_TIPS = [
  'Hãy nhập hoặc ghi lại câu bạn vừa nói để nhận góp ý local.',
  'Bạn có thể gõ gần đúng những gì mình nghe/nói, không cần hoàn hảo.',
];

const DEFAULT_TIPS = [
  'Nói chậm hơn một nhịp, ưu tiên rõ từ chính trước khi tăng tốc.',
  'Đọc theo cụm ngắn 2–4 từ để giữ hơi và nhịp tự nhiên.',
];

function tokenize(text: string) {
  return tokenizeSpeechTextForComparison(text);
}

function makeWord(text: string, index: number, type: 'target' | 'learner'): ShadowingFeedbackWord {
  return {
    id: `${type}-${index}-${text}`,
    text,
    ...(type === 'target' ? { targetIndex: index } : { learnerIndex: index }),
  };
}

function isLikelyChangedWord(target: string, learner: string) {
  if (!target || !learner || target === learner) return false;
  if (target[0] === learner[0]) return true;
  if (Math.abs(target.length - learner.length) <= 2 && (target.includes(learner.slice(0, 2)) || learner.includes(target.slice(0, 2)))) return true;
  return false;
}

function buildRhythmTips(missingWords: ShadowingFeedbackWord[], extraWords: ShadowingFeedbackWord[], changedWords: ShadowingFeedbackChangedWord[]) {
  const tips: string[] = [];

  if (missingWords.length) tips.push('Bạn đang bỏ sót vài từ. Hãy nói chậm hơn và chạm nhẹ từng từ, đặc biệt là từ ngắn ở giữa câu.');
  if (extraWords.length) tips.push('Có thêm từ ngoài câu mẫu. Hãy đọc theo cụm ngắn rồi dừng rất nhẹ trước khi sang cụm tiếp theo.');
  if (changedWords.length) tips.push('Một vài từ vựnghe/nói lệch âm. Hãy nhìn cặp từ thay đổi và luyện lại âm đầu + âm cuối.');
  if (!tips.length) tips.push('Các từ chính đã khá khớp. Bước tiếp theo là giữ nhịp đều và nói mềm hơn, không cần chạy theo tốc độ.');

  return [...tips, ...DEFAULT_TIPS].slice(0, 4);
}

function buildNextDrills(targetText: string, missingWords: ShadowingFeedbackWord[], changedWords: ShadowingFeedbackChangedWord[]) {
  const drills: string[] = [];
  const focusWords = [...changedWords.map((item) => item.target), ...missingWords.map((item) => item.text)].slice(0, 4);

  if (focusWords.length) drills.push(`Luyện riêng cụm: ${focusWords.join(' / ')}.`);
  drills.push(`Đọc chậm câu mẫu một lần: ${targetText}`);
  drills.push('Ghi âm lại một lượt ngắn, sau đó so với danh sách từ còn thiếu.');

  return drills.slice(0, 3);
}

export function analyzeShadowingFeedback(targetText: string, learnerText: string): ShadowingFeedbackResult {
  const targetTokens = tokenize(targetText);
  const learnerTokens = tokenize(learnerText);

  if (!learnerTokens.length) {
    return {
      status: 'empty',
      targetText,
      learnerText,
      normalizedTarget: targetTokens,
      normalizedLearner: learnerTokens,
      matchedWords: [],
      missingWords: targetTokens.map((word, index) => makeWord(word, index, 'target')),
      extraWords: [],
      changedWords: [],
      rhythmTipsVi: EMPTY_INPUT_TIPS,
      nextDrillsVi: ['Nhìn câu mẫu và đọc chậm từng cụm.', 'Gõ lại câu bạn vừa nói vào ô nhỏ.', 'Bấm “AI góp ý thử” để xem phần cần sửa.'],
      summaryVi: 'Hãy nhập hoặc ghi lại câu bạn vừa nói để nhận góp ý.',
    };
  }

  const learnerUsed = new Set<number>();
  const targetMatched = new Set<number>();
  const matchedWords: ShadowingFeedbackWord[] = [];

  targetTokens.forEach((targetWord, targetIndex) => {
    const learnerIndex = learnerTokens.findIndex((learnerWord, index) => !learnerUsed.has(index) && learnerWord === targetWord);
    if (learnerIndex >= 0) {
      learnerUsed.add(learnerIndex);
      targetMatched.add(targetIndex);
      matchedWords.push({ id: `match-${targetIndex}-${learnerIndex}-${targetWord}`, text: targetWord, targetIndex, learnerIndex });
    }
  });

  const changedWords: ShadowingFeedbackChangedWord[] = [];
  targetTokens.forEach((targetWord, targetIndex) => {
    if (targetMatched.has(targetIndex)) return;
    const learnerIndex = learnerTokens.findIndex((learnerWord, index) => !learnerUsed.has(index) && isLikelyChangedWord(targetWord, learnerWord));
    if (learnerIndex >= 0) {
      learnerUsed.add(learnerIndex);
      targetMatched.add(targetIndex);
      changedWords.push({
        id: `changed-${targetIndex}-${learnerIndex}-${targetWord}-${learnerTokens[learnerIndex]}`,
        target: targetWord,
        learner: learnerTokens[learnerIndex],
        targetIndex,
        learnerIndex,
        noteVi: 'Có thể bạn nghe/nói lệch âm đầu, âm cuối hoặc nuốt bớt âm.',
      });
    }
  });

  const missingWords = targetTokens
    .map((word, index) => ({ word, index }))
    .filter((item) => !targetMatched.has(item.index))
    .map((item) => makeWord(item.word, item.index, 'target'));

  const extraWords = learnerTokens
    .map((word, index) => ({ word, index }))
    .filter((item) => !learnerUsed.has(item.index))
    .map((item) => makeWord(item.word, item.index, 'learner'));

  const issueCount = missingWords.length + extraWords.length + changedWords.length;

  return {
    status: 'ready',
    targetText,
    learnerText,
    normalizedTarget: targetTokens,
    normalizedLearner: learnerTokens,
    matchedWords,
    missingWords,
    extraWords,
    changedWords,
    rhythmTipsVi: buildRhythmTips(missingWords, extraWords, changedWords),
    nextDrillsVi: buildNextDrills(targetText, missingWords, changedWords),
    summaryVi: issueCount === 0 ? 'Câu của bạn khớp tốt ở mức từ vựng. Hãy luyện thêm nhịp và độ tự nhiên.' : `Tìm thấy ${issueCount} điểm cần luyện lại. Tập trung sửa từng cụm nhỏ, không cần chấm điểm.` ,
  };
}
