const fs = require('fs');

fs.writeFileSync('apps/web/src/lib/p-english/shadowing-data.ts', String.raw`export type ShadowingSource = 'lesson' | 'library' | 'custom';

export type ShadowingSentence = {
  id: string;
  text: string;
  meaningVi: string;
  pronunciationHintVi: string;
  focusWords: string[];
  commonMistakeHintVi: string;
  start?: number;
  end?: number;
};

export type ShadowingVideo = {
  id: string;
  title: string;
  level: string;
  topic: string;
  duration: string;
  description: string;
  transcript: ShadowingSentence[];
  source: ShadowingSource;
  lessonId?: string;
  unitId?: string;
  videoUrl?: string;
};

const sentence = (id: string, text: string, meaningVi: string, pronunciationHintVi: string, focusWords: string[], commonMistakeHintVi: string): ShadowingSentence => ({ id, text, meaningVi, pronunciationHintVi, focusWords, commonMistakeHintVi });

export const shadowingVideos: ShadowingVideo[] = [
  {
    id: 'unit-1-greetings-shadowing', title: 'Unit 1 - Greetings and Self-introduction', level: 'A1', topic: 'Chào hỏi và giới thiệu bản thân', duration: '10 câu', source: 'lesson', unitId: 'unit-1-greetings', lessonId: 'unit-1-greetings-introduction', description: 'Phòng luyện nói theo bài Unit 1: chào hỏi, tên, cảm xúc và lời tạm biệt.',
    transcript: [
      sentence('u1-s1', 'Hello, my name is Minh.', 'Xin chào, tên tôi là Minh.', 'Heh-LOW, my NAME is Minh. Nhấn vào Hello và name.', ['Hello', 'my name'], 'Đừng đọc hello đều đều; hãy nhấn âm LOW.'),
      sentence('u1-s2', 'Nice to meet you.', 'Rất vui được gặp bạn.', 'NICE tuh MEET you. Âm /t/ trong meet bật nhẹ.', ['Nice', 'meet you'], 'Không đọc meet you thành một âm quá nhanh.'),
      sentence('u1-s3', 'I am from Vietnam.', 'Tôi đến từ Việt Nam.', 'I am from Viet-NAM. Nối nhẹ I am.', ['I am from', 'Vietnam'], 'Tránh bỏ âm /m/ ở am.'),
      sentence('u1-s4', 'I am a student.', 'Tôi là học sinh/sinh viên.', 'I am uh STU-dent. Âm student có 2 nhịp.', ['student'], 'Không thêm âm ờ quá dài trước student.'),
      sentence('u1-s5', 'How are you today?', 'Hôm nay bạn khỏe không?', 'HOW are you tuh-DAY? Lên giọng cuối câu hỏi.', ['How are you', 'today'], 'Đọc are nhẹ như /ər/, đừng nhấn quá nặng.'),
      sentence('u1-s6', 'I am fine, thank you.', 'Tôi khỏe, cảm ơn bạn.', 'I am FINE, THANK you. Ngắt nhẹ sau fine.', ['fine', 'thank you'], 'Không quên âm /θ/ trong thank; đặt lưỡi nhẹ giữa răng.'),
      sentence('u1-s7', 'What is your name?', 'Tên bạn là gì?', 'WHAT is your NAME? Nhấn what và name.', ['What', 'your name'], 'Không đọc your thành you; giữ âm /r/ nhẹ.'),
      sentence('u1-s8', 'This is my friend, Lan.', 'Đây là bạn của tôi, Lan.', 'THIS is my FRIEND, Lan. Nhấn friend.', ['This is', 'friend'], 'Âm /ð/ trong this cần rung nhẹ, không đọc thành dis.'),
      sentence('u1-s9', 'See you tomorrow.', 'Hẹn gặp bạn ngày mai.', 'SEE you tuh-MOR-row. Nhấn see và mor.', ['See you', 'tomorrow'], 'Đừng đọc tomorrow thành từng chữ rời rạc.'),
      sentence('u1-s10', 'Goodbye. Have a nice day.', 'Tạm biệt. Chúc bạn một ngày tốt lành.', 'good-BYE. Have uh NICE day. Ngắt ở dấu chấm.', ['Goodbye', 'nice day'], 'Không nói quá nhanh cụm have a nice day.'),
    ],
  },
  {
    id: 'unit-2-family-shadowing', title: 'Unit 2 - Family and Friends', level: 'A1', topic: 'Gia đình và bạn bè', duration: '10 câu', source: 'lesson', unitId: 'unit-2-family-friends', lessonId: 'unit-2-family-and-friends', description: 'Luyện giới thiệu người thân, tuổi, tính cách và hoạt động cùng gia đình.',
    transcript: [
      sentence('u2-s1', 'This is my mother.', 'Đây là mẹ của tôi.', 'THIS is my MO-ther. Âm mother mềm ở cuối.', ['mother'], 'Đừng đọc mother thành mô-thơ quá cứng.'),
      sentence('u2-s2', 'My father is very kind.', 'Bố tôi rất tốt bụng.', 'My FA-ther is VE-ry KIND. Nhấn father và kind.', ['father', 'kind'], 'Âm /ð/ trong father không phải /d/.'),
      sentence('u2-s3', 'I have one brother.', 'Tôi có một anh/em trai.', 'I HAVE one BRO-ther. Nối have one nhẹ.', ['have', 'brother'], 'Không bỏ âm /v/ cuối từ have.'),
      sentence('u2-s4', 'My sister likes music.', 'Chị/em gái tôi thích âm nhạc.', 'My SIS-ter LIKES MU-sic. Bật âm /s/ cuối likes.', ['sister', 'likes music'], 'Đừng quên âm /s/ trong likes.'),
      sentence('u2-s5', 'We eat dinner together.', 'Chúng tôi ăn tối cùng nhau.', 'We EAT DIN-ner tuh-GE-ther. Nhấn together.', ['eat dinner', 'together'], 'Không đọc together thành ba từ rời.'),
      sentence('u2-s6', 'My best friend is funny.', 'Bạn thân của tôi rất vui tính.', 'My BEST FRIEND is FUN-ny. Nối best friend.', ['best friend', 'funny'], 'Giữ âm /st/ trong best trước friend.'),
      sentence('u2-s7', 'She is twelve years old.', 'Cô ấy mười hai tuổi.', 'She is TWELVE years OLD. Nhấn twelve.', ['twelve', 'years old'], 'Đừng thêm âm /s/ sau twelve.'),
      sentence('u2-s8', 'He plays football after school.', 'Cậu ấy chơi bóng đá sau giờ học.', 'He PLAYS FOOT-ball AF-ter school. Nhấn plays.', ['plays', 'after school'], 'Không bỏ âm /z/ cuối plays.'),
      sentence('u2-s9', 'We help each other.', 'Chúng tôi giúp đỡ lẫn nhau.', 'We HELP each O-ther. Ngắt nhẹ sau help.', ['help', 'each other'], 'Không nuốt âm /p/ trong help.'),
      sentence('u2-s10', 'I love my family.', 'Tôi yêu gia đình của tôi.', 'I LOVE my FA-mi-ly. Family thường 3 âm tiết.', ['love', 'family'], 'Đừng đọc family quá dài thành 4 âm tiết.'),
    ],
  },
  {
    id: 'unit-3-classroom-shadowing', title: 'Unit 3 - School and Classroom', level: 'A1', topic: 'Lớp học và trường học', duration: '10 câu', source: 'lesson', unitId: 'unit-3-school', lessonId: 'unit-3-school-and-classroom', description: 'Tập nói các câu dùng trong lớp: hỏi bài, xin nhắc lại và mô tả đồ vật.',
    transcript: [
      sentence('u3-s1', 'This is my classroom.', 'Đây là lớp học của tôi.', 'THIS is my CLASS-room. Nhấn classroom.', ['classroom'], 'Đừng đọc classroom thành hai từ quá tách rời.'),
      sentence('u3-s2', 'I sit near the window.', 'Tôi ngồi gần cửa sổ.', 'I SIT near the WIN-dow. Nhấn sit và window.', ['sit', 'window'], 'Âm /w/ trong window cần tròn môi.'),
      sentence('u3-s3', 'Open your book, please.', 'Vui lòng mở sách của bạn.', 'O-pen your BOOK, please. Lịch sự ở please.', ['open', 'book', 'please'], 'Không đọc please thiếu âm /z/ cuối.'),
      sentence('u3-s4', 'May I ask a question?', 'Em có thể hỏi một câu không?', 'May I ASK uh QUES-tion? Lên giọng cuối.', ['May I', 'question'], 'Nối May I nhẹ, không tách quá lâu.'),
      sentence('u3-s5', 'Can you repeat that?', 'Bạn/cô có thể nhắc lại điều đó không?', 'Can you re-PEAT that? Nhấn repeat.', ['repeat', 'that'], 'Can trong câu hỏi đọc nhẹ, không nhấn quá mạnh.'),
      sentence('u3-s6', 'The pen is on the desk.', 'Cây bút ở trên bàn.', 'The PEN is on the DESK. Bật /k/ cuối desk.', ['pen', 'desk'], 'Không bỏ âm cuối /k/ của desk.'),
      sentence('u3-s7', 'I write in my notebook.', 'Tôi viết vào vở của mình.', 'I WRITE in my NOTE-book. Âm write có /r/.', ['write', 'notebook'], 'Không đọc write giống white.'),
      sentence('u3-s8', 'Our teacher is friendly.', 'Giáo viên của chúng tôi thân thiện.', 'Our TEA-cher is FRIEND-ly. Nhấn teacher.', ['teacher', 'friendly'], 'Đừng bỏ âm /r/ trong friendly.'),
      sentence('u3-s9', 'The lesson starts at eight.', 'Bài học bắt đầu lúc tám giờ.', 'The LES-son STARTS at EIGHT. Bật /ts/ cuối starts.', ['lesson', 'starts', 'eight'], 'Không quên âm /s/ trong starts.'),
      sentence('u3-s10', 'I like learning English at school.', 'Tôi thích học tiếng Anh ở trường.', 'I LIKE LEARN-ing ENG-lish at school. Nhịp đều.', ['learning English', 'school'], 'Không đọc English thành Eng-lít; giữ âm /ʃ/ cuối.'),
    ],
  },
  {
    id: 'daily-routine-speaking-room', title: 'Daily Routine - Morning to Night', level: 'A1+', topic: 'Thói quen hằng ngày', duration: '9 câu', source: 'library', description: 'Thư viện luyện nói về một ngày quen thuộc, từ thức dậy đến đi ngủ.',
    transcript: [
      sentence('lib-routine-s1', 'I wake up at six o’clock.', 'Tôi thức dậy lúc sáu giờ.', 'I WAKE up at SIX o-CLOCK. Nhấn wake và six.', ['wake up', 'six o’clock'], 'Không bỏ âm /k/ cuối wake.'),
      sentence('lib-routine-s2', 'I brush my teeth.', 'Tôi đánh răng.', 'I BRUSH my TEETH. Âm th cuối teeth nhẹ.', ['brush', 'teeth'], 'Đừng đọc teeth thành tít; luyện /θ/.'),
      sentence('lib-routine-s3', 'I have breakfast with my family.', 'Tôi ăn sáng cùng gia đình.', 'I have BREAK-fast with my FA-mi-ly.', ['breakfast', 'family'], 'Breakfast thường đọc nhanh, không tách break-fast quá mạnh.'),
      sentence('lib-routine-s4', 'I go to school by bus.', 'Tôi đi học bằng xe buýt.', 'I GO to SCHOOL by BUS. Nhấn school và bus.', ['go to school', 'by bus'], 'Không đọc school thiếu âm /sk/ đầu.'),
      sentence('lib-routine-s5', 'I study English after lunch.', 'Tôi học tiếng Anh sau bữa trưa.', 'I STU-dy ENG-lish AF-ter lunch.', ['study English', 'after lunch'], 'Không nuốt âm /ch/ cuối lunch.'),
      sentence('lib-routine-s6', 'I play with my friends.', 'Tôi chơi với bạn bè.', 'I PLAY with my FRIENDS. Bật /z/ cuối friends.', ['play', 'friends'], 'Đừng quên âm cuối của friends.'),
      sentence('lib-routine-s7', 'I do my homework in the evening.', 'Tôi làm bài tập vào buổi tối.', 'I DO my HOME-work in the EVE-ning.', ['homework', 'evening'], 'Không đọc evening quá nhanh mất âm đầu.'),
      sentence('lib-routine-s8', 'I read a short story.', 'Tôi đọc một câu chuyện ngắn.', 'I READ a SHORT STO-ry. Nhấn short story.', ['read', 'short story'], 'Đừng nhầm read hiện tại /riːd/ với quá khứ /red/.'),
      sentence('lib-routine-s9', 'I go to bed at ten.', 'Tôi đi ngủ lúc mười giờ.', 'I GO to BED at TEN. Ngắt nhẹ trước at ten.', ['go to bed', 'ten'], 'Không đọc bed thành bad.'),
    ],
  },
  {
    id: 'food-order-speaking-room', title: 'Food - Ordering a Snack', level: 'A1+', topic: 'Đồ ăn và gọi món', duration: '9 câu', source: 'library', description: 'Tập nói câu ngắn khi gọi đồ ăn, hỏi giá và nói sở thích.',
    transcript: [
      sentence('lib-food-s1', 'I would like a sandwich.', 'Tôi muốn một chiếc bánh sandwich.', 'I would LIKE a SAND-wich. Would đọc nhẹ.', ['would like', 'sandwich'], 'Không đọc would rõ âm /l/; âm l câm.'),
      sentence('lib-food-s2', 'Can I have some water?', 'Cho tôi xin một ít nước được không?', 'Can I HAVE some WA-ter? Lên giọng cuối.', ['Can I have', 'water'], 'Can I nối nhẹ, không tách quá lâu.'),
      sentence('lib-food-s3', 'This soup is hot.', 'Món súp này nóng.', 'This SOUP is HOT. Nhấn soup và hot.', ['soup', 'hot'], 'Không đọc soup thành sốp; âm /uː/ dài.'),
      sentence('lib-food-s4', 'The rice tastes good.', 'Cơm này có vị ngon.', 'The RICE tastes GOOD. Bật /s/ ở rice.', ['rice', 'tastes good'], 'Đừng quên âm /s/ cuối tastes.'),
      sentence('lib-food-s5', 'I do not eat spicy food.', 'Tôi không ăn đồ cay.', 'I do NOT eat SPI-cy FOOD. Nhấn not.', ['spicy food'], 'Spicy có hai âm tiết, không đọc thành một âm.'),
      sentence('lib-food-s6', 'How much is this cake?', 'Cái bánh này giá bao nhiêu?', 'How MUCH is this CAKE? Nhấn much và cake.', ['How much', 'cake'], 'Không bỏ âm /k/ cuối cake.'),
      sentence('lib-food-s7', 'I like fruit for dessert.', 'Tôi thích trái cây cho món tráng miệng.', 'I LIKE FRUIT for de-SERT. Dessert nhấn âm hai.', ['fruit', 'dessert'], 'Đừng nhầm desert và dessert; dessert nhấn âm cuối.'),
      sentence('lib-food-s8', 'The menu is on the table.', 'Thực đơn ở trên bàn.', 'The MEN-u is on the TA-ble.', ['menu', 'table'], 'Không đọc table thành ta-bờ; giữ âm /l/ nhẹ.'),
      sentence('lib-food-s9', 'Thank you for the meal.', 'Cảm ơn vì bữa ăn.', 'THANK you for the MEAL. Âm meal kéo dài.', ['Thank you', 'meal'], 'Luyện /θ/ trong thank, không đọc thành tank.'),
    ],
  },
  {
    id: 'directions-speaking-room', title: 'Directions - Around Town', level: 'A1+', topic: 'Hỏi và chỉ đường', duration: '9 câu', source: 'library', description: 'Luyện nói khi hỏi đường, rẽ trái/phải và tìm địa điểm trong thành phố.',
    transcript: [
      sentence('lib-directions-s1', 'Excuse me, where is the bank?', 'Xin lỗi, ngân hàng ở đâu?', 'ex-CUSE me, WHERE is the BANK? Lịch sự ở excuse me.', ['Excuse me', 'where', 'bank'], 'Không đọc excuse thiếu âm /z/.'),
      sentence('lib-directions-s2', 'Go straight ahead.', 'Đi thẳng về phía trước.', 'GO STRAIGHT a-HEAD. Nhấn straight.', ['go straight', 'ahead'], 'Không bỏ âm /t/ cuối straight.'),
      sentence('lib-directions-s3', 'Turn left at the corner.', 'Rẽ trái ở góc đường.', 'TURN LEFT at the COR-ner. Nhấn left.', ['turn left', 'corner'], 'Bật /t/ cuối left nhẹ trước at.'),
      sentence('lib-directions-s4', 'Turn right after the school.', 'Rẽ phải sau trường học.', 'TURN RIGHT AF-ter the SCHOOL. Nhấn right.', ['turn right', 'after school'], 'Không đọc right mất âm /r/ đầu.'),
      sentence('lib-directions-s5', 'The park is next to the library.', 'Công viên ở cạnh thư viện.', 'The PARK is NEXT to the LI-bra-ry.', ['next to', 'library'], 'Library thường đọc 3 âm tiết; đừng kéo quá dài.'),
      sentence('lib-directions-s6', 'It is across from the bus stop.', 'Nó ở đối diện trạm xe buýt.', 'It is a-CROSS from the BUS stop.', ['across from', 'bus stop'], 'Nhấn âm hai của across.'),
      sentence('lib-directions-s7', 'Is it far from here?', 'Nó có xa đây không?', 'Is it FAR from HERE? Lên giọng cuối câu hỏi.', ['far', 'from here'], 'Không đọc here thành hair.'),
      sentence('lib-directions-s8', 'It takes five minutes.', 'Mất năm phút.', 'It TAKES FIVE MI-nutes. Nhấn five.', ['five minutes'], 'Không quên âm /s/ trong takes.'),
      sentence('lib-directions-s9', 'Thank you for your help.', 'Cảm ơn bạn đã giúp đỡ.', 'THANK you for your HELP. Nhấn thank và help.', ['Thank you', 'help'], 'Không nuốt âm /p/ cuối help.'),
    ],
  },
];
`);

fs.writeFileSync('apps/web/src/pages/ShadowingPage.tsx', String.raw`import { useEffect, useMemo, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { Box, Button, Flex, FormControl, FormLabel, HStack, Icon, Input, SimpleGrid, Tag, TagLabel, Text, Textarea, VStack } from '@chakra-ui/react';
import { CheckCircle2, Edit3, Headphones, Mic, Pause, Play, PlusCircle, RotateCcw, Save, Sparkles, Trash2, Volume2, Waves } from 'lucide-react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { createBubbleLoop, createCardEntrance, createCorrectAnswerBurst, createTranscriptHighlight, safeGsapSet } from '../lib/animations/gsap-utils';
import { shadowingVideos, type ShadowingSentence, type ShadowingVideo } from '../lib/p-english/shadowing-data';

if (typeof window !== 'undefined') gsap.registerPlugin(useGSAP);

const COLORS = { card: '#FFFFFF', softAqua: '#DDF5FF', softBlue: '#E8F4FF', oceanBlue: '#2F9EEB', deepBlue: '#1F6FD6', text: '#102A43', muted: '#52667A', border: '#D7E8F5', yellow: '#FFF3C4', green: '#22C55E' };
const PROGRESS_KEY = 'p-english:shadowing-progress';
const CUSTOM_ITEMS_KEY = 'p-english:shadowing-custom-items';
type TabKey = 'lesson' | 'library' | 'custom' | 'weak';
type ProgressState = { completedItemIds: string[]; practicedSegmentIds: string[]; weakSegmentIds: string[]; lastPracticedItemId: string | null };
const EMPTY_PROGRESS: ProgressState = { completedItemIds: [], practicedSegmentIds: [], weakSegmentIds: [], lastPracticedItemId: null };

function getStorage() { if (typeof window === 'undefined') return null; try { return window.localStorage ?? null; } catch { return null; } }
function unique(values: string[]) { return Array.from(new Set(values.filter(Boolean))); }
function readJson<T>(key: string, fallback: T): T { const storage = getStorage(); if (!storage) return fallback; try { const raw = storage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; } }
function writeJson(key: string, value: unknown) { const storage = getStorage(); if (storage) storage.setItem(key, JSON.stringify(value)); }
function normalizeProgress(value: Partial<ProgressState>): ProgressState { return { completedItemIds: unique(Array.isArray(value.completedItemIds) ? value.completedItemIds : []), practicedSegmentIds: unique(Array.isArray(value.practicedSegmentIds) ? value.practicedSegmentIds : []), weakSegmentIds: unique(Array.isArray(value.weakSegmentIds) ? value.weakSegmentIds : []), lastPracticedItemId: typeof value.lastPracticedItemId === 'string' ? value.lastPracticedItemId : null }; }
function segmentKey(itemId: string, sentenceId: string) { return itemId + ':' + sentenceId; }
function customSentence(text: string, index: number): ShadowingSentence { return { id: 'custom-s' + (index + 1), text, meaningVi: 'Câu tự nhập - hãy hiểu ý chính rồi nói lại theo nhịp của bạn.', pronunciationHintVi: 'Đọc chậm từng cụm, sau đó nối tự nhiên hơn ở lần thứ hai.', focusWords: text.split(/\s+/).filter(Boolean).slice(0, 3), commonMistakeHintVi: 'Đừng vội nói nhanh; ưu tiên rõ âm cuối và nhịp câu.' }; }
function transcriptFromText(text: string) { return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map(customSentence); }
function readCustomItems(): ShadowingVideo[] { const items = readJson<ShadowingVideo[]>(CUSTOM_ITEMS_KEY, []); return Array.isArray(items) ? items.filter((item) => item?.id && item?.title && Array.isArray(item.transcript)).map((item) => ({ ...item, source: 'custom' })) : []; }

export function ShadowingPage() {
  const [progress, setProgress] = useState<ProgressState>(() => normalizeProgress(readJson(PROGRESS_KEY, EMPTY_PROGRESS)));
  const [customItems, setCustomItems] = useState<ShadowingVideo[]>(() => readCustomItems());
  const allItems = useMemo(() => [...shadowingVideos, ...customItems], [customItems]);
  const initialId = progress.lastPracticedItemId && allItems.some((item) => item.id === progress.lastPracticedItemId) ? progress.lastPracticedItemId : allItems[0]?.id ?? '';
  const [activeTab, setActiveTab] = useState<TabKey>('lesson');
  const [selectedItemId, setSelectedItemId] = useState(initialId);
  const selectedItem = useMemo(() => allItems.find((item) => item.id === selectedItemId) ?? allItems[0], [allItems, selectedItemId]);
  const [selectedSentenceId, setSelectedSentenceId] = useState(selectedItem?.transcript[0]?.id ?? '');
  const selectedSentence = useMemo(() => selectedItem?.transcript.find((item) => item.id === selectedSentenceId) ?? selectedItem?.transcript[0] ?? null, [selectedItem, selectedSentenceId]);
  const [flowStep, setFlowStep] = useState(1);
  const [recording, setRecording] = useState(false);
  const [recordMessage, setRecordMessage] = useState('Bấm ghi âm để luyện bước 4. Nếu trình duyệt không hỗ trợ, bạn vẫn có thể tự nói và đánh dấu đã luyện.');
  const [playbackUrl, setPlaybackUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customTranscript, setCustomTranscript] = useState('');
  const [editingCustomId, setEditingCustomId] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState('Dán mỗi câu trên một dòng để tạo bài luyện riêng.');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const roomRef = useRef<HTMLDivElement | null>(null);
  const recordPulseRef = useRef<HTMLDivElement | null>(null);
  const completionRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();

  const practicedForItem = useMemo(() => selectedItem ? selectedItem.transcript.filter((sentence) => progress.practicedSegmentIds.includes(segmentKey(selectedItem.id, sentence.id))).length : 0, [progress.practicedSegmentIds, selectedItem]);
  const allSentencesCompleted = Boolean(selectedItem?.transcript.length && practicedForItem >= selectedItem.transcript.length);
  const weakSegments = useMemo(() => allItems.flatMap((item) => item.transcript.map((sentence) => ({ item, sentence, key: segmentKey(item.id, sentence.id) }))).filter((entry) => progress.weakSegmentIds.includes(entry.key)), [allItems, progress.weakSegmentIds]);
  const visibleItems = useMemo(() => {
    if (activeTab === 'weak') return weakSegments.map((entry) => entry.item).filter((item, index, arr) => arr.findIndex((x) => x.id === item.id) === index);
    return allItems.filter((item) => item.source === activeTab);
  }, [activeTab, allItems, weakSegments]);

  useEffect(() => { writeJson(PROGRESS_KEY, progress); }, [progress]);
  useEffect(() => { writeJson(CUSTOM_ITEMS_KEY, customItems); }, [customItems]);
  useEffect(() => { if (selectedItem && !selectedItem.transcript.some((item) => item.id === selectedSentenceId)) setSelectedSentenceId(selectedItem.transcript[0]?.id ?? ''); setFlowStep(1); setPlaybackUrl(''); }, [selectedItem?.id]);
  useEffect(() => { if (visibleItems.length && !visibleItems.some((item) => item.id === selectedItemId)) setSelectedItemId(visibleItems[0].id); }, [activeTab, visibleItems, selectedItemId]);
  useEffect(() => () => { if (typeof window !== 'undefined') window.speechSynthesis?.cancel(); if (playbackUrl) URL.revokeObjectURL(playbackUrl); }, [playbackUrl]);

  useGSAP(() => {
    const root = rootRef.current; if (!root) return;
    const cards = root.querySelectorAll('.shadowing-card, .shadowing-room, .shadowing-transcript-card');
    const bubbles = root.querySelectorAll('.shadowing-ocean-bubble');
    if (reducedMotion) { safeGsapSet([cards, bubbles], { autoAlpha: 1, x: 0, y: 0, scale: 1 }); return; }
    createCardEntrance(cards, { y: 14, duration: 0.42, delay: 0.04, stagger: 0.04 });
    createBubbleLoop(bubbles, { y: -10, x: 3, duration: 7.2, stagger: 0.22, scale: 1.04 });
  }, { scope: rootRef, dependencies: [activeTab, selectedItemId, reducedMotion], revertOnUpdate: true });

  useGSAP(() => {
    const root = rootRef.current; if (!root) return;
    const activeCard = root.querySelector('[data-shadowing-sentence-id="' + selectedSentenceId + '"]');
    if (reducedMotion) { safeGsapSet([activeCard, roomRef.current], { autoAlpha: 1, x: 0, y: 0, scale: 1 }); return; }
    if (activeCard) { createTranscriptHighlight(activeCard, { scale: 1.015, duration: 0.16 }); activeCard.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
    if (roomRef.current) gsap.fromTo(roomRef.current, { autoAlpha: 0.82, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.22, ease: 'power2.out' });
  }, { scope: rootRef, dependencies: [selectedSentenceId, reducedMotion], revertOnUpdate: true });

  useGSAP(() => {
    const pulse = recordPulseRef.current; if (!pulse) return;
    if (reducedMotion || !recording) { safeGsapSet(pulse, { autoAlpha: recording ? 0.2 : 0, scale: 1 }); return; }
    gsap.fromTo(pulse, { autoAlpha: 0.28, scale: 0.94 }, { autoAlpha: 0, scale: 1.28, duration: 1.12, repeat: -1, ease: 'sine.out', force3D: true });
  }, { scope: rootRef, dependencies: [recording, reducedMotion], revertOnUpdate: true });

  useGSAP(() => { if (!completionRef.current || !allSentencesCompleted) return; if (reducedMotion) safeGsapSet(completionRef.current, { autoAlpha: 1, scale: 1 }); else createCorrectAnswerBurst(completionRef.current, { scale: 1.018, duration: 0.24 }); }, { scope: rootRef, dependencies: [allSentencesCompleted, reducedMotion], revertOnUpdate: true });

  const updateProgress = (updater: (current: ProgressState) => ProgressState) => setProgress((current) => normalizeProgress(updater(current)));
  const chooseItem = (item: ShadowingVideo, sentenceId?: string) => { setSelectedItemId(item.id); setSelectedSentenceId(sentenceId ?? item.transcript[0]?.id ?? ''); updateProgress((current) => ({ ...current, lastPracticedItemId: item.id })); };
  const speak = (rate: number, step: number) => { if (!selectedSentence || typeof window === 'undefined' || !('speechSynthesis' in window)) return; window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(selectedSentence.text); utterance.lang = 'en-US'; utterance.rate = rate; window.speechSynthesis.speak(utterance); setFlowStep(Math.max(flowStep, step)); };
  const markPracticed = () => { if (!selectedItem || !selectedSentence) return; const key = segmentKey(selectedItem.id, selectedSentence.id); updateProgress((current) => { const practiced = unique([...current.practicedSegmentIds, key]); const completed = selectedItem.transcript.every((sentence) => practiced.includes(segmentKey(selectedItem.id, sentence.id))) ? unique([...current.completedItemIds, selectedItem.id]) : current.completedItemIds; return { ...current, practicedSegmentIds: practiced, completedItemIds: completed, weakSegmentIds: current.weakSegmentIds.filter((item) => item !== key), lastPracticedItemId: selectedItem.id }; }); setFlowStep(6); };
  const toggleWeak = () => { if (!selectedItem || !selectedSentence) return; const key = segmentKey(selectedItem.id, selectedSentence.id); updateProgress((current) => ({ ...current, weakSegmentIds: current.weakSegmentIds.includes(key) ? current.weakSegmentIds.filter((item) => item !== key) : unique([...current.weakSegmentIds, key]) })); };
  const nextSentence = () => { if (!selectedItem || !selectedSentence) return; const index = selectedItem.transcript.findIndex((item) => item.id === selectedSentence.id); const next = selectedItem.transcript[(index + 1) % selectedItem.transcript.length]; setSelectedSentenceId(next.id); setFlowStep(1); setPlaybackUrl(''); };
  const startSpeakingStep = () => setFlowStep(Math.max(flowStep, 3));
  const toggleRecord = async () => { if (!selectedSentence) return; if (!('MediaRecorder' in window) || !navigator.mediaDevices?.getUserMedia) { setRecordMessage('Trình duyệt chưa hỗ trợ ghi âm trực tiếp. Bạn vẫn có thể nói theo và bấm đánh dấu đã luyện.'); setFlowStep(4); return; } if (recording) { mediaRecorderRef.current?.stop(); setRecording(false); setFlowStep(5); return; } try { const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); chunksRef.current = []; const recorder = new MediaRecorder(stream); mediaRecorderRef.current = recorder; recorder.ondataavailable = (event) => chunksRef.current.push(event.data); recorder.onstop = () => { stream.getTracks().forEach((track) => track.stop()); const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' }); if (playbackUrl) URL.revokeObjectURL(playbackUrl); setPlaybackUrl(URL.createObjectURL(blob)); setRecordMessage('Đã ghi âm. Hãy nghe lại rồi đánh dấu đã luyện.'); }; recorder.start(); setRecording(true); setRecordMessage('Đang ghi âm... nói theo câu hiện tại.'); setFlowStep(4); } catch { setRecordMessage('Không thể mở micro. Hãy kiểm tra quyền micro hoặc luyện bằng cách nói trực tiếp.'); setFlowStep(4); } };
  const saveCustom = () => { const transcript = transcriptFromText(customTranscript); if (!transcript.length) { setCustomMessage('Bạn cần nhập ít nhất một câu transcript.'); return; } const item: ShadowingVideo = { id: editingCustomId ?? 'custom-shadowing-' + Date.now(), title: customTitle.trim() || 'Bài Shadowing tự tạo', level: 'Tự tạo', topic: 'Bài của tôi', duration: transcript.length + ' câu', source: 'custom', description: 'Bài luyện Shadowing được tạo từ transcript bạn nhập và lưu cục bộ trên thiết bị này.', transcript }; setCustomItems((items) => editingCustomId ? items.map((current) => current.id === editingCustomId ? item : current) : [item, ...items]); setEditingCustomId(null); setCustomTitle(''); setCustomTranscript(''); setCustomMessage('Đã lưu bài tự tạo và có thể luyện lại sau khi tải lại trang.'); setActiveTab('custom'); chooseItem(item); };
  const editCustom = (item: ShadowingVideo) => { setEditingCustomId(item.id); setCustomTitle(item.title); setCustomTranscript(item.transcript.map((sentence) => sentence.text).join('\n')); setActiveTab('custom'); setCustomMessage('Đang chỉnh sửa: ' + item.title); };
  const deleteCustom = (id: string) => { setCustomItems((items) => items.filter((item) => item.id !== id)); if (selectedItemId === id) setSelectedItemId(shadowingVideos[0]?.id ?? ''); setCustomMessage('Đã xóa bài tự tạo khỏi thiết bị này.'); };

  const steps = ['Nghe mẫu', 'Nghe chậm', 'Nói theo', 'Ghi âm', 'Nghe lại', 'Đánh dấu đã luyện', 'Câu tiếp theo'];

  return (
    <Box ref={rootRef} px={{ base: '4', md: '6' }} pb={{ base: '28', md: '12' }} maxW="1320px" mx="auto" overflowX="hidden">
      <Flex className="shadowing-card" mb="5" p={{ base: '5', md: '7' }} borderRadius="3xl" bgGradient="linear(135deg, #DDF5FF 0%, #E8F4FF 52%, #FFFFFF 100%)" border="1px solid" borderColor="#BAE6FD" boxShadow="0 18px 44px rgba(47, 158, 235, 0.14)" direction={{ base: 'column', md: 'row' }} justify="space-between" gap="4" position="relative" overflow="hidden">
        <Box className="shadowing-ocean-bubble" position="absolute" right="-36px" top="-36px" w="190px" h="190px" borderRadius="full" bg="rgba(91,188,235,0.20)" pointerEvents="none" />
        <Box minW="0" position="relative"><HStack mb="2" gap="2" wrap="wrap"><Tag borderRadius="full" bg={COLORS.yellow} color={COLORS.text}><TagLabel>🐋 Shadowing</TagLabel></Tag><Tag borderRadius="full" bg={COLORS.softAqua} color={COLORS.deepBlue}><TagLabel>Speaking room</TagLabel></Tag></HStack><Text fontSize={{ base: '2xl', md: '4xl' }} fontWeight="900" color={COLORS.text} lineHeight="1.1">Shadowing - Phòng luyện nói có hướng dẫn</Text><Text mt="3" color={COLORS.muted} maxW="760px" fontWeight="600">Không phụ thuộc video hoa mẫu: nghe câu bằng giọng mẫu, luyện chậm, ghi âm, nghe lại và lưu câu yếu để ôn riêng.</Text></Box>
        <Text fontSize="6xl" aria-hidden>🎙️</Text>
      </Flex>

      <HStack className="shadowing-card" gap="2" mb="5" overflowX="auto" pb="1">
        {([{ key: 'lesson', label: 'Từ bài học' }, { key: 'library', label: 'Thư viện luyện nói' }, { key: 'custom', label: 'Bài của tôi' }, { key: 'weak', label: 'Câu yếu cần luyện lại' }] as Array<{ key: TabKey; label: string }>).map((tab) => <Button key={tab.key} flexShrink={0} borderRadius="full" colorScheme={activeTab === tab.key ? 'blue' : 'gray'} variant={activeTab === tab.key ? 'solid' : 'outline'} onClick={() => setActiveTab(tab.key)}>{tab.label}{tab.key === 'weak' ? ' (' + weakSegments.length + ')' : ''}</Button>)}
      </HStack>

      <SimpleGrid columns={{ base: 1, lg: 3 }} gap="5" minW="0">
        <VStack align="stretch" gap="4" minW="0" order={{ base: 2, lg: 1 }}>
          {activeTab === 'weak' && !weakSegments.length ? <Box className="shadowing-card" p="4" borderRadius="2xl" bg="#FFFBEB" border="1px solid" borderColor="#FDE68A"><Text fontWeight="900">Chưa có câu yếu</Text><Text color={COLORS.muted} fontSize="sm">Bấm “Lưu câu yếu” ở phòng luyện để đưa câu vào danh sách ôn lại.</Text></Box> : null}
          {(activeTab === 'weak' ? visibleItems : visibleItems).map((item) => { const active = item.id === selectedItem?.id; return <Box className="shadowing-card" key={item.id} as="button" type="button" textAlign="left" p="4" borderRadius="2xl" bg={active ? COLORS.softBlue : COLORS.card} border="1px solid" borderColor={active ? '#BAE6FD' : COLORS.border} boxShadow={active ? '0 14px 32px rgba(31, 111, 214, 0.12)' : '0 10px 26px rgba(16, 42, 67, 0.05)'} onClick={() => chooseItem(item)} w="100%" minW="0"><HStack mb="2" align="start"><Icon as={Headphones} color={COLORS.oceanBlue} /><Text fontWeight="900" color={COLORS.text}>{item.title}</Text></HStack><Text fontSize="sm" color={COLORS.muted}>{item.description}</Text><HStack mt="3" gap="2" wrap="wrap"><Tag size="sm"><TagLabel>{item.level}</TagLabel></Tag><Tag size="sm"><TagLabel>{item.duration}</TagLabel></Tag><Tag size="sm"><TagLabel>{item.source === 'lesson' ? 'Bài học' : item.source === 'custom' ? 'Của tôi' : 'Thư viện'}</TagLabel></Tag></HStack></Box>; })}
          {activeTab === 'weak' ? weakSegments.map((entry) => <Box key={entry.key} className="shadowing-card" as="button" type="button" textAlign="left" p="4" borderRadius="2xl" bg="#FFF7ED" border="1px solid" borderColor="#FED7AA" onClick={() => chooseItem(entry.item, entry.sentence.id)}><Text fontWeight="900">{entry.sentence.text}</Text><Text fontSize="sm" color={COLORS.muted}>{entry.item.title}</Text></Box>) : null}
          <Box className="shadowing-card" p="4" borderRadius="2xl" bg="linear-gradient(135deg, #FFFFFF, #F8FCFF)" border="1px solid" borderColor={COLORS.border}>
            <HStack mb="3" align="start"><Icon as={PlusCircle} color={COLORS.oceanBlue} /><Box><Text fontWeight="900">Bài của tôi</Text><Text fontSize="sm" color={COLORS.muted}>Tạo/sửa transcript, lưu cục bộ và luyện như bài thật.</Text></Box></HStack>
            <VStack align="stretch" gap="3"><FormControl><FormLabel fontSize="sm" fontWeight="800">Tiêu đề</FormLabel><Input value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} placeholder="Ví dụ: My classroom practice" bg="white" borderRadius="xl" /></FormControl><FormControl><FormLabel fontSize="sm" fontWeight="800">Transcript - mỗi dòng là một câu</FormLabel><Textarea value={customTranscript} onChange={(e) => setCustomTranscript(e.target.value)} placeholder={'Hello, my name is Anna.\nI am learning English every day.'} bg="white" borderRadius="xl" minH="140px" /></FormControl><Button leftIcon={<Icon as={Save} />} borderRadius="full" bg={COLORS.oceanBlue} color="white" _hover={{ bg: COLORS.deepBlue }} onClick={saveCustom}>{editingCustomId ? 'Lưu chỉnh sửa' : 'Tạo bài luyện'}</Button><Text fontSize="sm" color={COLORS.muted}>{customMessage}</Text>{customItems.map((item) => <Flex key={item.id} gap="2" align="center" justify="space-between" p="3" borderRadius="xl" bg={COLORS.softBlue} minW="0"><Text fontWeight="800" noOfLines={1}>{item.title}</Text><HStack><Button size="xs" onClick={() => chooseItem(item)}>Luyện</Button><Button size="xs" leftIcon={<Icon as={Edit3} />} onClick={() => editCustom(item)}>Sửa</Button><Button size="xs" colorScheme="red" leftIcon={<Icon as={Trash2} />} onClick={() => deleteCustom(item.id)}>Xóa</Button></HStack></Flex>)}</VStack>
          </Box>
        </VStack>

        <Box gridColumn={{ lg: 'span 2' }} minW="0" order={{ base: 1, lg: 2 }}>
          <Box ref={roomRef} className="shadowing-room" p={{ base: '4', md: '6' }} borderRadius="3xl" bg={COLORS.card} border="1px solid" borderColor={COLORS.border} boxShadow="0 16px 38px rgba(16, 42, 67, 0.06)" minW="0">
            <Flex justify="space-between" align="start" gap="3" wrap="wrap"><Box minW="0"><Text fontSize="sm" fontWeight="900" color={COLORS.oceanBlue}>{selectedItem?.title}</Text><Text mt="2" fontSize={{ base: '2xl', md: '4xl' }} fontWeight="950" color={COLORS.text} lineHeight="1.16">{selectedSentence?.text ?? 'Chọn một bài luyện'}</Text></Box><Tag borderRadius="full" bg={allSentencesCompleted ? '#DCFCE7' : COLORS.yellow}><TagLabel>{practicedForItem}/{selectedItem?.transcript.length ?? 0} câu</TagLabel></Tag></Flex>
            <Text mt="4" color={COLORS.muted} fontWeight="700">{selectedSentence?.meaningVi}</Text>
            <SimpleGrid mt="4" columns={{ base: 1, md: 2 }} gap="3"><Box p="3" borderRadius="2xl" bg={COLORS.softBlue}><Text fontWeight="900">Gợi ý phát âm</Text><Text fontSize="sm" color={COLORS.muted}>{selectedSentence?.pronunciationHintVi}</Text></Box><Box p="3" borderRadius="2xl" bg="#FFFBEB"><Text fontWeight="900">Lỗi thường gặp</Text><Text fontSize="sm" color={COLORS.muted}>{selectedSentence?.commonMistakeHintVi}</Text></Box></SimpleGrid>
            <HStack mt="4" gap="2" wrap="wrap">{selectedSentence?.focusWords.map((word) => <Tag key={word} borderRadius="full" bg={COLORS.softAqua} color={COLORS.deepBlue}><TagLabel>{word}</TagLabel></Tag>)}</HStack>
            <HStack mt="5" gap="2" wrap="wrap">{steps.map((label, index) => <Tag key={label} borderRadius="full" bg={flowStep >= index + 1 ? COLORS.softAqua : '#F1F5F9'} color={flowStep >= index + 1 ? COLORS.deepBlue : COLORS.muted}><TagLabel>{index + 1}. {label}</TagLabel></Tag>)}</HStack>
            <Flex mt="5" gap="3" wrap="wrap"><Button leftIcon={<Icon as={Volume2} />} borderRadius="full" bg={COLORS.oceanBlue} color="white" onClick={() => speak(0.95, 1)}>Nghe mẫu</Button><Button leftIcon={<Icon as={Waves} />} borderRadius="full" variant="outline" colorScheme="blue" onClick={() => speak(0.68, 2)}>Nghe chậm</Button><Button leftIcon={<Icon as={Play} />} borderRadius="full" variant="outline" onClick={startSpeakingStep}>Nói theo</Button><Box position="relative"><Box ref={recordPulseRef} position="absolute" inset="-6px" borderRadius="full" bg="rgba(239,68,68,0.28)" pointerEvents="none" /><Button leftIcon={<Icon as={recording ? Pause : Mic} />} borderRadius="full" colorScheme={recording ? 'red' : 'blue'} variant={recording ? 'solid' : 'outline'} onClick={toggleRecord}>{recording ? 'Dừng ghi' : 'Ghi âm'}</Button></Box>{playbackUrl ? <Button as="a" href={playbackUrl} target="_blank" leftIcon={<Icon as={Headphones} />} borderRadius="full" variant="outline">Nghe lại</Button> : null}<Button leftIcon={<Icon as={CheckCircle2} />} borderRadius="full" colorScheme="green" onClick={markPracticed}>Đánh dấu đã luyện</Button><Button leftIcon={<Icon as={Sparkles} />} borderRadius="full" variant="outline" colorScheme={progress.weakSegmentIds.includes(selectedItem && selectedSentence ? segmentKey(selectedItem.id, selectedSentence.id) : '') ? 'orange' : 'gray'} onClick={toggleWeak}>Lưu câu yếu</Button><Button leftIcon={<Icon as={RotateCcw} />} borderRadius="full" variant="outline" onClick={nextSentence}>Câu tiếp theo</Button></Flex>
            <Text mt="3" fontSize="sm" color={COLORS.muted}>{recordMessage}</Text>
          </Box>
          <Box ref={completionRef} className="shadowing-card" mt="4" p="4" borderRadius="2xl" bg={allSentencesCompleted ? '#F0FDF4' : COLORS.softBlue} border="1px solid" borderColor={allSentencesCompleted ? '#BBF7D0' : '#BAE6FD'}><HStack><Icon as={allSentencesCompleted ? CheckCircle2 : Sparkles} color={allSentencesCompleted ? COLORS.green : COLORS.oceanBlue} /><Text fontWeight="950">{allSentencesCompleted ? 'Hoàn thành bài Shadowing' : 'Tiến độ phòng luyện'}</Text></HStack><Text mt="2" color={COLORS.muted} fontSize="sm">Đã luyện {practicedForItem}/{selectedItem?.transcript.length ?? 0} câu. Câu yếu được lưu riêng để retry.</Text></Box>
          <Box className="shadowing-card" mt="5" p="4" borderRadius="3xl" bg="linear-gradient(135deg, #FFFFFF, #F8FCFF)" border="1px solid" borderColor={COLORS.border} minW="0">
            <HStack mb="3"><Icon as={Waves} color={COLORS.oceanBlue} /><Text fontWeight="900">Transcript luyện nói</Text></HStack>
            <VStack align="stretch" gap="3">{(selectedItem?.transcript ?? []).map((sentence, index) => { const active = sentence.id === selectedSentence?.id; const done = selectedItem ? progress.practicedSegmentIds.includes(segmentKey(selectedItem.id, sentence.id)) : false; const weak = selectedItem ? progress.weakSegmentIds.includes(segmentKey(selectedItem.id, sentence.id)) : false; return <Box className="shadowing-transcript-card" key={sentence.id} data-shadowing-sentence-id={sentence.id} as="button" type="button" textAlign="left" p="4" borderRadius="2xl" bg={active ? COLORS.softAqua : 'white'} border="1px solid" borderColor={weak ? '#FDBA74' : active ? '#7DD3FC' : COLORS.border} boxShadow={active ? '0 14px 28px rgba(47, 158, 235, 0.13)' : 'none'} onClick={() => { setSelectedSentenceId(sentence.id); setFlowStep(1); }} w="100%" minW="0"><HStack align="start" gap="3"><Flex w="32px" h="32px" borderRadius="full" bg={done ? COLORS.green : active ? COLORS.oceanBlue : COLORS.softBlue} color={done || active ? 'white' : COLORS.deepBlue} align="center" justify="center" fontWeight="900" flexShrink={0}>{done ? <Icon as={CheckCircle2} boxSize="4" /> : index + 1}</Flex><Box minW="0"><Text fontWeight="900" color={COLORS.text} lineHeight="1.45">{sentence.text}</Text><Text fontSize="sm" color={COLORS.muted} lineHeight="1.55">{sentence.meaningVi}</Text><HStack mt="2" gap="2" wrap="wrap">{weak ? <Tag size="sm" colorScheme="orange"><TagLabel>Câu yếu</TagLabel></Tag> : null}{sentence.focusWords.map((word) => <Tag key={word} size="sm"><TagLabel>{word}</TagLabel></Tag>)}</HStack></Box></HStack></Box>; })}</VStack>
          </Box>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
`);