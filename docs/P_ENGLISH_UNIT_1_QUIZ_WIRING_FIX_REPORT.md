# P-English Unit 1 Quiz Wiring Fix Report

## Mục tiêu

Wire component `LessonQuizPractice` hiện có vào `PracticePage` cho route quiz của Unit 1, chỉ xử lý routing cho `mode=quiz` và không thay đổi hành vi flashcard.

## Files changed

1. `apps/web/src/pages/PracticePage.tsx`
   - Thêm import `LessonQuizPractice`.
   - Thêm branch xử lý `mode === 'quiz'`.
   - Giữ branch `mode === 'flashcard'` hiện có.
   - Giữ placeholder cho các mode chưa triển khai.

2. `docs/P_ENGLISH_UNIT_1_QUIZ_WIRING_FIX_REPORT.md`
   - Ghi lại phạm vi thay đổi, route cần test, trạng thái mode, và build result.

## Exact import added

```tsx
import { LessonQuizPractice } from '../components/practice/LessonQuizPractice';
```

## Exact PracticePage branch added

```tsx
if (lessonId && mode === 'quiz') {
  if (!lesson) {
    return (
      <Box bg="#F8FAFC" minH="calc(100vh - 72px)" px="6" py="8">
        <Box maxW="760px" mx="auto" bg="white" border="1px solid" borderColor="#E2E8F0" borderRadius="3xl" p="8">
          <Text fontSize="2xl" fontWeight="900" color="#0F172A">Không tìm thấy bài học để luyện tập</Text>
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
  return <LessonQuizPractice lesson={lesson} />;
}
```

## Placeholder condition updated

```tsx
if (lessonId && mode && mode !== 'flashcard' && mode !== 'quiz') {
```

## Routes tested / verified by source wiring

| Route | Expected result | Status |
| --- | --- | --- |
| `/practice?lessonId=unit-1-greetings-introduction&mode=quiz` | Renders `LessonQuizPractice` with local Unit 1 lesson data | Wired |
| `/practice?lessonId=unit-1-greetings-introduction&mode=flashcard` | Keeps rendering `LessonFlashcardPractice` | Unchanged |
| `/practice?lessonId=unit-1-greetings-introduction&mode=listen` | Shows placeholder | Unchanged placeholder |
| `/practice?lessonId=unit-1-greetings-introduction&mode=reflex` | Shows placeholder | Unchanged placeholder |
| `/practice?lessonId=unit-1-greetings-introduction&mode=type` | Shows placeholder | Unchanged placeholder |
| `/practice?lessonId=unit-1-greetings-introduction&mode=match` | Shows placeholder | Unchanged placeholder |
| `/practice?lessonId=unit-1-greetings-introduction&mode=speed` | Shows placeholder | Unchanged placeholder |
| `/practice` | Generic PracticePage behavior remains active | Unchanged |

## Flashcard status

Flashcard behavior is unchanged. The existing `mode === 'flashcard'` branch still returns:

```tsx
return <LessonFlashcardPractice lesson={lesson} />;
```

## Quiz status

Quiz route is now wired. When `lessonId` is present, `mode === 'quiz'`, and `getLessonById(lessonId)` returns a lesson, `PracticePage` returns:

```tsx
return <LessonQuizPractice lesson={lesson} />;
```

If the lesson is not found, the quiz branch shows:

- `Không tìm thấy bài học để luyện tập`
- `Về trang chủ` button to `/home`
- `Quay lại bài học` button to `/lessons/{lessonId}`

## Modes intentionally still placeholder

The following lesson practice modes are intentionally not implemented in this task and remain on placeholder UI:

- `listen`
- `reflex`
- `type`
- `match`
- `speed`

Placeholder headline remains:

```text
Chế độ này sẽ được nối với bài học ở bước sau.
```

## Build result

Command run from `Luyen Tu`:

```bash
npm run build
```

Result: failed at the web Vite build step with the known pre-existing path-related Vite HTML inline proxy error. The API TypeScript build completed before the web build started.

Relevant output:

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
x Build failed in 124ms
error during build:
[vite:html-inline-proxy] Could not load C:/Users/PC/OneDrive/P-English/Luyen Tu/apps/web/index.html?html-proxy&inline-css&index=0.css (imported by index.html): No matching HTML proxy module found from C:/Users/PC/OneDrive/P-English/Luyen Tu/apps/web/index.html?html-proxy&inline-css&index=0.css
```

Notes:

- This is the same known Vite `html-inline-proxy` failure previously observed under the folder path containing a space: `Luyen Tu`.
- No Vite config, `index.html`, build pipeline, backend, auth, env, database, API, or runtime state changes were made in this task.
- The dev server accepted the `PracticePage.tsx` update via Vite HMR after the wiring change.
