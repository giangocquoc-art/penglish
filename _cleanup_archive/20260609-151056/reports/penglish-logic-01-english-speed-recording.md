# PENGLISH-LOGIC-01 — English Speed Recording Flow

## Scope

Improved only the English Speed recording flow. No homepage, landing page, ocean visual system, paid/pro/login logic, Supabase Storage, or audio upload flow was added.

## Files changed

- `apps/web/src/hooks/useAudioRecorder.ts`
  - Added a local browser MediaRecorder hook.
  - Stores recorded audio as a browser object URL.
  - Cleans up object URLs, media tracks, recorder refs, and timer intervals.

- `apps/web/src/pages/EnglishSpeedPage.tsx`
  - Replaced API/scoring recording flow with local-only recording state.
  - Removed English Speed use of `requestShadowingFeedback`, API transcript copy, upload/analyzing copy, fake score UI, and score-derived feedback.
  - Preserved prompt, “Nghe mẫu”, “Nghe chậm”, retry, and next prompt flow.

- `scripts/penglish-logic-english-speed-recording-qa.cjs`
  - Added Playwright QA with a mocked browser microphone and mocked MediaRecorder.
  - Captures required mobile and desktop screenshots.
  - Checks for no upload/API/Supabase/storage request during recording.

## Recording states implemented

Implemented the requested local state machine:

- `idle`
- `requesting`
- `recording`
- `recorded`
- `error`

The page now shows:

- idle record CTA: `Ghi âm câu đọc`
- permission state: `Đang xin quyền micro`
- recording state: `Đang ghi âm câu đọc...` with timer
- stop CTA: `Dừng ghi âm`
- recorded state: local feedback and replay controls

## Permission and error handling

Handled copy:

- Unsupported browser: `Trình duyệt này chưa hỗ trợ ghi âm.`
- Permission denied: `P-English cần quyền micro để ghi âm câu đọc.`
- No microphone: `Không tìm thấy micro trên thiết bị.`

Additional local error handling:

- interrupted microphone state
- empty recording blob state
- cleanup on prompt change and unmount

## Recorded-state feedback

The recorded state intentionally does not fake AI scoring. It shows:

```text
P-English đã ghi âm câu đọc của bạn. Chấm phát âm chi tiết sẽ được mở ở bản sau.
```

After recording, the UI shows:

- `Nghe lại bài đọc của tôi`
- `Ghi lại`
- `Câu tiếp theo`

## Privacy and network result

English Speed recording is local-only:

- no audio upload
- no recording API call
- no Supabase Storage usage
- recorded audio is held as a browser object URL for the current page/session state

QA monitored recording actions and found no unexpected upload/API/Supabase/storage request.

## Screenshots saved

Saved to `reports/screenshots/penglish-logic/`:

- `english-speed-record-idle-mobile.png`
- `english-speed-recording-mobile.png`
- `english-speed-recorded-mobile.png`
- `english-speed-record-desktop.png`

## Validation

Build command:

```bash
npm.cmd run build -w @pshare/web
```

Result: passed.

QA command:

```bash
node scripts/penglish-logic-english-speed-recording-qa.cjs
```

Result: passed.
