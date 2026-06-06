# Luyen Tu backend parity plan

## Mục tiêu
Dựng clean-room fullstack clone local có backend persistent và feature-flow gần tương đương site live trên từng tab chính, không phụ thuộc backend gốc.

## Recon đã chốt từ live bundle

### Static assets
- `/assets/index.DW9kJys3.js`
- `/assets/vendor-react.UyWQdFzf.js`
- `/assets/vendor-motion.DU-fgqFQ.js`
- `/assets/vendor-chakra.Dh-el5Ep.js`
- `/assets/index.DqXta_Yv.css`

### Auth / token
- `/auth/google`
- `/auth/login`
- `/auth/logout`
- `/auth/profile`
- `/auth/refresh`
- header `X-App-Token`
- token local: `accessToken`, `refreshToken`

### Encryption / payload handling
- markers `_enc`, `_ts`
- bundle có decrypt helper cho vocabulary payload
- route local nên giữ compatibility mode cho payload plain + encrypted

### API surface thấy từ bundle
#### Paths / SRS
- `/paths/summary`
- `/paths/groups`
- `/paths/:id`
- `/paths/:id/progress`
- `/paths/:id/progress/bulk`
- `/paths/:id/leaderboard`
- `/paths/:id/srs/overview`
- `/paths/:id/srs/candidates`
- `/paths/:id/srs/words`
- `/paths/:id/srs/update`
- `/paths/:id/srs/bulk-update`
- `/paths/:id/srs/level`
- `/paths/:id/srs/recompute-level5`
- fallback generic progress routes:
  - `/progress/srs/update`
  - `/progress/srs/bulk-update`
  - `/progress/srs/candidates`
  - `/progress/srs/words`
  - `/progress/srs/level`
  - `/progress/srs/recompute-level5`
  - `/progress/srs/counts`
- wordset:
  - `/word-sets/:id/vocabularies`
  - `/word-sets/:id/study`

#### Categories / vocab
- `/categories`
- `/categories/:id`
- `/categories/:id/vocabularies`
- `/categories/:id/share-link`
- `/categories/public/search`
- `/categories/public/:id`
- `/categories/shared/:id`
- `/categories/shared/:id/copy`
- `/categories/copy/:id`
- `/categories/copy/:id/to/:targetId`
- `/vocabularies`
- `/vocabularies/:id`
- `/vocabularies/:id/progress`
- `/vocabularies/bulk`
- `/vocabularies/progress/bulk`
- `/vocabularies/stats`
- `/vocabularies/suggestions/popular`
- `/vocabularies/suggestions/words`
- `/vocabularies/suggest`

#### Activity / leaderboard
- `/activity/calendar`
- `/activity/log`
- `/activity/leaderboard`
- `/activity/leaderboard/top`

#### Shop / reward
- `/shop/items`
- `/shop/coins`
- `/shop/inventory`
- `/shop/custom-upload-pricing`
- `/shop/custom-upload/:id`
- `/shop/equipped-sound`
- `/shop/equipped-typing-sound`
- `/shop/equip/:id`
- `/shop/unequip/:id`
- `/shop/purchase/:id`
- `/shop/daily-reward`
- `/shop/reward`

#### Shared streak
- `/shared-streak`
- `/shared-streak/invite`
- `/shared-streak/invitations/:id`
- `/shared-streak/invitations/:id/accept`
- `/shared-streak/invitations/:id/decline`
- `/shared-streak/:id/restore`

#### Folders
- `/folders`
- `/folders/:id`
- `/folders/:id/categories`
- `/folders/shared/newest`
- `/folders/shared/trending`
- `/folders/shared/upvotes`
- `/folders/shared/:id`
- `/folders/shared/:id/copy`
- `/folders/shared/:id/upvote`

#### Chat
- `/chat/messages`

#### Subscription / pricing
- `/api/subscriptions`
- `/api/subscriptions/:id/payment`
- `/api/subscriptions/activate-by-order/:id`

#### AI
- `/ai/usage`
- `/ai/generate-vocabulary`

## Gap local hiện tại

### Có rồi
- login demo local
- home/study/categories/vocab/leaderboard/shop/pricing/shared-streak
- vài endpoint cơ bản mock in-memory

### Thiếu
- DB persistent
- bulk category/vocab endpoints
- folders CRUD đầy đủ
- chat UX + reply state giữ bền
- shop equipped sound/state endpoint
- generic SRS progress endpoints
- subscriptions lifecycle đầy đủ
- AI usage persistence
- payload encryption compatibility layer
- app-token compatibility middleware
- games/practice UI đang mới local, chưa bắn full API parity

## Kiến trúc target
- DB: SQLite nhanh để local, dễ migrate lên Postgres sau
- ORM nhẹ: Prisma hoặc Drizzle; ưu tiên Prisma cho speed scaffold
- Layer:
  - `apps/api/src/modules/*`
  - `apps/api/src/lib/auth.ts`
  - `apps/api/src/lib/appToken.ts`
  - `apps/api/src/lib/cryptoCompat.ts`
  - `apps/api/src/db/*`
- Persistence cho:
  - users
  - refresh_tokens / sessions
  - groups / paths / words / progress
  - categories / category_words
  - folders / folder_categories / folder_upvotes
  - activity_logs / streaks / leaderboard snapshots
  - shop_inventory / equipped_items / coin_ledger
  - subscriptions / payments
  - chat_messages
  - ai_usage / ai_generations

## Phase triển khai

### Phase 1 — backend persistent core
1. thêm DB + schema + seed
2. bỏ in-memory state
3. giữ response shape cũ để frontend local không gãy

### Phase 2 — auth parity
1. profile / refresh / logout ổn định
2. mock Google callback local
3. session persistence
4. token bootstrap compatible bundle

### Phase 3 — content + SRS
1. paths groups summary detail
2. progress single + bulk
3. srs overview / candidates / words / level / recompute
4. word-set study log
5. generic `/progress/srs/*`

### Phase 4 — categories + vocab
1. CRUD category
2. share-link / shared copy
3. vocab single / bulk / stats / suggestions
4. encrypted payload compatibility optional

### Phase 5 — social + utility
1. folders CRUD + add categories + shared newest/trending/upvotes
2. chat messages + reply persistence
3. shared streak invite / accept / decline / restore

### Phase 6 — commerce + AI
1. shop state / purchase / equip / reward / custom-upload pricing
2. subscriptions create / payment / activate
3. ai usage / generate vocabulary persistence

### Phase 7 — frontend full wire
1. route `/games` dùng `GamesPage`
2. route `/practice` dùng `PracticePage`
3. add `/folders` `/chat` `/ai`
4. profile thật hơn
5. error/loading/empty states

### Phase 8 — verify
- Playwright route smoke:
  - `/home`
  - `/paths/:id`
  - `/categories`
  - `/vocabularies`
  - `/games`
  - `/practice`
  - `/folders`
  - `/chat`
  - `/shop`
  - `/pricing`
  - `/shared-streak`
  - `/ai`
- API checklist theo endpoint group

## Tool / stack đề xuất
- browser recon: Playwright + local Chromium với `LD_LIBRARY_PATH`
- API diff: curl + grep endpoint extraction từ bundle
- DB: Prisma + SQLite
- verify: Playwright smoke + npm build

## Trạng thái hiện tại
- build local: PASS
- live bundle recon: DONE vòng 1
- next ROI: DB persistent + missing endpoints + wire full tabs
