import type { Foundation48ChallengeType } from './foundation48Types';
import { shuffleTokensForQuestion } from '../../lib/p-english/practice-randomization';

export type Foundation48DeepVocabularyItem = {
  term: string;
  meaningVi: string;
  example: string;
};

export type Foundation48DeepPattern = {
  pattern: string;
  meaningVi: string;
  examples: string[];
};

export type Foundation48DeepListeningItem = {
  id: string;
  text: string;
  meaningVi: string;
  question: string;
  options: string[];
  answer: string;
};

export type Foundation48DeepSpeakingItem = {
  id: string;
  text: string;
  meaningVi: string;
  focus: string;
};

export type Foundation48DeepQuizItem = {
  id: string;
  type: Foundation48ChallengeType;
  prompt: string;
  target: string;
  answer: string;
  acceptableAnswers?: string[];
  options?: string[];
  tokens?: string[];
  hint?: string;
  explanation?: string;
  /** Source listening items without a verified key must be practice-only and never consume hearts or score. */
  selfCheckOnly?: boolean;
  scoreEligible?: boolean;
  audioSrc?: string;
  audioLabel?: string;
  speakText?: string;
};

export type Foundation48DeepPicturePrompt = {
  id: string;
  prompt: string;
  answer: string;
  hint?: string;
  acceptableAnswers?: string[];
  alt: string;
  panel: number;
};

export type Foundation48DeepLesson = {
  readiness: 'complete' | 'future';
  learnerTitle: string;
  goalVi: string;
  vocabulary: Foundation48DeepVocabularyItem[];
  patterns: Foundation48DeepPattern[];
  grammarPoint: {
    title: string;
    explanationVi: string;
    examples: string[];
  };
  listening: Foundation48DeepListeningItem[];
  speaking: Foundation48DeepSpeakingItem[];
  quiz: Foundation48DeepQuizItem[];
  picturePrompts?: Foundation48DeepPicturePrompt[];
  summary: string[];
  review: {
    remember: string[];
    next: string;
  };
};

type DaySeed = {
  title: string;
  goal: string;
  grammarTitle: string;
  grammar: string;
  vocabulary: Array<[string, string, string]>;
  patterns: Array<[string, string, string[]]>;
  sentences: Array<[string, string]>;
  fills: Array<[string, string, string]>;
  orders: Array<[string, string]>;
  choices: Array<[string, string, string[]]>;
  finalPrompt: string;
  picturePrompts?: Foundation48DeepPicturePrompt[];
};

function uniqueOptions(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).slice(0, 4);
}

function shuffleTokens(sentence: string, seed: string) {
  const words = sentence.replace(/[.!?]/g, '').split(/\s+/).filter(Boolean);
  return shuffleTokensForQuestion(words, seed);
}

function buildDay5SourceQuiz(): Foundation48DeepQuizItem[] {
  const verbForms: Array<[string, string, string]> = [
    ['watch', 'watches', 'watch ends in ch, so add es.'],
    ['study', 'studies', 'study ends in consonant + y, so change y to ies.'],
    ['play', 'plays', 'play ends in vowel + y, so add s.'],
    ['dance', 'dances', 'Add s to dance.'],
    ['go', 'goes', 'go changes to goes.'],
    ['do', 'does', 'do changes to does.'],
    ['visit', 'visits', 'Add s to visit.'],
    ['wash', 'washes', 'wash ends in sh, so add es.'],
  ];
  const writtenForms = verbForms.map(([verb, answer, hint]): Foundation48DeepQuizItem => ({
    id: `day-5-source-verb-form-${verb}`,
    type: 'fill-blank',
    prompt: `Add s/es for he, she, or it: ${verb} → ___`,
    target: `${verb} → ${answer}`,
    answer,
    hint,
    explanation: `${verb} → ${answer}. ${hint}`,
  }));
  const choices: Array<[string, string, string, string[]]> = [
    ['She ___ letters to her friends.', 'writes', 'She uses the third-person singular form writes.', ['write', 'writed', 'is write']],
    ['They ___ books before bedtime.', 'read', 'They takes the base form read.', ['reads', 'reading', 'are read']],
    ['His sisters ___ maths at home.', 'study', 'Sisters is plural, so use study.', ['studies', 'studys', 'are study']],
    ['My children ___ candies.', 'enjoy', 'Children is plural, so use enjoy.', ['enjoys', 'enjoyes', 'is enjoy']],
    ['We ___ to music in the morning.', 'listen', 'We uses the base form listen.', ['listens', 'listened', 'is listen']],
    ['My parents ___ TV at night.', 'watch', 'Parents is plural, so use watch.', ['watches', 'watchs', 'are watches']],
    ['Her brother ___ his bike to university.', 'rides', 'Brother is singular, so use rides.', ['ride', 'rided', 'is ride']],
    ['She ___ the dishes after dinner.', 'washes', 'Wash ends in sh, so add es.', ['wash', 'washs', 'is wash']],
    ['Huy ___ at parties.', 'sings', 'Huy is one person, so use sings.', ['sing', 'singes', 'is sing']],
    ['They ___ their parents with housework.', 'help', 'They uses the base form help.', ['helps', 'helped', 'are helps']],
    ['Susan ___ badminton.', 'likes', 'Susan is one person, so use likes.', ['like', 'likies', 'is like']],
    ['Their students ___ chess every day.', 'play', 'Students is plural, so use play.', ['plays', 'playes', 'are play']],
  ];
  return [
    ...writtenForms,
    ...choices.map(([prompt, answer, explanation, distractors], index): Foundation48DeepQuizItem => ({
      id: `day-5-source-choice-${index + 1}`,
      type: 'multiple-choice',
      prompt,
      target: prompt,
      answer,
      options: uniqueOptions([answer, ...distractors]),
      hint: 'Check the subject first: I/you/we/they use the base form; he/she/it adds s or es.',
      explanation,
    })),
  ];
}

function buildDay14SourceQuiz(): Foundation48DeepQuizItem[] {
  const transformations: Array<[string, string, string]> = [
    ['I ___ with my friends at 9:30 last night. (chat)', 'was chatting', 'Quá khứ tiếp diễn: was/were + động từ thêm -ing.'],
    ['His children ___ games when he came home. (not/play)', 'were not playing', 'Children dùng were; phủ định là were not + V-ing.'],
    ['My father ___ my bicycle at 4:30 yesterday. (fix)', 'was fixing', 'My father dùng was + động từ thêm -ing.'],
    ['Complete both blanks: ___ he ___ at the factory at 5:00 yesterday? (work)', 'Was working', 'Câu hỏi dùng Was + chủ ngữ + V-ing.'],
    ['Their parents ___ to the supermarket at 3:00 yesterday. (drive)', 'were driving', 'Parents dùng were + động từ thêm -ing.'],
  ];
  const multipleChoice: Array<[string, string, string[]]> = [
    ['At 5:00 yesterday, we ___ the movie.', 'were watching', ['watched', 'are watching']],
    ['Yesterday I met her while I ___.', 'was walking', ['am walking', 'walked']],
    ['The power went out while I ___ at home yesterday.', 'was staying', ['did stay', 'stayed']],
    ['We ___ an accident last month.', 'had', ['were having', 'have']],
    ['They ___ to music when I came last night.', 'were listening', ['are listening', 'listened']],
    ['Jina ___ with her family at 10:00 last night.', 'was talking', ['is talking', 'talked']],
    ['She ___ for the bus at 4:30 yesterday.', 'was waiting', ['wait', 'are waiting']],
    ['I ___ a cartoon at 4 p.m. yesterday.', 'was watching', ['am watching', 'watched']],
    ['My mother ___ the clothes at 8:00 last night.', 'was not washing', ['are not washing', 'do not wash']],
    ['His friend ___ coffee at 6:30 yesterday.', 'was drinking', ['am drinking', 'drink']],
    ['When I came yesterday, she ___ in the kitchen.', 'was cooking', ['is cooking', 'cooks']],
    ['The boys ___ volleyball at 6:00 yesterday afternoon.', 'were not playing', ['are not playing', 'do not play']],
    ['They ___ breakfast when we arrived yesterday.', 'were having', ['is having', 'are having']],
    ['I ___ to school when I met Tim.', 'was going', ['is going', 'go']],
    ['___ your children ___ homework at 3:30 yesterday?', 'Were — doing', ['Does — do', 'Did — did']],
  ];
  return [
    ...transformations.map(([prompt, answer, hint], index): Foundation48DeepQuizItem => ({
      id: `day-14-source-form-${index + 1}`,
      type: 'fill-blank', prompt, target: prompt, answer, hint,
      explanation: `Đáp án: ${answer}. ${hint}`,
    })),
    ...multipleChoice.map(([prompt, answer, distractors], index): Foundation48DeepQuizItem => ({
      id: `day-14-source-choice-${index + 1}`,
      type: 'multiple-choice', prompt, target: prompt, answer,
      options: uniqueOptions([answer, ...distractors]),
      hint: 'Nhìn mốc thời gian và hành động đang diễn ra tại thời điểm đó.',
      explanation: `Đáp án đúng: ${answer}. Thì quá khứ tiếp diễn dùng was/were + V-ing.`,
    })),
  ];
}

function buildDay15SourceQuiz(): Foundation48DeepQuizItem[] {
  const participles: Array<[string, string]> = [
    ['stop', 'stopped'], ['marry', 'married'], ['be', 'been'], ['eat', 'eaten'], ['tell', 'told'],
  ];
  const agreement: Array<[string, string, string[]]> = [
    ['I ___ lived here for 5 years.', 'have', ['has', 'had']],
    ['She ___ worked at the factory for 2 months.', 'has', ['have', 'had']],
    ['We ___ just received a message from her.', 'have', ['has', 'had']],
    ['He ___ just lost his key.', 'has', ['have', 'had']],
    ['___ you ever been to Paris?', 'Have', ['Has', 'Had']],
  ];
  const presentPerfectForms: Array<[string, string, string]> = [
    ['They ___ the bicycle since 8:00 a.m. (fix)', 'have fixed', 'They dùng have; fix thêm -ed thành fixed.'],
    ['He ___ here for 6 months. (live)', 'has lived', 'He dùng has; live thêm -d thành lived.'],
    ['My father ___ my room recently. (paint)', 'has painted', 'My father dùng has; paint thêm -ed thành painted.'],
    ['My sister ___ in the park for 20 minutes. (run)', 'has run', 'My sister dùng has; quá khứ phân từ của run là run.'],
    ['We ___ English for 3 weeks. (study)', 'have studied', 'We dùng have; study đổi y thành ied.'],
  ];
  const multipleChoice: Array<[string, string, string[]]> = [
    ['She ___ this game for 3 hours.', 'has played', ['have played', 'is playing']],
    ['Have you ever ___ chess?', 'played', ['play', 'playing']],
    ['We ___ already watched that movie.', 'have', ['has', 'did not']],
    ['She ___ already ___ her homework.', 'has — finished', ['have — finished', 'does not — finish']],
    ['We have just ___ breakfast.', 'had', ['have', 'has']],
    ['He ___ this watch for 5 years.', 'has worn', ['was wearing', 'wears']],
    ['___ your daughter ever drawn a picture?', 'Has', ['Have', 'Did']],
    ['My parents have recently ___ a new house.', 'bought', ['buys', 'buy']],
    ['She ___ just ___ her keys.', 'has — found', ['is — finding', 'have — found']],
    ['They ___ her since 2010.', 'have not seen', ['do not see', 'did not see']],
  ];
  return [
    ...participles.map(([verb, answer], index): Foundation48DeepQuizItem => ({
      id: `day-15-source-participle-${index + 1}`,
      type: 'fill-blank', prompt: `Write the past participle: ${verb} → ___`,
      target: `${verb} → ${answer}`, answer,
      hint: `Quá khứ phân từ của ${verb} là ${answer}.`,
      explanation: `${verb} → ${answer}. Học riêng dạng quá khứ phân từ để dùng sau have/has.`,
    })),
    ...agreement.map(([prompt, answer, distractors], index): Foundation48DeepQuizItem => ({
      id: `day-15-source-agreement-${index + 1}`,
      type: 'multiple-choice', prompt, target: prompt, answer,
      options: uniqueOptions([answer, ...distractors]),
      hint: 'Have đi với I/you/we/they; has đi với he/she/it.',
      explanation: `Chủ ngữ này dùng ${answer.toLowerCase()} trong thì hiện tại hoàn thành.`,
    })),
    ...presentPerfectForms.map(([prompt, answer, hint], index): Foundation48DeepQuizItem => ({
      id: `day-15-source-form-${index + 1}`,
      type: 'fill-blank', prompt, target: prompt, answer, hint,
      explanation: `Đáp án: ${answer}. ${hint}`,
    })),
    ...multipleChoice.map(([prompt, answer, distractors], index): Foundation48DeepQuizItem => ({
      id: `day-15-source-choice-${index + 1}`,
      type: 'multiple-choice', prompt, target: prompt, answer,
      options: uniqueOptions([answer, ...distractors]),
      hint: 'Nhìn chủ ngữ, dấu hiệu thời gian và quá khứ phân từ.',
      explanation: `Đáp án đúng: ${answer}. Hiện tại hoàn thành dùng have/has + past participle.`,
    })),
  ];
}

function buildDay16SourceQuiz(): Foundation48DeepQuizItem[] {
  const transformations: Array<[string, string, string]> = [
    ['They ___ home tonight. (return)', 'will return', 'Tương lai đơn dùng will + động từ nguyên mẫu.'],
    ['We ___ better soon. (be)', 'will be', 'Sau will giữ nguyên động từ be.'],
    ['Complete both blanks: ___ he ___ a story tomorrow? (tell)', 'Will tell', 'Câu hỏi đưa Will lên trước chủ ngữ; động từ tell giữ nguyên mẫu.'],
    ['I ___ him the book next week. (lend)', 'will lend', 'Sau will dùng động từ nguyên mẫu lend.'],
    ['Quang ___ his car next year. (not/sell)', 'will not sell', 'Phủ định tương lai đơn dùng will not + động từ nguyên mẫu.'],
  ];
  const multipleChoice: Array<[string, string, string[]]> = [
    ['This bag is so big. I ___ it for you.', 'will carry', ['carried', 'have carried']],
    ['They ___ the meeting soon.', 'will cancel', ['cancelled', 'have cancelled']],
    ['I don’t think it ___ tomorrow.', 'will rain', ['rains', 'rained']],
    ['It’s cold. I ___ on the heater.', 'will turn', ['is turning', 'turned']],
    ['We ___ a new house next year.', 'will not buy', ['did not buy', 'have not bought']],
    ['I think she ___ back tomorrow.', 'will go', ['goes', 'went']],
    ['___ you write your essay tonight?', 'Will', ['Are', 'Have']],
    ['I think it ___ hot tomorrow.', 'will be', ['was', 'is']],
    ['Your parents ___ your dog soon.', 'will feed', ['feed', 'do not feed']],
    ['Freddy ___ a picture next week.', 'will bring', ['have brought', 'bring']],
  ];
  return [
    ...transformations.map(([prompt, answer, hint], index): Foundation48DeepQuizItem => ({
      id: `day-16-source-form-${index + 1}`,
      type: 'fill-blank', prompt, target: prompt, answer, hint,
      explanation: `Đáp án: ${answer}. ${hint}`,
    })),
    ...multipleChoice.map(([prompt, answer, distractors], index): Foundation48DeepQuizItem => ({
      id: `day-16-source-choice-${index + 1}`,
      type: 'multiple-choice', prompt, target: prompt, answer,
      options: uniqueOptions([answer, ...distractors]),
      hint: 'Nhìn mốc thời gian hoặc ngữ cảnh dự đoán/đề nghị rồi dùng will + động từ nguyên mẫu.',
      explanation: `Đáp án đúng: ${answer}. Tương lai đơn dùng will/won’t + động từ nguyên mẫu.`,
    })),
  ];
}

function buildDay17SourceQuiz(): Foundation48DeepQuizItem[] {
  const transformations: Array<[string, string, string]> = [
    ['By tomorrow, I ___ the project. (complete)', 'will have completed', 'Future perfect uses will have + past participle; complete becomes completed.'],
    ['Next month, my father ___ for the factory for a year. (work)', 'will have worked', 'Use will have worked for the duration reached by the future checkpoint.'],
    ['I ___ the letter by 5 p.m. today. (not/send)', 'will not have sent', 'The negative form is will not have + past participle; send becomes sent.'],
    ['He ___ the book by the end of the day. (return)', 'will have returned', 'Return becomes returned after will have.'],
    ['Complete both blanks: ___ you ___ in Hanoi by tomorrow afternoon? (arrive)', 'Will have arrived', 'Questions begin with Will + subject + have + past participle.'],
  ];
  const multipleChoice: Array<[string, string, string[]]> = [
    ['She will have ___ the novel by 5:00.', 'finished', ['finish', 'finishing']],
    ['He won’t ___ written the essay by tomorrow.', 'have', ['has', 'had']],
    ['Next week, I ___ here for two years.', 'will have worked', ['will work', 'am working']],
    ['We ___ married for three years by next month.', 'will have been', ['will be', 'will have']],
    ['Our guests are coming at 7:30. I will ___ by then.', 'have finished', ['has finished', 'had finish']],
    ['By next week, Linda will have ___.', 'graduated', ['graduate', 'graduating']],
    ['My baby ___ for two hours by 9:00.', 'will have slept', ['will sleep', 'has slept']],
    ['I hope that I will have ___ my exam by summer.', 'passed', ['pass', 'passing']],
    ['Choose the form that describes the work still being incomplete at the Friday cutoff: Sophia ___ work by the end of this week.', 'won’t have finished', ['won’t has finished', 'didn’t finish']],
    ['Will you ___ the report by 6:00 tomorrow?', 'have finished', ['had finished', 'has finished']],
    ['My brother ___ in hospital for two weeks by next week.', 'will have been', ['has been', 'will be']],
    ['We ___ the project by the end of this week.', 'will have completed', ['are completing', 'completed']],
    ['His sister-in-law ___ at this bank for three years by next month.', 'will have worked', ['has worked', 'will work']],
    ['They ___ home by 7:30 tonight.', 'won’t have gone', ['won’t had gone', 'didn’t go']],
    ['Next week, we ___ in Paris for two years.', 'will have lived', ['have lived', 'will live']],
    ['She ___ by 6:00 today.', 'won’t have finished', ['won’t has finished', 'doesn’t finish']],
    ['By next week, my grandfather ___ for two months. (Use the grammatically complete form for the state “retired.”)', 'will have been retired', ['will have retired', 'has retired']],
    ['Susan ___ by the end of next month.', 'will have left', ['has left', 'will leave']],
    ['He ___ this novel by the end of this week.', 'will have read', ['is reading', 'read']],
    ['They ___ the film by the end of this month.', 'will have finished', ['will finish', 'finished']],
    ['Next month, we ___ in New York for two years.', 'will have been', ['will be', 'have been']],
    ['It’s very hot. I ___ the fan. (A decision made now)', 'will turn on', ['will have turned on', 'turned on']],
    ['By next year, she ___ from university.', 'will have graduated', ['will graduate', 'graduated']],
    ['I think it ___ tomorrow morning. (A prediction)', 'will rain', ['will have rained', 'rained']],
    ['The report is still missing. Choose the form that says it will remain unreceived at tomorrow’s deadline: My teacher ___.', 'won’t have received it', ['will not receive it', 'didn’t receive it']],
    ['The homework must be complete before 7 p.m. My son ___ it by then.', 'will have done', ['will do', 'has done']],
    ['___ they ___ to a new flat by the end of this month?', 'Will — have moved', ['Do — move', 'Are — moving']],
    ['Next year, I ___ him for ten years.', 'will have known', ['knew', 'don’t know']],
    ['I have not started painting. Choose the form that describes the house’s unfinished state at next month’s checkpoint: By next month, I ___.', 'won’t have painted the house yet', ['didn’t paint the house', 'don’t paint the house']],
    ['Next month, I ___ English for two years.', 'will have learnt', ['am learning', 'was learning']],
    ['Next week, they ___ at university for a month.', 'will have studied', ['has studied', 'don’t study']],
    ['By 6 p.m. today, his mother ___ dinner.', 'will have cooked', ['has cooked', 'was cooking']],
    ['We ___ your suitcase by the end of the day.', 'will have found', ['are finding', 'hasn’t found']],
    ['Choose the form that describes the essay as incomplete at tomorrow’s deadline: By tomorrow, I ___.', 'won’t have written the essay yet', ['didn’t write the essay', 'will not write the essay']],
  ];
  return [
    ...transformations.map(([prompt, answer, hint], index): Foundation48DeepQuizItem => ({
      id: `day-17-source-form-${index + 1}`,
      type: 'fill-blank', prompt, target: prompt, answer, hint,
      explanation: `Answer: ${answer}. ${hint}`,
    })),
    ...multipleChoice.map(([prompt, answer, distractors], index): Foundation48DeepQuizItem => ({
      id: `day-17-source-choice-${index + 1}`,
      type: 'multiple-choice', prompt, target: prompt, answer,
      options: uniqueOptions([answer, ...distractors]),
      hint: 'Tìm mốc tương lai: by + thời điểm hoặc next + khoảng thời gian; sau will have dùng V3.',
      explanation: `Answer: ${answer}. Future perfect uses will have + past participle; a continuing state such as “be retired” uses will have been + adjective/state.`,
    })),
  ];
}

const day18IpaSourceQuestions: Array<[string, string, string[]]> = [
  ['/ɪ/: từ nào có âm này?', 'kitchen', ['hot', 'food', 'work']],
  ['/e/: từ nào có âm này?', 'help', ['have', 'fan', 'bird']],
  ['/ʌ/: từ nào có âm này?', 'lunch', ['afternoon', 'green', 'stop']],
  ['/z/: từ nào có âm này?', 'cousin', ['classmate', 'think', 'wish']],
  ['/ŋ/: từ nào có âm này?', 'shopping', ['centre', 'summer', 'city']],
  ['/eɪ/: từ nào có âm này?', 'change', ['meet', 'think', 'book']],
  ['/ɒ/: từ nào có âm này theo giọng Anh-Anh?', 'stop', ['see', 'food', 'green']],
  ['/d/: từ nào có âm này?', 'lend', ['share', 'chat', 'think']],
  ['/æ/: từ nào có âm này?', 'chat', ['work', 'bird', 'food']],
  ['/dʒ/: từ nào bắt đầu bằng âm này?', 'juice', ['brother', 'teacher', 'think']],
  ['/ɔɪ/: từ nào có âm này?', 'boy', ['fix', 'meet', 'stop']],
  ['/ɑː/: từ nào có âm này theo giọng Anh-Anh?', 'art', ['think', 'bed', 'hot']],
  ['/əʊ/: từ nào có âm này theo giọng Anh-Anh?', 'wardrobe', ['watch', 'have', 'lunch']],
  ['/θ/: từ nào có âm này?', 'birthday', ['become', 'brother', 'green']],
  ['/ɡ/: từ nào bắt đầu bằng âm này?', 'begin', ['finish', 'think', 'share']],
  ['/p/: từ nào bắt đầu bằng âm này?', 'pillow', ['hat', 'bird', 'weather']],
  ['/k/: từ nào bắt đầu bằng âm này?', 'complete', ['chat', 'juice', 'thin']],
  ['/ə/: từ nào có âm schwa?', 'accident', ['bike', 'stop', 'green']],
  ['/ʃ/: từ nào kết thúc bằng âm này?', 'wash', ['match', 'chat', 'lend']],
  ['/tʃ/: từ nào bắt đầu bằng âm này?', 'teacher', ['doctor', 'brother', 'weather']],
];

function buildDay18SourceQuiz(): Foundation48DeepQuizItem[] {
  return day18IpaSourceQuestions.map(([prompt, answer, distractors], index): Foundation48DeepQuizItem => ({
    id: `day-18-source-choice-${index + 1}`,
    type: 'multiple-choice',
    prompt,
    target: prompt,
    answer,
    options: uniqueOptions([answer, ...distractors]),
    hint: 'Đọc ký hiệu IPA trước, sau đó phát âm từng từ chậm và so sánh âm đang được hỏi.',
    explanation: `Âm mục tiêu có trong “${answer}”. Chú ý cách ghi IPA Anh-Anh của bài và khác biệt phát âm theo vùng.`,
  }));
}

const day19StressPositionQuestions: Array<[string, string]> = [
  ['uncle /ˈʌŋkl/: trọng âm chính rơi vào âm tiết nào?', 'âm tiết thứ nhất'],
  ['garden /ˈɡɑːdn/: trọng âm chính rơi vào âm tiết nào?', 'âm tiết thứ nhất'],
  ['exam /ɪɡˈzæm/: trọng âm chính rơi vào âm tiết nào?', 'âm tiết thứ hai'],
  ['children /ˈtʃɪldrən/: trọng âm chính rơi vào âm tiết nào?', 'âm tiết thứ nhất'],
  ['midday /ˌmɪdˈdeɪ/: trọng âm chính rơi vào âm tiết nào?', 'âm tiết thứ hai'],
  ['banana /bəˈnɑːnə/: trọng âm chính rơi vào âm tiết nào?', 'âm tiết thứ hai'],
  ['tomorrow /təˈmɒrəʊ/: trọng âm chính rơi vào âm tiết nào?', 'âm tiết thứ hai'],
  ['grandmother /ˈɡrænmʌðə(r)/: trọng âm chính rơi vào âm tiết nào?', 'âm tiết thứ nhất'],
  ['Saturday /ˈsætədeɪ/: trọng âm chính rơi vào âm tiết nào?', 'âm tiết thứ nhất'],
  ['understand /ˌʌndəˈstænd/: trọng âm chính rơi vào âm tiết nào?', 'âm tiết thứ ba'],
];

const day19StressWordQuestions: Array<[string, string, string[]]> = [
  ['Từ nào có trọng âm chính rơi vào âm tiết thứ nhất?', 'question', ['guitar', 'retire', 'tonight']],
  ['Từ nào có trọng âm chính rơi vào âm tiết thứ hai?', 'retire', ['homework', 'finish', 'question']],
  ['Từ nào có trọng âm chính rơi vào âm tiết thứ nhất?', 'finish', ['complete', 'guitar', 'retire']],
  ['Từ nào có trọng âm chính rơi vào âm tiết thứ ba?', 'afternoon', ['accident', 'question', 'hotel']],
  ['Từ nào có trọng âm chính rơi vào âm tiết thứ hai?', 'tonight', ['hungry', 'question', 'open']],
];

function buildDay19SourceQuiz(): Foundation48DeepQuizItem[] {
  const positions = day19StressPositionQuestions.map(([prompt, answer], index): Foundation48DeepQuizItem => ({
    id: `day-19-source-position-${index + 1}`,
    type: 'multiple-choice',
    prompt,
    target: prompt,
    answer,
    options: uniqueOptions([answer, 'âm tiết thứ nhất', 'âm tiết thứ hai', 'âm tiết thứ ba']),
    hint: 'Dấu ˈ đứng ngay trước âm tiết mang trọng âm chính. Bỏ qua dấu ˌ nếu câu hỏi hỏi trọng âm chính.',
    explanation: `Dấu ˈ trong phiên âm chỉ trọng âm chính ở ${answer}.`,
  }));
  const words = day19StressWordQuestions.map(([prompt, answer, distractors], index): Foundation48DeepQuizItem => ({
    id: `day-19-source-word-${index + 1}`,
    type: 'multiple-choice',
    prompt,
    target: prompt,
    answer,
    options: uniqueOptions([answer, ...distractors]),
    hint: 'Đọc dấu ˈ trong IPA; nếu chưa chắc, kiểm tra từ điển thay vì đoán theo hậu tố.',
    explanation: `“${answer}” có trọng âm chính ở âm tiết được hỏi.`,
  }));
  return [...positions, ...words];
}

const day20WordBankQuestions: Array<[string, string, string]> = [
  ['___ was the film? — It was great!', 'How', 'How hỏi cảm nhận hoặc tình trạng.'],
  ['___ are you late? — Because it is raining.', 'Why', 'Why hỏi lý do; câu trả lời bắt đầu bằng Because.'],
  ['___ does this book cost? — It is VND 50,000.', 'How much', 'How much dùng để hỏi giá.'],
  ['___ do you water the plants? — Twice a week.', 'How often', 'Câu trả lời “Twice a week” là tần suất; tài liệu thi thiếu How often trong khung từ.'],
  ['___ students are there in your class? — There are 41 students.', 'How many', 'How many hỏi số lượng danh từ đếm được số nhiều.'],
];

const day20QuestionConstruction: Array<[string, string, string]> = [
  ['Viết câu hỏi: ____________. Gợi ý: How / you · câu trả lời: I am fine, thank you.', 'How are you', 'Dùng How + be + chủ ngữ để hỏi thăm tình trạng.'],
  ['Viết câu hỏi: ____________. Gợi ý: How much / this hat / cost · câu trả lời: It is VND 40,000.', 'How much does this hat cost', 'Câu hỏi giá với động từ thường dùng How much + does + chủ ngữ + cost.'],
  ['Viết câu hỏi: ____________. Gợi ý: How many / cats / you / have · câu trả lời: I have 3 cats.', 'How many cats do you have', 'How many đứng trước danh từ số nhiều; tiếp theo dùng do + chủ ngữ + động từ.'],
  ['Viết câu hỏi: ____________. Gợi ý: How long / you / live / in Hanoi · câu trả lời: For 5 years.', 'How long have you lived in Hanoi', 'For 5 years trả lời khoảng thời gian; dùng How long have you lived…?'],
  ['Viết câu hỏi: ____________. Gợi ý: Why / you / hate / winter · câu trả lời: Because it is cold.', 'Why do you hate winter', 'Why hỏi lý do; dùng do + chủ ngữ + động từ.'],
];

const day20SourceChoiceQuestions: Array<[string, string, string[], string]> = [
  ['_____ do you go to the library? — Once a week.', 'How often', ['Why', 'How far', 'How many'], 'Once a week nêu tần suất.'],
  ['_____ were you late today? — Because I was tired.', 'Why', ['Which', 'How', 'How many'], 'Because I was tired nêu lý do.'],
  ['_____ is it from your house to your school? — It’s 1 kilometre.', 'How far', ['Why', 'Which', 'How long'], 'Kilometre là đơn vị khoảng cách.'],
  ['_____ essays did you write? — Three essays.', 'How many', ['Why', 'How', 'How often'], 'Essays là danh từ đếm được số nhiều.'],
  ['_____ do you go to work every day? — By bus.', 'How', ['Why', 'Which', 'How often'], 'By bus mô tả cách/phương tiện đi lại.'],
  ['_____ vase did Tim break? — The yellow vase.', 'Which', ['Why', 'How', 'How many'], 'Câu hỏi chọn một chiếc bình cụ thể.'],
  ['_____ is your mother? — She is fine.', 'How', ['How many', 'How often', 'Why'], 'How is your mother? hỏi tình trạng/sức khỏe.'],
  ['How _____ is your daughter? — She’s 10 years old.', 'old', ['many', 'much', 'far'], 'How old hỏi tuổi.'],
  ['_____ are you eating that cake? — Because I’m hungry.', 'Why', ['Which', 'How', 'How long'], 'Because I’m hungry nêu lý do.'],
  ['_____ has your father worked in the factory? — For 3 years.', 'How long', ['How far', 'What', 'How often'], 'For 3 years nêu khoảng thời gian.'],
];

function buildDay20SourceQuiz(): Foundation48DeepQuizItem[] {
  const wordBank = day20WordBankQuestions.map(([prompt, answer, hint], index): Foundation48DeepQuizItem => ({
    id: `day-20-source-bank-${index + 1}`,
    type: 'fill-blank',
    prompt,
    target: prompt,
    answer,
    hint,
    explanation: `Đáp án: ${answer}. ${hint}`,
  }));
  const construction = day20QuestionConstruction.map(([prompt, answer, hint], index): Foundation48DeepQuizItem => ({
    id: `day-20-source-build-${index + 1}`,
    type: 'fill-blank',
    prompt,
    target: prompt,
    answer,
    hint,
    explanation: `Câu hỏi hoàn chỉnh: ${answer}? ${hint}`,
  }));
  const choices = day20SourceChoiceQuestions.map(([prompt, answer, distractors, hint], index): Foundation48DeepQuizItem => ({
    id: `day-20-source-choice-${index + 1}`,
    type: 'multiple-choice',
    prompt,
    target: prompt,
    answer,
    options: uniqueOptions([answer, ...distractors]),
    hint,
    explanation: `Đáp án: ${answer}. ${hint}`,
  }));
  return [...wordBank, ...construction, ...choices];
}

function buildDay20NumberDictation(): Foundation48DeepQuizItem[] {
  const numbers: Array<[string, string, string]> = [
    ['13', 'thirteen', 'Listen for teen, not the shorter ty ending.'],
    ['30', 'thirty', 'Listen for the ty ending.'],
    ['14', 'fourteen', 'The teen ending marks fourteen.'],
    ['40', 'forty', 'Forty drops the u from four.'],
    ['15', 'fifteen', 'Listen for teen, not fifty.'],
    ['50', 'fifty', 'Listen for the ty ending.'],
    ['19', 'nineteen', 'Listen for teen, not ninety.'],
    ['90', 'ninety', 'Listen for the ty ending.'],
    ['21', 'twenty-one', 'Join the tens and ones with a hyphen.'],
    ['43', 'forty-three', 'Say the tens before the ones.'],
    ['105', 'one hundred and five', 'Keep the hundred and final unit in order.'],
    ['309', 'three hundred and nine', 'Do not add a tens digit when the tens place is zero.'],
    ['1,024', 'one thousand and twenty-four', 'Group the number into thousands, then tens and ones.'],
    ['12,500', 'twelve thousand five hundred', 'Read the thousands group before the hundreds.'],
    ['230,017', 'two hundred and thirty thousand and seventeen', 'Keep the zero tens place; the final group is seventeen.'],
    ['3,405,090', 'three million four hundred and five thousand and ninety', 'Read each million/thousand group in order.'],
    ['42,000,000', 'forty-two million', 'Name the million group and skip the zero groups.'],
    ['1,000,000,000', 'one billion', 'One billion is the top cardinal example in this unit.'],
  ];
  const ordinals: Array<[string, string, string]> = [
    ['1st', 'first', 'First is irregular.'],
    ['2nd', 'second', 'Second is irregular.'],
    ['3rd', 'third', 'Third is irregular.'],
    ['4th', 'fourth', 'Use fourth; the source chart typo “forth” is corrected.'],
    ['5th', 'fifth', 'Five changes to fifth.'],
    ['8th', 'eighth', 'Eight changes to eighth.'],
    ['9th', 'ninth', 'Nine changes to ninth.'],
    ['12th', 'twelfth', 'Twelve changes to twelfth.'],
    ['20th', 'twentieth', 'Twenty changes to twentieth.'],
    ['21st', 'twenty-first', 'Keep the ordinal ending on the final unit.'],
    ['30th', 'thirtieth', 'Thirty changes to thirtieth.'],
    ['40th', 'fortieth', 'Forty changes to fortieth.'],
    ['90th', 'ninetieth', 'Ninety changes to ninetieth.'],
  ];
  const buildItem = (kind: 'cardinal' | 'ordinal', item: [string, string, string], index: number): Foundation48DeepQuizItem => ({
    id: `day-20-number-dictation-${kind}-${index + 1}`,
    type: 'fill-blank',
    prompt: `Nghe cách đọc ${kind === 'cardinal' ? 'số đếm' : 'số thứ tự'} rồi ghi bằng số vào ô trống: ___`,
    target: item[1],
    answer: item[0].replaceAll(',', ''),
    acceptableAnswers: [item[0]],
    speakText: item[1],
    hint: item[2],
    explanation: `${item[1]} → ${item[0]}. ${item[2]}`,
  });
  return [
    ...numbers.map((item, index) => buildItem('cardinal', item, index)),
    ...ordinals.map((item, index) => buildItem('ordinal', item, index)),
  ];
}

function buildDay21SourceQuiz(): Foundation48DeepQuizItem[] {
  const audio = (track: number) => ({
    audioSrc: `/assets/foundation48/audio/day-21/${String(track).padStart(2, '0')}-${track}.mp3`,
    audioLabel: `mp3.${track}`,
    selfCheckOnly: true,
    scoreEligible: false,
    hint: 'Tệp nghe có nhiều câu liên tiếp. Nghe lại nhóm số hoặc tên tương ứng rồi tự đối chiếu với nội dung bạn vừa ghi.',
    explanation: 'Đáp án trong phiếu gốc chưa có bản văn bản kiểm chứng. Đây là lượt nghe luyện tập: không trừ Bọt Biển, không tính điểm và không tạo lỗi ôn tập.',
  });
  const numberChoices: Array<[string, string[]]> = [
    ['8', ['9']], ['13', ['15']], ['31', ['41']], ['120', ['150']], ['1780', ['1785']],
  ];
  const letterChoices: Array<[string, string[]]> = [
    ['L', ['G']], ['R', ['A']], ['I', ['E']], ['J', ['F']], ['B', ['P']],
  ];
  return [
    ...numberChoices.map(([first, [second]], index): Foundation48DeepQuizItem => ({
      id: `day-21-source-number-choice-${index + 1}`,
      type: 'multiple-choice',
      prompt: `Nghe ${audio(1).audioLabel}, câu ${index + 1}/5. Chọn số bạn nghe được.`,
      target: `mp3.1 · câu ${index + 1}`,
      answer: '',
      options: [first, second],
      ...audio(1),
    })),
    ...Array.from({ length: 6 }, (_, index): Foundation48DeepQuizItem => ({
      id: `day-21-source-number-dictation-${index + 1}`,
      type: 'fill-blank',
      prompt: `Nghe ${audio(2).audioLabel}, câu ${index + 1}/6. Ghi lại số: ___`,
      target: `mp3.2 · câu ${index + 1}`,
      answer: '',
      ...audio(2),
    })),
    ...Array.from({ length: 5 }, (_, index): Foundation48DeepQuizItem => ({
      id: `day-21-source-phone-dictation-${index + 1}`,
      type: 'fill-blank',
      prompt: `Nghe ${audio(3).audioLabel}, câu ${index + 1}/5. Ghi lại số điện thoại, giữ các số 0 đầu nếu có: ___`,
      target: `mp3.3 · câu ${index + 1}`,
      answer: '',
      ...audio(3),
    })),
    ...letterChoices.map(([first, [second]], index): Foundation48DeepQuizItem => ({
      id: `day-21-source-letter-choice-${index + 1}`,
      type: 'multiple-choice',
      prompt: `Nghe ${audio(4).audioLabel}, câu ${index + 1}/5. Chọn chữ cái bạn nghe được.`,
      target: `mp3.4 · câu ${index + 1}`,
      answer: '',
      options: [first, second],
      ...audio(4),
    })),
    ...Array.from({ length: 5 }, (_, index): Foundation48DeepQuizItem => ({
      id: `day-21-source-letter-dictation-${index + 1}`,
      type: 'fill-blank',
      prompt: `Nghe ${audio(5).audioLabel}, câu ${index + 1}/5. Gõ chữ cái bạn nghe được: ___`,
      target: `mp3.5 · câu ${index + 1}`,
      answer: '',
      ...audio(5),
    })),
    ...Array.from({ length: 5 }, (_, index): Foundation48DeepQuizItem => ({
      id: `day-21-source-name-dictation-${index + 1}`,
      type: 'fill-blank',
      prompt: `Nghe ${audio(6).audioLabel}, câu ${index + 1}/5. Gõ tên bạn nghe được: ___`,
      target: `mp3.6 · câu ${index + 1}`,
      answer: '',
      ...audio(6),
    })),
  ];
}

function buildDeepLesson(dayNumber: number, seed: DaySeed): Foundation48DeepLesson {
  const sentenceBank = seed.sentences.slice(0, dayNumber === 18 ? 6 : dayNumber === 19 || dayNumber === 20 ? 10 : 5);
  return {
    readiness: 'complete',
    learnerTitle: seed.title,
    goalVi: seed.goal,
    vocabulary: seed.vocabulary.map(([term, meaningVi, example]) => ({ term, meaningVi, example })),
    patterns: seed.patterns.map(([pattern, meaningVi, examples]) => ({ pattern, meaningVi, examples })),
    grammarPoint: {
      title: seed.grammarTitle,
      explanationVi: seed.grammar,
      examples: seed.sentences.slice(0, 3).map(([text]) => text),
    },
    listening: sentenceBank.map(([text, meaningVi], index) => ({
      id: `day-${dayNumber}-listen-${index + 1}`,
      text,
      meaningVi,
      question: dayNumber === 18
        ? 'Nghe nhóm từ và chọn bản đồ âm IPA tương ứng.'
        : dayNumber === 19 ? 'Nghe từ và chọn vị trí trọng âm chính.' : dayNumber === 20 ? 'Nghe câu rồi nhận ra câu hỏi đang hỏi cách thức, số lượng, giá, tuổi, tần suất hay thời gian.' : 'Nghe câu và chọn nghĩa tiếng Việt đúng.',
      options: uniqueOptions([meaningVi, ...sentenceBank.filter((_, optionIndex) => optionIndex !== index).map(([, translation]) => translation)]),
      answer: meaningVi,
    })),
    speaking: sentenceBank.map(([text, meaningVi], index) => ({
      id: `day-${dayNumber}-speak-${index + 1}`,
      text,
      meaningVi,
      focus: index % 2 === 0 ? 'Nói chậm, rõ chủ ngữ và động từ.' : 'Giữ nhịp đều, không nuốt âm cuối.',
    })),
    quiz: dayNumber === 5 ? [
      ...buildDay5SourceQuiz(),
      {
        id: `day-${dayNumber}-speak-review`,
        type: 'speaking-repeat' as const,
        prompt: seed.finalPrompt,
        target: sentenceBank[0]?.[0] ?? seed.finalPrompt,
        answer: sentenceBank[0]?.[0] ?? seed.finalPrompt,
        hint: 'Nghe mẫu rồi nói lại một câu thật rõ.',
        explanation: 'Câu nói lại được lưu vào vòng ôn nếu bạn thấy còn yếu.',
      },
    ] : dayNumber === 14 ? [
      ...buildDay14SourceQuiz(),
      {
        id: `day-${dayNumber}-speak-review`,
        type: 'speaking-repeat' as const,
        prompt: seed.finalPrompt,
        target: sentenceBank[0]?.[0] ?? seed.finalPrompt,
        answer: sentenceBank[0]?.[0] ?? seed.finalPrompt,
        hint: 'Nghe mẫu rồi nói lại một câu thật rõ.',
        explanation: 'Câu nói lại được lưu vào vòng ôn nếu bạn thấy còn yếu.',
      },
    ] : dayNumber === 15 ? [
      ...buildDay15SourceQuiz(),
      {
        id: `day-${dayNumber}-speak-review`,
        type: 'speaking-repeat' as const,
        prompt: seed.finalPrompt,
        target: sentenceBank[0]?.[0] ?? seed.finalPrompt,
        answer: sentenceBank[0]?.[0] ?? seed.finalPrompt,
        hint: 'Nghe mẫu rồi nói lại một câu thật rõ.',
        explanation: 'Câu nói lại được lưu vào vòng ôn nếu bạn thấy còn yếu.',
      },
    ] : dayNumber === 16 ? [
      ...buildDay16SourceQuiz(),
      {
        id: `day-${dayNumber}-speak-review`,
        type: 'speaking-repeat' as const,
        prompt: seed.finalPrompt,
        target: sentenceBank[0]?.[0] ?? seed.finalPrompt,
        answer: sentenceBank[0]?.[0] ?? seed.finalPrompt,
        hint: 'Nghe mẫu rồi nói lại một câu thật rõ.',
        explanation: 'Câu nói lại được lưu vào vòng ôn nếu bạn thấy còn yếu.',
      },
    ] : dayNumber === 17 ? [
      ...buildDay17SourceQuiz(),
      {
        id: `day-${dayNumber}-speak-review`,
        type: 'speaking-repeat' as const,
        prompt: seed.finalPrompt,
        target: sentenceBank[0]?.[0] ?? seed.finalPrompt,
        answer: sentenceBank[0]?.[0] ?? seed.finalPrompt,
        hint: 'Dùng mốc tương lai rõ ràng rồi đọc trọn cấu trúc will have + V3.',
        explanation: 'Phần nói tự luyện không bị chấm đúng/sai; bạn có thể nghe mẫu và tự đánh dấu đã luyện.',
      },
    ] : dayNumber === 18 ? [
      ...buildDay18SourceQuiz(),
      ...seed.choices.slice(0, 3).map(([prompt, answer, options], index) => ({
        id: `day-${dayNumber}-guided-choice-${index + 1}`,
        type: 'multiple-choice' as const,
        prompt,
        target: answer,
        answer,
        options: uniqueOptions([answer, ...options]),
        hint: 'So sánh cách đặt lưỡi, độ dài nguyên âm và sự rung của dây thanh quản.',
        explanation: seed.grammar,
      })),
      ...seed.fills.map(([prompt, answer, hint], index) => ({
        id: `day-${dayNumber}-guided-fill-${index + 1}`,
        type: 'fill-blank' as const,
        prompt,
        target: prompt,
        answer,
        hint,
        explanation: `Đáp án IPA: ${answer}. ${hint}`,
      })),
      ...seed.orders.map(([meaningVi, answer], index) => ({
        id: `day-${dayNumber}-guided-order-${index + 1}`,
        type: 'sentence-order' as const,
        prompt: meaningVi,
        target: answer,
        answer,
        tokens: shuffleTokens(answer, `day-${dayNumber}-guided-order-${index + 1}`),
        hint: 'Ghép các từ theo thứ tự để tạo mô tả phát âm tự nhiên.',
        explanation: `Câu hoàn chỉnh: ${answer}`,
      })),
      {
        id: `day-${dayNumber}-speak-review`,
        type: 'speaking-repeat' as const,
        prompt: seed.finalPrompt,
        target: sentenceBank[0]?.[0] ?? seed.finalPrompt,
        answer: sentenceBank[0]?.[0] ?? seed.finalPrompt,
        hint: 'Nghe từng từ rồi đọc chậm; không cần nói nhanh.',
        explanation: 'Tự đánh dấu đã luyện sau khi nghe và đọc lại cặp từ.',
      },
    ] : dayNumber === 19 ? [
      ...buildDay19SourceQuiz(),
      ...seed.choices.slice(0, 3).map(([prompt, answer, options], index) => ({
        id: `day-${dayNumber}-guided-choice-${index + 1}`,
        type: 'multiple-choice' as const,
        prompt,
        target: answer,
        answer,
        options: uniqueOptions([answer, ...options]),
        hint: 'Đọc dấu ˈ và kiểm tra vị trí trong phiên âm IPA.',
        explanation: seed.grammar,
      })),
      ...seed.fills.map(([prompt, answer, hint], index) => ({
        id: `day-${dayNumber}-guided-fill-${index + 1}`,
        type: 'fill-blank' as const,
        prompt,
        target: prompt,
        answer,
        hint,
        explanation: `Đáp án: ${answer}. ${hint}`,
      })),
      ...seed.orders.map(([meaningVi, answer], index) => ({
        id: `day-${dayNumber}-guided-order-${index + 1}`,
        type: 'sentence-order' as const,
        prompt: meaningVi,
        target: answer,
        answer,
        tokens: shuffleTokens(answer, `day-${dayNumber}-guided-order-${index + 1}`),
        hint: 'Đọc cả câu sau khi ghép để nhớ vị trí dấu trọng âm.',
        explanation: `Câu hoàn chỉnh: ${answer}`,
      })),
      {
        id: `day-${dayNumber}-speak-review`,
        type: 'speaking-repeat' as const,
        prompt: seed.finalPrompt,
        target: sentenceBank[0]?.[0] ?? seed.finalPrompt,
        answer: sentenceBank[0]?.[0] ?? seed.finalPrompt,
        hint: 'Đọc dấu ˈ rồi nói rõ âm tiết được nhấn.',
        explanation: 'Phần đọc luyện được tự đánh dấu; độ đúng không tính vào điểm trắc nghiệm.',
      },
    ] : dayNumber === 20 ? [
      ...buildDay20SourceQuiz(),
      ...buildDay20NumberDictation(),
      {
        id: `day-${dayNumber}-speak-review`,
        type: 'speaking-repeat' as const,
        prompt: seed.finalPrompt,
        target: sentenceBank[0]?.[0] ?? seed.finalPrompt,
        answer: sentenceBank[0]?.[0] ?? seed.finalPrompt,
        hint: 'Tự đặt một câu hỏi với How, Why hoặc Which; dùng nhịp chậm và rõ từ hỏi.',
        explanation: 'Phần nói tự luyện không bị chấm đúng/sai; bạn tự đánh dấu sau khi nói thành tiếng.',
      },
    ] : dayNumber === 21 ? [
      ...buildDay21SourceQuiz(),
    ] : [
      ...seed.choices.slice(0, 3).map(([prompt, answer, options], index) => ({
        id: `day-${dayNumber}-choice-${index + 1}`,
        type: 'multiple-choice' as const,
        prompt,
        target: answer,
        answer,
        options: uniqueOptions([answer, ...options]),
        hint: 'Nhìn chủ ngữ và động từ chính trước.',
        explanation: seed.grammar,
      })),
      ...seed.fills.slice(0, 3).map(([prompt, answer, hint], index) => ({
        id: `day-${dayNumber}-fill-${index + 1}`,
        type: 'fill-blank' as const,
        prompt,
        target: prompt,
        answer,
        hint,
        explanation: `Đáp án đúng là “${answer}” vì ${hint.toLowerCase()}`,
      })),
      ...seed.orders.slice(0, 2).map(([meaningVi, answer], index) => ({
        id: `day-${dayNumber}-order-${index + 1}`,
        type: 'sentence-order' as const,
        prompt: meaningVi,
        target: answer,
        answer,
        tokens: shuffleTokens(answer, `day-${dayNumber}-order-${index + 1}`),
        hint: 'Bắt đầu bằng chủ ngữ, sau đó đến động từ/trợ động từ.',
        explanation: `Câu đầy đủ: ${answer}`,
      })),
      {
        id: `day-${dayNumber}-speak-review`,
        type: 'speaking-repeat' as const,
        prompt: seed.finalPrompt,
        target: sentenceBank[0]?.[0] ?? seed.finalPrompt,
        answer: sentenceBank[0]?.[0] ?? seed.finalPrompt,
        hint: 'Nghe mẫu rồi nói lại một câu thật rõ.',
        explanation: 'Câu nói lại được lưu vào vòng ôn nếu bạn thấy còn yếu.',
      },
    ].slice(0, 9),
    picturePrompts: seed.picturePrompts ?? (dayNumber === 3 ? [
      { id: 'day-3-picture-1', prompt: 'What are these? Write a complete sentence.', answer: 'They are hats.', hint: '“Hats” is plural, so begin with “They are”.', acceptableAnswers: ['They are three hats.'], alt: 'A straw hat, a red cap, and a blue knitted hat', panel: 0 },
      { id: 'day-3-picture-2', prompt: 'What is this? Write a complete sentence.', answer: 'It is a cake.', hint: '“Cake” is one thing, so begin with “It is a”.', acceptableAnswers: ['This is a cake.'], alt: 'A birthday cake with a candle', panel: 1 },
      { id: 'day-3-picture-3', prompt: 'What are these? Write a complete sentence.', answer: 'They are pillows.', hint: '“Pillows” is plural, so begin with “They are”.', acceptableAnswers: ['These are pillows.'], alt: 'Two blue and white pillows', panel: 2 },
      { id: 'day-3-picture-4', prompt: 'Who are they? Write a complete sentence.', answer: 'They are doctors.', hint: 'For more than one person, use “They are”.', acceptableAnswers: ['They are three doctors.'], alt: 'Three doctors standing together', panel: 3 },
      { id: 'day-3-picture-5', prompt: 'What is this? Write a complete sentence.', answer: 'It is a handbag.', hint: '“Handbag” is one thing, so begin with “It is a”.', acceptableAnswers: ['This is a handbag.'], alt: 'A pink handbag with a short handle', panel: 4 },
    ] : dayNumber === 4 ? [
      { id: 'day-4-picture-1', prompt: 'Write where the boy is.', answer: 'He is at the airport.', hint: 'For a specific destination, use “at the ...”.', acceptableAnswers: ['The boy is at the airport.'], alt: 'A boy standing at an airport beside an airplane', panel: 0 },
      { id: 'day-4-picture-2', prompt: 'Write the time shown in the picture.', answer: 'It is three o’clock in the afternoon.', hint: 'Use “at” before a clock time, and name the part of day if you can.', acceptableAnswers: ['It is three o’clock.', 'The time is three o’clock.'], alt: 'A classroom clock showing three o’clock in the afternoon', panel: 1 },
      { id: 'day-4-picture-3', prompt: 'Write where the parents are.', answer: 'They are in the park.', hint: 'Use “in the park” for this place.', acceptableAnswers: ['The parents are in the park.'], alt: 'Two parents spending time together in a park', panel: 2 },
      { id: 'day-4-picture-4', prompt: 'Write where the cat is.', answer: 'The cat is on the sofa.', hint: 'Use “on” when something is resting on a surface.', acceptableAnswers: ['It is on the sofa.'], alt: 'A cat resting on a blue sofa', panel: 3 },
      { id: 'day-4-picture-5', prompt: 'Write when the birthday party is.', answer: 'The birthday party is at night.', hint: '“At night” names this part of the day.', acceptableAnswers: ['It is at night.', 'The party is at night.'], alt: 'Children celebrating a birthday party at night', panel: 4 },
    ] : undefined),
    summary: [
      seed.goal,
      `Điểm ngữ pháp: ${seed.grammarTitle}.`,
      `Từ/cụm chính: ${seed.vocabulary.slice(0, 5).map(([term]) => term).join(', ')}.`,
      'Hoàn thành nghe, nói, điền từ, xếp câu và mini test để Poo lưu tiến độ.',
    ],
    review: {
      remember: seed.patterns.slice(0, 3).map(([pattern]) => pattern),
      next: 'Ngày tiếp theo sẽ dùng lại câu hôm nay trong tình huống mới để tăng phản xạ.',
    },
  };
}

export { buildDeepLesson };
export type { DaySeed };

const seeds: Record<number, DaySeed> = {
  1: {
    title: 'Tôi là ai? — nói câu khẳng định/phủ định với to be',
    goal: 'Biết nói “tôi là…”, “bạn là…”, “cô ấy là…” và thêm not để phủ định.',
    grammarTitle: 'am / is / are đi với từng chủ ngữ',
    grammar: 'I đi với am; you/we/they đi với are; he/she/it đi với is. Khi phủ định, thêm not sau am/is/are.',
    vocabulary: [['I', 'tôi', 'I am a student.'], ['you', 'bạn', 'You are my friend.'], ['he', 'anh ấy', 'He is tall.'], ['she', 'cô ấy', 'She is kind.'], ['it', 'nó', 'It is small.'], ['we', 'chúng tôi', 'We are happy.'], ['they', 'họ', 'They are teachers.'], ['student', 'học sinh', 'I am a student.'], ['teacher', 'giáo viên', 'She is a teacher.'], ['happy', 'vui', 'They are happy.']],
    patterns: [['I am + noun/adjective', 'Tôi là/đang...', ['I am a student.', 'I am happy.']], ['You/We/They are + ...', 'Bạn/chúng ta/họ là...', ['You are my friend.', 'They are teachers.']], ['He/She/It is + ...', 'Anh ấy/cô ấy/nó là...', ['She is kind.', 'It is small.']], ['Subject + am/is/are + not', 'Câu phủ định với to be', ['I am not tired.', 'He is not tall.']]],
    sentences: [['I am a student.', 'Tôi là học sinh.'], ['She is happy.', 'Cô ấy vui.'], ['They are teachers.', 'Họ là giáo viên.'], ['He is not tall.', 'Anh ấy không cao.'], ['We are not sad.', 'Chúng tôi không buồn.']],
    fills: [['I ___ a student.', 'am', 'I luôn đi với am.'], ['She ___ happy.', 'is', 'She đi với is.'], ['They ___ teachers.', 'are', 'They đi với are.']],
    orders: [['Tôi là học sinh.', 'I am a student.'], ['Cô ấy không cao.', 'She is not tall.']],
    choices: [['Chọn câu đúng cho “Tôi là học sinh.”', 'I am a student.', ['I is a student.', 'I are a student.', 'I am student not.']], ['Chọn câu phủ định đúng.', 'He is not tall.', ['He not is tall.', 'He are not tall.', 'He am not tall.']], ['They đi với động từ nào?', 'are', ['am', 'is', 'not']]],
    finalPrompt: 'Nói lại một câu giới thiệu bản thân bằng to be.',
  },
  2: {
    title: 'Bạn có phải...? — hỏi Yes/No với to be',
    goal: 'Biết đưa am/is/are lên đầu câu để hỏi và trả lời Yes/No ngắn.',
    grammarTitle: 'Đảo am/is/are lên trước chủ ngữ để hỏi',
    grammar: 'Câu hỏi to be dùng Am/Is/Are ở đầu câu. Trả lời ngắn: Yes, I am. / No, she is not.',
    vocabulary: [['are you', 'bạn có phải không', 'Are you a student?'], ['is she', 'cô ấy có phải không', 'Is she your teacher?'], ['is he', 'anh ấy có phải không', 'Is he your brother?'], ['yes', 'vâng/có', 'Yes, I am.'], ['no', 'không', 'No, she is not.'], ['friend', 'bạn', 'Are you my friend?'], ['book', 'quyển sách', 'Is it your book?'], ['brother', 'anh/em trai', 'Is he your brother?'], ['sister', 'chị/em gái', 'Is she your sister?']],
    patterns: [['Are you + ...?', 'Bạn có phải/đang...? ', ['Are you a student?', 'Are you happy?']], ['Is he/she/it + ...?', 'Anh ấy/cô ấy/nó có phải...? ', ['Is she your teacher?', 'Is it your book?']], ['Yes/No + subject + be', 'Trả lời ngắn', ['Yes, I am.', 'No, he is not.']]],
    sentences: [['Are you a student?', 'Bạn có phải học sinh không?'], ['Yes, I am.', 'Vâng, đúng vậy.'], ['Is she your teacher?', 'Cô ấy có phải giáo viên của bạn không?'], ['No, she is not.', 'Không, cô ấy không phải.'], ['Is it your book?', 'Nó có phải sách của bạn không?']],
    fills: [['___ you a student?', 'Are', 'Câu hỏi với you dùng Are ở đầu.'], ['___ she your teacher?', 'Is', 'She đi với Is.'], ['No, he ___ not.', 'is', 'He đi với is.']],
    orders: [['Bạn có phải học sinh không?', 'Are you a student?'], ['Không, cô ấy không phải.', 'No, she is not.']],
    choices: [['Câu hỏi đúng là gì?', 'Are you a student?', ['You are a student?', 'Is you a student?', 'Am you a student?']], ['Trả lời ngắn cho “Is he tall?”', 'Yes, he is.', ['Yes, he are.', 'Yes, he am.', 'Yes, is he.']], ['Is it your book? nghĩa là gì?', 'Nó có phải sách của bạn không?', ['Bạn là quyển sách à?', 'Sách ở đâu?', 'Bạn đọc sách không?']]],
    finalPrompt: 'Nói lại một câu hỏi Yes/No với to be.',
  },
  3: {
    title: 'Ai và cái gì? — hỏi Who / What với to be',
    goal: 'Dùng Who để hỏi người, What để hỏi tên/đồ vật/sự việc, rồi trả lời bằng câu to be thật ngắn và rõ.',
    grammarTitle: 'Who/What + is/are + subject?',
    grammar: 'Who hỏi người; What hỏi tên, nghề, đồ vật hoặc bản chất sự việc. Với một người/vật dùng Who/What is; với nhiều người/vật dùng Who/What are. Khi trả lời, dùng chủ ngữ phù hợp: He/She/It/They + is/are.',
    vocabulary: [['who', 'ai', 'Who is she?'], ['what', 'cái gì/là gì', 'What is this?'], ['this', 'cái này', 'What is this?'], ['that', 'cái kia', 'What is that?'], ['these', 'những cái này', 'What are these?'], ['those', 'những cái kia', 'What are those?'], ['grandfather', 'ông', 'Who is this? It is my grandfather.'], ['grandmother', 'bà', 'Who is that? It is my grandmother.'], ['cousin', 'anh/chị/em họ', 'Who is she? She is my cousin.'], ['classmate', 'bạn cùng lớp', 'Who are they? They are my classmates.'], ['banana', 'quả chuối', 'What is that? It is a banana.'], ['cake', 'bánh', 'What is this? It is a cake.'], ['bag', 'cặp/túi', 'What is this? It is my bag.'], ['desk', 'bàn học', 'What is this? It is a desk.'], ['chair', 'ghế', 'What is that? It is a chair.'], ['shirt', 'áo sơ mi', 'What are these? They are shirts.'], ['hat', 'mũ', 'What are they? They are hats.'], ['jeans', 'quần bò', 'What are those? They are her jeans.'], ['pillow', 'gối', 'What are those? They are pillows.'], ['sock', 'tất', 'What are they? They are my socks.'], ['doctor', 'bác sĩ', 'Who are they? They are doctors.']],
    patterns: [['Who is + one person?', 'Hỏi một người là ai', ['Who is she?', 'Who is this?', 'Who is that?']], ['Who are + many people?', 'Hỏi nhiều người là ai', ['Who are they?', 'Who are these?', 'Who are those?']], ['What is + one thing?', 'Hỏi một đồ vật số ít', ['What is this?', 'What is that?']], ['What are + plural things?', 'Hỏi nhiều đồ vật', ['What are these?', 'What are those?', 'What are they?']], ['It is + singular noun.', 'Trả lời về một người/vật được chỉ bằng this hoặc that', ['It is a desk.', 'It is my grandmother.']], ['They are + plural noun.', 'Trả lời về nhiều người/vật', ['They are my classmates.', 'They are her jeans.']]],
    sentences: [['Who is she?', 'Cô ấy là ai?'], ['She is my cousin.', 'Cô ấy là chị/em họ tôi.'], ['Who is this?', 'Đây là ai?'], ['It is my grandfather.', 'Đó là ông tôi.'], ['What is that?', 'Kia là cái gì?'], ['It is a banana.', 'Đó là một quả chuối.'], ['What are they?', 'Chúng là những gì?'], ['They are my socks.', 'Chúng là những đôi tất của tôi.'], ['Who are these?', 'Đây là những ai?'], ['They are my classmates.', 'Họ là các bạn cùng lớp của tôi.'], ['What are those?', 'Kia là những cái gì?'], ['They are her jeans.', 'Chúng là quần bò của cô ấy.']],
    fills: [['___ is she?', 'Who', 'Hỏi người dùng Who.'], ['___ is this?', 'What', 'Hỏi đồ vật dùng What.'], ['What ___ your name?', 'is', 'Name là số ít nên dùng is.'], ['Who ___ they?', 'are', 'They là số nhiều nên dùng are.'], ['What ___ these?', 'are', 'These là số nhiều nên dùng are.']],
    orders: [['Cô ấy là ai?', 'Who is she?'], ['Đây là cái gì?', 'What is this?'], ['Họ là ai?', 'Who are they?'], ['Những cái này là gì?', 'What are these?']],
    choices: [['Hỏi “Cô ấy là ai?”', 'Who is she?', ['What is she?', 'Who are she?', 'What are she?']], ['Hỏi “Đây là cái gì?”', 'What is this?', ['Who is this?', 'What are this?', 'This is what?']], ['Who dùng để hỏi gì?', 'người', ['đồ vật', 'thời gian', 'địa điểm']], ['These đi với câu hỏi nào?', 'What are these?', ['What is these?', 'Who is these?', 'What am these?']], ['Trả lời đúng cho “Who are they?”', 'They are my friends.', ['She is my friend.', 'It is a friend.', 'They is my friends.']]],
    finalPrompt: 'Nói một mini hội thoại 4 câu: hỏi Who/What rồi tự trả lời.',
  },
  4: {
    title: 'Ở đâu, khi nào? — hỏi Where / When với to be',
    goal: 'Hỏi và trả lời địa điểm/thời gian bằng Where, When, at/on/in thật chắc.',
    grammarTitle: 'Where/When + is/are + subject?',
    grammar: 'Where hỏi “ở đâu”, When hỏi “khi nào”. Với to be, dùng Where/When + is/are + chủ ngữ. Trả lời địa điểm thường dùng at/in/on; trả lời ngày dùng on, tháng dùng in, giờ dùng at.',
    vocabulary: [['where', 'ở đâu', 'Where is the clock?'], ['when', 'khi nào', 'When is the class?'], ['park', 'công viên', 'The kids are in the park.'], ['supermarket', 'siêu thị', 'We are at the supermarket.'], ['garden', 'khu vườn', 'She is in the garden.'], ['party', 'bữa tiệc', 'The party is at 3:00.'], ['wardrobe', 'tủ quần áo', 'The jeans are in the wardrobe.'], ['airport', 'sân bay', 'They are at the airport.'], ['shopping centre', 'trung tâm mua sắm', 'She is in the shopping centre.'], ['train station', 'nhà ga', 'They are at the train station.'], ['table', 'cái bàn', 'The bag is on the table.'], ['clock', 'đồng hồ', 'The clock is on the wall.'], ['wall', 'bức tường', 'The clock is on the wall.'], ['floor', 'sàn nhà', 'The pillow is on the floor.'], ['sofa', 'ghế sô pha', 'The book is on the sofa.'], ['school', 'trường học', 'They are at school.'], ['work', 'nơi làm việc', 'He is at work.'], ['home', 'nhà', 'They are at home.'], ['class', 'lớp học', 'When is the English class?'], ['English', 'môn tiếng Anh', 'The English class is in the afternoon.'], ['maths', 'môn toán', 'The maths class is in the morning.'], ['exam', 'kỳ thi', 'The exam is on Friday.'], ['birthday', 'sinh nhật', 'When is your birthday?'], ['morning', 'buổi sáng', 'The class is in the morning.'], ['afternoon', 'buổi chiều', 'The party is in the afternoon.'], ['evening', 'buổi tối', 'The class is in the evening.'], ['lunchtime', 'giờ ăn trưa', 'The class is at lunchtime.'], ['noon', 'buổi trưa', 'The class is at noon.'], ['midday', 'giữa trưa', 'The class is at midday.'], ['night', 'ban đêm', 'The party is at night.'], ['midnight', 'nửa đêm', 'The train leaves at midnight.'], ['Monday', 'thứ Hai', 'The exam is on Monday.'], ['Tuesday', 'thứ Ba', 'The party is on Tuesday.'], ['Wednesday', 'thứ Tư', 'The class is on Wednesday.'], ['Thursday', 'thứ Năm', 'Her birthday is on Thursday.'], ['Friday', 'thứ Sáu', 'The exam is on Friday.'], ['Saturday', 'thứ Bảy', 'The party is on Saturday.'], ['Sunday', 'Chủ Nhật', 'The class is on Sunday.'], ['in', 'trong/vào', 'The jeans are in the wardrobe.'], ['on', 'trên/vào (ngày)', 'The exam is on Monday.'], ['at', 'ở/vào (giờ)', 'The class is at noon.'], ['today', 'hôm nay', 'The class is today.']],
    patterns: [['Where is/are + subject?', 'Dùng Where để hỏi địa điểm', ['Where is your book?', 'Where are they?', 'Where is the clock?']], ['When is/are + event?', 'Dùng When để hỏi thời gian', ['When is your birthday?', 'When is the exam?', 'When is the class?']], ['in + enclosed place; on + surface; at + place/activity', 'Chọn giới từ theo mối quan hệ với địa điểm', ['in the garden', 'on the wall', 'at the airport']], ['in + part of day; on + weekday; at + clock time or set time', 'Dùng in cho buổi, on cho thứ, at cho giờ và một số mốc cố định', ['in the morning', 'on Monday', 'at 3:00', 'at night']]],
    sentences: [['Where is she?', 'Cô ấy đang ở đâu?'], ['She is in the garden.', 'Cô ấy đang ở trong vườn.'], ['Where are the dogs?', 'Những chú chó đang ở đâu?'], ['They are in the house.', 'Chúng ở trong nhà.'], ['Where is the book?', 'Quyển sách ở đâu?'], ['It is on the desk.', 'Nó ở trên bàn học.'], ['When is the English class?', 'Khi nào có lớp tiếng Anh?'], ['It is at 3:00 in the afternoon.', 'Lớp học lúc 3 giờ chiều.'], ['When is the exam?', 'Kỳ thi khi nào?'], ['It is on Monday.', 'Kỳ thi vào thứ Hai.'], ['Where is your brother?', 'Anh/em trai bạn ở đâu?'], ['He is at the train station.', 'Anh ấy ở nhà ga.']],
    fills: [['Where ___ the clock?', 'is', 'Dùng is với chủ ngữ số ít the clock.'], ['When ___ your classes?', 'are', 'Dùng are với classes ở số nhiều.'], ['We are ___ the supermarket.', 'at', 'Dùng at trong cụm at the supermarket.'], ['The jeans are ___ the wardrobe.', 'in', 'Dùng in khi đồ vật ở bên trong tủ.'], ['His birthday is ___ Monday.', 'on', 'Dùng on trước thứ trong tuần.']],
    orders: [['Cô ấy ở trong vườn.', 'She is in the garden.'], ['Quyển sách ở trên ghế sô pha.', 'The book is on the sofa.'], ['Lớp toán ở buổi sáng.', 'The maths class is in the morning.'], ['Kỳ thi vào thứ Sáu.', 'The exam is on Friday.']],
    choices: [['Dùng từ nào để hỏi địa điểm?', 'Where', ['When', 'Who', 'What']], ['Dùng từ nào để hỏi thời gian?', 'When', ['Where', 'Who', 'What']], ['Giới từ đúng trong “on the wall” là gì?', 'on', ['in', 'at', 'to']], ['“Vào buổi sáng” nói thế nào?', 'in the morning', ['on the morning', 'at the morning', 'in Monday']], ['“Vào lúc 3 giờ” dùng giới từ nào?', 'at', ['in', 'on', 'to']]],
    finalPrompt: 'Nói 2 câu hỏi Where và 2 câu hỏi When về đồ vật/lớp học của bạn.',
  },
  5: {
    title: 'Tôi làm mỗi ngày — động từ thường hiện tại',
    goal: 'Nói thói quen đơn giản bằng động từ thường, phân biệt I/you/we/they với he/she/it thêm s/es.',
    grammarTitle: 'Hiện tại đơn khẳng định với động từ thường',
    grammar: 'I/you/we/they dùng động từ nguyên mẫu. He/she/it thường thêm s hoặc es ở động từ. Dùng every day/usually/often để nói thói quen lặp lại.',
    vocabulary: [['study', 'học', 'I study English.'], ['read', 'đọc', 'She reads books.'], ['play', 'chơi', 'They play football.'], ['work', 'làm việc', 'My father works.'], ['go', 'đi', 'He goes to school.'], ['like', 'thích', 'I like apples.'], ['eat', 'ăn', 'I eat breakfast.'], ['drink', 'uống', 'She drinks milk.'], ['live', 'sống', 'They live in Ha Noi.'], ['every day', 'mỗi ngày', 'We study every day.'], ['usually', 'thường xuyên', 'She usually reads.'], ['often', 'thường hay', 'I often listen.']],
    patterns: [['I/You/We/They + verb', 'Nói hành động với chủ ngữ thường', ['I study English.', 'They play football.', 'We live here.']], ['He/She/It + verb-s/es', 'Thêm s/es với he/she/it', ['She reads books.', 'He goes to school.', 'My father works.']], ['Subject + usually/often/every day + verb', 'Nói thói quen', ['I usually eat breakfast.', 'She often reads books.', 'We study every day.']], ['go/do/watch + es with he/she/it', 'Một số động từ thêm es', ['He goes to school.', 'She watches TV.']]],
    sentences: [['I study English.', 'Tôi học tiếng Anh.'], ['She reads books.', 'Cô ấy đọc sách.'], ['They play football.', 'Họ chơi bóng đá.'], ['He goes to school.', 'Anh ấy đi học.'], ['We study every day.', 'Chúng tôi học mỗi ngày.'], ['My father works at home.', 'Bố tôi làm việc ở nhà.'], ['She drinks milk every morning.', 'Cô ấy uống sữa mỗi sáng.'], ['I often listen to music.', 'Tôi thường nghe nhạc.']],
    fills: [['He ___ to school.', 'goes', 'He nên động từ go thêm es.'], ['I ___ English.', 'study', 'I dùng động từ nguyên mẫu.'], ['She ___ books.', 'reads', 'She nên read thêm s.'], ['They ___ football.', 'play', 'They dùng động từ nguyên mẫu.'], ['My mother ___ at home.', 'works', 'My mother tương đương she nên thêm s.']],
    orders: [['Tôi học tiếng Anh.', 'I study English.'], ['Cô ấy đọc sách.', 'She reads books.'], ['Anh ấy đi học mỗi ngày.', 'He goes to school every day.'], ['Họ sống ở Hà Nội.', 'They live in Ha Noi.']],
    choices: [['Chọn câu đúng.', 'She reads books.', ['She read books.', 'She reading books.', 'She are read books.']], ['I đi với dạng nào?', 'study', ['studies', 'studys', 'studying']], ['He + go thành gì?', 'goes', ['go', 'gos', 'going']], ['They + play thành gì?', 'play', ['plays', 'playes', 'playing']], ['Dấu hiệu thói quen là:', 'every day', ['now', 'yesterday', 'last night']]],
    finalPrompt: 'Nói 5 câu về routine của bạn, ít nhất 1 câu dùng he/she.',
  },
  6: {
    title: 'Tôi không làm — phủ định với don’t / doesn’t',
    goal: 'Nói điều mình không làm bằng don’t/doesn’t và nhớ sau doesn’t động từ không thêm s.',
    grammarTitle: 'do not / does not + động từ nguyên mẫu',
    grammar: 'I/you/we/they dùng do not hoặc don’t. He/she/it dùng does not hoặc doesn’t. Sau don’t/doesn’t, động từ chính luôn ở dạng nguyên mẫu, nên nói He doesn’t like, không nói He doesn’t likes.',
    vocabulary: [['do not', 'không', 'I do not like coffee.'], ['don’t', 'không (rút gọn)', 'They don’t live here.'], ['does not', 'không với he/she/it', 'She does not play tennis.'], ['doesn’t', 'không (rút gọn)', 'He doesn’t go to school.'], ['coffee', 'cà phê', 'I don’t like coffee.'], ['tea', 'trà', 'He doesn’t like tea.'], ['tennis', 'quần vợt', 'She doesn’t play tennis.'], ['Sunday', 'Chủ nhật', 'He doesn’t work on Sunday.'], ['watch', 'xem', 'I don’t watch TV every day.'], ['live', 'sống', 'They don’t live here.'], ['homework', 'bài tập về nhà', 'She doesn’t do homework at night.'], ['late', 'muộn', 'We don’t sleep late.']],
    patterns: [['I/You/We/They + don’t + verb', 'Phủ định với chủ ngữ thường', ['I don’t like coffee.', 'They don’t live here.', 'We don’t sleep late.']], ['He/She/It + doesn’t + verb', 'Phủ định với he/she/it', ['She doesn’t play tennis.', 'He doesn’t go on Sunday.', 'It doesn’t work.']], ['Doesn’t + verb nguyên mẫu', 'Không thêm s sau doesn’t', ['He doesn’t like tea.', 'She doesn’t read comics.', 'My brother doesn’t watch TV.']], ['do not/does not = don’t/doesn’t', 'Dạng đầy đủ và rút gọn', ['I do not like coffee.', 'She does not play tennis.']]],
    sentences: [['I do not like coffee.', 'Tôi không thích cà phê.'], ['She does not play tennis.', 'Cô ấy không chơi quần vợt.'], ['They don’t live here.', 'Họ không sống ở đây.'], ['He doesn’t go to school on Sunday.', 'Anh ấy không đi học vào Chủ nhật.'], ['We don’t watch TV every day.', 'Chúng tôi không xem TV mỗi ngày.'], ['My brother doesn’t like tea.', 'Anh trai/em trai tôi không thích trà.'], ['I don’t sleep late.', 'Tôi không ngủ muộn.'], ['She doesn’t do homework at night.', 'Cô ấy không làm bài tập vào buổi tối.']],
    fills: [['I ___ like coffee.', 'don’t', 'I dùng don’t để phủ định.'], ['He ___ play football.', 'doesn’t', 'He dùng doesn’t.'], ['She doesn’t ___ tea.', 'like', 'Sau doesn’t dùng động từ nguyên mẫu.'], ['They ___ live here.', 'don’t', 'They dùng don’t.'], ['My sister doesn’t ___ TV.', 'watch', 'Sau doesn’t không thêm s/es.']],
    orders: [['Tôi không thích cà phê.', 'I don’t like coffee.'], ['Cô ấy không chơi quần vợt.', 'She doesn’t play tennis.'], ['Họ không sống ở đây.', 'They don’t live here.'], ['Anh ấy không đi học vào Chủ nhật.', 'He doesn’t go to school on Sunday.']],
    choices: [['Câu đúng là gì?', 'He doesn’t like tea.', ['He doesn’t likes tea.', 'He don’t like tea.', 'He not like tea.']], ['They dùng phủ định nào?', 'don’t', ['doesn’t', 'isn’t', 'aren’t']], ['Sau doesn’t dùng gì?', 'động từ nguyên mẫu', ['động từ thêm s', 'to be', 'danh từ số nhiều']], ['Câu đúng với “She/play tennis”', 'She doesn’t play tennis.', ['She doesn’t plays tennis.', 'She don’t play tennis.', 'She not plays tennis.']], ['Dạng đầy đủ của doesn’t là:', 'does not', ['do not', 'is not', 'are not']]],
    finalPrompt: 'Nói 4 câu về điều bạn không làm và 2 câu về điều một người thân không làm.',
  },
  7: {
    title: 'Bạn có làm không? — câu hỏi Do / Does',
    goal: 'Đặt câu hỏi thói quen bằng Do/Does, trả lời Yes/No ngắn và không thêm s sau Does.',
    grammarTitle: 'Do/Does + subject + verb?',
    grammar: 'Câu hỏi hiện tại đơn với động từ thường dùng Do hoặc Does ở đầu. I/you/we/they dùng Do; he/she/it dùng Does. Khi đã có Does, động từ chính trở về nguyên mẫu: Does she like music?',
    vocabulary: [['do you', 'bạn có...không', 'Do you study English?'], ['does she', 'cô ấy có...không', 'Does she like music?'], ['does he', 'anh ấy có...không', 'Does he play football?'], ['speak', 'nói', 'Do you speak English?'], ['music', 'âm nhạc', 'Does she like music?'], ['live', 'sống', 'Do they live here?'], ['read books', 'đọc sách', 'Do you read books?'], ['answer', 'trả lời', 'Yes, I do.'], ['question', 'câu hỏi', 'Ask a question.'], ['weekend', 'cuối tuần', 'Do you study on weekends?'], ['friend', 'bạn', 'Does your friend speak English?'], ['short answer', 'trả lời ngắn', 'No, he doesn’t.']],
    patterns: [['Do + I/you/we/they + verb?', 'Hỏi với do', ['Do you study English?', 'Do they live here?', 'Do we have class today?']], ['Does + he/she/it + verb?', 'Hỏi với does', ['Does she like music?', 'Does he play football?', 'Does your friend speak English?']], ['Yes/No + subject + do/does', 'Trả lời ngắn', ['Yes, I do.', 'No, he doesn’t.', 'Yes, she does.']], ['Does + verb nguyên mẫu', 'Không thêm s sau Does', ['Does she read books?', 'Does he go to school?']]],
    sentences: [['Do you study English?', 'Bạn có học tiếng Anh không?'], ['Does she like music?', 'Cô ấy có thích nhạc không?'], ['Do they live here?', 'Họ có sống ở đây không?'], ['Yes, I do.', 'Vâng, có.'], ['No, he doesn’t.', 'Không, anh ấy không.'], ['Does he play football on weekends?', 'Anh ấy có chơi bóng đá vào cuối tuần không?'], ['Do you read books every day?', 'Bạn có đọc sách mỗi ngày không?'], ['Yes, she does.', 'Vâng, cô ấy có.']],
    fills: [['___ you speak English?', 'Do', 'You dùng Do.'], ['___ she go to school?', 'Does', 'She dùng Does.'], ['No, I ___.', 'don’t', 'Trả lời phủ định với I dùng don’t.'], ['Yes, she ___.', 'does', 'Trả lời khẳng định với she dùng does.'], ['Does he ___ football?', 'play', 'Sau Does dùng động từ nguyên mẫu.']],
    orders: [['Bạn có học tiếng Anh không?', 'Do you study English?'], ['Cô ấy có thích nhạc không?', 'Does she like music?'], ['Anh ấy có chơi bóng đá vào cuối tuần không?', 'Does he play football on weekends?'], ['Bạn có đọc sách mỗi ngày không?', 'Do you read books every day?']],
    choices: [['Câu hỏi đúng là gì?', 'Does she like music?', ['Does she likes music?', 'Do she like music?', 'She does like music?']], ['Do you read books? trả lời ngắn đúng:', 'Yes, I do.', ['Yes, I does.', 'Yes, do I.', 'Yes, I am.']], ['Does đi với chủ ngữ nào?', 'he/she/it', ['I/you/we', 'they', 'you only']], ['Sau Does dùng dạng nào?', 'play', ['plays', 'playing', 'played']], ['Câu hỏi cho “They live here.”', 'Do they live here?', ['Does they live here?', 'Are they live here?', 'Do they lives here?']]],
    finalPrompt: 'Phỏng vấn tưởng tượng một người bạn bằng 6 câu Do/Does và tự trả lời ngắn.',
  },
  8: {
    title: 'Routine mỗi ngày — tổng hợp hiện tại đơn',
    goal: 'Nói routine bằng khẳng định, phủ định, nghi vấn và trạng từ tần suất.',
    grammarTitle: 'Hiện tại đơn cho thói quen và sự thật',
    grammar: 'Hiện tại đơn dùng cho thói quen, lịch trình và sự thật. Trạng từ như always/usually/often đứng trước động từ thường.',
    vocabulary: [['always', 'luôn luôn', 'I always get up early.'], ['usually', 'thường', 'She usually has breakfast.'], ['often', 'thường hay', 'We often play games.'], ['sometimes', 'thỉnh thoảng', 'I sometimes read at night.'], ['never', 'không bao giờ', 'He never drinks coffee.'], ['get up', 'thức dậy', 'I get up early.'], ['breakfast', 'bữa sáng', 'She has breakfast at seven.'], ['routine', 'thói quen', 'My routine is simple.']],
    patterns: [['Subject + frequency + verb', 'Nói tần suất', ['I always get up early.', 'She usually reads books.']], ['Subject + don’t/doesn’t + verb', 'Phủ định trong routine', ['He doesn’t like cartoons.', 'I don’t drink coffee.']], ['Do/Does + subject + often + verb?', 'Hỏi thói quen', ['Do you often go to the park?', 'Does she usually study?']]],
    sentences: [['I always get up early.', 'Tôi luôn thức dậy sớm.'], ['She usually has breakfast at seven.', 'Cô ấy thường ăn sáng lúc bảy giờ.'], ['He doesn’t like cartoons.', 'Anh ấy không thích hoạt hình.'], ['Do you often go to the park?', 'Bạn có thường đi công viên không?'], ['People drink water every day.', 'Mọi người uống nước mỗi ngày.']],
    fills: [['The sun ___ in the East.', 'rises', 'Sự thật với chủ ngữ số ít thêm s.'], ['She usually ___ breakfast.', 'has', 'She dùng has.'], ['Does he ___ novels?', 'read', 'Sau Does dùng động từ nguyên mẫu.']],
    orders: [['Tôi luôn thức dậy sớm.', 'I always get up early.'], ['Bạn có thường đi công viên không?', 'Do you often go to the park?']],
    choices: [['Trạng từ tần suất trong câu nào đúng?', 'I always get up early.', ['I get up always early.', 'Always I get up early.', 'I get always up early.']], ['Sau Does dùng gì?', 'read', ['reads', 'reading', 'to read']], ['Câu phủ định đúng:', 'He doesn’t like cartoons.', ['He don’t like cartoons.', 'He doesn’t likes cartoons.', 'He not likes cartoons.']]],
    finalPrompt: 'Nói lại một câu về routine mỗi ngày của bạn.',
  },
  9: {
    title: 'Từ loại dễ hiểu — noun, verb, adjective trong câu ngắn',
    goal: 'Nhận diện danh từ, động từ, tính từ để tự sửa câu cơ bản.',
    grammarTitle: 'Noun / verb / adjective giữ vai trò khác nhau',
    grammar: 'Noun gọi tên người/vật. Verb chỉ hành động/trạng thái. Adjective mô tả noun hoặc trạng thái sau to be.',
    vocabulary: [['noun', 'danh từ', 'Student is a noun.'], ['verb', 'động từ', 'Study is a verb.'], ['adjective', 'tính từ', 'Happy is an adjective.'], ['person', 'người', 'A teacher is a person.'], ['thing', 'đồ vật', 'A book is a thing.'], ['action', 'hành động', 'Run is an action.'], ['big', 'to/lớn', 'The bag is big.'], ['small', 'nhỏ', 'The cat is small.']],
    patterns: [['Noun = person/thing', 'Danh từ là người/vật', ['teacher', 'book']], ['Verb = action/state', 'Động từ là hành động/trạng thái', ['study', 'read']], ['Subject + be + adjective', 'Tính từ mô tả trạng thái', ['She is happy.', 'The room is small.']]],
    sentences: [['A teacher is a person.', 'Giáo viên là một người.'], ['A book is a thing.', 'Quyển sách là một đồ vật.'], ['Study is a verb.', 'Study là một động từ.'], ['Happy is an adjective.', 'Happy là một tính từ.'], ['The bag is big.', 'Cái túi thì to.']],
    fills: [['A book is a ___.', 'thing', 'Book là đồ vật.'], ['Study is a ___.', 'verb', 'Study chỉ hành động học.'], ['Happy is an ___.', 'adjective', 'Happy mô tả trạng thái.']],
    orders: [['Cái túi thì to.', 'The bag is big.'], ['Study là một động từ.', 'Study is a verb.']],
    choices: [['“teacher” là từ loại gì?', 'noun', ['verb', 'adjective', 'question']], ['“read” là từ loại gì?', 'verb', ['noun', 'adjective', 'place']], ['“small” là từ loại gì?', 'adjective', ['noun', 'verb', 'time']]],
    finalPrompt: 'Nói lại một câu có danh từ và tính từ.',
  },
  10: {
    title: 'Đang làm gì? — hiện tại tiếp diễn',
    goal: 'Nói hành động đang diễn ra ngay lúc này bằng am/is/are + V-ing.',
    grammarTitle: 'am/is/are + verb-ing',
    grammar: 'Hiện tại tiếp diễn dùng cho việc đang xảy ra bây giờ. Cấu trúc: subject + am/is/are + verb-ing.',
    vocabulary: [['now', 'bây giờ', 'I am studying now.'], ['studying', 'đang học', 'I am studying.'], ['reading', 'đang đọc', 'She is reading.'], ['playing', 'đang chơi', 'They are playing.'], ['cooking', 'đang nấu ăn', 'Mom is cooking.'], ['sleeping', 'đang ngủ', 'The baby is sleeping.'], ['right now', 'ngay bây giờ', 'He is working right now.'], ['watching', 'đang xem', 'We are watching TV.']],
    patterns: [['I am + V-ing', 'Tôi đang làm gì', ['I am studying now.', 'I am reading.']], ['He/She/It is + V-ing', 'Một người/vật đang làm gì', ['She is cooking.', 'The baby is sleeping.']], ['We/They/You are + V-ing', 'Nhiều người/bạn đang làm gì', ['They are playing.', 'We are watching TV.']]],
    sentences: [['I am studying now.', 'Tôi đang học bây giờ.'], ['She is reading a book.', 'Cô ấy đang đọc sách.'], ['They are playing football.', 'Họ đang chơi bóng đá.'], ['Mom is cooking dinner.', 'Mẹ đang nấu bữa tối.'], ['We are watching TV.', 'Chúng tôi đang xem TV.']],
    fills: [['I ___ studying now.', 'am', 'I đi với am.'], ['She ___ reading a book.', 'is', 'She đi với is.'], ['They ___ playing football.', 'are', 'They đi với are.']],
    orders: [['Tôi đang học bây giờ.', 'I am studying now.'], ['Họ đang chơi bóng đá.', 'They are playing football.']],
    choices: [['Câu hiện tại tiếp diễn đúng:', 'She is reading a book.', ['She reading a book.', 'She reads now a book.', 'She are reading a book.']], ['They đi với gì?', 'are playing', ['is playing', 'am playing', 'playing is']], ['Dấu hiệu “now” thường dùng với:', 'hiện tại tiếp diễn', ['quá khứ đơn', 'danh từ', 'mạo từ']]],
    finalPrompt: 'Nói lại một câu về việc bạn đang làm ngay bây giờ.',
  },
  11: {
    title: 'Mỗi ngày hay ngay bây giờ? — phân biệt simple/present continuous',
    goal: 'Chọn đúng hiện tại đơn cho thói quen và hiện tại tiếp diễn cho việc đang xảy ra.',
    grammarTitle: 'every day vs now',
    grammar: 'Every day/usually dùng hiện tại đơn. Now/right now dùng hiện tại tiếp diễn. Hãy nhìn dấu hiệu thời gian trước khi chọn động từ.',
    vocabulary: [['every day', 'mỗi ngày', 'I study every day.'], ['now', 'bây giờ', 'I am studying now.'], ['usually', 'thường', 'She usually reads.'], ['right now', 'ngay bây giờ', 'She is reading right now.'], ['habit', 'thói quen', 'A habit happens often.'], ['happening', 'đang xảy ra', 'It is happening now.'], ['compare', 'so sánh', 'Compare the two sentences.'], ['choose', 'chọn', 'Choose the correct tense.']],
    patterns: [['Simple present = habit', 'Hiện tại đơn cho thói quen', ['I study every day.', 'She usually reads.']], ['Present continuous = now', 'Hiện tại tiếp diễn cho bây giờ', ['I am studying now.', 'She is reading right now.']], ['Signal word helps you choose', 'Từ khóa giúp chọn thì', ['every day → study', 'now → am studying']]],
    sentences: [['I study English every day.', 'Tôi học tiếng Anh mỗi ngày.'], ['I am studying English now.', 'Tôi đang học tiếng Anh bây giờ.'], ['She usually reads books.', 'Cô ấy thường đọc sách.'], ['She is reading a book right now.', 'Cô ấy đang đọc sách ngay bây giờ.'], ['They play football on Sundays.', 'Họ chơi bóng đá vào Chủ nhật.']],
    fills: [['I ___ English every day.', 'study', 'Every day dùng hiện tại đơn.'], ['I ___ studying English now.', 'am', 'Now dùng am/is/are + V-ing.'], ['She usually ___ books.', 'reads', 'Usually dùng hiện tại đơn.']],
    orders: [['Tôi học tiếng Anh mỗi ngày.', 'I study English every day.'], ['Tôi đang học tiếng Anh bây giờ.', 'I am studying English now.']],
    choices: [['Có “now” nên chọn:', 'I am studying now.', ['I study now.', 'I studies now.', 'I studied now.']], ['Có “every day” nên chọn:', 'I study every day.', ['I am studying every day now.', 'I studies every day.', 'I studying every day.']], ['Usually thuộc nhóm:', 'thói quen', ['ngay bây giờ', 'quá khứ', 'địa điểm']]],
    finalPrompt: 'Nói hai câu: một câu every day và một câu now.',
  },
  12: {
    title: 'Chuyện đã xảy ra — quá khứ đơn khẳng định',
    goal: 'Kể việc đã xảy ra bằng was/were hoặc động từ quá khứ đơn cơ bản.',
    grammarTitle: 'Past simple affirmative',
    grammar: 'Quá khứ đơn dùng cho việc đã xảy ra và kết thúc. To be đổi thành was/were; nhiều động từ thường thêm -ed.',
    vocabulary: [['yesterday', 'hôm qua', 'I studied yesterday.'], ['last night', 'tối qua', 'We watched TV last night.'], ['was', 'đã là/ở (số ít)', 'She was happy.'], ['were', 'đã là/ở (số nhiều/you)', 'They were at home.'], ['studied', 'đã học', 'I studied English.'], ['played', 'đã chơi', 'He played football.'], ['watched', 'đã xem', 'We watched TV.'], ['visited', 'đã thăm', 'I visited my grandma.']],
    patterns: [['I/He/She/It + was', 'To be quá khứ số ít', ['I was tired.', 'She was happy.']], ['You/We/They + were', 'To be quá khứ với you/we/they', ['They were at home.', 'We were late.']], ['Subject + regular verb-ed', 'Động từ thường quá khứ', ['I studied yesterday.', 'He played football.']]],
    sentences: [['I studied English yesterday.', 'Tôi đã học tiếng Anh hôm qua.'], ['She was happy last night.', 'Cô ấy đã vui tối qua.'], ['They were at home.', 'Họ đã ở nhà.'], ['He played football yesterday.', 'Anh ấy đã chơi bóng đá hôm qua.'], ['We watched TV last night.', 'Chúng tôi đã xem TV tối qua.']],
    fills: [['I ___ English yesterday.', 'studied', 'Yesterday dùng quá khứ đơn.'], ['She ___ happy last night.', 'was', 'She dùng was trong quá khứ.'], ['They ___ at home.', 'were', 'They dùng were trong quá khứ.']],
    orders: [['Tôi đã học tiếng Anh hôm qua.', 'I studied English yesterday.'], ['Họ đã ở nhà.', 'They were at home.']],
    choices: [['Câu quá khứ đúng:', 'I studied English yesterday.', ['I study English yesterday.', 'I am studying yesterday.', 'I studies yesterday.']], ['She dùng to be quá khứ nào?', 'was', ['were', 'are', 'am']], ['They dùng to be quá khứ nào?', 'were', ['was', 'is', 'am']]],
    finalPrompt: 'Nói lại một câu về việc bạn đã làm hôm qua.',
  },
};

export const foundation48DeepLessons: Record<number, Foundation48DeepLesson> = Object.fromEntries(
  Object.entries(seeds).map(([day, seed]) => [Number(day), buildDeepLesson(Number(day), seed)]),
) as Record<number, Foundation48DeepLesson>;

export function getFoundation48Readiness(dayNumber: number) {
  return foundation48DeepLessons[dayNumber]?.readiness ?? 'future';
}
