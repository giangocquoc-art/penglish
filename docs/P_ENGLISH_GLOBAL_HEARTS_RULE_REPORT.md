# P-English Global Hearts Rule Report

## Mục tiêu

Triển khai hệ thống tim học tập toàn cục kiểu Minecraft cho các chế độ luyện tập P-English, dùng `localStorage` phía client, không yêu cầu đăng nhập, không thay đổi backend/auth/database/env/API key, không thêm package ngoài và không thay đổi build pipeline.

## Quy tắc tim học tập

- Mỗi người học có tối đa 5 tim mỗi ngày theo lịch Việt Nam.
- Ngày học được tính theo timezone `Asia/Ho_Chi_Minh`.
- Tim reset vào 00:00 ngày kế tiếp theo giờ Việt Nam.
- Không dùng rolling 24-hour lock.
- Khi trả lời sai trong chế độ học/luyện tập, người học mất 1 tim.
- Khi còn 0 tim, toàn bộ chế độ practice bị khóa cho đến nửa đêm Việt Nam tiếp theo.
- Lesson reading vẫn được phép truy cập; các CTA luyện tập hiển thị trạng thái khóa.

## File tạo mới

- `apps/web/src/lib/p-english/learning-hearts.ts`
  - Quản lý state tim bằng `localStorage`.
  - Tự reset theo Vietnam day key.
  - Tính thời điểm mở khóa tại nửa đêm Việt Nam tiếp theo.
  - Phát event `p-english:hearts-updated` để UI đồng bộ.
  - Export các hàm chính: `getLearningHeartsState`, `loseHeart`, `isLearningLocked`, `getLockRemainingText`.

- `apps/web/src/components/learning/LearningHeartsBadge.tsx`
  - Badge tim phong cách Minecraft bằng UI/CSS nội bộ.
  - Hiển thị số tim còn lại và trạng thái khóa.
  - Tự cập nhật khi focus tab, khi nhận event cập nhật tim, và theo interval.

- `docs/P_ENGLISH_GLOBAL_HEARTS_RULE_REPORT.md`
  - Báo cáo triển khai này.

## File đã chỉnh sửa

- `apps/web/src/components/Sidebar.tsx`
  - Gắn `LearningHeartsBadge` gần khung cá nhân người dùng ở sidebar trái.

- `apps/web/src/pages/PracticePage.tsx`
  - Thêm guard khóa toàn cục cho các mode:
    - `flashcard`
    - `quiz`
    - `listen`
    - `reflex`
    - `type`
    - `match`
    - `speed`
  - Khi hết tim, render màn hình khóa thay vì practice component.

- `apps/web/src/pages/LessonPage.tsx`
  - Không khóa nội dung đọc bài.
  - CTA practice hiển thị cảnh báo hết tim và thời gian mở lại khi bị khóa.

- `apps/web/src/components/practice/LessonFlashcardPractice.tsx`
  - Thêm bước nhập nghĩa tiếng Việt trước khi được lật thẻ.
  - Click/space/button không thể lật thẻ nếu chưa xác minh nghĩa.
  - Trả lời sai nghĩa mất 1 tim.
  - `Chưa nhớ` sau khi đã lật thẻ không làm mất tim, giữ nguyên hành vi SRS.
  - `Đã nhớ` vẫn ghi nhận đúng SRS; `Chưa nhớ` vẫn ghi nhận sai SRS.
  - Chuẩn hóa đáp án tiếng Việt:
    - lowercase
    - trim
    - collapse multiple spaces
    - bỏ dấu câu cuối `. ! ?`
    - bỏ ellipsis `...`
    - chuẩn hóa smart quotes
    - so sánh có dấu và không dấu
    - hỗ trợ slash alternatives
    - hỗ trợ comma alternatives
    - không chấp nhận input rỗng

- `apps/web/src/components/practice/LessonQuizPractice.tsx`
  - Sai khi check đáp án mất 1 tim.
  - Mỗi câu chỉ trừ khi check lần đầu vì câu đã checked sẽ không check lại.
  - Feedback hiển thị `Bạn mất 1 tim. Còn X/5 tim.`.

- `apps/web/src/components/practice/LessonListeningPractice.tsx`
  - Sai khi check lựa chọn mất 1 tim.
  - Mỗi item chỉ trừ khi check lần đầu.
  - Feedback hiển thị số tim còn lại.

- `apps/web/src/components/practice/LessonReflexPractice.tsx`
  - Sai khi check câu typed answer mất 1 tim.
  - Mỗi prompt chỉ trừ khi check lần đầu.
  - Feedback hiển thị số tim còn lại.

- `apps/web/src/components/practice/LessonTypingPractice.tsx`
  - Sai khi check typing/fill blank/listen-type task mất 1 tim.
  - Mỗi task chỉ trừ khi check lần đầu.
  - Feedback hiển thị số tim còn lại.

- `apps/web/src/components/practice/LessonMatchPractice.tsx`
  - Mỗi lần ghép sai một pair mất 1 tim.
  - Warning hiển thị số tim còn lại.

- `apps/web/src/components/practice/LessonSpeedPractice.tsx`
  - Mỗi option sai mất 1 tim.
  - Feedback hiển thị số tim còn lại.

## Ghi chú kiểm thử thủ công đề xuất

1. Mở app, kiểm tra sidebar trái có badge tim tại khung cá nhân.
2. Vào flashcard, thử click/space/button khi chưa nhập nghĩa: thẻ không được lật.
3. Nhập nghĩa sai trong flashcard: mất 1 tim và không lật thẻ.
4. Nhập nghĩa đúng không dấu/có dấu hoặc một alternative hợp lệ: được phép lật thẻ.
5. Sau khi lật flashcard, bấm `Chưa nhớ`: chỉ cập nhật SRS, không mất thêm tim.
6. Trả lời sai ở quiz/listen/reflex/type/match/speed: mất tim đúng theo từng attempt được yêu cầu.
7. Khi hết 5 tim, truy cập practice mode bất kỳ sẽ thấy màn hình khóa.
8. Vào lesson page khi hết tim vẫn đọc bài được, nhưng CTA luyện tập báo khóa.
9. Qua 00:00 giờ Việt Nam, tim reset về 5/5 và practice mở lại.

## Trạng thái validation

- `npx tsc -p apps/web/tsconfig.json --noEmit`: PASS, exit code 0.
- `npm run build`: FAIL tại bước `vite build` của workspace web.
  - API TypeScript build đã chạy xong trước đó.
  - Lỗi Vite hiện tại:
    - `[vite:html-inline-proxy] Could not load C:/Users/PC/OneDrive/P-English/Luyen-Tu/apps/web/index.html?html-proxy&inline-css&index=0.css`
    - `No matching HTML proxy module found from C:/Users/PC/OneDrive/P-English/Luyen-Tu/apps/web/index.html?html-proxy&inline-css&index=0.css`
  - Lỗi phát sinh ở xử lý inline CSS trong `apps/web/index.html`, không phải lỗi TypeScript từ các file hearts/practice vừa chỉnh.
  - Theo ràng buộc task, không sửa `apps/web/index.html`, Vite config hoặc build pipeline.
