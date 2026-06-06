import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import Database from 'better-sqlite3';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

dotenv.config();

const PORT = Number(process.env.PORT ?? 8080);
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';
const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(__dirname, '../data/state.json');
const DB_PATH = resolve(__dirname, '../data/state.sqlite');

type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  coin: number;
  streak: number;
  vip: boolean;
  isVip: boolean;
  vipExpiresAt: string | null;
  proExpiresAt: string | null;
  bio: string;
};

type Group = {
  id: string;
  name: string;
  description: string;
  order: number;
};

type PathSummary = {
  id: string;
  groupId: string;
  name: string;
  description: string;
  coverImage: string | null;
  difficulty: number;
  displayOrder: number;
  wordSetCount: number;
  group: Group;
};

type WordItem = {
  id: string;
  term: string;
  meaning: string;
  pronunciation: string;
  partOfSpeech: string;
  example: string;
  learned: boolean;
  srsLevel: number;
};

type Category = {
  id: string;
  name: string;
  description: string;
  icon: string;
  userId: string;
  ispublic: boolean;
  note: string | null;
  createdAt: string;
  wordCount: number;
  user: { name: string };
};

type Folder = {
  id: number;
  name: string;
  icon: string;
  isShared: boolean;
  upvoteCount: number;
  createdAt: string;
  categoryCount: number;
  wordCount: number;
  user: { id: number | string; name: string };
};

type Vocabulary = {
  id: string;
  term: string;
  meaning: string;
  pronunciation?: string;
  partOfSpeech?: string;
  example?: string;
  isLearned: boolean;
  categoryId: string | null;
  userId?: string | null;
};

type ShopItem = {
  id: string;
  name: string;
  price: number;
  description: string;
  emoji: string;
};

type Message = {
  id: string;
  content: string;
  createdAt: string;
  author: { id: number; name: string };
  replyToMessageId: string | null;
};

type Subscription = { id: string; type: string; status: string; userId?: string | null };
type SharedInvitation = { id: string; email: string; status: 'invited' | 'accepted' | 'declined' };
type SharedStreakState = { inviter: string; invitee: string | null; status: string; invitations: SharedInvitation[] };
type AiUsage =
  | number
  | {
      limitPerDay?: number;
      usedToday?: number;
      remainingToday?: number;
      isVip?: boolean;
      today?: string;
      period?: string;
      limitPerMonth?: number;
      usedThisMonth?: number;
      remainingThisMonth?: number;
      month?: string;
      [key: string]: string | number | boolean | null | undefined;
    };
type AiGeneration = { id: string; text: string; image: string | null; createdAt: string; termCount: number };
type ActivityState = {
  currentStreak: number;
  calendar: Array<{ date: string; count: number }>;
  leaderboard: Array<{ user: { id: string | number; name: string; avatar: string }; activityCount: number }>;
};
type ShopState = {
  coins: number;
  items: ShopItem[];
  inventory: string[];
  equippedSound: string | null;
  equippedTypingSound: string | null;
  customUploadPrice: number;
};
type UserShopState = Pick<ShopState, 'coins' | 'inventory' | 'equippedSound' | 'equippedTypingSound'>;
type PathProgressRecord = Record<string, Record<string, { learned: boolean; srsLevel: number }>>;

type AppState = {
  users: User[];
  refreshTokens: Record<string, string>;
  groups: Group[];
  paths: PathSummary[];
  pathWords: Record<string, WordItem[]>;
  categories: Category[];
  folders: { newest: Folder[]; trending: Folder[]; mine: Folder[] };
  vocabularies: Vocabulary[];
  pathProgressByUser: Record<string, PathProgressRecord>;
  activity: ActivityState;
  activityByUser: Record<string, ActivityState>;
  shop: ShopState;
  shopByUser: Record<string, UserShopState>;
  messages: Message[];
  subscriptions: Subscription[];
  sharedStreak: SharedStreakState;
  sharedStreakByUser: Record<string, SharedStreakState>;
  aiUsage: AiUsage;
  aiUsageByUser: Record<string, AiUsage>;
  aiGenerations: AiGeneration[];
  aiGenerationsByUser: Record<string, AiGeneration[]>;
};

const groups: Group[] = [
  { id: 'grp-thpt', name: 'THPT', description: '', order: 0 },
  { id: 'grp-ielts-books', name: 'Sách IELTS', description: 'Vocab in use ; Quyển CAM', order: 1 },
  { id: 'grp-ielts', name: 'IELTS', description: '', order: 2 },
  { id: 'grp-toeic', name: 'TOEIC', description: '', order: 3 },
  { id: 'grp-celeb', name: 'Người nổi tiếng khuyên dùng', description: '', order: 4 },
  { id: 'grp-level', name: 'Theo level', description: '', order: 5 },
  { id: 'grp-pro', name: 'Người đi làm & Chuyên ngành', description: 'Các bạn có thể học TOEIC hoặc từ vựng ở đây', order: 6 },
  { id: 'grp-thcs', name: 'THCS & Tiểu học', description: '', order: 7 },
];

function makePath(id: string, groupId: string, name: string, difficulty: number, wordSetCount: number): PathSummary {
  return {
    id,
    groupId,
    name,
    description: '',
    coverImage: null,
    difficulty,
    displayOrder: 0,
    wordSetCount,
    group: groups.find((g) => g.id === groupId)!,
  };
}

function partOfSpeechFor(index: number) {
  return ['N', 'V', 'Adj', 'Adv'][index % 4];
}

function makeWords(prefix: string, count: number): WordItem[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `${prefix}-${index + 1}`,
    term: `${prefix} term ${index + 1}`,
    meaning: `nghĩa ${index + 1}`,
    pronunciation: `/${prefix.slice(0, 3)}-${index + 1}/`,
    partOfSpeech: partOfSpeechFor(index),
    example: `Example sentence ${index + 1} for ${prefix}.`,
    learned: index % 5 === 0,
    srsLevel: (index % 5) + 1,
  }));
}

const paths: PathSummary[] = [
  // THPT — 13 lộ trình
  makePath('path-thpt-1', 'grp-thpt', 'Luyện thi HSA - VACT', 1, 29),
  makePath('path-thpt-2', 'grp-thpt', 'Từ vựng VIP 90 Cô MP (2026)', 2, 18),
  makePath('path-thpt-3', 'grp-thpt', 'Collocation, cụm động từ, cấu trúc quan trọng thi THPTQG 2026 (cô Mai Phương)', 3, 21),
  makePath('path-thpt-4', 'grp-thpt', 'Idioms và từ vựng ăn điểm các sở 2026', 2, 10),
  makePath('path-thpt-5', 'grp-thpt', 'TỪ VỰNG QUAN TRỌNG XUẤT HIỆN NHIỀU NHẤT', 4, 8),
  makePath('path-thpt-6', 'grp-thpt', 'Từ vựng Đọc hiểu THPTQG 2026', 3, 24),
  makePath('path-thpt-7', 'grp-thpt', 'Phrasal verb thi THPTQG 2026', 3, 18),
  makePath('path-thpt-8', 'grp-thpt', 'Từ vựng đề minh hoạ Bộ GD 2026', 2, 16),
  makePath('path-thpt-9', 'grp-thpt', 'Từ vựng đề thi 63 tỉnh 2025', 2, 22),
  makePath('path-thpt-10', 'grp-thpt', 'High School Vocabulary 12', 1, 32),
  makePath('path-thpt-11', 'grp-thpt', 'Từ vựng SGK lớp 12 mới', 1, 30),
  makePath('path-thpt-12', 'grp-thpt', 'Từ vựng SGK lớp 11 mới', 1, 26),
  makePath('path-thpt-13', 'grp-thpt', 'Từ vựng SGK lớp 10 mới', 1, 24),

  // Sách IELTS — 8 lộ trình
  makePath('path-ielts-books-1', 'grp-ielts-books', 'Vocabulary In Use Elementary', 1, 50),
  makePath('path-ielts-books-2', 'grp-ielts-books', 'Cambridge Practice Tests for IELTS (18-20)', 3, 30),
  makePath('path-ielts-books-3', 'grp-ielts-books', 'Vocabulary in Use - Pre-intermediate & Intermediate', 2, 100),
  makePath('path-ielts-books-4', 'grp-ielts-books', 'Vocabulary In Use - Upper-Intermediate', 3, 101),
  makePath('path-ielts-books-5', 'grp-ielts-books', 'Vocabulary In Use Advanced', 4, 90),
  makePath('path-ielts-books-6', 'grp-ielts-books', 'Cambridge IELTS 17', 3, 28),
  makePath('path-ielts-books-7', 'grp-ielts-books', 'Cambridge IELTS 16', 3, 26),
  makePath('path-ielts-books-8', 'grp-ielts-books', 'Cambridge IELTS 15', 3, 24),

  // IELTS — theo kỹ năng / band
  makePath('path-ielts-1', 'grp-ielts', 'IELTS General Core', 3, 48),
  makePath('path-ielts-2', 'grp-ielts', 'IELTS Writing Task 2 Vocabulary', 4, 36),
  makePath('path-ielts-3', 'grp-ielts', 'IELTS Speaking Part 1-2-3', 3, 40),
  makePath('path-ielts-4', 'grp-ielts', 'IELTS Listening High Frequency', 3, 32),
  makePath('path-ielts-5', 'grp-ielts', 'IELTS Reading Academic', 4, 38),
  makePath('path-ielts-6', 'grp-ielts', 'IELTS Band 7+ Advanced Words', 5, 50),

  // TOEIC
  makePath('path-toeic-1', 'grp-toeic', 'TOEIC Warmup', 2, 30),
  makePath('path-toeic-2', 'grp-toeic', 'TOEIC Part 1-2 Listening', 2, 28),
  makePath('path-toeic-3', 'grp-toeic', 'TOEIC Part 3-4 Conversations', 3, 32),
  makePath('path-toeic-4', 'grp-toeic', 'TOEIC Part 5-6 Grammar Vocab', 3, 36),
  makePath('path-toeic-5', 'grp-toeic', 'TOEIC Part 7 Reading', 4, 40),
  makePath('path-toeic-6', 'grp-toeic', 'TOEIC 900+ Booster', 5, 48),

  // Người nổi tiếng
  makePath('path-celeb-1', 'grp-celeb', 'Bộ từ vựng cô Mai Phương khuyên dùng', 3, 40),
  makePath('path-celeb-2', 'grp-celeb', 'Bộ từ vựng thầy Tuấn Anh khuyên dùng', 3, 36),
  makePath('path-celeb-3', 'grp-celeb', 'Bộ từ vựng IELTS Fighter chọn lọc', 3, 32),
  makePath('path-celeb-4', 'grp-celeb', 'Bộ từ vựng Đan Trường English', 2, 28),

  // Theo level
  makePath('path-level-a1', 'grp-level', 'Level A1 - Beginner', 1, 30),
  makePath('path-level-a2', 'grp-level', 'Level A2 - Elementary', 1, 35),
  makePath('path-level-b1', 'grp-level', 'Level B1 - Intermediate', 2, 45),
  makePath('path-level-b2', 'grp-level', 'Level B2 - Upper Intermediate', 3, 55),
  makePath('path-level-c1', 'grp-level', 'Level C1 - Advanced', 4, 65),
  makePath('path-level-c2', 'grp-level', 'Level C2 - Mastery', 5, 75),

  // Người đi làm & Chuyên ngành
  makePath('path-pro-1', 'grp-pro', 'Workplace English', 2, 25),
  makePath('path-pro-2', 'grp-pro', 'Business English Essentials', 3, 40),
  makePath('path-pro-3', 'grp-pro', 'Marketing & Sales English', 3, 32),
  makePath('path-pro-4', 'grp-pro', 'IT & Tech English', 3, 36),
  makePath('path-pro-5', 'grp-pro', 'Finance & Accounting English', 3, 30),
  makePath('path-pro-6', 'grp-pro', 'Medical English Foundation', 4, 28),

  // THCS & Tiểu học
  makePath('path-thcs-1', 'grp-thcs', 'Từ vựng SGK lớp 9', 1, 22),
  makePath('path-thcs-2', 'grp-thcs', 'Từ vựng SGK lớp 8', 1, 20),
  makePath('path-thcs-3', 'grp-thcs', 'Từ vựng SGK lớp 7', 1, 18),
  makePath('path-thcs-4', 'grp-thcs', 'Từ vựng SGK lớp 6', 1, 16),
  makePath('path-thcs-5', 'grp-thcs', 'Tiếng Anh Tiểu học cơ bản', 1, 24),
  makePath('path-thcs-6', 'grp-thcs', 'Phonics & Spelling cho trẻ', 1, 18),
];

const pathWords: Record<string, WordItem[]> = Object.fromEntries(paths.map((path) => [path.id, makeWords(path.id, path.wordSetCount)]));

const categories: Category[] = [
  { id: 'cat-public-ielts-1', name: 'IELTS Writing Core', description: 'ielts theo kỹ năng', icon: 'fas fa-star', userId: 'u2', ispublic: true, note: null, createdAt: new Date().toISOString(), wordCount: 54, user: { name: 'Serum Huy' } },
  { id: 'cat-public-toeic-1', name: 'TOEIC Part 4 Booster', description: 'toeic theo part', icon: 'fas fa-graduation-cap', userId: 'u3', ispublic: true, note: null, createdAt: new Date().toISOString(), wordCount: 42, user: { name: '7 Hà Thành' } },
  { id: 'cat-public-general-1', name: 'Starter Daily English', description: 'general', icon: 'fas fa-book', userId: 'u4', ispublic: true, note: null, createdAt: new Date().toISOString(), wordCount: 30, user: { name: 'Ngọc Minh' } },
];

function defaultState(): AppState {
  return {
    users: [
      {
        id: 'demo-user',
        name: 'Mr Minh',
        email: 'demo@pshare.local',
        avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Mr%20Minh',
        coin: 120,
        streak: 1,
        vip: false,
        isVip: false,
        vipExpiresAt: null,
        proExpiresAt: null,
        bio: 'Nhấn để xem hồ sơ cá nhân',
      },
    ],
    refreshTokens: {},
    groups,
    paths,
    pathWords: structuredClone(pathWords),
    pathProgressByUser: {},
    categories: structuredClone(categories),
    folders: {
      newest: [
        { id: 1001, name: 'Starter Pack', icon: '📁', isShared: true, upvoteCount: 0, createdAt: new Date().toISOString(), categoryCount: 3, wordCount: 156, user: { id: 1, name: 'Demo User' } },
        { id: 1002, name: 'IELTS Reading', icon: '📘', isShared: true, upvoteCount: 0, createdAt: new Date().toISOString(), categoryCount: 4, wordCount: 343, user: { id: 2, name: 'Demo User 2' } },
      ],
      trending: [
        { id: 2001, name: 'PTE Pack', icon: '🔥', isShared: true, upvoteCount: 27, createdAt: new Date().toISOString(), categoryCount: 4, wordCount: 4986, user: { id: 3, name: 'Demo User 3' } },
        { id: 2002, name: 'VOCAB IN USE', icon: '📚', isShared: true, upvoteCount: 15, createdAt: new Date().toISOString(), categoryCount: 11, wordCount: 358, user: { id: 4, name: 'Demo User 4' } },
      ],
      mine: [
        { id: 3001, name: 'Folder cá nhân', icon: '🗂️', isShared: false, upvoteCount: 0, createdAt: new Date().toISOString(), categoryCount: 2, wordCount: 80, user: { id: 'demo-user', name: 'Mr Minh' } },
      ],
    },
    vocabularies: Array.from({ length: 40 }, (_, index) => ({
      id: `v-${index + 1}`,
      term: `word ${index + 1}`,
      meaning: `nghĩa ${index + 1}`,
      pronunciation: `/wɜːd-${index + 1}/`,
      partOfSpeech: partOfSpeechFor(index),
      example: `Example for word ${index + 1}`,
      isLearned: index % 3 === 0,
      categoryId: index % 2 === 0 ? 'cat-public-general-1' : 'cat-public-ielts-1',
      userId: 'demo-user',
    })),
    activity: {
      currentStreak: 1,
      calendar: [{ date: new Date().toISOString().slice(0, 10), count: 1 }],
      leaderboard: Array.from({ length: 10 }, (_, index) => ({
        user: { id: index + 1, name: `Người học ${index + 1}`, avatar: `https://api.dicebear.com/9.x/thumbs/svg?seed=user-${index + 1}` },
        activityCount: 100 - index * 8,
      })),
    },
    activityByUser: {},
    shop: {
      coins: 120,
      items: [
        { id: 'item-streak-shield', name: 'Streak Shield', price: 150, description: 'Giữ streak 1 ngày', emoji: '🛡️' },
        { id: 'item-theme-blue', name: 'Blue Theme', price: 80, description: 'Giao diện xanh', emoji: '🎨' },
        { id: 'item-typing-sfx', name: 'Typing SFX', price: 60, description: 'Âm thanh gõ phím', emoji: '🔊' },
      ],
      inventory: ['item-streak-shield'],
      equippedSound: null,
      equippedTypingSound: null,
      customUploadPrice: 30,
    },
    shopByUser: {},
    messages: [
      { id: 'm1', content: 'Chào mừng vào bản clone local.', createdAt: new Date().toISOString(), author: { id: 1, name: 'System' }, replyToMessageId: null },
    ],
    subscriptions: [],
    sharedStreak: { inviter: 'Mr Minh', invitee: null, status: 'open', invitations: [] },
    sharedStreakByUser: {},
    aiUsage: 0,
    aiUsageByUser: {},
    aiGenerations: [],
    aiGenerationsByUser: {},
  };
}

function ensureDataDir() {
  mkdirSync(dirname(DATA_PATH), { recursive: true });
}

function loadState(): AppState {
  ensureDataDir();
  if (!existsSync(DATA_PATH)) {
    const seeded = defaultState();
    writeFileSync(DATA_PATH, JSON.stringify(seeded, null, 2));
    return seeded;
  }
  try {
    return JSON.parse(readFileSync(DATA_PATH, 'utf8')) as AppState;
  } catch {
    const seeded = defaultState();
    writeFileSync(DATA_PATH, JSON.stringify(seeded, null, 2));
    return seeded;
  }
}

let state: AppState = loadState();
normalizeState();


const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

function syncDbFromState() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT, email TEXT, avatar TEXT, coin INTEGER, streak INTEGER, vip INTEGER, bio TEXT);
    CREATE TABLE IF NOT EXISTS paths (id TEXT PRIMARY KEY, groupId TEXT, name TEXT, description TEXT, coverImage TEXT, difficulty INTEGER, displayOrder INTEGER, wordSetCount INTEGER);
    CREATE TABLE IF NOT EXISTS path_words (id TEXT PRIMARY KEY, pathId TEXT, term TEXT, meaning TEXT, pronunciation TEXT, partOfSpeech TEXT, example TEXT, learned INTEGER, srsLevel INTEGER);
    CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY, name TEXT, description TEXT, icon TEXT, userId TEXT, ispublic INTEGER, note TEXT, createdAt TEXT, wordCount INTEGER, userName TEXT);
    CREATE TABLE IF NOT EXISTS vocabularies (id TEXT PRIMARY KEY, term TEXT, meaning TEXT, pronunciation TEXT, partOfSpeech TEXT, example TEXT, isLearned INTEGER, categoryId TEXT, userId TEXT);
    CREATE TABLE IF NOT EXISTS folders (id INTEGER PRIMARY KEY, bucket TEXT, name TEXT, icon TEXT, isShared INTEGER, upvoteCount INTEGER, createdAt TEXT, categoryCount INTEGER, wordCount INTEGER, userId TEXT, userName TEXT);
    CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, content TEXT, createdAt TEXT, authorId INTEGER, authorName TEXT, replyToMessageId TEXT);
    CREATE TABLE IF NOT EXISTS subscriptions (id TEXT PRIMARY KEY, type TEXT, status TEXT, userId TEXT);
    CREATE TABLE IF NOT EXISTS ai_generations (id TEXT PRIMARY KEY, text TEXT, image TEXT, createdAt TEXT, termCount INTEGER, userId TEXT);
  `);

  const vocabColumns = db.prepare('PRAGMA table_info(vocabularies)').all() as Array<{ name: string }>;
  if (!vocabColumns.some((column) => column.name === 'userId')) db.exec('ALTER TABLE vocabularies ADD COLUMN userId TEXT');
  const subscriptionColumns = db.prepare('PRAGMA table_info(subscriptions)').all() as Array<{ name: string }>;
  if (!subscriptionColumns.some((column) => column.name === 'userId')) db.exec('ALTER TABLE subscriptions ADD COLUMN userId TEXT');
  const aiColumns = db.prepare('PRAGMA table_info(ai_generations)').all() as Array<{ name: string }>;
  if (!aiColumns.some((column) => column.name === 'userId')) db.exec('ALTER TABLE ai_generations ADD COLUMN userId TEXT');

  const tx = db.transaction(() => {
    for (const table of ['users','paths','path_words','categories','vocabularies','folders','messages','subscriptions','ai_generations']) db.prepare(`DELETE FROM ${table}`).run();

    const userStmt = db.prepare('INSERT INTO users VALUES (@id,@name,@email,@avatar,@coin,@streak,@vip,@bio)');
    for (const user of state.users) userStmt.run({ ...user, vip: user.vip ? 1 : 0 });

    const pathStmt = db.prepare('INSERT INTO paths VALUES (@id,@groupId,@name,@description,@coverImage,@difficulty,@displayOrder,@wordSetCount)');
    for (const path of state.paths) pathStmt.run({ id:path.id, groupId:path.groupId, name:path.name, description:path.description, coverImage:path.coverImage, difficulty:path.difficulty, displayOrder:path.displayOrder, wordSetCount:path.wordSetCount });

    const wordStmt = db.prepare('INSERT INTO path_words VALUES (@id,@pathId,@term,@meaning,@pronunciation,@partOfSpeech,@example,@learned,@srsLevel)');
    for (const [pathId, words] of Object.entries(state.pathWords)) for (const word of words) wordStmt.run({ ...word, pathId, learned: word.learned ? 1 : 0 });

    const catStmt = db.prepare('INSERT INTO categories VALUES (@id,@name,@description,@icon,@userId,@ispublic,@note,@createdAt,@wordCount,@userName)');
    for (const cat of state.categories) catStmt.run({ ...cat, ispublic: cat.ispublic ? 1 : 0, userName: cat.user.name });

    const vocabStmt = db.prepare('INSERT INTO vocabularies (id,term,meaning,pronunciation,partOfSpeech,example,isLearned,categoryId,userId) VALUES (@id,@term,@meaning,@pronunciation,@partOfSpeech,@example,@isLearned,@categoryId,@userId)');
    for (const vocab of state.vocabularies) vocabStmt.run({ ...vocab, isLearned: vocab.isLearned ? 1 : 0, pronunciation: vocab.pronunciation ?? null, partOfSpeech: vocab.partOfSpeech ?? null, example: vocab.example ?? null, userId: vocab.userId ?? null });

    const folderStmt = db.prepare('INSERT INTO folders VALUES (@id,@bucket,@name,@icon,@isShared,@upvoteCount,@createdAt,@categoryCount,@wordCount,@userId,@userName)');
    for (const bucket of ['newest','trending','mine'] as const) for (const folder of state.folders[bucket]) folderStmt.run({ ...folder, bucket, isShared: folder.isShared ? 1 : 0, userId: folder.user.id, userName: folder.user.name });

    const msgStmt = db.prepare('INSERT INTO messages VALUES (@id,@content,@createdAt,@authorId,@authorName,@replyToMessageId)');
    for (const msg of state.messages) msgStmt.run({ id: msg.id, content: msg.content, createdAt: msg.createdAt, authorId: msg.author.id, authorName: msg.author.name, replyToMessageId: msg.replyToMessageId });

    const subStmt = db.prepare('INSERT INTO subscriptions (id,type,status,userId) VALUES (@id,@type,@status,@userId)');
    for (const sub of state.subscriptions) subStmt.run({ ...sub, userId: sub.userId ?? null });

    const aiStmt = db.prepare('INSERT INTO ai_generations (id,text,image,createdAt,termCount,userId) VALUES (@id,@text,@image,@createdAt,@termCount,@userId)');
    for (const [userId, items] of Object.entries(state.aiGenerationsByUser)) {
      if (!Array.isArray(items)) continue;
      for (const item of items) aiStmt.run({ ...item, userId });
    }
  });
  tx();
}
syncDbFromState();

function saveState() {
  ensureDataDir();
  writeFileSync(DATA_PATH, JSON.stringify(state, null, 2));
  syncDbFromState();
}

const app = express();
app.use(cors({ origin: [FRONTEND_URL, 'http://localhost:4173', 'http://localhost:5173'], credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

async function issueAppToken() {
  return `local.${Math.abs(Date.now()).toString(16).padStart(16, '0').slice(0, 16)}`;
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function coerceEmail(value: string) {
  const normalized = normalizeEmail(value);
  if (normalized.includes('@')) return normalized;
  return `${normalized.replace(/[^a-z0-9._-]/g, '') || `local-${randomUUID()}`}@pshare.local`;
}

function displayNameFromEmail(email: string) {
  const local = email.split('@')[0]?.replace(/[._-]+/g, ' ').trim();
  return local || 'Người học';
}

function makeUser(emailInput: string, nameInput?: string | null, id = `user-${randomUUID()}`): User {
  const email = coerceEmail(emailInput);
  const name = String(nameInput ?? '').trim() || displayNameFromEmail(email);
  return {
    id,
    name,
    email,
    avatar: `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(email)}`,
    coin: 0,
    streak: 0,
    vip: false,
    isVip: false,
    vipExpiresAt: null,
    proExpiresAt: null,
    bio: 'Nhấn để xem hồ sơ cá nhân',
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeActivity(raw: Partial<ActivityState> | undefined, user: User): ActivityState {
  const calendar = Array.isArray(raw?.calendar)
    ? raw.calendar.map((entry) => ({ date: String(entry.date), count: Number(entry.count ?? 0) })).filter((entry) => entry.date)
    : [];
  const leaderboard = Array.isArray(raw?.leaderboard)
    ? raw.leaderboard.map((entry) => ({
        user: {
          id: entry.user?.id ?? user.id,
          name: String(entry.user?.name ?? user.name),
          avatar: String(entry.user?.avatar ?? user.avatar),
        },
        activityCount: Number(entry.activityCount ?? 0),
      }))
    : [];
  return { currentStreak: Number(raw?.currentStreak ?? user.streak ?? 0), calendar, leaderboard };
}

function normalizeUserShop(raw: Partial<UserShopState> | undefined, user: User): UserShopState {
  return {
    coins: Number(raw?.coins ?? user.coin ?? 0),
    inventory: Array.isArray(raw?.inventory) ? raw.inventory.map((id) => String(id)) : [],
    equippedSound: raw?.equippedSound == null ? null : String(raw.equippedSound),
    equippedTypingSound: raw?.equippedTypingSound == null ? null : String(raw.equippedTypingSound),
  };
}

function normalizeSharedStreak(raw: Partial<SharedStreakState> | undefined, user: User): SharedStreakState {
  const invitations: SharedInvitation[] = Array.isArray(raw?.invitations)
    ? raw.invitations.map((item): SharedInvitation => ({
        id: String(item.id || randomUUID()),
        email: String(item.email ?? ''),
        status: item.status === 'accepted' || item.status === 'declined' ? item.status : 'invited',
      }))
    : [];
  return {
    inviter: String(raw?.inviter ?? user.name),
    invitee: raw?.invitee == null ? null : String(raw.invitee),
    status: String(raw?.status ?? 'open'),
    invitations,
  };
}

function normalizeState() {
  if (!Array.isArray(state.users)) state.users = [];
  if (state.users.length === 0) state.users.push(makeUser('demo@pshare.local', 'Mr Minh', 'demo-user'));

  for (const user of state.users) {
    user.id = String(user.id || `user-${randomUUID()}`);
    user.email = coerceEmail(user.email || `${user.id}@pshare.local`);
    user.name = String(user.name || displayNameFromEmail(user.email));
    user.avatar = String(user.avatar || `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(user.email)}`);
    user.coin = Number(user.coin ?? 0);
    user.streak = Number(user.streak ?? 0);
    user.vip = Boolean(user.vip);
    user.isVip = Boolean(user.isVip ?? user.vip);
    user.vipExpiresAt = user.vipExpiresAt ?? null;
    user.proExpiresAt = user.proExpiresAt ?? null;
    user.bio = String(user.bio ?? 'Nhấn để xem hồ sơ cá nhân');
  }

  state.categories = Array.isArray(state.categories) ? state.categories : [];
  state.vocabularies = Array.isArray(state.vocabularies) ? state.vocabularies : [];
  state.folders = state.folders ?? { newest: [], trending: [], mine: [] };
  state.folders.newest = Array.isArray(state.folders.newest) ? state.folders.newest : [];
  state.folders.trending = Array.isArray(state.folders.trending) ? state.folders.trending : [];
  state.folders.mine = Array.isArray(state.folders.mine) ? state.folders.mine : [];
  state.pathWords = isRecord(state.pathWords) ? state.pathWords : structuredClone(pathWords);
  state.pathProgressByUser = isRecord(state.pathProgressByUser) ? state.pathProgressByUser as Record<string, PathProgressRecord> : {};
  state.activityByUser = isRecord(state.activityByUser) ? state.activityByUser as Record<string, ActivityState> : {};
  state.shopByUser = isRecord(state.shopByUser) ? state.shopByUser as Record<string, UserShopState> : {};
  state.sharedStreakByUser = isRecord(state.sharedStreakByUser) ? state.sharedStreakByUser as Record<string, SharedStreakState> : {};
  state.aiUsageByUser = isRecord(state.aiUsageByUser) ? state.aiUsageByUser as Record<string, AiUsage> : {};
  state.aiGenerationsByUser = isRecord(state.aiGenerationsByUser) ? state.aiGenerationsByUser as Record<string, AiGeneration[]> : {};

  const fallbackUser = state.users[0];
  const knownUserIds = new Set(state.users.map((user) => user.id));

  for (const category of state.categories) {
    category.userId = String(category.userId ?? fallbackUser.id);
    category.ispublic = Boolean(category.ispublic);
    if (!category.ispublic && !knownUserIds.has(category.userId)) category.userId = fallbackUser.id;
    const owner = state.users.find((user) => sameId(user.id, category.userId));
    category.user = { name: category.user?.name ?? owner?.name ?? 'Người học' };
  }

  const categoriesById = new Map(state.categories.map((category) => [category.id, category]));
  for (const vocab of state.vocabularies) {
    vocab.id = String(vocab.id || randomUUID());
    vocab.categoryId = vocab.categoryId ?? null;
    const category = vocab.categoryId ? categoriesById.get(vocab.categoryId) : null;
    if (!vocab.userId) vocab.userId = category && !category.ispublic ? category.userId : fallbackUser.id;
    if (!knownUserIds.has(String(vocab.userId))) vocab.userId = fallbackUser.id;
  }

  for (const folder of state.folders.mine) {
    const ownerId = folder.user?.id != null ? String(folder.user.id) : fallbackUser.id;
    const owner = state.users.find((user) => sameId(user.id, ownerId)) ?? fallbackUser;
    folder.user = { id: owner.id, name: owner.name };
  }

  state.activity = normalizeActivity(state.activity, fallbackUser);
  if (state.activityByUser[fallbackUser.id] == null) state.activityByUser[fallbackUser.id] = normalizeActivity(state.activity, fallbackUser);

  const migratedProgress = state.pathProgressByUser[fallbackUser.id] ?? {};
  if (Object.keys(migratedProgress).length === 0) {
    for (const [pathId, words] of Object.entries(state.pathWords)) {
      if (!Array.isArray(words)) continue;
      for (const word of words) {
        const learned = Boolean(word.learned);
        const srsLevel = Number(word.srsLevel ?? 1);
        if (!learned && srsLevel === 1) continue;
        migratedProgress[pathId] = migratedProgress[pathId] ?? {};
        migratedProgress[pathId][word.id] = { learned, srsLevel };
      }
    }
    state.pathProgressByUser[fallbackUser.id] = migratedProgress;
  }

  if (state.shopByUser[fallbackUser.id] == null) state.shopByUser[fallbackUser.id] = normalizeUserShop(state.shop, fallbackUser);
  if (state.sharedStreakByUser[fallbackUser.id] == null) state.sharedStreakByUser[fallbackUser.id] = normalizeSharedStreak(state.sharedStreak, fallbackUser);
  if (state.aiUsageByUser[fallbackUser.id] == null) state.aiUsageByUser[fallbackUser.id] = state.aiUsage ?? 0;
  if (state.aiGenerationsByUser[fallbackUser.id] == null) state.aiGenerationsByUser[fallbackUser.id] = Array.isArray(state.aiGenerations) ? state.aiGenerations : [];

  for (const user of state.users) {
    state.pathProgressByUser[user.id] = state.pathProgressByUser[user.id] ?? {};
    state.activityByUser[user.id] = normalizeActivity(state.activityByUser[user.id], user);
    state.activityByUser[user.id].leaderboard = state.activity.leaderboard;
    state.shopByUser[user.id] = normalizeUserShop(state.shopByUser[user.id], user);
    state.sharedStreakByUser[user.id] = normalizeSharedStreak(state.sharedStreakByUser[user.id], user);
    state.aiUsageByUser[user.id] = state.aiUsageByUser[user.id] ?? 0;
    state.aiGenerationsByUser[user.id] = Array.isArray(state.aiGenerationsByUser[user.id]) ? state.aiGenerationsByUser[user.id] : [];
  }

  state.subscriptions = Array.isArray(state.subscriptions) ? state.subscriptions : [];
  for (const subscription of state.subscriptions) {
    if (!subscription.userId || !knownUserIds.has(String(subscription.userId))) subscription.userId = fallbackUser.id;
  }
}

function firstQueryString(value: unknown) {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (Array.isArray(value) && typeof value[0] === 'string' && value[0].trim()) return value[0].trim();
  return null;
}

function findOrCreateUserByEmail(emailInput: string, nameInput?: string | null) {
  const email = coerceEmail(emailInput);
  const existing = state.users.find((user) => normalizeEmail(user.email) === email);
  if (existing) {
    const nextName = String(nameInput ?? '').trim();
    if (nextName && existing.name !== nextName) existing.name = nextName;
    return existing;
  }
  const user = makeUser(email, nameInput);
  state.users.push(user);
  return user;
}

function resolveGoogleUser(req: Request) {
  const email = firstQueryString(req.query.email);
  const name = firstQueryString(req.query.name);
  if (email) return findOrCreateUserByEmail(email, name);

  const cookieUserId = typeof req.cookies?.pshareLocalUserId === 'string' ? req.cookies.pshareLocalUserId : null;
  const cookieUser = cookieUserId ? state.users.find((user) => sameId(user.id, cookieUserId)) : null;
  if (cookieUser) return cookieUser;

  const user = makeUser(`local-${randomUUID()}@pshare.local`, name ?? 'Người học');
  state.users.push(user);
  return user;
}

function setLocalUserCookie(res: Response, user: User) {
  res.cookie('pshareLocalUserId', user.id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: FRONTEND_URL.startsWith('https://'),
    maxAge: 365 * 24 * 60 * 60 * 1000,
  });
}

function issueTokens(userId: string) {
  const accessToken = jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '2h' });
  const refreshToken = randomUUID();
  state.refreshTokens[refreshToken] = userId;
  saveState();
  return { accessToken, refreshToken };
}

function authHeader(req: Request) {
  return req.headers.authorization?.replace('Bearer ', '') ?? null;
}

function sameId(left: string | number | null | undefined, right: string | number | null | undefined) {
  return left != null && right != null && String(left) === String(right);
}

function requireAuth(req: Request, res: Response) {
  const token = authHeader(req);
  if (!token) {
    res.status(401).json({ message: 'Unauthorized', statusCode: 401 });
    return null;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    const user = state.users.find((item) => item.id === payload.sub);
    if (!user) throw new Error('missing user');
    return user;
  } catch {
    res.status(401).json({ message: 'Unauthorized', statusCode: 401 });
    return null;
  }
}

function categoryOwnedBy(category: Category, user: User) {
  return sameId(category.userId, user.id);
}

function canReadCategory(category: Category, user: User) {
  return category.ispublic || categoryOwnedBy(category, user);
}

function folderOwnedBy(folder: Folder, user: User) {
  return sameId(folder.user.id, user.id);
}

function vocabOwnedBy(vocab: Vocabulary, user: User) {
  return sameId(vocab.userId, user.id);
}

function requireCategoryAccess(categoryId: string | null | undefined, user: User, res: Response) {
  if (!categoryId) return true;
  const category = state.categories.find((item) => item.id === categoryId);
  if (!category) {
    res.status(404).json({ message: 'Category not found', statusCode: 404 });
    return false;
  }
  if (!canReadCategory(category, user)) {
    res.status(403).json({ message: 'Access denied', error: 'Forbidden', statusCode: 403 });
    return false;
  }
  return true;
}

function optionalAuth(req: Request) {
  const token = authHeader(req);
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    return state.users.find((item) => item.id === payload.sub) ?? null;
  } catch {
    return null;
  }
}

function pathProgressForUser(user: User, pathId: string) {
  state.pathProgressByUser[user.id] = state.pathProgressByUser[user.id] ?? {};
  state.pathProgressByUser[user.id][pathId] = state.pathProgressByUser[user.id][pathId] ?? {};
  return state.pathProgressByUser[user.id][pathId];
}

function wordsForUser(pathId: string, user: User) {
  const progress = pathProgressForUser(user, pathId);
  return (state.pathWords[pathId] ?? []).map((word) => {
    const current = progress[word.id];
    return {
      ...word,
      learned: Boolean(current?.learned ?? false),
      srsLevel: Number(current?.srsLevel ?? 1),
    };
  });
}

function publicWords(pathId: string) {
  return (state.pathWords[pathId] ?? []).map((word) => ({ ...word, learned: false, srsLevel: 1 }));
}

function setWordProgress(user: User, pathId: string, vocabularyId: string, learned: boolean, srsLevel?: number) {
  const word = (state.pathWords[pathId] ?? []).find((item) => item.id === vocabularyId);
  if (!word) return false;
  const progress = pathProgressForUser(user, pathId);
  const previous = progress[vocabularyId];
  progress[vocabularyId] = {
    learned,
    srsLevel: Number(srsLevel ?? previous?.srsLevel ?? 1),
  };
  return true;
}

function updateAnyPathWordProgress(user: User, vocabularyId: string, learned: boolean, srsLevel?: number) {
  for (const pathId of Object.keys(state.pathWords)) {
    if (setWordProgress(user, pathId, vocabularyId, learned, srsLevel)) return true;
  }
  return false;
}

function allWordsForUser(user: User) {
  return Object.keys(state.pathWords).flatMap((pathId) => wordsForUser(pathId, user));
}

function activityForUser(user: User) {
  state.activityByUser[user.id] = normalizeActivity(state.activityByUser[user.id], user);
  state.activityByUser[user.id].leaderboard = state.activity.leaderboard;
  return state.activityByUser[user.id];
}

function userActivityCount(user: User) {
  return activityForUser(user).calendar.reduce((sum, entry) => sum + entry.count, 0);
}

function leaderboardData(limit: number) {
  const realUsers = state.users.map((user) => ({
    user: { id: user.id, name: user.name, avatar: user.avatar },
    activityCount: userActivityCount(user),
    streak: activityForUser(user).currentStreak,
  }));
  const seeded = state.activity.leaderboard.filter((entry) => !realUsers.some((real) => sameId(real.user.id, entry.user.id)));
  return [...realUsers, ...seeded].sort((left, right) => right.activityCount - left.activityCount).slice(0, limit);
}

function shopForUser(user: User) {
  state.shopByUser[user.id] = normalizeUserShop(state.shopByUser[user.id], user);
  user.coin = state.shopByUser[user.id].coins;
  return state.shopByUser[user.id];
}

function sharedStreakForUser(user: User) {
  state.sharedStreakByUser[user.id] = normalizeSharedStreak(state.sharedStreakByUser[user.id], user);
  return state.sharedStreakByUser[user.id];
}

function aiUsageForUser(user: User) {
  state.aiUsageByUser[user.id] = state.aiUsageByUser[user.id] ?? 0;
  return state.aiUsageByUser[user.id];
}

function aiGenerationsForUser(user: User) {
  state.aiGenerationsByUser[user.id] = Array.isArray(state.aiGenerationsByUser[user.id]) ? state.aiGenerationsByUser[user.id] : [];
  return state.aiGenerationsByUser[user.id];
}

function incrementAiUsage(user: User) {
  const usage = aiUsageForUser(user);
  if (usage && typeof usage === 'object') {
    const usedToday = Number(usage.usedToday ?? 0) + 1;
    const usedThisMonth = Number(usage.usedThisMonth ?? 0) + 1;
    usage.usedToday = usedToday;
    usage.usedThisMonth = usedThisMonth;
    if (typeof usage.limitPerDay === 'number') usage.remainingToday = Math.max(usage.limitPerDay - usedToday, 0);
    if (typeof usage.limitPerMonth === 'number') usage.remainingThisMonth = Math.max(usage.limitPerMonth - usedThisMonth, 0);
    return usage;
  }
  const next = (typeof usage === 'number' ? usage : 0) + 1;
  state.aiUsageByUser[user.id] = next;
  return next;
}

function maybeEncryptedWords(words: WordItem[]) {
  return words;
}

app.use(async (req, _res, next) => {
  try {
    req.headers['x-app-token'] = req.headers['x-app-token'] ?? (await issueAppToken());
  } catch {}
  next();
});

app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/auth/google', (req, res) => {
  const user = resolveGoogleUser(req);
  setLocalUserCookie(res, user);
  const { accessToken, refreshToken } = issueTokens(user.id);
  res.redirect(`${FRONTEND_URL}/login/callback?accessToken=${encodeURIComponent(accessToken)}&refreshToken=${encodeURIComponent(refreshToken)}`);
});

app.post('/auth/login', (req, res) => {
  const schema = z.object({ email: z.string().email(), password: z.string().min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload', statusCode: 400 });
  const user = findOrCreateUserByEmail(parsed.data.email);
  const { accessToken, refreshToken } = issueTokens(user.id);
  res.json({ data: { accessToken, refreshToken, user } });
});

app.get('/auth/profile', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  res.json({ data: user });
});

app.put('/auth/profile', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  user.bio = String(req.body?.bio ?? user.bio);
  user.avatar = String(req.body?.avatar ?? user.avatar);
  saveState();
  res.json({ data: user });
});

app.post('/auth/refresh', (req, res) => {
  const token = z.object({ refreshToken: z.string().min(1) }).safeParse(req.body);
  if (!token.success) return res.status(400).json({ message: 'Invalid payload', statusCode: 400 });
  const userId = state.refreshTokens[token.data.refreshToken];
  if (!userId) return res.status(401).json({ message: 'Unauthorized', statusCode: 401 });
  const accessToken = jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '2h' });
  res.json({ data: { accessToken, refreshToken: token.data.refreshToken } });
});

app.post('/auth/logout', (req, res) => {
  const token = typeof req.body?.refreshToken === 'string' ? req.body.refreshToken : null;
  if (token) delete state.refreshTokens[token];
  saveState();
  res.json({ data: { ok: true } });
});

app.get('/paths/groups', (_req, res) => res.json(state.groups));
app.get('/paths/summary', (_req, res) => res.json(state.paths));
app.get('/paths/:id', (req, res) => {
  const path = state.paths.find((item) => item.id === req.params.id);
  if (!path) return res.status(404).json({ message: 'Not found' });
  res.json(path);
});
app.get('/paths/:id/progress', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const words = wordsForUser(req.params.id, user);
  const learned = words.filter((item) => item.learned).length;
  res.json({ total: words.length, learned, progress: words.length ? Math.round((learned / words.length) * 100) : 0 });
});
app.post('/paths/:id/progress', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const schema = z.object({ vocabularyId: z.string(), isLearned: z.boolean().default(true), skipActivityLog: z.boolean().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload' });
  const updated = setWordProgress(user, req.params.id, parsed.data.vocabularyId, parsed.data.isLearned);
  saveState();
  res.json({ data: { ok: true, updated } });
});
app.post('/paths/:id/progress/bulk', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const schema = z.object({ vocabularyIds: z.array(z.string()), isLearned: z.boolean().default(true), skipActivityLog: z.boolean().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload' });
  let updated = 0;
  for (const id of parsed.data.vocabularyIds) {
    if (setWordProgress(user, req.params.id, id, parsed.data.isLearned)) updated += 1;
  }
  saveState();
  res.json({ data: { ok: true, updated } });
});
app.get('/paths/:id/leaderboard', (_req, res) => res.json({ data: leaderboardData(10) }));
app.get('/paths/:id/srs/overview', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const words = wordsForUser(req.params.id, user);
  res.json({ data: { due: words.filter((item) => !item.learned).length, reviewed: words.filter((item) => item.learned).length } });
});
app.get('/paths/:id/srs/candidates', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const words = wordsForUser(req.params.id, user);
  const limit = Number(req.query.limit ?? 20);
  res.json({ data: { candidates: maybeEncryptedWords(words.filter((item) => !item.learned).slice(0, limit)) } });
});
app.get('/paths/:id/srs/words', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const words = wordsForUser(req.params.id, user);
  res.json({ data: maybeEncryptedWords(words) });
});
app.get('/paths/:id/srs/level', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const words = wordsForUser(req.params.id, user);
  const counts = words.reduce<Record<number, number>>((acc, word) => {
    acc[word.srsLevel] = (acc[word.srsLevel] ?? 0) + 1;
    return acc;
  }, {});
  res.json({ data: counts });
});
app.post('/paths/:id/srs/recompute-level5', (_req, res) => res.json({ data: { ok: true } }));
app.post('/paths/:id/srs/update', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const schema = z.object({ vocabularyId: z.string(), isCorrect: z.boolean().default(true) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload' });
  const current = wordsForUser(req.params.id, user).find((item) => item.id === parsed.data.vocabularyId);
  const nextLevel = parsed.data.isCorrect ? Math.min(5, Number(current?.srsLevel ?? 1) + 1) : 1;
  const updated = setWordProgress(user, req.params.id, parsed.data.vocabularyId, parsed.data.isCorrect, nextLevel);
  saveState();
  res.json({ data: { ok: true, updated } });
});
app.post('/paths/:id/srs/bulk-update', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const schema = z.object({ vocabularyIds: z.array(z.string()), isCorrect: z.boolean().default(true) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload' });
  const currentWords = new Map(wordsForUser(req.params.id, user).map((word) => [word.id, word]));
  let updated = 0;
  for (const id of parsed.data.vocabularyIds) {
    const current = currentWords.get(id);
    const nextLevel = parsed.data.isCorrect ? Math.min(5, Number(current?.srsLevel ?? 1) + 1) : 1;
    if (setWordProgress(user, req.params.id, id, parsed.data.isCorrect, nextLevel)) updated += 1;
  }
  saveState();
  res.json({ data: { ok: true, updated } });
});

app.get('/progress/srs/counts', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const words = allWordsForUser(user);
  res.json({ data: { due: words.filter((item) => !item.learned).length, reviewed: words.filter((item) => item.learned).length } });
});
app.get('/progress/srs/candidates', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const words = allWordsForUser(user).filter((item) => !item.learned).slice(0, 20);
  res.json({ data: { candidates: maybeEncryptedWords(words) } });
});
app.get('/progress/srs/words', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  res.json({ data: maybeEncryptedWords(allWordsForUser(user)) });
});
app.get('/progress/srs/level', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const counts = allWordsForUser(user).reduce<Record<number, number>>((acc, word) => {
    acc[word.srsLevel] = (acc[word.srsLevel] ?? 0) + 1;
    return acc;
  }, {});
  res.json({ data: counts });
});
app.post('/progress/srs/update', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const schema = z.object({ vocabularyId: z.string(), isCorrect: z.boolean().default(true) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload' });
  const current = allWordsForUser(user).find((item) => item.id === parsed.data.vocabularyId);
  const nextLevel = parsed.data.isCorrect ? Math.min(5, Number(current?.srsLevel ?? 1) + 1) : 1;
  const updated = updateAnyPathWordProgress(user, parsed.data.vocabularyId, parsed.data.isCorrect, nextLevel);
  saveState();
  res.json({ data: { ok: true, updated } });
});
app.post('/progress/srs/bulk-update', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const schema = z.object({ vocabularyIds: z.array(z.string()), isCorrect: z.boolean().default(true) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload' });
  const currentWords = new Map(allWordsForUser(user).map((word) => [word.id, word]));
  let updated = 0;
  for (const id of parsed.data.vocabularyIds) {
    const current = currentWords.get(id);
    const nextLevel = parsed.data.isCorrect ? Math.min(5, Number(current?.srsLevel ?? 1) + 1) : 1;
    if (updateAnyPathWordProgress(user, id, parsed.data.isCorrect, nextLevel)) updated += 1;
  }
  saveState();
  res.json({ data: { ok: true, updated } });
});
app.post('/progress/srs/recompute-level5', (req, res) => {
  if (!requireAuth(req, res)) return;
  res.json({ data: { ok: true } });
});

app.get('/word-sets/:id/vocabularies', (req, res) => {
  const user = optionalAuth(req);
  res.json(user ? wordsForUser(req.params.id, user) : publicWords(req.params.id));
});
app.post('/word-sets/:id/study', (req, res) => res.json({ data: { ok: true, studiedAt: new Date().toISOString(), payload: req.body ?? {} } }));

app.get('/categories/public/search', (req, res) => {
  const prefix = String(req.query.descriptionPrefix ?? '').toLowerCase();
  const data = state.categories.filter((category) => category.ispublic && (category.name.toLowerCase().includes(prefix) || category.description.toLowerCase().includes(prefix)));
  res.json({ data, statusCode: 200, message: 'Lay danh sach bo tu vung cong khai theo prefix thanh cong' });
});
app.get('/categories/public/:id', (req, res) => {
  const found = state.categories.find((item) => item.id === req.params.id);
  if (!found) return res.status(404).json({ message: 'Not found' });
  if (!found.ispublic) return res.status(403).json({ message: 'Access denied', error: 'Forbidden', statusCode: 403 });
  res.json({ data: found });
});
app.get('/categories/shared/:id', (req, res) => {
  const found = state.categories.find((item) => item.id === req.params.id);
  if (!found) return res.status(404).json({ message: 'Not found' });
  if (!found.ispublic) return res.status(403).json({ message: 'Access denied', error: 'Forbidden', statusCode: 403 });
  res.json({ data: found });
});
app.post('/categories/shared/:id/copy', (req, res) => {
  const found = state.categories.find((item) => item.id === req.params.id);
  if (!found) return res.status(404).json({ message: 'Not found' });
  if (!found.ispublic) return res.status(403).json({ message: 'Access denied', error: 'Forbidden', statusCode: 403 });
  res.json({ data: { ok: true, id: req.params.id, token: req.body?.token ?? null } });
});
app.get('/categories', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  res.json({ data: state.categories.filter((category) => canReadCategory(category, user)) });
});
app.get('/categories/:id', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const found = state.categories.find((item) => item.id === req.params.id);
  if (!found) return res.status(404).json({ message: 'Not found' });
  if (!canReadCategory(found, user)) return res.status(403).json({ message: 'Access denied', error: 'Forbidden', statusCode: 403 });
  res.json({ data: found });
});
app.get('/categories/:id/share-link', (req, res) => res.json({ data: { url: `${FRONTEND_URL}/categories/${req.params.id}?share=1` } }));
app.post('/categories', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const schema = z.object({ name: z.string().min(1), description: z.string().optional().default('') });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload' });
  const created: Category = { id: randomUUID(), name: parsed.data.name, description: parsed.data.description, icon: 'fas fa-book', userId: user.id, ispublic: false, note: null, createdAt: new Date().toISOString(), wordCount: 0, user: { name: user.name } };
  state.categories.unshift(created);
  saveState();
  res.status(201).json({ data: created });
});
app.patch('/categories/:id', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const found = state.categories.find((item) => item.id === req.params.id);
  if (!found) return res.status(404).json({ message: 'Not found' });
  if (!categoryOwnedBy(found, user)) return res.status(403).json({ message: 'Access denied', error: 'Forbidden', statusCode: 403 });
  found.name = String(req.body?.name ?? found.name);
  found.description = String(req.body?.description ?? found.description);
  saveState();
  res.json({ data: found });
});
app.delete('/categories/:id', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const found = state.categories.find((item) => item.id === req.params.id);
  if (!found) return res.status(404).json({ message: 'Not found' });
  if (!categoryOwnedBy(found, user)) return res.status(403).json({ message: 'Access denied', error: 'Forbidden', statusCode: 403 });
  state.categories = state.categories.filter((item) => item.id !== req.params.id);
  saveState();
  res.json({ data: { ok: true } });
});
app.post('/categories/copy/:id', (req, res) => res.json({ data: { ok: true, sourceId: req.params.id } }));
app.post('/categories/copy/:id/to/:targetId', (req, res) => res.json({ data: { ok: true, sourceId: req.params.id, targetId: req.params.targetId, vocabularyIds: req.body?.vocabularyIds ?? [] } }));
app.get('/categories/:id/vocabularies', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const category = state.categories.find((item) => item.id === req.params.id);
  if (!category) return res.status(404).json({ message: 'Category not found', statusCode: 404 });
  if (!canReadCategory(category, user)) return res.status(403).json({ message: 'Access denied', error: 'Forbidden', statusCode: 403 });
  const data = state.vocabularies.filter((item) => item.categoryId === req.params.id && vocabOwnedBy(item, user));
  res.json({ data });
});

app.get('/vocabularies', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  res.json({ data: state.vocabularies.filter((item) => vocabOwnedBy(item, user)) });
});
app.post('/vocabularies', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const schema = z.object({ term: z.string().min(1), meaning: z.string().min(1), pronunciation: z.string().optional(), partOfSpeech: z.string().optional(), example: z.string().optional(), categoryId: z.string().nullable().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload' });
  if (!requireCategoryAccess(parsed.data.categoryId ?? null, user, res)) return;
  const item: Vocabulary = { id: randomUUID(), term: parsed.data.term, meaning: parsed.data.meaning, pronunciation: parsed.data.pronunciation ?? '/new/', partOfSpeech: parsed.data.partOfSpeech ?? 'N', example: parsed.data.example ?? 'Example generated locally', isLearned: false, categoryId: parsed.data.categoryId ?? null, userId: user.id };
  state.vocabularies.unshift(item);
  saveState();
  res.status(201).json({ data: item });
});
app.post('/vocabularies/bulk', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const vocabularies = Array.isArray(req.body?.vocabularies) ? req.body.vocabularies : [];
  for (const entry of vocabularies) {
    const categoryId = entry?.categoryId == null ? null : String(entry.categoryId);
    if (!requireCategoryAccess(categoryId, user, res)) return;
  }
  const created: Vocabulary[] = vocabularies.map((entry: any, index: number) => ({ id: randomUUID(), term: String(entry.term ?? `bulk ${index + 1}`), meaning: String(entry.meaning ?? `nghĩa ${index + 1}`), pronunciation: String(entry.pronunciation ?? '/bulk/'), partOfSpeech: String(entry.partOfSpeech ?? 'N'), example: String(entry.example ?? 'Bulk example'), isLearned: false, categoryId: entry.categoryId == null ? null : String(entry.categoryId), userId: user.id }));
  state.vocabularies.unshift(...created);
  saveState();
  res.status(201).json({ data: created });
});
app.put('/vocabularies/bulk', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const payload = Array.isArray(req.body?.vocabularies) ? req.body.vocabularies : [];
  let updated = 0;
  for (const entry of payload) {
    const found = state.vocabularies.find((item) => item.id === entry.id);
    if (found && vocabOwnedBy(found, user)) {
      found.term = String(entry.term ?? found.term);
      found.meaning = String(entry.meaning ?? found.meaning);
      updated += 1;
    }
  }
  saveState();
  res.json({ data: { ok: true, updated } });
});
app.put('/vocabularies/:id', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const item = state.vocabularies.find((entry) => entry.id === req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  if (!vocabOwnedBy(item, user)) return res.status(403).json({ message: 'Access denied', error: 'Forbidden', statusCode: 403 });
  item.term = String(req.body?.term ?? item.term);
  item.meaning = String(req.body?.meaning ?? item.meaning);
  saveState();
  res.json({ data: item });
});
app.delete('/vocabularies/bulk', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
  const before = state.vocabularies.length;
  state.vocabularies = state.vocabularies.filter((entry) => !ids.includes(entry.id) || !vocabOwnedBy(entry, user));
  saveState();
  res.json({ data: { ok: true, deleted: before - state.vocabularies.length } });
});
app.delete('/vocabularies/:id', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const item = state.vocabularies.find((entry) => entry.id === req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  if (!vocabOwnedBy(item, user)) return res.status(403).json({ message: 'Access denied', error: 'Forbidden', statusCode: 403 });
  state.vocabularies = state.vocabularies.filter((entry) => entry.id !== req.params.id);
  saveState();
  res.json({ data: { ok: true } });
});
app.patch('/vocabularies/:id/progress', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const item = state.vocabularies.find((entry) => entry.id === req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  if (!vocabOwnedBy(item, user)) return res.status(403).json({ message: 'Access denied', error: 'Forbidden', statusCode: 403 });
  item.isLearned = Boolean(req.body?.isLearned);
  saveState();
  res.json({ data: item });
});
app.patch('/vocabularies/progress/bulk', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const ids = Array.isArray(req.body?.vocabularyIds) ? req.body.vocabularyIds : [];
  const isLearned = Boolean(req.body?.isLearned);
  let updated = 0;
  for (const item of state.vocabularies) {
    if (ids.includes(item.id) && vocabOwnedBy(item, user)) {
      item.isLearned = isLearned;
      updated += 1;
    }
  }
  saveState();
  res.json({ data: { ok: true, updated } });
});
app.get('/vocabularies/stats', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const mine = state.vocabularies.filter((item) => vocabOwnedBy(item, user));
  const learned = mine.filter((item) => item.isLearned).length;
  res.json({ data: { total: mine.length, learned, progress: mine.length ? Math.round((learned / mine.length) * 100) : 0 } });
});
app.get('/vocabularies/suggestions/popular', (req, res) => res.json({ data: { meanings: [`${String(req.query.word ?? 'word')} meaning`], examples: [`Example using ${String(req.query.word ?? 'word')}`] } }));
app.get('/vocabularies/suggestions/words', (req, res) => res.json({ data: [{ term: `${String(req.query.prefix ?? 'pre')}fix`, meaning: 'gợi ý' }] }));
app.post('/vocabularies/suggest', (req, res) => res.json({ data: { term: String(req.body?.word ?? ''), suggestions: [String(req.body?.word ?? '').toUpperCase()] } }));

app.get('/activity/calendar', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  res.json({ data: activityForUser(user) });
});
app.post('/activity/log', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const activity = activityForUser(user);
  const date = typeof req.body?.activityDate === 'string' ? req.body.activityDate : new Date().toISOString().slice(0, 10);
  const existing = activity.calendar.find((entry) => entry.date === date);
  if (existing) existing.count += 1;
  else activity.calendar.push({ date, count: 1 });
  if (req.body?.incrementCount) activity.currentStreak += 1;
  user.streak = activity.currentStreak;
  saveState();
  res.json({ data: activity });
});
app.get('/activity/leaderboard', (req, res) => {
  const limit = Number(req.query.limit ?? 200);
  res.json({ data: leaderboardData(limit) });
});
app.get('/activity/leaderboard/top', (req, res) => {
  const limit = Number(req.query.limit ?? 200);
  res.json({ data: leaderboardData(limit) });
});

app.get('/shop/items', (req, res) => {
  res.json({ data: state.shop.items });
});
app.get('/shop/coins', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  res.json({ coins: shopForUser(user).coins });
});
app.get('/shop/inventory', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  res.json({ data: shopForUser(user).inventory });
});
app.get('/shop/state', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const shop = shopForUser(user);
  res.json({ data: { coins: shop.coins, inventory: shop.inventory, equippedSound: shop.equippedSound, equippedTypingSound: shop.equippedTypingSound } });
});
app.get('/shop/custom-upload-pricing', (req, res) => {
  res.json({ data: { price: state.shop.customUploadPrice } });
});
app.get('/shop/equipped-sound', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  res.json({ data: { id: shopForUser(user).equippedSound } });
});
app.get('/shop/equipped-typing-sound', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  res.json({ data: { id: shopForUser(user).equippedTypingSound } });
});
app.post('/shop/purchase/:id', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const shop = shopForUser(user);
  const item = state.shop.items.find((entry) => entry.id === req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  if (shop.coins < item.price) return res.status(400).json({ message: 'Not enough coins' });
  shop.coins -= item.price;
  user.coin = shop.coins;
  if (!shop.inventory.includes(item.id)) shop.inventory.push(item.id);
  saveState();
  res.json({ data: { ok: true, coins: shop.coins } });
});
app.post('/shop/custom-upload/:id', (req, res) => {
  if (!requireAuth(req, res)) return;
  res.json({ data: { ok: true, id: req.params.id, uploaded: true } });
});
app.patch('/shop/equip/:id', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const shop = shopForUser(user);
  if (req.params.id.includes('typing')) shop.equippedTypingSound = req.params.id;
  else shop.equippedSound = req.params.id;
  saveState();
  res.json({ data: { ok: true } });
});
app.patch('/shop/unequip/:id', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const shop = shopForUser(user);
  if (shop.equippedSound === req.params.id) shop.equippedSound = null;
  if (shop.equippedTypingSound === req.params.id) shop.equippedTypingSound = null;
  saveState();
  res.json({ data: { ok: true } });
});
app.post('/shop/daily-reward', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const shop = shopForUser(user);
  shop.coins += 10;
  user.coin = shop.coins;
  saveState();
  res.json({ data: { coins: shop.coins } });
});
app.post('/shop/reward', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const shop = shopForUser(user);
  shop.coins += Number(req.body?.totalGameCoins ?? 0);
  user.coin = shop.coins;
  saveState();
  res.json({ data: { coins: shop.coins } });
});

app.get('/shared-streak', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  res.json({ data: sharedStreakForUser(user) });
});
app.post('/shared-streak/invite', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const streak = sharedStreakForUser(user);
  const email = String(req.body?.email ?? '').trim();
  const invitation: SharedInvitation = { id: randomUUID(), email, status: 'invited' };
  streak.inviter = user.name;
  streak.invitations.unshift(invitation);
  streak.invitee = email || null;
  streak.status = 'invited';
  saveState();
  res.json({ data: streak });
});
app.post('/shared-streak/invitations/:id/accept', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const streak = sharedStreakForUser(user);
  const item = streak.invitations.find((entry) => entry.id === req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  if (item) item.status = 'accepted';
  streak.status = 'accepted';
  saveState();
  res.json({ data: { ok: true } });
});
app.post('/shared-streak/invitations/:id/decline', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const streak = sharedStreakForUser(user);
  const item = streak.invitations.find((entry) => entry.id === req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  if (item) item.status = 'declined';
  streak.status = 'declined';
  saveState();
  res.json({ data: { ok: true } });
});
app.delete('/shared-streak/invitations/:id', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const streak = sharedStreakForUser(user);
  const before = streak.invitations.length;
  streak.invitations = streak.invitations.filter((entry) => entry.id !== req.params.id);
  if (streak.invitations.length === before) return res.status(404).json({ message: 'Not found' });
  saveState();
  res.json({ data: { ok: true } });
});
app.post('/shared-streak/:id/restore', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const streak = sharedStreakForUser(user);
  streak.status = 'restored';
  saveState();
  res.json({ data: { ok: true } });
});

app.get('/folders', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  res.json({ data: state.folders.mine.filter((folder) => folderOwnedBy(folder, user)) });
});
app.post('/folders', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const folder: Folder = { id: Date.now(), name: String(req.body?.name ?? 'Folder'), icon: String(req.body?.icon ?? '📁'), isShared: false, upvoteCount: 0, createdAt: new Date().toISOString(), categoryCount: 0, wordCount: 0, user: { id: user.id, name: user.name } };
  state.folders.mine.unshift(folder);
  saveState();
  res.json({ data: folder });
});
app.put('/folders/:id', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const folder = state.folders.mine.find((item) => String(item.id) === req.params.id);
  if (!folder) return res.status(404).json({ message: 'Not found' });
  if (!folderOwnedBy(folder, user)) return res.status(403).json({ message: 'Access denied', error: 'Forbidden', statusCode: 403 });
  folder.name = String(req.body?.name ?? folder.name);
  folder.icon = String(req.body?.icon ?? folder.icon);
  saveState();
  res.json({ data: folder });
});
app.delete('/folders/:id', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const folder = state.folders.mine.find((item) => String(item.id) === req.params.id);
  if (!folder) return res.status(404).json({ message: 'Not found' });
  if (!folderOwnedBy(folder, user)) return res.status(403).json({ message: 'Access denied', error: 'Forbidden', statusCode: 403 });
  state.folders.mine = state.folders.mine.filter((item) => String(item.id) !== req.params.id);
  saveState();
  res.json({ data: { ok: true } });
});
app.post('/folders/:id/categories', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const folder = state.folders.mine.find((item) => String(item.id) === req.params.id);
  if (!folder) return res.status(404).json({ message: 'Not found' });
  if (!folderOwnedBy(folder, user)) return res.status(403).json({ message: 'Access denied', error: 'Forbidden', statusCode: 403 });
  const categoryIds = Array.isArray(req.body?.categoryIds) ? req.body.categoryIds.map((id: unknown) => String(id)) : [];
  for (const categoryId of categoryIds) {
    const category = state.categories.find((item) => item.id === categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found', statusCode: 404 });
    if (!canReadCategory(category, user)) return res.status(403).json({ message: 'Access denied', error: 'Forbidden', statusCode: 403 });
  }
  folder.categoryCount += categoryIds.length;
  saveState();
  res.json({ data: { ok: true, categoryIds } });
});
app.get('/folders/shared/newest', (_req, res) => res.json({ statusCode: 200, data: state.folders.newest }));
app.get('/folders/shared/trending', (_req, res) => res.json({ statusCode: 200, data: state.folders.trending }));
app.get('/folders/shared/upvotes', (req, res) => {
  if (!requireAuth(req, res)) return;
  res.json({ data: { ids: String(req.query.ids ?? '').split(',').filter(Boolean) } });
});
app.get('/folders/shared/:id', (req, res) => res.json({ data: { id: req.params.id, name: 'Shared folder', categories: [] } }));
app.post('/folders/shared/:id/copy', (req, res) => res.json({ data: { ok: true, id: req.params.id } }));
app.post('/folders/shared/:id/upvote', (req, res) => {
  const item = state.folders.trending.find((entry) => String(entry.id) === req.params.id) ?? state.folders.newest.find((entry) => String(entry.id) === req.params.id);
  if (item) item.upvoteCount += 1;
  saveState();
  res.json({ data: { ok: true, id: req.params.id } });
});

app.get('/chat/messages', (req, res) => {
  if (!requireAuth(req, res)) return;
  const limit = Number(req.query.limit ?? 50);
  res.json({ data: state.messages.slice(-limit) });
});
app.post('/chat/messages', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const schema = z.object({ content: z.string().min(1), replyToMessageId: z.string().nullable().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload' });
  const message: Message = {
    id: randomUUID(),
    content: parsed.data.content,
    createdAt: new Date().toISOString(),
    author: { id: Number(user.id.replace(/\D/g, '') || 1), name: user.name },
    replyToMessageId: parsed.data.replyToMessageId ?? null,
  };
  state.messages.push(message);
  saveState();
  res.status(201).json({ data: message });
});

app.get('/api/subscriptions', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  res.json({ data: state.subscriptions.filter((item) => sameId(item.userId, user.id)) });
});
app.post('/api/subscriptions', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const sub: Subscription = { id: randomUUID(), type: String(req.body?.type ?? 'pro'), status: 'pending', userId: user.id };
  state.subscriptions.push(sub);
  saveState();
  res.status(201).json({ data: sub });
});
app.post('/api/subscriptions/:id/payment', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const subscription = state.subscriptions.find((item) => sameId(item.id, req.params.id) && sameId(item.userId, user.id));
  if (!subscription) return res.status(404).json({ message: 'Subscription not found', statusCode: 404 });
  res.json({ data: { checkoutUrl: `${FRONTEND_URL}/pricing?subscription=${req.params.id}&paid=1`, returnUrl: req.body?.returnUrl ?? FRONTEND_URL, cancelUrl: req.body?.cancelUrl ?? `${FRONTEND_URL}/pricing` } });
});
app.post('/api/subscriptions/activate-by-order/:id', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const subscription = state.subscriptions.find((item) => sameId(item.id, req.params.id) && sameId(item.userId, user.id));
  if (!subscription) return res.status(404).json({ message: 'Subscription not found', statusCode: 404 });
  subscription.status = 'active';
  saveState();
  res.json({ data: subscription });
});

app.get('/ai/usage', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const u: any = aiUsageForUser(user);
  if (u && typeof u === 'object') {
    res.json({ data: { usage: u.usedToday ?? 0, ...u } });
  } else {
    res.json({ data: { usage: typeof u === 'number' ? u : 0 } });
  }
});
app.post('/ai/generate-vocabulary', (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const text = String(req.body?.text ?? '').trim();
  const image = typeof req.body?.image === 'string' ? req.body.image : null;
  const usage = incrementAiUsage(user);
  const terms = text
    ? text.split(/\s+/).slice(0, 12).map((word, index) => ({ term: word.replace(/[^\w-]/g, ''), meaning: `Gợi ý ${index + 1}`, example: image ? `Sinh từ ảnh ${index + 1}` : `Sinh từ text ${index + 1}` }))
    : [];
  aiGenerationsForUser(user).unshift({ id: randomUUID(), text, image, createdAt: new Date().toISOString(), termCount: terms.length });
  saveState();
  res.json({ data: { terms, usage } });
});

const webDistPath = resolve(__dirname, '../../web/dist');
const webIndexPath = join(webDistPath, 'index.html');

if (existsSync(webIndexPath)) {
  app.use(express.static(webDistPath));
  app.get('*', (req: Request, res: Response, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
    res.sendFile(webIndexPath);
  });
}

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});
