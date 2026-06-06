# P-English Unit 1 Speed Mode Report

## Mục tiêu

Triển khai chế độ Speed thật cho Unit 1 tại route:

- `/practice?lessonId=unit-1-greetings-introduction&mode=speed`

Chế độ này là game luyện phản xạ nhẹ trong 60 giây, dùng hoàn toàn dữ liệu local của bài học, không gọi backend/API/audio ngoài.

## Files created

- `apps/web/src/components/practice/LessonSpeedPractice.tsx`

## Files changed

- `apps/web/src/pages/PracticePage.tsx`

## PracticePage branch added

`PracticePage` đã import component Speed:

```tsx
import { LessonSpeedPractice } from '../components/practice/LessonSpeedPractice';
```

Nhánh route mới được thêm cho `mode=speed`:

```tsx
if (lessonId && mode === 'speed') {
  if (!lesson) {
    return (
      <Box bg="#F8FAFC" minH="calc(100vh - 72px)" px="6" py="8">
        <Box maxW="760px" mx="auto" bg="white" border="1px solid" borderColor="#E2E8F0" borderRadius="3xl" p="8">
          <Text fontSize="2xl" fontWeight="900" color="#0F172A">Không tìm thấy bài học để luyện tốc độ</Text>
          <Text mt="2" color="#64748B">Lesson ID hiện tại chưa có trong dữ liệu local của P-English.</Text>
          <HStack mt="6" wrap="wrap">
            <Button as={Link} to="/home" borderRadius="full" bg="#2563EB" color="white" _hover={{ bg: '#1D4ED8' }}>
              Về trang chủ
            </Button>
            <Button as={Link} to={`/lessons/${lessonId}`} borderRadius="full" variant="outline">
              Quay lại bài học
            </Button>
          </HStack>
        </Box>
      </Box>
    );
  }
  return <LessonSpeedPractice lesson={lesson} />;
}
```

Placeholder condition cũng đã loại trừ `speed`, nên speed không còn rơi vào màn hình “nối sau”.

## Route tested

- Target route: `/practice?lessonId=unit-1-greetings-introduction&mode=speed`
- Vite dev server đang chạy và nhận HMR cho `PracticePage.tsx`.
- Build command sẽ được chạy và cập nhật ở phần dưới.

## Question pool sources

`LessonSpeedPractice` tạo pool tối đa 30 câu từ 4 nguồn local:

1. Vocabulary recognition
   - Source: `lesson.vocabulary`
   - Prompt: English `term`
   - Answer/options: Vietnamese `meaningVi`
   - Label: `Từ vựng`

2. Reverse vocabulary
   - Source: `lesson.vocabulary`
   - Prompt: Vietnamese `meaningVi`
   - Answer/options: English `term`
   - Label: `Từ vựng`

3. Quiz multiple choice
   - Source: `lesson.quizQuestions`
   - Chỉ lấy câu `type === "multiple-choice"`, có `options`, có `question`, và `answer` là string
   - Reuse `question/options/answer/explanationVi`
   - Label: `Quiz`

4. Reflex quick choice
   - Source: `lesson.speakingReflexPrompts`
   - Prompt: `promptVi`
   - Answer/options: `expectedEnglish`
   - Explanation: `hint`
   - Label: `Phản xạ`

Question shape trong component:

```ts
type SpeedQuestion = {
  id: string;
  type: 'vocab-meaning' | 'vocab-reverse' | 'quiz-multiple-choice' | 'reflex-quick-choice';
  prompt: string;
  options: string[];
  answer: string;
  explanationVi?: string;
  sourceLabel: 'Từ vựng' | 'Quiz' | 'Phản xạ';
};
```

Pool được shuffle khi bấm `Bắt đầu`; option của từng câu cũng shuffle tại thời điểm bắt đầu game. Không gọi `Math.random` trực tiếp trong render.

## Scoring rules

- Correct: `+10`
- Wrong: `+0`
- Streak bonus: mỗi 3 câu đúng liên tiếp được `+5`
- Khi có bonus, UI hiển thị: `+5 streak bonus`
- Theo dõi:
  - score
  - correct count
  - wrong count
  - current streak
  - max streak
  - accuracy
  - answered/total

## Timer behavior

- Thời lượng mỗi lượt: 60 giây.
- Timer bắt đầu sau khi nhấn `Bắt đầu`.
- Game kết thúc khi:
  - timer về 0, hoặc
  - người học trả lời hết pool câu hỏi.
- Feedback sau khi chọn đáp án tự chuyển sau khoảng 780ms.
- Có nút `Câu tiếp theo` để chuyển ngay khi feedback đang hiển thị.

## speechSynthesis behavior

- Có nút `Nghe câu` trong feedback khi đáp án đúng là tiếng Anh.
- Dùng browser `speechSynthesis`, không gọi API/audio ngoài.
- Cấu hình:
  - `lang = "en-US"`
  - `rate = 0.88`
- Có guard cho môi trường không có `window` hoặc không hỗ trợ `speechSynthesis`.

## Keyboard shortcuts

- Phím `1–4`: chọn option tương ứng khi chưa có feedback.
- Phím `Enter`: chuyển câu tiếp theo khi feedback đang hiển thị.
- Không dùng phím Space để tránh scroll/interference.
- Guard input target:
  - `input`
  - `textarea`
  - `select`
  - `contenteditable`

## localStorage

Key dùng cho Unit 1:

```text
p-english:lesson-progress:unit-1-greetings-introduction
```

Component merge với object hiện có và chỉ thêm/cập nhật field `speed`, không overwrite các field mode khác như:

- `flashcard`
- `quiz`
- `listening`
- `reflex`
- `typing`
- `match`

Shape của field `speed`:

```json
{
  "speed": {
    "attempts": 1,
    "bestScore": 0,
    "lastScore": 0,
    "lastCorrect": 0,
    "lastWrong": 0,
    "maxStreak": 0,
    "lastPlayedAt": "..."
  }
}
```

Nếu localStorage không khả dụng, game vẫn chạy trong memory và không crash.

## UI/UX

- Chakra UI.
- P-English color system:
  - background `#F8FAFC`
  - card `#FFFFFF`
  - text `#0F172A`
  - muted `#64748B`
  - primary blue `#2563EB`
  - green `#22C55E`
  - amber cho timer/streak/bonus
  - red cho wrong state
  - border `#E2E8F0`
- Mobile:
  - option buttons full width ở base breakpoint
  - stats wrap bằng `HStack wrap="wrap"`
  - summary dùng responsive grid
  - không tạo horizontal overflow chủ ý

## Modes preserved

Các mode Unit 1 đã có vẫn được giữ nguyên branch trong `PracticePage`:

- `flashcard`
- `quiz`
- `listen`
- `reflex`
- `type`
- `match`

Generic `/practice` không có `lessonId` vẫn giữ flow luyện tập chung hiện tại.

## Limitations

- Speed dùng browser timer và `setInterval`, không có server validation.
- `speechSynthesis` phụ thuộc trình duyệt và voice có sẵn trên máy.
- Pool hiện được tạo từ dữ liệu Unit 1 local; lesson khác nếu thiếu dữ liệu sẽ hiển thị fallback “chưa có dữ liệu”.
- Scoring lưu localStorage, chưa đồng bộ dashboard/server.

## Build result

Command run from `Luyen Tu`:

```bash
npm run build
```

Result: failed at web Vite build with the known pre-existing/path-related Vite HTML proxy issue.

Observed output:

```text
> pshare@1.0.0 build
> npm run build -w @pshare/api && npm run build -w @pshare/web

> build
> tsc -p tsconfig.json

> build
> vite build

vite v5.4.21 building for production...
transforming...
✓ 1 modules transformed.
x Build failed in 168ms
error during build:
[vite:html-inline-proxy] Could not load C:/Users/PC/OneDrive/P-English/Luyen Tu/apps/web/index.html?html-proxy&inline-css&index=0.css (imported by index.html): No matching HTML proxy module found from C:/Users/PC/OneDrive/P-English/Luyen Tu/apps/web/index.html?html-proxy&inline-css&index=0.css
```

Notes:

- API TypeScript build completed before the web build step.
- Web build failed at the known Vite `html-inline-proxy` issue.
- No Vite config, `index.html`, or build pipeline files were changed.

## TypeScript check result

Command run from `Luyen Tu`:

```bash
npx tsc -p apps/web/tsconfig.json --noEmit
```

Result: failed due existing unrelated TypeScript issues in pages outside the Speed implementation scope:

```text
apps/web/src/pages/CategoriesPage.tsx(92,11): error TS2322: Type '{ delay: number; }' is not assignable to type 'ResponsiveValue<Transition<string & {}>> | undefined'.
apps/web/src/pages/FoldersPage.tsx(82,11): error TS2322: Type '{ delay: number; }' is not assignable to type 'ResponsiveValue<Transition<string & {}>> | undefined'.
apps/web/src/pages/StudyPage.tsx(110,15): error TS2783: 'transition' is specified more than once, so this usage will be overwritten.
```

These are the same unrelated checks seen in prior Unit 1 mode reports and were not changed for this task.

## Known Vite html-inline-proxy status

The known Vite `[vite:html-inline-proxy] No matching HTML proxy module found` error still appears during `npm run build`. This is documented as pre-existing/path-related with the project folder `Luyen Tu` containing a space. Per instruction, no fix was attempted in Vite config / `index.html` / build pipeline.
