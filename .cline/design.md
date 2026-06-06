# P-English DESIGN.md

This is the highest-priority design and product rule file for P-English.

Before changing UI, lesson flow, Shadowing, Vocabulary, English Speed, Learning Path, Practice, dashboard, or shared components, every AI coding agent must read and follow this file.

## Product identity

P-English is a Vietnamese-first English learning web app.

The app must feel:
- calm
- ocean-inspired
- simple
- glassmorphism-based
- beginner-friendly
- mobile-first
- local-first where possible

The app must not feel:
- cluttered
- like an admin dashboard
- like a random card collection
- like a sci-fi app
- overloaded with mascots

## Core visual rules

Use one consistent visual system:
- ocean / sky background
- soft blue, cyan, white, aqua palette
- transparent or semi-transparent glass widgets
- subtle blur
- soft border
- soft shadow
- rounded corners
- strong readability
- clear hierarchy

Avoid:
- too many gradients
- too many colors
- dense walls of cards
- text wrapping letter-by-letter
- tiny cramped widgets
- noisy decorative icons

## Whale rule

Use one whale identity only.

The whale:
- must follow the current logo whale style
- must not be replaced by random mascots
- may gently swim or float
- may lightly react to cursor direction
- must not chase the cursor aggressively
- must not sit too close to the cursor
- must never cover text, buttons, inputs, or practice content
- must support reduced-motion
- animations must clean up on unmount

## Page hierarchy rule

Every page must have one clear main purpose.

Recommended order:
1. short page purpose
2. one primary action
3. important learning status
4. main learning/practice content
5. secondary actions
6. optional details below

If a page feels like a collage, simplify it.

## Home rule

Home is a calm learner dashboard.

Prioritize:
1. Hôm nay học gì?
2. one primary next action
3. one secondary action
4. progress summary
5. recent practice memory
6. skill overview
7. a few daily actions only

## Learning Path rule

Learning Path should feel like a calm CEFR journey map:
- A1 → A2 → B1 → B2
- clear unit cards
- one primary CTA per unit
- short skill/level labels
- no wall of cards

## Lesson rule

Lesson pages should feel like focused lesson rooms:
- clear title
- level
- skill focus
- estimated time
- one recommended next action
- available modes only

## Practice rule

Practice pages should feel like one calm task surface:
- clear instruction
- clear answer area
- calm feedback
- subtle keyboard hints
- intentional fallback if mode unavailable

## Vocabulary rule

Vocabulary must feel like a learning module, not a table.

Search must work for common A1 words:
- hello
- morning
- school
- family
- water
- food
- go
- study

If filters hide results, show a helpful Vietnamese suggestion.

## Shadowing rule

Shadowing has two layers.

Local Shadowing Core:
- works without API
- has local lessons
- transcript chunks
- listen/read/repeat
- recording/self-review
- manual transcript fallback
- local error map:
  - missing words
  - extra words
  - changed words/phrases
  - timing difference
  - phrase drills
  - Vietnamese pronunciation tips

AI Shadowing Assist:
- optional only
- API key must stay server-side
- no key exposed in frontend
- no API required for normal learning
- focus on showing mistakes, not /10 score first

## API safety

Never expose these in frontend:
- GEMINI_API_KEY
- OPENAI_API_KEY
- SUPABASE_SERVICE_ROLE_KEY

Allowed frontend public env:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

Server-side only:
- GEMINI_API_KEY
- OPENAI_API_KEY
- SUPABASE_SERVICE_ROLE_KEY

If API/backend is missing:
- fail softly
- show local mode
- do not spam console
- do not break page

## Development workflow

Work in small reviewed phases.

Each phase must:
1. read DESIGN.md
2. define small scope
3. inspect relevant files
4. implement only that scope
5. run validation
6. capture screenshots if UI changes
7. create report
8. stop for human review

Do not proceed to the next phase automatically.

## Validation

After meaningful changes, run:

npx.cmd tsc -p apps/web/tsconfig.json --noEmit
npm.cmd run validate:lessons
npm.cmd run build

Screenshots go to:
reports/screenshots

Reports go to:
reports

Prompts go to:
reports/prompts
