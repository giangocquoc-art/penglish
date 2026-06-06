# P-English Unit 1 Match Practice Report

## Mục tiêu

Triển khai chế độ Match thật cho Unit 1 tại route:

- `/practice?lessonId=unit-1-greetings-introduction&mode=match`

Phạm vi chỉ bao gồm `match` mode. Không triển khai `speed` trong task này.

## Files created

- `apps/web/src/components/practice/LessonMatchPractice.tsx`

## Files changed

- `apps/web/src/pages/PracticePage.tsx`

## Exact PracticePage branch added

Đã thêm import:

```tsx
import { LessonMatchPractice } from '../components/practice/LessonMatchPractice';
```

Đã thêm branch:

```tsx
if (lessonId && mode === 'match') {
  if (!lesson) {
    return (
      <Box bg="#F8FAFC" minH="calc(100vh - 72px)" px="6" py="8">
        <Box maxW="760px" mx="auto" bg="white" border="1px solid" borderColor="#E2E8F0" borderRadius="3xl" p="8">
          <Text fontSize="2xl" fontWeight="900" color="#0F172A">Không tìm thấy bài học để ghép cặp</Text>
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
  return <LessonMatchPractice lesson={lesson} />;
}
```

Đã cập nhật placeholder condition để chỉ còn các mode chưa triển khai như `speed` rơi vào placeholder:

```tsx
if (lessonId && mode && mode !== 'flashcard' && mode !== 'quiz' && mode !== 'listen' && mode !== 'reflex' && mode !== 'type' && mode !== 'match') {
```

## Route tested / target route

- `/practice?lessonId=unit-1-greetings-introduction&mode=match`

Route này hiện render `LessonMatchPractice` với dữ liệu local của Unit 1 khi `lessonId` hợp lệ.

## Matching rules

Nguồn dữ liệu:

- `lesson.vocabulary`

Mỗi vocabulary item được map thành pair:

```ts
{
  id: vocabulary.id,
  left: vocabulary.term,
  right: vocabulary.meaningVi,
  example: vocabulary.example,
  exampleMeaningVi: vocabulary.exampleMeaningVi,
  tags: vocabulary.tags
}
```

Interaction:

- Learner chọn một cụm tiếng Anh bên trái.
- Learner chọn một nghĩa tiếng Việt bên phải.
- Nếu `id` khớp:
  - pair được đánh dấu matched
  - left/right bị khóa bằng trạng thái xanh
  - pair được thêm vào `completedPairIds`
  - ví dụ câu được mở khóa bên dưới board
- Nếu sai:
  - hiển thị warning `Chưa khớp, thử lại nhé.`
  - tăng `mistakes`
  - tăng `roundMistakes`
  - thêm left pair id vào `weakPairIds`
  - hai item flash red tạm thời nhưng vẫn còn khả dụng

Selected state dùng blue border/background. Matched state dùng green border/background. Wrong state dùng red border/background và warning amber/red theo P-English color rules.

## Round behavior

- Dùng tất cả 18 vocabulary/chunk items của Unit 1.
- Chia 6 pairs mỗi round:
  - round 1: first 6
  - round 2: next 6
  - round 3: last 6
- Left column dùng thứ tự round hiện tại.
- Right column được shuffle một lần khi khởi tạo session/round state, không gọi `Math.random` trực tiếp trong render.
- Khi match hết round hiện tại:
  - hiện card `Hoàn thành vòng {round}`
  - hiện mistakes trong round
  - button `Vòng tiếp theo` nếu còn round
  - button `Xem tổng kết` nếu là round cuối

## speechSynthesis behavior

Đã thêm button `Nghe cụm` trên từng left item.

Speech helper:

- chỉ chạy trong browser qua guard `typeof window !== "undefined"`
- kiểm tra `window.speechSynthesis`
- gọi `window.speechSynthesis.cancel()` trước speech mới
- dùng `SpeechSynthesisUtterance`
- `lang = "en-US"`
- `rate = 0.86`
- không gọi backend/API/audio external

## localStorage key and match shape

Key:

```text
p-english:lesson-progress:unit-1-greetings-introduction
```

Shape thêm mới:

```json
{
  "match": {
    "attempts": 1,
    "completedPairIds": [],
    "weakPairIds": [],
    "lastMistakes": 0,
    "lastCompletedAt": "..."
  }
}
```

Progress được save khi summary được render. Logic dùng merge object hiện có, không overwrite:

- `flashcard`
- `quiz`
- `listening`
- `reflex`
- `typing`

Nếu `localStorage` unavailable, mode vẫn chạy bằng React state trong memory.

## Modes still placeholder

Mode vẫn chưa triển khai trong task này:

- `speed`

Không triển khai `speed` theo đúng scope.

## Preserved modes

Các branch hiện có vẫn giữ nguyên:

- `flashcard`
- `quiz`
- `listen`
- `reflex`
- `type`

Generic `/practice` không có `lessonId` vẫn giữ behavior luyện tập chung hiện tại.

## Limitations

- Không có drag-and-drop; interaction là click/tap chọn trái rồi chọn phải.
- Không có timer; tốc độ sẽ dành cho `speed` mode sau.
- Weak pair hiện được ghi theo left item bị chọn sai.
- Shuffle right column dùng `Math.random` khi configure session, không seed cố định.
- Không có backend/API/auth; toàn bộ chạy local.

## Build result

Đã chạy:

```bash
npm run build
```

Kết quả:

- API build (`tsc -p tsconfig.json`) chạy xong.
- Web build (`vite build`) fail ở bước Vite trước khi bundle app đầy đủ.

Lỗi:

```text
[vite:html-inline-proxy] Could not load C:/Users/PC/OneDrive/P-English/Luyen Tu/apps/web/index.html?html-proxy&inline-css&index=0.css (imported by index.html): No matching HTML proxy module found from C:/Users/PC/OneDrive/P-English/Luyen Tu/apps/web/index.html?html-proxy&inline-css&index=0.css
```

Exit code: `1`.

## TypeScript check result

Đã chạy:

```bash
npx tsc -p apps/web/tsconfig.json --noEmit
```

Kết quả: fail với các lỗi TypeScript hiện có ở file khác, không trỏ vào `LessonMatchPractice.tsx` hoặc `PracticePage.tsx`:

```text
apps/web/src/pages/CategoriesPage.tsx(92,11): error TS2322: Type '{ delay: number; }' is not assignable to type 'ResponsiveValue<Transition<string & {}>> | undefined'.
apps/web/src/pages/FoldersPage.tsx(82,11): error TS2322: Type '{ delay: number; }' is not assignable to type 'ResponsiveValue<Transition<string & {}>> | undefined'.
apps/web/src/pages/StudyPage.tsx(110,15): error TS2783: 'transition' is specified more than once, so this usage will be overwritten.
```

Các lỗi này nằm ngoài scope task match nên không được sửa trong task này.

## Known Vite html-inline-proxy status

Lỗi `[vite:html-inline-proxy] No matching HTML proxy module found` vẫn xuất hiện. Đây là lỗi build đã biết/trước đó, liên quan path có space `Luyen Tu` trong Vite HTML inline proxy. Theo constraint của task, không chỉnh Vite config, `index.html` hoặc build pipeline.
