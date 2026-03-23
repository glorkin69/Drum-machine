# BeatForge 808 - Architecture Documentation

## Overview
A vintage drum machine pattern generator web app that allows users to play and customize 16-step drum patterns across 7 music genres (House, Electronic, Lo-Fi, Pop, Rock, Hip-Hop, Trap) and 5 song parts (Intro, Verse, Chorus, Bridge, Outro). Features Web Audio API synthesis for real-time playback, pattern save/load, real-time collaboration (up to 4 users via SSE), AI virtual band (bass/melody/harmony/percussion), session recording/playback, and a retro drum machine aesthetic.

## Tech Stack
- **Framework**: Next.js 16 with App Router (webpack mode)
- **Styling**: Tailwind CSS v4 + shadcn/ui + custom vintage CSS classes
- **Database**: PostgreSQL with Prisma ORM v6
- **Authentication**: NextAuth.js v4 with Credentials provider + bcryptjs
- **Email**: Resend (for password reset emails)
- **Audio**: Web Audio API (synthesized drums, no sample files)
- **Icons**: Lucide React
- **Toast**: Sonner

## Project Structure
```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout with Providers

│   ├── globals.css           # Tailwind + vintage CSS classes
│   ├── login/page.tsx        # Login form
│   ├── register/page.tsx     # Registration form
│   ├── forgot-password/      # Password reset request
│   ├── reset-password/       # Password reset confirm
│   ├── dashboard/
│   │   ├── page.tsx          # Dashboard entry with Suspense boundary
│   │   └── dashboard-content.tsx  # Main drum machine with guest mode support
│   ├── admin/page.tsx        # Admin portal for user management (admin-only)
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/route.ts
│       │   ├── register/route.ts
│       │   └── password-reset/ (request, verify, confirm)
│       ├── analytics/
│       │   └── track/route.ts    # POST track pageview (called from middleware)
│       ├── admin/
│       │   ├── analytics/route.ts    # GET analytics data (admin only)
│       │   ├── waf/route.ts          # GET stats/events/config, PATCH update config (admin only)
│       │   ├── security/route.ts     # GET security data (6 views), POST alert management (admin only)
│       │   └── users/
│       │       ├── route.ts          # GET list all users (admin)
│       │       └── [id]/
│       │           ├── route.ts      # DELETE user (admin)
│       │           ├── promote/route.ts  # PUT promote to admin
│       │           ├── demote/route.ts   # PUT remove admin
│       │           └── password/route.ts # PUT change user password (admin)
│       ├── patterns/
│       │   ├── route.ts      # GET list, POST create
│       │   └── [id]/route.ts # GET one, DELETE
│       ├── style-profile/
│       │   ├── route.ts          # GET/POST user's style DNA profile
│       │   └── feedback/route.ts # POST pattern feedback (like/dislike)
│       ├── collab/
│       │   ├── sessions/
│       │   │   ├── route.ts      # GET list, POST create collab sessions
│       │   │   ├── join/route.ts # POST join by invite code
│       │   │   └── [id]/
│       │   │       ├── route.ts       # GET details, PATCH update, DELETE close
│       │   │       ├── leave/route.ts # POST leave session
│       │   │       ├── sync/route.ts  # GET SSE stream, POST broadcast messages
│       │   │       └── recordings/route.ts # GET/POST session recordings
│       │   └── recordings/
│       │       ├── route.ts      # GET list, POST save recordings
│       │       └── [id]/route.ts # GET one, DELETE
│       └── songs/
│           ├── route.ts      # GET list, POST create (song structures)
│           └── [id]/route.ts # GET one, DELETE
├── components/
│   ├── providers.tsx         # SessionProvider + TooltipProvider + Toaster
│   ├── in-app-tour.tsx       # Guided tour with spotlight overlay
│   ├── guest-signup-banner.tsx  # Timed signup prompt for guest users (appears after 5 min, auto-dismisses after 30s)
│   ├── ui/                   # shadcn/ui components
│   └── drum-machine/
│       ├── drum-machine.tsx  # Main orchestrator component (collapsible sections layout)
│       ├── collapsible-section.tsx  # Reusable collapsible panel wrapper with theme support
│       ├── song-mode-panel.tsx  # Song mode UI: timeline, block management, playback controls
│       ├── pattern-variation-selector.tsx  # Dropdown to pick pattern variations per genre/part
│       ├── pattern-grid.tsx  # Variable-length sequencer grid with velocity/probability
│       ├── pattern-editor-toolbar.tsx  # Editor mode, undo/redo, copy/paste, clear, length
│       ├── transport-controls.tsx  # Play/stop/BPM + fill trigger button
│       ├── variation-controls.tsx  # A/B variation selector, fill controls, intensity, auto-switch
│       ├── complexity-slider.tsx  # Pattern complexity slider (1-10 scale)
│       ├── swing-humanize-controls.tsx  # Swing & humanization sliders
│       ├── xy-pad.tsx            # XY Kaoss Pad-style effect controller
│       ├── genre-selector.tsx
│       ├── song-part-selector.tsx
│       ├── emotion-selector.tsx  # Mood/emotion-based pattern selection with intensity controls
│       ├── emotion-impact-meter.tsx  # Real-time emotional impact analysis visualization
│       ├── arrangement-suggestions-panel.tsx  # AI arrangement suggestions & contextual recommendations
│       ├── emotional-arc-timeline.tsx  # Song emotional arc SVG timeline visualization
│       ├── style-dna-panel.tsx   # Style DNA panel: artist presets, style meters, evolve/generate, feedback
│       ├── collab-panel.tsx      # [NOT IN USE] Live Jam collaboration panel (backend preserved, UI removed from drum-machine)
│       ├── virtual-band-panel.tsx # AI virtual band controls: 4 instruments with key/scale/intelligence
│       └── session-recording-panel.tsx # Session recording controls: record/play/save/load
├── components/
│   ├── providers.tsx         # SessionProvider + TooltipProvider + ThemeContext + Toaster
│   ├── theme-selector.tsx    # Theme toggle buttons (Default/Dark Neon/Light Neon)
│   ├── in-app-tour.tsx       # Guided tour with spotlight overlay
│   ├── guest-signup-banner.tsx  # Timed signup prompt for guest users
│   ├── ui/                   # shadcn/ui components
│   └── drum-machine/         # (see above)
├── hooks/
│   ├── use-collapsible-sections.ts  # Section expand/collapse state with localStorage persistence
│   ├── use-pattern-editor.ts  # Pattern editing state: undo/redo, copy/paste, velocity, probability
│   ├── use-song-mode.ts       # Song mode state: block management, song playback engine, BPM transitions
│   ├── use-style-dna.ts       # Style DNA hook: artist selection, pattern evolution, feedback submission
│   ├── use-theme.ts           # Theme context, provider, and localStorage persistence (default/dark-neon/light-neon)
│   ├── use-emotion-intelligence.ts  # Emotion intelligence hook: analysis, suggestions, psychoacoustic hints, context
│   ├── use-collab-session.ts  # Collaboration session hook: SSE sync, chat, cursors, session CRUD
│   ├── use-virtual-band.ts    # Virtual band state: 4 AI instruments, pattern generation, scheduling
│   └── use-session-recording.ts # Session recording hook: record/play/save/load recordings
├── lib/
│   ├── auth.ts              # NextAuth config (includes isAdmin in JWT/session)
│   ├── admin.ts             # Admin auth utility (requireAdmin helper)
│   ├── prisma.ts            # Prisma client singleton
│   ├── email.ts             # Email service (Resend) for password resets
│   ├── validation.ts        # Input validation & sanitization (Zod schemas, size limits, storage quotas)
│   ├── drum-patterns.ts     # All preset patterns, types, genre/part definitions
│   ├── complexity-engine.ts  # Pattern complexity algorithm (simplify/complexify patterns)
│   ├── style-dna.ts          # Style DNA analysis, artist DNA library, fingerprint system
│   ├── emotion-intelligence.ts # Emotion-driven adaptive intelligence: analysis, psychoacoustics, arrangement AI
│   ├── style-engine.ts       # Pattern evolution/generation guided by style DNA profiles
│   ├── humanize.ts           # Swing & humanization engine (timing offsets, velocity variation)
│   ├── fill-patterns.ts     # Fill pattern library, smart fill generation, A/B variation generation
│   ├── audio-engine.ts      # Web Audio API drum synthesizer (routes through effects chain)
│   ├── audio-effects.ts     # Web Audio API effects engine (reverb, delay, filter, distortion) for XY pad
│   ├── midi-export.ts       # MIDI file export utility (jsmidgen-based, supports single pattern + full song export)
│   ├── song-types.ts        # Song mode types: SongBlock, Song, SongPlaybackState, genre colors, part labels
│   ├── theme-colors.ts      # Theme color palettes for inline styles (default/dark-neon/light-neon)
│   ├── security.ts          # Security utilities: password policy, error sanitization, generic rate limiter, audit logging, ID/email validation
│   ├── ids.ts               # Intrusion Detection System: behavioral profiling, threat scoring, honeypot traps, IP allow/blocklists, geo-blocking, auto-block
│   ├── rate-limit.ts        # In-memory rate limiter for auth endpoints (sliding window, per-IP)
│   ├── collab-types.ts      # Collaboration types: sessions, participants, sync messages, virtual band
│   ├── collab-sync.ts       # SSE-based real-time sync manager with auto-reconnect
│   ├── virtual-band-engine.ts # AI virtual band: pattern analysis, instrument generation, Web Audio synthesis
│   ├── session-recording.ts # Session recorder/player: event timeline capture and playback
│   ├── sequencer.ts         # Timing utilities
│   └── utils.ts             # cn() utility
├── types/
│   └── next-auth.d.ts       # Session type augmentation
└── middleware.ts             # Route protection
```

## Database Schema
- **User**: id, email (unique), password (hashed), name, isAdmin (boolean, default false), timestamps
- **PasswordResetToken**: id, email, token (unique), expiresAt, used, usedAt, timestamps
- **SavedPattern**: id, name, genre, songPart, emotion (optional), bpm, pattern (JSON), userId (FK to User), timestamps
- **SavedSong**: id, name, blocks (JSON array of SongBlock), loop (boolean), userId (FK to User), timestamps
- **PageView**: id, path, country (optional), userAgent (optional), userId (optional), sessionId (optional), createdAt (indexed on createdAt, path, sessionId)
- **UserSession**: id, userId (FK to User), sessionToken (unique), userAgent (optional), ipAddress (optional), lastActiveAt, expiresAt, isRevoked, revokedAt (optional), createdAt (indexed on userId, sessionToken, expiresAt, lastActiveAt)
- **StyleProfile**: id, userId (unique FK to User), dna (JSON - StyleFingerprint data), feedbackCount (int), timestamps
- **PatternFeedback**: id, userId (FK to User), patternHash, genre, songPart, artistDna (optional), liked (boolean), patternData (JSON), createdAt (indexed on userId, patternHash)
- **CollabSession**: id, name, inviteCode (unique), hostId (FK to User), genre, songPart, emotion (optional), bpm, patternLength, patternData (JSON, optional), visibility (public/private/invite_only), isActive, timestamps. Relations: host, participants, recordings
- **CollabParticipant**: id, sessionId (FK to CollabSession), userId (FK to User), role (host/editor/viewer), joinedAt, leftAt (optional). @@unique([sessionId, userId])
- **CollabRecording**: id, sessionId (FK to CollabSession), name, duration (Float), events (JSON), createdById (FK to User), timestamps

## API Routes
- `POST /api/auth/register` - Create new user account (normalizes email to lowercase)
- `POST /api/auth/[...nextauth]` - NextAuth endpoints (login, session, etc.)
- `GET /api/auth/diagnostics` - Database and user verification (query param: email) for debugging
- `GET /api/auth/env-check` - Environment variable verification and production configuration diagnostics
- `POST /api/auth/password-reset/request` - Request password reset
- `GET /api/auth/password-reset/verify` - Verify reset token
- `POST /api/auth/password-reset/confirm` - Set new password
- `GET /api/patterns` - List user's saved patterns
- `POST /api/patterns` - Save a new pattern (validates schema, sanitizes input, enforces 500 pattern limit)
- `GET /api/patterns/[id]` - Get a specific pattern
- `DELETE /api/patterns/[id]` - Delete a pattern
- `POST /api/analytics/track` - Record a pageview (called from middleware, fire-and-forget)
- `GET /api/admin/analytics` - Get analytics dashboard data (admin only, supports ?days=7|14|30|90)
- `GET /api/admin/users` - List all users with pattern counts (admin only, supports search & pagination)
- `PUT /api/admin/users/[id]/promote` - Promote user to admin (admin only)
- `PUT /api/admin/users/[id]/demote` - Remove admin privileges (admin only, cannot self-demote)
- `PUT /api/admin/users/[id]/password` - Change user password (admin only, cannot change own password)
- `DELETE /api/admin/users/[id]` - Delete user account and data (admin only, cannot self-delete)
- `GET /api/songs` - List user's saved songs (with block count summary)
- `POST /api/songs` - Save a new song (validates schema, sanitizes input, enforces 100 song limit, max 100 blocks)
- `GET /api/songs/[id]` - Get a specific song with full block data
- `DELETE /api/songs/[id]` - Delete a song
- `GET /api/style-profile` - Fetch user's style DNA profile (returns default fingerprint for new users)
- `POST /api/style-profile` - Create/update user's style DNA profile
- `POST /api/style-profile/feedback` - Submit pattern feedback (like/dislike), updates style DNA via progressive learning
- `GET /api/sessions` - List current user's active sessions (authenticated)
- `DELETE /api/sessions` - Log out all other devices (authenticated, preserves current session)
- `DELETE /api/sessions/[id]` - Revoke a specific session (authenticated)
- `POST /api/sessions/validate` - Validate a session token (internal, called from middleware)
- `GET /api/admin/sessions` - Get active session statistics and recent sessions (admin only)
- `POST /api/admin/sessions` - Cleanup expired/revoked sessions older than 7 days (admin only)
- `GET /api/collab/sessions` - List user's hosted + participating sessions
- `POST /api/collab/sessions` - Create a new collab session (max 5 active per host)
- `POST /api/collab/sessions/join` - Join session by invite code (max 4 participants)
- `GET /api/collab/sessions/[id]` - Get session details with participants (access-controlled)
- `PATCH /api/collab/sessions/[id]` - Update session settings (host only)
- `DELETE /api/collab/sessions/[id]` - Close/deactivate session (host only)
- `POST /api/collab/sessions/[id]/leave` - Leave session (host leaving closes session)
- `GET /api/collab/sessions/[id]/sync` - SSE stream for real-time sync messages
- `POST /api/collab/sessions/[id]/sync` - Broadcast sync message to session participants
- `GET /api/collab/recordings` - List recordings (filterable by sessionId)
- `POST /api/collab/recordings` - Save a recording (max 20 per session)
- `GET /api/collab/recordings/[id]` - Get recording with events (access-controlled)
- `DELETE /api/collab/recordings/[id]` - Delete recording (host only)

## Key Components
- **DrumMachine** (drum-machine.tsx) - State manager for genre, song part, emotion, complexity, BPM, pattern, playback; integrates usePatternEditor hook; includes fill preview mode for visual feedback when playback is stopped
- **DancingCharacter** (dancing-character.tsx) - 270x110px animated visual display with dancing stick figure character (7 genre-weighted dance moves with 4-pose interpolation), plus moving background elements (walking figures with animated legs, rolling tumbleweed with random timing, parallax trees). Container width 2x wider than original for cinematic effect. Uses SVG animations and CSS transforms for smooth 60fps performance. Syncs to BPM and current step. Vintage CRT scanline overlay and beat flash LED.
- **ComplexitySlider** (complexity-slider.tsx) - 1-10 range slider for adjusting pattern complexity; vintage-styled with LED indicators, color gradient (green→orange→red), and tooltip; positioned between emotion selector and transport controls
- **SwingHumanizeControls** (swing-humanize-controls.tsx) - 3-slider panel for swing (0-100%), timing humanize (0-20ms), and velocity humanize (0-30%); vintage-styled with color-coded sliders (orange/blue/green), info tooltip, active indicator LED
- **EmotionSelector** (emotion-selector.tsx) - 6-emotion mood picker (happy, sad, aggressive, calm, anxious, romantic) with vintage styling; selecting an emotion loads a mood-specific pattern and BPM
- **PatternGrid** (pattern-grid.tsx) - 8-row x variable-length sequencer grid with velocity/probability editing modes, per-track clear, fill preview visual styling with pulsing animation
- **PatternEditorToolbar** (pattern-editor-toolbar.tsx) - Editor mode toggle (PAD/VEL/PROB), pattern length selector, undo/redo, copy/paste, clear all
- **TransportControls** - Play/pause/stop, BPM adjustment, status LED, inline fill trigger button with countdown and preview mode support
- **VariationControls** (variation-controls.tsx) - A/B pattern variation selector, fill queue/cancel, fill intensity (subtle/moderate/heavy), auto-switch A/B every N bars
- **InAppTour** (in-app-tour.tsx) - Auto-starting guided tour with spotlight overlay
- **usePatternEditor** (hooks/use-pattern-editor.ts) - Custom hook managing undo/redo history, velocity/probability maps, clipboard, pattern length
- **SongModePanel** (song-mode-panel.tsx) - Collapsible song timeline UI with block list, drag-and-drop reordering, per-block repeat count, play/stop song, loop toggle, save/load/export MIDI, genre-colored blocks, clear with confirmation. Includes FillConfigMenu context menu for per-block fill configuration (timing, intensity, category, auto-generate toggle, visual fill region preview)
- **useSongMode** (hooks/use-song-mode.ts) - Song mode state management: block CRUD, drag-and-drop reorder, sequential playback engine with BPM transitions, loop support, total duration calculation
- **ThemeSelector** (theme-selector.tsx) - Three-button theme switcher (Vintage/Dark Neon/Light Neon) with emoji icons, placed in top bar
- **useTheme** (hooks/use-theme.ts) - Theme context with React Context API, localStorage persistence, applies CSS class to HTML element
- **CollabPanel** (collab-panel.tsx) - Live Jam panel: create/join sessions via dialogs, participant list with color/role indicators, invite code copy, chat section with message history, leave/close session buttons
- **VirtualBandPanel** (virtual-band-panel.tsx) - AI virtual band controls: 4 instrument cards (bass/melody/harmony/percussion) with toggle, volume, key (12 keys), scale (6 scales), intelligence level (basic/mid/advanced), octave, follow-drums intensity. Color-coded per instrument
- **SessionRecordingPanel** (session-recording-panel.tsx) - Session recording controls: record/pause/resume/stop, save with name dialog, saved recordings list with load-for-playback, playback transport with progress bar
- **useCollabSession** (hooks/use-collab-session.ts) - Collaboration session state: SSE message handlers for pattern/cursor/BPM/genre/part/emotion sync, chat messages (max 100), remote cursor tracking, session CRUD (create/join/leave/close)
- **useVirtualBand** (hooks/use-virtual-band.ts) - Virtual band state: 4 VirtualBandMember objects, per-member controls, pattern generation from drum pattern analysis, step scheduling for Web Audio playback
- **useSessionRecording** (hooks/use-session-recording.ts) - Recording state: wraps SessionRecorder/RecordingPlayer, duration timer, save/load via API, playback state updates
- **CollabSyncManager** (lib/collab-sync.ts) - SSE-based sync: EventSource connection with auto-reconnect (exponential backoff, max 10 attempts), 15s heartbeat, typed message sending methods
- **VirtualBandEngine** (lib/virtual-band-engine.ts) - AI music generation: pattern analysis (density, syncopation, accents), per-instrument pattern generators with 3 intelligence levels, Web Audio synthesis (sawtooth bass, triangle melody, sine harmony, noise percussion)
- **SessionRecorder/Player** (lib/session-recording.ts) - Event timeline capture with timestamps, playback engine using requestAnimationFrame, speed control

## Authentication & Authorization
- JWT-based sessions via NextAuth.js with database-backed session tracking
- **Session Security**:
  - **Session Timeout**: Auto-expire after 24 hours of inactivity (sliding window - refreshed every 5 min)
  - **Concurrent Session Limits**: Max 3 active sessions per user (oldest auto-revoked on new login)
  - **Session Invalidation**: All sessions revoked on password change (via reset or admin)
  - **"Log Out All Devices"**: Users can revoke all other sessions from /settings page
  - **Session Monitoring**: Admin "Sessions" tab shows active sessions, per-user counts, real-time status
  - **Session Cleanup**: Admin can trigger cleanup of expired sessions older than 7 days
- **Security Headers** (via next.config.ts): CSP, HSTS, X-Frame-Options (DENY), X-Content-Type-Options (nosniff), Referrer-Policy, X-XSS-Protection, Permissions-Policy
- **Email Normalization**: All emails normalized to lowercase (trim + toLowerCase) on both registration and login
- **Database Verification**: Connection checks before auth operations to catch production issues early
- **Enhanced Logging**: Comprehensive auth flow logging for production debugging
- Middleware protects all routes except /, /login, /register, /forgot-password, /reset-password, /dashboard?guest=true
- Middleware additionally checks isAdmin JWT claim for /admin and /api/admin routes (redirects non-admins to /dashboard)
- Middleware fires async session validation against DB for authenticated requests
- All API routes verify session.user.id before database operations
- Admin API routes use requireAdmin() helper which verifies isAdmin against DB (not just JWT)
- **Admin accounts**: Must be created manually via custom scripts (see ADMIN_ACCOUNT.md)
- Admin portal at /admin with user management (promote/demote/delete) + session monitoring
- Password reset flow with secure token generation (1-hour expiration) + invalidates all sessions
- Email-based password reset using Resend service
- **NEXTAUTH_URL**: Configured for production callback URL handling
- **Diagnostics Endpoint**: /api/auth/diagnostics for production troubleshooting
- **Guest Mode**: Unauthenticated users can access /dashboard?guest=true for full functionality with save/load disabled
  - Guest session tracked from dashboard entry (timer displayed in banner)
  - Save/Load buttons disabled with visual feedback
  - Banner shows guest status with session time and sign-in link
  - No authentication required for guest mode, but disallows persistence

## Email Configuration
- **Service**: Resend (https://resend.com)
- **Required Environment Variables**:
  - `RESEND_API_KEY` - API key from Resend dashboard
  - `EMAIL_FROM` - Verified sender email (e.g., noreply@yourdomain.com)
  - `NEXT_PUBLIC_APP_URL` - Public URL for password reset links (fallback: NEXTAUTH_URL)
- **Development Mode**: If RESEND_API_KEY is not configured, emails are logged to console
- **Email Features**:
  - HTML and plain text email templates
  - Branded password reset emails with BeatForge 808 styling
  - 1-hour expiration links with security best practices
  - Email enumeration prevention (always returns success message)

## Audio Engine
- Fully synthesized drum sounds using Web Audio API oscillators and noise buffers
- Sounds: kick, snare, hi-hat (open/closed), clap, tom high/low, ride
- AudioContext initialized on first user interaction (browser requirement)
- Sounds resemble classic 808/909 drum machines
- Velocity support: playSound(instrumentId, velocity) applies gain scaling (1-127 mapped to 0.0-1.0)

## Important Patterns
- Pattern data stored as JSON in PostgreSQL. New format: { steps, velocity, probability, patternLength }. Backward compatible with legacy format (Record<string, boolean[]>)
- Pattern lengths: 8, 16, 24, or 32 steps (16th notes in 4/4 time)
- Per-step velocity (1-127) and probability (0-100%) for humanization
- Playback uses setInterval with step-based scheduling; probability checked per-step at playback time
- Genre change loads preset pattern and sets default BPM; emotion selection overrides with mood-specific pattern
- Emotion patterns: 6 moods (happy, sad, aggressive, calm, anxious, romantic) with dedicated patterns and BPMs
- Selecting an emotion loads its pattern; clearing emotion reverts to genre/song part pattern
- Genre/song part changes clear the active emotion
- All preset patterns defined in src/lib/drum-patterns.ts (PRESET_PATTERNS for genre, EMOTION_PATTERNS for moods)
- **Expanded pattern library**: src/lib/pattern-library.ts contains 359+ pattern variants across all 7 genres (51+ per genre × 5 song parts + 30 emotion variants)
- **Pattern selector**: src/lib/pattern-selector.ts provides weighted randomization with anti-repeat logic (tracks last 5 selections per genre/part combo)
- "Shuffle" button in drum machine header picks a random pattern from the expanded library for the current genre/song part or emotion
- Pattern variant name displayed as badge in machine header when a shuffled pattern is active
- Types: DrumPattern, VelocityMap, ProbabilityMap, PatternLength, ExtendedPatternData, Emotion, PatternVariant, EmotionVariant, FillIntensity, FillType, FillCategory, FillPattern, ActiveVariation
- **Fill patterns**: src/lib/fill-patterns.ts contains 126 genre-specific fills (18 per genre × 7 genres: 6 per category × 3 categories)
- **Fill categories**: Three fill types — Transition (smooth section changes), Rising Energy (building intensity/crescendo), Signature (vintage 808/909 machine fills)
- **Category-aware selection**: `getRandomFillByCategory()` and `getFillsByCategory()` filter fills by category; `getContextualCategory()` suggests category based on song part/emotion
- **Smart fill generation**: `generateSmartFill()` now accepts optional category parameter, dispatching to category-specific algorithms (transition, rising-energy, signature)
- **A/B variations**: `generateVariation()` creates subtle pattern differences (ghost notes, accent shifts) from any base pattern
- **Fill triggering**: Fills queue on button press (or F key) and trigger at next bar boundary, auto-returning to main pattern after one bar
- **Auto-switch**: Configurable automatic A/B variation switching every N bars (2, 4, 8, or 16)
- **Save format extended**: Pattern JSON now optionally includes `variationB`, `variationBVelocity`, `variationBProbability` for B variation persistence

## Recent Changes
- 2026-03-15: Emotion-Driven Adaptive Intelligence System — added emotion-intelligence.ts engine (emotional profile analysis, psychoacoustic database, arrangement AI with 10 suggestion types, 7 use contexts, biometric integration), use-emotion-intelligence.ts hook, emotion-impact-meter.tsx (real-time 6-dimension bars + impact score), arrangement-suggestions-panel.tsx (context selector + AI suggestions), emotional-arc-timeline.tsx (SVG timeline for song mode), updated emotion-selector.tsx with 5-level intensity controls, integrated into drum-machine.tsx
- 2026-03-15: Enhanced DancingCharacter component with wider animation box and moving elements:
  - **src/components/drum-machine/dancing-character.tsx**: Doubled container width from 110px to 270px (2.5x wider); added MovingElements component with three layers: background trees (slow parallax effect), middle tumbleweed (rolling animation with random appearance timing), foreground walking figures (animated stick figures with leg/arm movement walking left-to-right and right-to-left). All elements use CSS transforms and keyframe animations for smooth performance. Character remains centered with same size. Maintains vintage aesthetic with theme-aware colors.
- 2026-03-15: Added Site Analytics Dashboard to Admin Page:
  - **prisma/schema.prisma**: Added `PageView` model with path, country, userAgent, userId, sessionId fields and indexes
  - **src/middleware.ts**: Added fire-and-forget pageview tracking via session cookie (`_av_sid`) for all non-API page requests; supports country detection via geo-IP headers (Vercel, Cloudflare)
  - **src/lib/analytics.ts**: Analytics query engine with parallel Prisma queries for overview stats, daily trends, top pages, top countries, user registrations, and pattern creation stats
  - **src/app/api/analytics/track/route.ts**: POST endpoint for recording pageviews (called from middleware)
  - **src/app/api/admin/analytics/route.ts**: GET endpoint returning full analytics data (admin only, supports `?days=` param)
  - **src/components/admin/analytics-dashboard.tsx**: Full analytics dashboard component with overview cards, bar chart, sparklines, top pages/countries lists, registration trend, and content stats; pure CSS charts (no chart library), vintage-styled, period selector (7D/14D/30D/90D)
  - **src/app/admin/page.tsx**: Added tab switcher (Users / Analytics) to admin console header
- 2026-03-15: Added three fill pattern categories (Transition, Rising Energy, Signature/Vintage Machine):
  - **fill-patterns.ts**: Expanded from 42 to 126 fills (18 per genre × 7 genres). Added `FillCategory` type, `FILL_CATEGORIES` config, category-specific smart fill generators (`generateTransitionFill`, `generateRisingEnergyFill`, `generateSignatureFill`). New selection functions: `getRandomFillByCategory()`, `getFillsByCategory()`, `getContextualCategory()`, `getCategoryFillCount()`.
  - **variation-controls.tsx**: Added fill category TYPE selector (TRANS/RISE/808 buttons) with color-coded active states. Fill status indicator now shows category name. Added `fillCategory` and `onFillCategoryChange` props.
  - **drum-machine.tsx**: Added `fillCategory` state, updated `handleFillToggle()` and `triggerFill()` to use category-aware fill selection and generation.
  - **transport-controls.tsx**: Status LED now shows category-specific fill label (e.g., "TRANS FILL", "RISE FILL", "808 FILL"). Added `fillCategory` prop.
  - **drum-patterns.ts**: Updated exports to include new fill category types and functions.
- 2026-03-15: Removed all demo user references and components for cleaner production deployment:
  - Removed demo credentials info box from login page (src/app/login/page.tsx)
  - Removed "QUICK DEMO LOGIN" button from login form
  - Removed `handleDemoLogin` function and demo user hardcoded credentials
  - Updated seed file (prisma/seed.ts) to not create demo user or sample patterns
  - Admin accounts must now be created manually via custom scripts (see ADMIN_ACCOUNT.md)
  - Updated documentation (ADMIN_ACCOUNT.md, AUTH_FIX_SUMMARY.md, PRODUCTION_AUTH_SETUP.md)
  - Guest mode (`/dashboard?guest=true`) remains available for unauthenticated trial usage
  - Cleaner, more professional authentication flow without exposed test credentials
- 2026-03-15: Fixed fill preview to use persistent toggle instead of temporary auto-revert:
  - Removed auto-revert timeout (was 2.5 seconds) from `handleFillToggle` function
  - Fill preview now stays active until user clicks button again or presses F to toggle off
  - Updated button tooltip to clarify toggle behavior ("Toggle fill preview" vs "Queue fill")
  - Updated toast messages to reflect toggle state ("turned on" / "turned off")
  - Updated pattern grid hint message: "FILL PREVIEW ON — Press F to turn off"
  - Button styling already shows active state clearly with pulsing orange glow
  - Applies to stopped playback only; playing mode still queues fills for next bar boundary
- 2026-03-14: Added Intro and Outro song parts for complete song structure capabilities:
  - Updated SONG_PARTS to include 'intro' and 'outro' (now 5 total song parts)
  - Created minimal, DJ-friendly intro patterns for all 7 genres (sparse drums to establish groove foundation)
  - Created fade-out style outro patterns for all 7 genres (reduced complexity for smooth transitions)
  - Intro patterns feature kick + minimal hi-hats to set tempo and mood
  - Outro patterns provide closure while maintaining rhythmic foundation
  - Song part selector UI automatically adapts to show all 5 parts
  - Patterns integrate seamlessly with save/load functionality and emotion selector
- 2026-03-14: Fixed critical production authentication issues:
  - Removed hardcoded `NEXTAUTH_URL=http://localhost:3000` to enable auto-detection in production
  - Added comprehensive error handling in middleware with try-catch for JWT token parsing
  - Created `/api/auth/env-check` endpoint for environment variable verification and diagnostics
  - Enhanced login page with better error messages and diagnostics logging
  - Wrapped login form in Suspense boundary to fix static page generation
  - Created `PRODUCTION_AUTH_SETUP.md` comprehensive troubleshooting guide
  - Updated `.env` to comment out localhost NEXTAUTH_URL (enables auto-detection)
  - Added `debug: true` in NextAuth config for development mode
  - Improved error messages to guide production deployment issues
- 2026-03-13: Initial build completed with all core features
- 2026-03-13: Added comprehensive pattern editing interface:
  - Editor mode toggle (PAD/VEL/PROB) for toggling notes, editing velocity, and editing probability
  - Per-step velocity control (1-127) with drag editing and visual feedback (color-coded pads)
  - Per-step probability settings (0-100%) for humanization with opacity-based visual feedback
  - Pattern length adjustment (8, 16, 24, 32 steps) with automatic resize
  - Copy/paste full pattern sections
  - Clear all tracks and clear individual track buttons
  - Undo/redo with 50-state history (Ctrl+Z / Ctrl+Y keyboard shortcuts)
  - Spacebar keyboard shortcut for play/stop (works in both pattern and song mode)
  - Pattern name editing in save dialog
  - Real-time pattern editing while playing (edits take effect immediately)
  - Visual "EDITED" / "MODIFIED" badges for edited vs preset patterns
  - Backward-compatible save format (velocity, probability, length stored in JSON pattern field)
  - Audio engine updated with velocity gain support for all 8 instruments
- 2026-03-13: Added emotion-based pattern selection:
  - 6 moods: Happy, Sad, Aggressive, Calm, Anxious, Romantic with unique icons and colors
  - Each emotion has a dedicated drum pattern and default BPM designed to evoke the feeling
  - EmotionSelector component with vintage-styled grid layout (6 columns on desktop, 3 on mobile)
  - Emotion integrates with genre/song part: selecting an emotion overrides; changing genre/part clears emotion
  - Database schema updated: optional `emotion` field on SavedPattern model
  - Save/load fully supports emotion metadata with backward compatibility
  - Machine header display shows active emotion with icon when mood is selected
- 2026-03-13: Expanded pattern library with large variety per genre:
  - Added src/lib/pattern-library.ts with 275+ pattern variants (35+ per genre × 3 song parts + 30 emotion variants)
  - Patterns vary in rhythm complexity (simple/medium/advanced), subdivisions, syncopation, ghost notes
  - Each variant has metadata: id, name, complexity, tags, bpmRange
  - Added src/lib/pattern-selector.ts with anti-repeat randomization (tracks last 5 selections per combo)
  - Added "SHUFFLE" button to drum machine header for one-click pattern randomization
  - Pattern variant name shown as blue badge in machine header when shuffled pattern is active
  - Genre patterns include: deep house, tech house, progressive house, jackin house, garage house (house); techno, trance, breaks, dubstep, drum & bass (electronic); chill hop, study beats, jazzy lo-fi, ambient lo-fi, nostalgic (lo-fi); dance pop, indie pop, synth pop, power pop, ballad pop (pop); punk, grunge, southern, country, arena (rock)
  - Emotion variants: 5 per mood with unique names and BPMs for maximum variety
  - All exports re-exported from drum-patterns.ts for backward compatibility
- 2026-03-13: Updated genre library to modern popular styles:
  - **REMOVED**: Hip-Hop, Jazz, Latin genres
  - **ADDED**: House (120-126 BPM), Lo-Fi (60-90 BPM), Pop (100-130 BPM)
  - **UPDATED**: Electronic genre enhanced with modern EDM elements (120-140 BPM)
  - **KEPT**: Rock genre with classic patterns (100-140 BPM)
  - Genre definitions in GENRES: house (#9b59b6 purple), electronic (#3498db blue), lo-fi (#95a5a6 gray), pop (#e91e63 pink), rock (#e74c3c red)
  - House patterns: Four-on-the-floor kick foundation, syncopated hi-hats with TR-909/808 sounds, emphasis on groove and swing
  - Lo-Fi patterns: Hip-hop boom-bap with jazz elements, swing timing, mellow/dusty aesthetic, atmospheric and sparse
  - Pop patterns: Clean polished sounds, dynamic builds, mix of 1&3 kick (verses) and four-on-the-floor (choruses)
  - Each new genre has 25+ comprehensive pattern variants across Verse/Chorus/Bridge in pattern-library.ts
  - Pattern variants include complexity ratings, BPM ranges, and descriptive tags
  - All saved patterns with old genres remain backward compatible (genre field stored as string in database)
- 2026-03-13: Added drum fills and pattern variations system:
  - New file src/lib/fill-patterns.ts with 30 genre-specific fill patterns (6 per genre × 3 intensities)
  - Smart fill generation algorithm that analyzes current pattern density to create complementary fills
  - A/B pattern variation system with algorithmically generated subtle differences (ghost notes, accent shifts)
  - New VariationControls component with A/B selector, fill queue/cancel, intensity picker (S/M/H), auto-switch
  - Fill trigger button added to TransportControls with visual countdown indicator
  - Bar-boundary fill triggering: fill queues on press and triggers at next bar start, auto-returns after one bar
  - Keyboard shortcut: F key to queue/cancel fills
  - Auto-switch A/B variation every N bars (configurable: OFF, 2, 4, 8, 16 bars)
  - Active variation badge in machine header (VAR A / VAR B / FILL ▶)
  - B variation saved/loaded with patterns for persistence
  - Fill intensity levels: subtle (last 4 steps), moderate (last 8 steps), heavy (full bar)
  - Fully backward compatible with existing saved patterns
- 2026-03-13: Fixed fill button visual feedback:
  - Fill patterns now update both playback ref and visual editor state for proper visual feedback
  - Pattern grid now shows fill patterns visually when triggered (previously fills played but weren't visible)
  - Fill restoration now properly updates visual display when returning to main pattern after fill ends
  - Fill button visual states work correctly: default (vintage-button), queued (orange/70 with countdown), active (full orange with pulse)
- 2026-03-13: Implemented password reset email functionality:
  - Installed Resend package for email delivery
  - Created src/lib/email.ts utility module with sendPasswordResetEmail function
  - Updated password reset request route to send actual emails (not just console logs)
  - Added branded HTML email template with BeatForge 808 styling
  - Development fallback: emails log to console when RESEND_API_KEY not configured
  - Improved security: invalidates old tokens, normalizes email addresses, prevents email enumeration
  - Added environment variables: RESEND_API_KEY, EMAIL_FROM, NEXT_PUBLIC_APP_URL
  - Email includes 1-hour expiration warning and both HTML/text formats for compatibility
- 2026-03-13: Added Admin Portal for User Management:
  - Added `isAdmin` boolean field to User model (default false) with migration
  - Created admin dashboard page at /admin with vintage drum machine styling
  - Stats overview: total users, admin count, new registrations (24h)
  - Searchable/filterable user list with pagination (15 per page)
  - User table shows: name, email, admin status badge, saved patterns count, join date
  - Admin actions: promote user to admin, demote admin to user, delete user account
  - Confirmation dialog for destructive delete action with pattern count warning
  - Safety guards: cannot self-delete, cannot self-demote
  - Responsive design: table view on desktop, card view on mobile
  - Middleware protection: /admin and /api/admin routes require isAdmin JWT claim
  - API routes double-check isAdmin against database (not just JWT) via requireAdmin() helper
  - Updated NextAuth config to include isAdmin in JWT and session
  - Session type augmented with isAdmin field
  - Admin link (shield icon) visible only to admin users in drum machine top bar
- 2026-03-13: Added Hip-Hop and Trap genres with Pattern Variation Dropdown:
  - **New Genres**: Hip-Hop (95 BPM, #8E44AD purple) and Trap (145 BPM, #F39C12 gold)
  - Hip-Hop: Boom bap style with punchy kicks, crisp snares, creative hi-hats, swing feel
  - Trap: Half-time feel with heavy 808 kicks, rapid 16th hi-hats, snappy snares, hi-hat rolls
  - Both genres have full Verse/Chorus/Bridge preset patterns in PRESET_PATTERNS
  - 35 Hip-Hop pattern variants with styles: Classic Boom Bap, Modern, Jazzy, Hard Knock, West Coast, East Coast, Chopped Soul, G-Funk, Drill, Jazz Rap, Trap Soul, Brooklyn Drill
  - 35 Trap pattern variants with styles: Classic, Roll Heavy, Triplet, 808 Heavy, Minimal, Double Time, Drill, Atlanta, Future Trap, Latin Trap, Memphis, Rage, Cloud, Hard Trap, Reggaeton
  - 12 new fill patterns (6 per genre: 2 subtle, 2 moderate, 2 heavy each)
  - **Pattern Variation Selector**: New dropdown component (pattern-variation-selector.tsx) lets users browse and select specific pattern variations per genre/song part
  - Dropdown shows variation name, complexity badge (Simple/Medium/Advanced color-coded), tags, and count
  - Hidden when emotion mode is active (emotion patterns don't have genre-specific variations)
  - Integrates with shuffle button (shuffle updates the dropdown selection)
  - Genre/song part changes reset the variation selection
  - Total patterns now: 245 genre variants (35 per genre × 7 genres) + 30 emotion variants = 275+ patterns
- 2026-03-14: Added Password Management to Admin Portal:
  - New API endpoint: PUT /api/admin/users/[id]/password for admin password changes
  - Admin authorization verified via requireAdmin() helper (DB-level check)
  - Prevents admins from changing their own password through this interface
  - Password hashed with bcryptjs before storage
  - Audit logging: password changes logged with admin ID, target user, and timestamp
  - Password change modal in admin portal with vintage drum machine styling
  - New password + confirm password fields with show/hide toggle
  - Client-side validation: min 8 chars, passwords must match
  - KeyRound icon button added to user action buttons (desktop table + mobile cards)
  - Success/error feedback via Sonner toast system
- 2026-03-14: Created Admin Account Creation Script:
  - New script: prisma/create-admin.ts for creating/updating admin accounts
  - Admin account created: tim@tim.com with password tim@tim
  - Admin privileges: true (isAdmin field set to true in database)
  - Password hashed with bcryptjs (10 salt rounds) before storage
  - Script supports both creating new accounts and updating existing ones
  - Ability to immediately access /admin portal with admin credentials
  - Verified: Build completes successfully with no TypeScript errors
- 2026-03-14: Added Guest Mode and Updated Homepage:
  - **Homepage (page.tsx)**: Updated call-to-action buttons for better UX
    - Removed "Try Demo Account" button completely
    - Added conditional button rendering based on authentication status
    - Authenticated users see "Start Making Beats" CTA
    - Unauthenticated users see "Try this!" button (guest mode) + "Get Started" button (registration)
    - "Try this!" redirects to /dashboard?guest=true
    - "Get Started" redirects to /register (unchanged)
    - Header login/signup buttons already present and properly styled
  - **Guest Mode Implementation**:
    - Middleware allows unauthenticated access to /dashboard?guest=true via query parameter check
    - Dashboard page wraps content in Suspense boundary to handle useSearchParams() safely
    - Created dashboard-content.tsx component that detects guest mode and tracks session time
    - Guest session timer tracks elapsed time in seconds from dashboard entry
    - Passes isGuest and guestSessionStart props to DrumMachine component
  - **DrumMachine Component Updates**:
    - Accepts isGuest boolean and guestSessionStart timestamp props
    - Guest mode banner displays at top with pulsing indicator, session time, and sign-in link
    - Banner shows "GUEST MODE", elapsed session time (format: Xm Ys), and disabled features notice
    - Save and Load buttons disabled in guest mode with visual feedback (grayed out, disabled cursor)
    - Disabled buttons show "Save disabled in guest mode" / "Load disabled in guest mode" tooltips
    - Session time updated every second via useEffect
    - No tour content shown in guest mode
  - **Styling Consistency**:
    - Guest banner matches vintage drum machine aesthetic (border color: #E8732A)
    - Disabled buttons use muted color (#6B5B47) to match vintage panel style
    - Session timer uses monospace font for consistent vintage display
    - Sign-in button in banner matches primary CTA styling (#E8732A)
  - **Technical Details**:
    - Guest mode indicated by ?guest=true query parameter
    - Suspense boundary prevents hydration errors with useSearchParams()
    - Session time tracked client-side from dashboard entry (Date.now())
    - No backend tracking required for guest sessions (minimal footprint)
    - Fully backward compatible (existing routes unchanged except middleware)

## Recent Changes

- **2026-03-16**: Comprehensive Security Logging & Monitoring System
  - **New: `src/lib/security-logger.ts`** — Structured JSON security logger with centralized log collection:
    - Wraps audit-log with structured JSON output for easy parsing/aggregation
    - In-memory log buffer (1000 entries) for real-time dashboard access
    - Convenience functions: `logAuthSuccess`, `logAuthFailure`, `logLogout`, `logAdminAccess`, `logPrivilegeChange`, `logApiCall`, `logDataAccess`, `logSuspiciousActivity`
    - All entries include timestamp, level, category, IP, user agent, method, path, duration
    - Categories: authentication, authorization, admin_access, privilege_change, api_call, rate_limit, waf, data_access, session, password, suspicious
  - **New: `src/lib/security-monitor.ts`** — Real-time pattern detection & alerting engine:
    - Detects brute force attacks (5+ failed logins from same IP in 15 min)
    - Alerts on admin access from new/unknown IPs
    - Monitors API error spikes (20+ errors in 15 min)
    - Detects rate limit abuse (10+ hits from same IP in 15 min)
    - Tracks WAF attack bursts (15+ blocks in 15 min)
    - Records privilege escalation events (promote/demote)
    - In-memory alert storage (500 max) with acknowledge/acknowledge-all
    - Threat timeline tracking (hourly buckets, 72h retention)
    - Security health stats: activeThreats, bySeverity, byType
  - **New: `src/components/admin/security-dashboard.tsx`** — Full security monitoring dashboard:
    - Overview tab: real-time stats cards (failed logins, API errors, rate limits, WAF blocks), alert severity distribution, audit event type bars, recent alerts
    - Alerts tab: filterable alert list with severity/acknowledged filters, expand for metadata, acknowledge individual/all
    - Audit Logs tab: persistent DB logs with type/severity filters, metadata display (method, path, status code)
    - Timeline tab: bar chart visualization of hourly threat activity, alert type distribution, security health indicators
    - Auto-refreshes every 30 seconds, vintage-themed UI matching existing admin panels
  - **Enhanced: `src/app/api/admin/security/route.ts`** — Expanded to GET (6 views) + POST (alert management):
    - GET views: overview, alerts, audit-logs, timeline, monitor, structured-logs
    - POST actions: acknowledge (single), acknowledge_all
  - **Enhanced: `src/lib/audit-log.ts`** — Added event types: api_error, privilege_change, data_access, session_timeout, admin_access
  - **Integrated: `src/lib/auth.ts`** — Auth flow now feeds failed logins into security monitor for real-time brute force detection
  - **Integrated: `src/lib/waf.ts`** — WAF blocks feed into security monitor for attack burst detection
  - **Integrated: `src/lib/rate-limit.ts`** — Rate limit hits feed into security monitor for abuse detection
  - **Integrated: `src/app/api/admin/users/[id]/promote/route.ts`** — Privilege changes tracked in security monitor
  - **Integrated: `src/app/api/admin/users/[id]/demote/route.ts`** — Privilege changes tracked in security monitor
  - **Enhanced: `src/app/admin/page.tsx`** — Added "Security" tab to admin console with SecurityDashboard component

- **2026-03-16**: Redesigned Dancing Character — Person + Fluffy Dog Animation
  - **Rewritten: `src/components/drum-machine/dancing-character.tsx`** — Complete rewrite with new animation concept:
    - 5 rotating animation scenes: Fetch (throw/retrieve ball), Dancing Together, Dog Tricks (sit/jump/roll), Petting/Belly Rubs, Beat Bouncing
    - Scene rotation every 5-8 seconds with smooth fade transitions
    - BPM-synced animation via requestAnimationFrame: beat phase drives bounce amplitude, tail wag speed, limb movement
    - SVG-based fluffy dog character with floppy ears, wagging tail, 4 expressions (happy/excited/tongue/sleeping)
    - SVG person character with articulated limbs, hat, vest, 3 expressions (smile/grin/laugh)
    - Particle effects: floating hearts (petting scene), music notes (dancing/bouncing), star particles (tricks)
    - Mobile-responsive positioning using CSS min(), clamp(), and viewport units (vw) instead of fixed pixel sizes
    - Container uses overflow:hidden with percentage-based SVG viewBox for safe mobile containment
    - Idle mode shows calm petting scene with slow breathing animation
    - Retro CRT scanline overlay, beat flash LED, theme-aware colors preserved
  - **Same props interface**: `isPlaying`, `bpm`, `currentStep`, `genre` — no changes to drum-machine.tsx integration
  - **Verified**: Build succeeds with no compilation errors

- **2026-03-16**: Enhanced Arrangement AI with Smart Suggestions (Phase 2)
  - **Modified: `src/lib/emotion-intelligence.ts`**:
    - Added `SuggestionHistoryEntry` type for tracking applied suggestions
    - Added `balance` and `variation` to ArrangementSuggestion type union
    - Suggestions now generate without emotion selection (dynamic/groove/balance categories)
    - New frequency balance suggestion when pattern is lopsided (heavy bass/no brightness or vice versa)
    - New "Add Rhythmic Interest" variation suggestion for low-complexity patterns
    - New "Verse Pocket" suggestion for high-energy verse patterns
    - Fallback energy/brightness/weight suggestions when no target emotion is set
    - Modification preview data exposed in reasoning panel
  - **Modified: `src/components/drum-machine/arrangement-suggestions-panel.tsx`**:
    - Added suggestion history section (collapsible, shows last 5 with timestamps)
    - Added session analytics counter (total suggestions applied)
    - Added Bass/Brightness analysis bars alongside Energy/Groove/Tension/Complexity
    - Added modification preview tags in reasoning panel (shows +/- instrument changes)
    - Improved empty state with icon and contextual guidance
    - Added hover underline on suggestion labels for click affordance
    - Genre/song part context shown in footer
    - New props: `suggestionHistory`, `suggestionsAppliedCount`
  - **Modified: `src/hooks/use-emotion-intelligence.ts`**:
    - Added `suggestionHistory` and `suggestionsAppliedCount` to state
    - `applyArrangementSuggestion()` now tracks history entries with genre/songPart/emotion context
    - History limited to last 20 entries
    - New `clearSuggestionHistory()` method
  - **Modified: `src/components/drum-machine/drum-machine.tsx`**:
    - ArrangementSuggestionsPanel moved outside `emotion &&` gate — now always visible in Emotion Controls section
    - EmotionImpactMeter remains gated behind emotion selection
    - `handleApplyArrangementSuggestion` passes genre/songPart/emotion to history tracking
    - New props passed: `suggestionHistory`, `suggestionsAppliedCount`

- **2026-03-16**: Enhanced Dual Tutorial System
  - **Modified: `src/components/in-app-tour.tsx`** - Major enhancements to the tutorial system:
    - Added section auto-expand: tour steps targeting elements inside collapsed sections now auto-expand those sections via custom events (`tour-expand-section`)
    - Added keyboard navigation: ESC to close, Arrow Left/Right to navigate, Enter for next step
    - Added step-jumping: clickable dot indicators jump to any step; new "View all steps" panel with grouped step list
    - Added progress persistence: tutorial progress saved to localStorage, resumes where user left off
    - Added group labels on steps (Basics, Pattern Editing, Performance, Sound Shaping, Creative Tools, etc.)
    - Added resume progress indicators in selection modal showing completion bars
    - Added external event listener (`tour-open-selector`) so other components can trigger the tutorial
    - Each step now has optional `section` and `group` properties
    - `TARGET_SECTION_MAP` maps data-tour targets to collapsible section IDs
  - **Modified: `src/hooks/use-collapsible-sections.ts`** - Added `tour-expand-section` custom event listener to auto-expand sections when the tour targets elements inside them. Added `expandSection()` utility method.
  - **Modified: `src/components/drum-machine/drum-machine.tsx`** - Added "TUTORIAL" button (GraduationCap icon) in the machine header toolbar next to collapse/expand buttons. Dispatches `tour-open-selector` event to trigger the tutorial selection modal.

- **2026-03-16**: Comprehensive Security Audit & Hardening (Phase 2)
  - **New Files**:
    - `src/lib/audit-log.ts` - Persistent security audit logging to PostgreSQL. Writes auth events, admin actions, rate limits, and suspicious activity. Includes queryAuditLogs() for admin dashboard, getAuditStats() for summary, cleanupAuditLogs() for retention management (90-day default)
    - `src/lib/account-lockout.ts` - Brute-force protection via account lockout. Locks after 5 failed attempts (15min), escalating lockout (doubles each threshold up to 2hr). Tracks via AccountLockout DB model. Auto-clears on successful login and after 1hr inactivity
    - `src/lib/security-headers.ts` - Enhanced security header configuration with CSP nonce generation, SECURITY_HEADERS constant for all response hardening, API_SECURITY_HEADERS for API-specific headers
  - **Database Schema** (`prisma/schema.prisma`):
    - Added `SecurityAuditLog` model (type, severity, detail, ip, userId, metadata JSON) with indexes on type, userId, createdAt, severity
    - Added `AccountLockout` model (email unique, failedCount, lastFailedAt, lockedUntil) with indexes
    - Added missing `@@index([userId])` on PageView model
    - Added `@@index([visibility])` on CollabSession model
    - Migration: `security_audit_logging`
  - **CVE-2025-29927 Protection** (`src/middleware.ts`): Blocks any request with `x-middleware-subrequest` header (Next.js internal header that could bypass auth if spoofed). Added security headers to ALL responses via middleware. Improved session validation error logging (no longer silently swallowed). Secure cookie flag added to tracking cookie
  - **Account Lockout** (`src/lib/auth.ts`): Login now checks lockout status before attempting auth. Records failed attempts for both existing and non-existing users. Timing attack prevention via dummy bcrypt compare when user not found. Clears lockout on successful login. All auth events persistently logged
  - **CSP Hardened** (`next.config.ts`): Removed `unsafe-eval` from production CSP (only allowed in dev for HMR). Added `Cache-Control: no-store` headers for all API routes to prevent sensitive data caching
  - **Rate Limiting Added to**:
    - `GET/POST /api/patterns` - 60 reads/min, 30 saves/min per user
    - `GET/POST /api/songs` - 60 reads/min, 20 saves/min per user
    - `POST /api/collab/sessions` - 10 creations/hour per user
    - `POST /api/collab/sessions/join` - 10 attempts/5min per IP (prevents invite code enumeration)
    - `GET /api/collab/sessions/[id]/sync` - 10 SSE connections/min per user
    - `POST /api/collab/sessions/[id]/sync` - 120 messages/min per user
    - `DELETE /api/admin/users/[id]` - 10 deletions/hour per admin
    - `PUT /api/admin/users/[id]/promote` - 5 promotions/hour per admin
    - `PUT /api/admin/users/[id]/demote` - 5 demotions/hour per admin
    - `PUT /api/admin/users/[id]/password` - 5 resets/hour per admin
  - **SSE Endpoint Hardened** (`collab/sessions/[id]/sync`):
    - Connection count tracking per session (max 8 connections = 4 users * 2 reconnect buffer)
    - Session ID format validation
    - Chat message sanitization (XSS prevention, 500 char limit)
    - Message type whitelist validation
    - Genre/part string length limits on DB writes
    - Connection cleanup on disconnect
  - **Admin Endpoints Hardened**: All admin actions (delete, promote, demote, password reset) now write persistent audit logs to SecurityAuditLog table with admin identity, target user, and action details. Rate limiting prevents rapid bulk operations
  - **Invite Code Entropy Increased** (`src/lib/collab-types.ts`): Invite codes increased from 6 to 8 characters (31^6 = ~890M to 31^8 = ~8.5B combinations). Now uses crypto.getRandomValues() for cryptographic randomness
  - **Input Sanitization Enhanced** (`src/lib/security.ts`):
    - validateName(): Now removes zero-width Unicode characters, decodes HTML entities before sanitizing, removes CSS expressions/url() patterns, strips control characters
    - validateEmail(): RFC 5321 compliant validation with local part length check (64 chars), domain label validation, consecutive dot detection, TLD length check, zero-width character removal
  - **Error Disclosure Fixed**: Pattern and song API routes no longer expose raw error messages in production (only in development mode)
  - **ID Validation Added**: Pattern GET/DELETE routes now validate ID format before database queries

- **2026-03-16**: Redesigned Drum Machine Layout - Collapsible Sections & Song Builder UX
  - **New File: `src/hooks/use-collapsible-sections.ts`** - Hook managing expand/collapse state for all sections with localStorage persistence. Supports 8 section IDs: songBuilder, emotionControls, styleDna, soundShaping, virtualBand, sessionRecording, fillVariation, xyPad. Includes collapseAll/expandAll utilities.
  - **New File: `src/components/drum-machine/collapsible-section.tsx`** - Reusable CollapsibleSection component with theme-aware styling, left border accent indicator, icon support, badge slots, and compact mode option.
  - **Modified: `src/components/drum-machine/drum-machine.tsx`** - Major layout restructure:
    - All panels now wrapped in CollapsibleSection components with persist state
    - Song Mode panel moved inside main machine panel (was separate below), grouped as "Song Builder" section near genre/song part selectors
    - Added Collapse All / Expand All buttons in machine header
    - Reduced spacing from `space-y-5` to `space-y-3`, padding from `p-4 md:p-6` to `p-3 md:p-5`
    - Compact header with smaller badges and condensed action buttons
    - Sections grouped logically: Song Builder, Emotion & Mood, Style DNA, Sound Shaping (complexity + swing/humanize combined), Virtual Band, Session Recording, Fill & Variation, XY Kaoss Pad
    - Genre/Song Part selectors, Transport controls, Pattern Editor Toolbar, and Pattern Grid remain always-visible
    - Removed standalone `songModeOpen` state (now managed by collapsible sections hook)
    - Status badges on section headers show active state (block count, playing status, recording, active instruments, etc.)

- **2026-03-16**: Comprehensive Security Audit and Hardening
  - **New File: `src/lib/security.ts`** - Centralized security utilities: password strength validation (uppercase/lowercase/number/special char + common password check + strength scoring), email/name sanitization, error response sanitization, generic API rate limiter, security audit event logging, ID validation, IP extraction with format validation, bcrypt rounds constant (12)
  - **New API: `GET /api/admin/security`** - Admin-only security events viewer for monitoring auth failures, rate limits, suspicious activity
  - **Password Policy Hardened** (`register`, `password-reset/confirm`, `admin/users/[id]/password`): Now requires uppercase, lowercase, number, special character, checks against top 50 breached passwords, rejects repeated characters, max 128 chars (prevents bcrypt DoS)
  - **Bcrypt Rounds Increased**: All password hashing upgraded from 10 to 12 rounds across register, password reset, and admin password change
  - **SSE Auth Bypass Fixed** (`collab/sessions/[id]/sync`): GET endpoint now validates userId format, verifies user exists in database, and POST endpoint verifies senderId matches authenticated session user (prevents impersonation)
  - **Admin Promote Self-Check** (`admin/users/[id]/promote`): Added prevention for self-promotion + ID format validation + security audit logging
  - **Analytics Tracking Hardened** (`analytics/track`): Added rate limiting (60/min per IP), path format validation, sessionId/userId format validation, country field length truncation
  - **Password Reset Token Verify Hardened** (`password-reset/verify`): Added rate limiting (10/15min per IP), token format validation (hex64), email masking in response
  - **Password Reset Confirm Hardened** (`password-reset/confirm`): Added token format validation, strong password policy enforcement
  - **Style Feedback Rate Limited** (`style-profile/feedback`): Added rate limiting (30/min per user)
  - **Admin Password Change** (`admin/users/[id]/password`): Added ID validation, strong password policy, increased bcrypt rounds, structured security audit logging
  - **CSP & Security Headers** (`next.config.ts`): Added `base-uri 'self'`, `form-action 'self'`, `object-src 'none'`, `upgrade-insecure-requests`, Cross-Origin-Opener-Policy, Cross-Origin-Resource-Policy, X-DNS-Prefetch-Control, extended Permissions-Policy, HSTS preload, disabled X-Powered-By
  - **Auth Logging Sanitized** (`lib/auth.ts`): All login log messages now use maskEmail() to prevent email exposure in logs
  - **Register Route Hardened** (`auth/register`): Email format validation, name sanitization, password strength enforcement, masked email in logs, security event logging
  - **User Enumeration Fixed** (`auth/register`): Register endpoint no longer reveals whether an email is already registered; returns generic "Unable to create account" message
  - **Diagnostic Endpoints Secured** (`auth/diagnostics`, `auth/env-check`, `runtime-check`): All three previously-public debugging endpoints now require admin authentication. Removed user lookup by email, secret lengths, URL values, and DB prefix exposure
  - **Session Validation Hardened** (`sessions/validate`): Added content-type check, session token format validation (hex64 pattern), string type enforcement
  - **Password Reset Request Hardened** (`password-reset/request`): Added email format validation via validateEmail(), masked emails in all log messages
  - **Client-Side Password Requirements** (`register/page.tsx`, `reset-password/page.tsx`): Added real-time password strength indicator showing requirements (uppercase, lowercase, number, special char, length). Submit buttons disabled until all requirements met
  - **HSTS Preload + Extended Headers**: HSTS max-age increased to 2 years with preload flag. Added X-DNS-Prefetch-Control, Cross-Origin-Opener-Policy (same-origin), Cross-Origin-Resource-Policy (same-origin). CSP extended with base-uri, form-action, object-src 'none', upgrade-insecure-requests. Permissions-Policy expanded (payment, USB, magnetometer, gyroscope, accelerometer). X-Powered-By disabled

- **2026-03-15**: Enhanced Kaoss Pad with Stutter Effects, Target Selection, and Multi-Hit Sequencer
  - **Stutter Effect** (`src/lib/audio-effects.ts`): Added 5th effect type "stutter" to XY pad. X-axis controls stutter rate (1/4, 1/8, 1/16, 1/32 note divisions, beat-synced via BPM). Y-axis controls stutter intensity/depth (gain gate from subtle to full chop). Uses setInterval-based lookahead scheduling with gain automation for precise timing. Added `setBpm()` for beat-sync, `createStutterNodes()`, `startStutterScheduler()`, `stopStutterScheduler()`, `scheduleStutterEvents()` methods
  - **Effect Target Selection** (`src/components/drum-machine/xy-pad.tsx`): Added dropdown above XY pad to select effect target - "Whole Pattern" (master) or individual drums (Kick, Snare, Hi-Hat, etc.). Visual indicator shows active target. Dropdown styled with vintage theme. New `EffectTarget` type and `setEffectTarget()`/`getEffectTarget()` methods on AudioEffectsEngine
  - **Multi-Hit Sequencer** (`src/components/drum-machine/pattern-grid.tsx`): Right-click context menu on active sequencer steps to set 1-4 hits per step. Visual dot indicators on pads showing multi-hit count. Rapid-fire playback: hits evenly distributed within step timing. New `MultiHitMap` type in `drum-patterns.ts`, `createDefaultMultiHit()` helper, `setStepMultiHit()` action in `use-pattern-editor.ts`
  - **Pattern Editor Integration** (`src/hooks/use-pattern-editor.ts`): MultiHitMap added to state, snapshots (undo/redo), clipboard (copy/paste), clear operations, and pattern loading. Full history support for multi-hit changes
  - **Playback Engine** (`src/components/drum-machine/drum-machine.tsx`): `playSoundsForStep` updated with multi-hit scheduling loop - schedules N hits evenly across step interval. `multiHitRef` synced from editor state. BPM passed to XYPad for stutter sync
  - **Save/Load** (`drum-machine.tsx`): Pattern save JSON extended with `multiHit` field. Load restores multi-hit data when available, falls back to defaults

- **2026-03-15**: Real-Time Collaboration & Live Jam Features
  - **New Database Models**: `CollabSession` (jam sessions with invite codes, pattern state, visibility), `CollabParticipant` (session members with roles/join-leave tracking), `CollabRecording` (captured session event timelines)
  - **Database Migration**: `add_collab_sessions` — 3 new tables with cascade deletes, composite unique on participant sessionId+userId
  - **Real-Time Sync** (`src/lib/collab-sync.ts`): SSE-based CollabSyncManager with EventSource connection, auto-reconnect with exponential backoff (max 10 attempts, 30s max delay), 15s heartbeat, typed message broadcasting for pattern/cursor/BPM/genre/part/emotion changes
  - **SSE Server** (`src/app/api/collab/sessions/[id]/sync/route.ts`): GET endpoint returns SSE ReadableStream with in-memory listener pattern for broadcasting; POST broadcasts sync messages and persists state changes to DB. 30s heartbeat keepalive
  - **Virtual Band Engine** (`src/lib/virtual-band-engine.ts`): Musical theory (12 keys, 6 scales with intervals), pattern analysis (density, syncopation, accent detection), per-instrument generators with 3 intelligence levels (basic/intermediate/advanced). Bass: root notes→walking bass→chromatic approaches. Melody: beat positions→contour→motif phrases. Harmony: chord stabs→rhythmic→voice leading. Percussion: conga/shaker/cowbell/tambourine patterns. Web Audio synthesis: sawtooth+lowpass bass, triangle melody, sine pad harmony, noise+oscillator percussion
  - **Session Recording** (`src/lib/session-recording.ts`): SessionRecorder class with start/pause/stop/reset and timestamped event capture. RecordingPlayer with load/play/pause/stop/seek, requestAnimationFrame tick loop, playback speed control
  - **Collaboration Types** (`src/lib/collab-types.ts`): All collab interfaces (CollabSession, SessionParticipant, SyncMessage, VirtualBandMember, RecordingEvent), MAX_SESSION_PARTICIPANTS=4, PARTICIPANT_COLORS, VIRTUAL_BAND_PRESETS for bass/melody/harmony/percussion
  - **Hooks**: `useCollabSession` (session CRUD, SSE handlers, chat, remote cursors), `useVirtualBand` (4-instrument state, pattern generation, step scheduling), `useSessionRecording` (recorder/player wrapper, save/load API)
  - **UI Components**: CollabPanel (create/join dialogs, participant list, chat), VirtualBandPanel (4 instrument cards with key/scale/intelligence/octave/follow controls), SessionRecordingPanel (record/play/save transport), StreamControls (stub)
  - **API Routes**: Full CRUD for sessions (create, join by invite code, get, update, close, leave), SSE sync stream, recording save/load/delete. Max 5 active sessions per host, max 4 participants per session, max 20 recordings per session
  - **Integration**: drum-machine.tsx wired with refs to bridge hook ordering (virtualBandScheduleRef, sessionRecordingRef), virtual band regenerates on pattern changes, playSoundsForStep schedules virtual band notes and records events
  - **Middleware**: Added `/api/collab/` prefix bypass (auth handled in route handlers)

- **2026-03-17**: Enhanced WAF & Intrusion Detection System (IDS)
  - **New File `src/lib/ids.ts`**: Comprehensive Intrusion Detection System engine with:
    - **Behavioral Profiling**: Tracks per-IP request patterns (frequency, paths, methods, user agents, status codes) with 2-hour TTL and 5000 profile max
    - **Threat Scoring**: Multi-factor scoring (0-100) based on: request rate, honeypot hits, failed auth, suspicious payloads, user agent diversity, error rate, path scanning, admin probing
    - **Honeypot Traps**: 20 decoy endpoints (wp-admin, phpmyadmin, .env, .git, etc.) that instantly flag attackers
    - **IP Allowlist/Blocklist**: Admin-managed lists with permanent and timed blocks; allowlisted IPs bypass all security checks
    - **Geo-Blocking**: Country-code-based blocking (ISO 3166-1 alpha-2)
    - **Automated Response**: Auto-blocks IPs exceeding configurable threat threshold (default 70/100) for configurable duration (default 1 hour)
    - Exports: `recordRequest()`, `recordFailedAuth()`, `recordSuspiciousPayload()`, `isHoneypotPath()`, `isIpAllowlisted()`, `isIpBlocklisted()`, `isIdsAutoBlocked()`, `isCountryBlocked()`, IP list CRUD, `getIdsStats()`, `getTopThreats()`, `getThreatScore()`, `getHoneypotLog()`, config getters/setters
  - **Enhanced `src/lib/waf.ts`**: Integrated IDS pre-checks before all WAF rules:
    - IP allowlist bypass (skip all checks for trusted IPs)
    - IP blocklist enforcement (instant deny for blocked IPs)
    - IDS auto-block enforcement (deny IPs with high threat scores)
    - Geo-blocking check
    - Honeypot trap detection (returns 404 and records violation)
    - All WAF violations now feed into IDS threat scoring via `recordSuspiciousPayload()`
    - All allowed requests feed into IDS behavioral profiling via `recordRequest()`
  - **Enhanced `src/lib/security-monitor.ts`**: Added 4 new alert types: `ids_auto_block`, `honeypot_triggered`, `geo_block`, `behavior_anomaly`. New recording functions: `recordIdsAutoBlock()`, `recordHoneypotHit()`, `recordBehaviorAnomaly()`
  - **Enhanced `src/app/api/admin/waf/route.ts`**:
    - GET: New views `?view=ids` (IDS stats, threats, honeypot log), `?view=ip-lists` (allowlist/blocklist), `?view=threat&ip=x.x.x.x` (per-IP threat score). Overview now includes IDS summary
    - PATCH: Supports `_target=ids` for IDS config updates (enabled, autoBlockThreshold, honeypotEnabled, behaviorAnalysisEnabled, geoBlockEnabled, blockedCountries, requestRateThreshold)
    - POST: New IP management endpoint with actions: `add_allowlist`, `remove_allowlist`, `add_blocklist` (with reason and optional duration), `remove_blocklist`. IP format validation included
  - **Enhanced `src/app/api/admin/security/route.ts`**: Added `?view=ids-overview` for IDS stats, top threats, and honeypot log. Overview now includes IDS summary stats
  - **Enhanced `src/components/admin/waf-dashboard.tsx`**: Major dashboard upgrade with 4 tabs:
    - **Overview**: 6 stat cards (WAF blocked, logged, total, auto-blocked, IDS threats, honeypot hits) + threats by category + WAF config toggles + blocked IPs table with "Block" action buttons
    - **Events**: Unchanged WAF event log
    - **IDS**: IDS stats (5 cards), config toggles (IDS engine, honeypot traps, behavior analysis, geo-blocking), threat IP lookup tool with factor breakdown and block/allow actions, top threats list, honeypot trap log
    - **IP Lists**: Allowlist and blocklist management with add/remove UI, reason field for blocks, expiry display
  - **Enhanced `src/lib/auth.ts`**: Failed login attempts now also recorded in IDS via `recordIdsFailedAuth()` for behavioral threat scoring

- **2026-03-16**: Web Application Firewall (WAF) Protection
  - **New File `src/lib/waf.ts`**: Comprehensive application-level WAF engine with: SQL injection detection (10+ patterns), XSS filtering (12+ patterns), path traversal prevention, command injection/React2Shell protection (12+ patterns), malicious bot/scanner detection (15+ tools: sqlmap, nikto, burpsuite, etc.), global rate limiting (100 req/min per IP, 60 req/min for API), automatic IP reputation system (auto-blocks IPs after 20 violations in 10 min for 30 min), in-memory event ring buffer (1000 events), protocol violation detection (URL length, invalid methods, header bombs). Exports: `runWafCheck()`, `scanRequestBody()`, `addWafHeaders()`, `getWafEvents()`, `getWafStats()`, `getWafConfig()`, `updateWafConfig()`
  - **New File `src/app/api/admin/waf/route.ts`**: Admin-only WAF management API. GET supports `?view=stats|events|config` with category filtering and limits. PATCH updates WAF config (enabled, logOnly, botProtection, rate limits) with validation
  - **New File `src/components/admin/waf-dashboard.tsx`**: Full WAF monitoring dashboard with: overview stats cards (blocked/logged/total/auto-blocked), threat-by-category bar chart, real-time configuration toggles (WAF on/off, log-only mode, bot protection), event log viewer with color-coded categories, top blocked IPs table. Vintage-themed to match admin console
  - **Modified `src/middleware.ts`**: WAF check runs as first line of defense before any other middleware logic. WAF rate limit headers (X-RateLimit-*) added to all responses. Imports `runWafCheck`, `addWafHeaders`, `getClientIp` from waf.ts
  - **Modified `src/app/admin/page.tsx`**: Added "WAF" tab to admin console tab switcher alongside Users/Analytics/Sessions. Imports and renders WafDashboard component

- **2026-03-15**: Added Auto Humanize button with intelligent pattern humanization
  - **src/lib/humanize.ts**: Added `autoHumanize()` function with genre-specific presets (7 genres), BPM-aware scaling, complexity-aware intensity, and musical intelligence (preserves kick downbeats/snare backbeats, varies decorative instruments more). New types: `GenreHumanizePreset`, `AutoHumanizeResult`. Applies velocity variation, probability reduction, downbeat/backbeat accenting, and offbeat softening.
  - **src/hooks/use-pattern-editor.ts**: Added `applyAutoHumanize(genre, bpm)` action with full undo/redo support, `isHumanized` state flag (resets on pattern load).
  - **src/components/drum-machine/pattern-editor-toolbar.tsx**: Added "HUMANIZE" button with Wand2 icon between Copy/Paste and Clear sections. Features pulse animation on click, active state glow when humanized, and descriptive tooltip. New props: `isHumanized`, `onAutoHumanize`.
  - **src/components/drum-machine/drum-machine.tsx**: Added `handleAutoHumanize` callback that applies auto-humanization and also updates real-time humanize settings (swing, timing, velocity) to recommended values. Passes new props to PatternEditorToolbar.
  - **New Files**: src/lib/collab-types.ts, src/lib/collab-sync.ts, src/lib/virtual-band-engine.ts, src/lib/session-recording.ts, src/hooks/use-collab-session.ts, src/hooks/use-virtual-band.ts, src/hooks/use-session-recording.ts, src/components/drum-machine/collab-panel.tsx, src/components/drum-machine/virtual-band-panel.tsx, src/components/drum-machine/session-recording-panel.tsx, src/components/drum-machine/stream-controls.tsx, src/app/api/collab/sessions/route.ts, src/app/api/collab/sessions/join/route.ts, src/app/api/collab/sessions/[id]/route.ts, src/app/api/collab/sessions/[id]/leave/route.ts, src/app/api/collab/sessions/[id]/sync/route.ts, src/app/api/collab/recordings/route.ts, src/app/api/collab/recordings/[id]/route.ts
  - **Modified Files**: prisma/schema.prisma, src/middleware.ts, src/components/drum-machine/drum-machine.tsx

- **2026-03-15**: Pattern DNA & Style Learning System
  - **New Database Models**: `StyleProfile` (user's drumming DNA fingerprint, one per user), `PatternFeedback` (like/dislike ratings that train the profile)
  - **Style DNA Analysis** (`src/lib/style-dna.ts`): `analyzePattern()` extracts a `StyleFingerprint` from any pattern (density, syncopation, kick/snare/hihat density, backbeat/downbeat strength, layering, swing, complexity, genre affinity, instrument weights). Includes `mergeFingerprints()` for progressive learning, `calculateStyleSimilarity()`, and `hashPattern()` for deduplication.
  - **Artist DNA Library**: 7 pre-built artist profiles (J Dilla, Travis Barker, Questlove, Metro Boomin, Four Tet, John Bonham, Kaytranada) each with style fingerprints and transform hints (kick/snare bias positions, hi-hat style, ghost note amount, BPM range).
  - **Style Engine** (`src/lib/style-engine.ts`): `evolvePattern()` transforms a base pattern toward a target style DNA, `generateFromDNA()` creates new patterns entirely from style DNA + genre/part, `applyStyleTransfer()` for cross-style transformation. Handles kick, snare, hi-hat (4 styles: straight/swing/rolls/sparse), percussion, and ghost notes.
  - **API Routes**: `GET/POST /api/style-profile` for profile CRUD, `POST /api/style-profile/feedback` with progressive learning (exponential moving average, weight decay over time, anti-fingerprint for dislikes, 1000 feedback limit with FIFO).
  - **Hook** (`src/hooks/use-style-dna.ts`): Client-side state for artist selection, profile loading, pattern evolution/generation, feedback submission. Guest mode stores feedback locally.
  - **UI Component** (`src/components/drum-machine/style-dna-panel.tsx`): Collapsible panel with artist DNA selector grid (7 presets with icons/colors), style strength meters (density, syncopation, swing, complexity, layering), "Evolve Pattern" and "Generate New" buttons, thumbs up/down feedback, learning progress indicator.
  - Integrated into `drum-machine.tsx` between Emotion Selector and Complexity Slider.

- **2026-03-15**: Session Security Enhancements
  - **New Database Model**: `UserSession` for tracking active sessions with metadata (user agent, IP, timestamps)
  - **Session Timeout**: 24-hour inactivity auto-expiry with sliding window refresh
  - **Concurrent Session Limits**: Max 3 sessions per user; oldest auto-revoked on new login
  - **Session Invalidation on Password Change**: All sessions revoked when password is changed (via reset or admin)
  - **User Session Management Page**: `/settings` page with active session list, "Log Out Other Devices", and "Log Out All Devices" (danger zone)
  - **Admin Session Monitoring**: New "Sessions" tab in admin console showing active sessions count, per-user breakdown, and recent session activity
  - **Security Headers**: Added CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, X-XSS-Protection, Permissions-Policy via next.config.ts
  - **Session Manager Library**: `src/lib/session-manager.ts` with create/validate/revoke/cleanup operations
  - **New API Routes**: `/api/sessions` (GET/DELETE), `/api/sessions/[id]` (DELETE), `/api/sessions/validate` (POST), `/api/admin/sessions` (GET/POST)
  - **UI**: "SESSIONS" button added to drum machine header, admin console has Sessions tab
  - **Modified Files**: prisma/schema.prisma, src/lib/auth.ts, src/middleware.ts, next.config.ts, src/types/next-auth.d.ts, src/app/admin/page.tsx, src/app/api/auth/password-reset/confirm/route.ts, src/app/api/admin/users/[id]/password/route.ts, src/components/drum-machine/drum-machine.tsx
  - **New Files**: src/lib/session-manager.ts, src/app/settings/page.tsx, src/app/api/sessions/route.ts, src/app/api/sessions/[id]/route.ts, src/app/api/sessions/validate/route.ts, src/app/api/admin/sessions/route.ts, src/components/admin/sessions-monitor.tsx

- **2026-03-15**: CRITICAL SECURITY UPDATE - CVE-2025-55182 (React2Shell) Patched
  - **Vulnerability**: CVE-2025-55182 (React2Shell) - CVSS 10.0 remote code execution vulnerability in React Server Components
  - **Affected Versions**: React 19.0-19.2.0, Next.js 15.0.0-16.0.6
  - **Updated Dependencies**:
    - React: 19.2.3 → 19.2.4 (latest patched version)
    - React-dom: 19.2.3 → 19.2.4 (latest patched version)
    - Next.js: 16.1.6 (already above vulnerable range, confirmed secure)
  - **Security Verification**:
    - npm audit: 0 vulnerabilities detected
    - Build: Successful compilation with all tests passing
    - All functionality tested and working correctly
  - **Threat Context**: This vulnerability was actively exploited by multiple threat actors including state-sponsored groups shortly after disclosure in December 2025. Allows unauthenticated remote code execution via crafted HTTP requests.
  - **Action Required**:
    - ✅ Code updated and verified
    - ⚠️ **IMPORTANT**: Rotate all application secrets via Avery Secrets panel:
      - NEXTAUTH_SECRET (regenerate with: `openssl rand -base64 32`)
      - Database credentials (if compromised)
      - RESEND_API_KEY (rotate via Resend dashboard)
      - Any other API keys or sensitive credentials
  - **References**:
    - [React Security Advisory](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
    - [Vercel Security Bulletin](https://vercel.com/kb/bulletin/react2shell)
    - [Next.js Security Update](https://nextjs.org/blog/security-update-2025-12-11)
  - **Modified Files**: package.json, package-lock.json

- **2026-03-15**: Rewrote all app copy with dry/sarcastic voice
  - **Modified Files**: `src/app/page.tsx`, `src/app/login/page.tsx`, `src/app/register/page.tsx`, `src/components/guest-signup-banner.tsx`, `src/components/in-app-tour.tsx`
  - **Tone Update**: All user-facing copy now reflects authentic, conversational tone with dry humor while maintaining professionalism and accuracy about app functionality
  - **Homepage Changes**:
    - Headline: "Classic Beats. Modern Soul." → "Classic Beats. Probably Better Taste Than Your Playlist."
    - Description: Updated to accurately describe 16-step drum pattern generator with 7 genres, avoiding marketing speak
    - Features descriptions rewritten for personality while staying accurate (e.g., "Each genre has patterns that someone actually spent time on")
    - Button text: "TRY THIS!" → "KICK THE TIRES", "START MAKING BEATS" → "LET'S MAKE NOISE"
  - **Login Page Changes**:
    - Description: "Enter your credentials to access the machine" → "Enter your credentials to unlock your drum patterns"
    - Password placeholder: "Enter your password" → "Password (we won't judge how simple it is)"
    - Sign-up link: "Create one" → "Weird flex but okay"
    - Guest mode: Updated copy to "Your beats aren't saved (you'll regret it in 30 seconds)"
    - Guest button: "I'M JUST A GUEST!" → "YEP, JUST VISITING"
  - **Register Page Changes**:
    - Description: "Join the studio and start making beats" → "Join the chaos and start creating patterns you'll either love or immediately delete"
    - Password placeholder: "At least 8 characters" → "At least 8 characters (longer is better)"
    - Submit button: "CREATE ACCOUNT" → "LET'S DO THIS"
    - Sign-in link: "Sign in" → "Use it then"
  - **Guest Signup Banner Changes**:
    - Message: "Loving the beats? Create an account..." → "Found a pattern you actually like? Create an account before you accidentally close the tab."
    - Subtext: "YOUR CREATIONS DESERVE TO BE SAVED" → "THAT TOOK YOU LIKE 10 MINUTES TO TWEAK"
    - Button: "SIGN UP" → "SAVE ME"
  - **In-App Tour Changes**:
    - Welcome step: Added context about vintage aesthetic ("Yes, it looks like it's from 1988...")
    - Genre step: Updated with accurate 7-genre list and personality
    - Pattern grid step: Simplified language ("Each row = a drum sound. Each column = when it plays.")
    - All tour steps now match conversational, authentic tone while educating users about functionality
  - **Accuracy Notes**: All copy updates maintain factual accuracy about app features (16-step patterns, 7 genres, 5 song parts, Web Audio synthesis, pattern saving/loading)
  - **No Functional Changes**: Pure copy update - no code logic, UI components, or database changes

- **2026-03-15**: Added Song Mode Fill System with Block-Level Fill Configuration
  - **New Types** (song-types.ts): `FillTiming` ("last-2-bars"|"last-1-bar"|"last-2-beats"|"none"), `BlockFillSettings` (timing, intensity 1-10, category, autoGenerate, manualPattern), `FILL_TIMING_OPTIONS`, `DEFAULT_FILL_SETTINGS`, `getFillStartStep()`, `mapFillIntensity()`
  - **Modified Files**:
    - `src/lib/song-types.ts` — Added BlockFillSettings interface, FillTiming type, fill timing options array, default fill settings, getFillStartStep() and mapFillIntensity() helpers. SongBlock now includes fillSettings property
    - `src/hooks/use-song-mode.ts` — Enhanced playback engine with fill-aware step advancement. Fills trigger on last repeat of each block based on timing setting. Added generateBlockFill() using existing fill-patterns.ts system, shouldPlayFill() position check, fillActiveRef/fillPatternRef tracking. New setBlockFillSettings() for per-block configuration. Backward-compatible song loading (auto-migrates blocks without fillSettings)
    - `src/components/drum-machine/song-mode-panel.tsx` — Added FillConfigMenu context menu component (right-click blocks): fill timing selector (4 options), intensity slider (1-10 with color gradient), category picker (Transition/Rising Energy/Signature), auto-generate toggle, visual fill region preview. Added "F" badge on blocks with fills, fill count in header, "FILL" indicator during playback, red glow on active fill blocks, fill region overlay on progress bar
    - `src/components/drum-machine/drum-machine.tsx` — Passed new fillActiveForBlock and onSetBlockFillSettings props to SongModePanel
  - **Fill Features**:
    - Per-block fill timing: Last 2 Bars, Last 1 Bar, Last 2 Beats, or None
    - Per-block fill intensity (1-10) mapped to subtle/moderate/heavy
    - Per-block fill category: Transition, Rising Energy, Signature (with contextual defaults)
    - Fills play only on last repeat of each block for natural song transitions
    - Auto-generated fills use existing fill-patterns.ts (smart + library fills)
    - Right-click context menu for fill configuration with visual region preview
    - Fill region indicator overlays on timeline progress bars during playback
    - Red border glow and "FILL" text when fill is actively playing

- **2026-03-15**: Added XY Kaoss Pad-Style Effect Controller
  - **New Files**:
    - `src/lib/audio-effects.ts` — AudioEffectsEngine class: manages 4 real-time audio effects (reverb with synthetic impulse response, delay with feedback loop, lowpass filter with resonance, waveshaper distortion with tone control). Inserts into audio chain between instrument output and speakers. Smooth parameter transitions via setTargetAtTime (30ms smoothing). Dry/wet routing with per-effect signal path management.
    - `src/components/drum-machine/xy-pad.tsx` — Interactive XY pad component: mouse/touch-controllable square area, 4 effect selector buttons (Reverb/Delay/Filter/Distort) with color coding, LED indicators on X/Y axes showing parameter intensity, position lock toggle, enable/disable with power LED, real-time parameter readout displays, crosshair position indicator with glow effect, grid overlay lines. Vintage-styled to match drum machine aesthetic.
  - **Modified Files**:
    - `src/lib/audio-engine.ts` — Added master output routing through effects chain. All instrument sounds now connect to effects engine input node instead of AudioContext.destination. Added getAudioContext() method for effects initialization. Imports and initializes audioEffects on init().
    - `src/components/drum-machine/drum-machine.tsx` — Imported and placed XYPad component between pattern grid and machine footer.
    - `src/app/globals.css` — Added xy-pad-surface and xy-pad-active CSS classes for vintage pad styling with inset shadows and hover/active states.
  - **Effect Parameters (mapped to X/Y axes)**:
    - Reverb: Room size (X: 0.3-5s decay) / Wet-dry mix (Y: 0-80%)
    - Delay: Delay time (X: 50-1200ms) / Feedback (Y: 0-85%)
    - Filter: Cutoff frequency (X: 60Hz-18kHz log) / Resonance (Y: Q 0.5-20)
    - Distortion: Drive amount (X: waveshaper curve) / Tone (Y: 200-12kHz)

- **2026-03-15**: Added Swing & Humanization Controls
  - **New Files**:
    - `src/lib/humanize.ts` — Swing/humanization engine: HumanizeSettings type, swing offset calculation (delays off-beat 16th notes), timing humanization (random ±ms per step), velocity humanization (random ±% per hit), combined timing offset calculation
    - `src/components/drum-machine/swing-humanize-controls.tsx` — Vintage-styled UI with 3 sliders: Swing (0-100%), Timing humanize (0-20ms), Velocity humanize (0-30%). Uses orange/blue/green color coding with info tooltip
  - **Modified Files**:
    - `src/components/drum-machine/drum-machine.tsx` — Added humanizeSettings state + ref, modified playSoundsForStep to apply swing timing offsets via scheduleSound, velocity humanization per hit, and timing randomization. Added bpmRef for accurate step interval calculations during playback. Swing/humanize settings saved with patterns and restored on load. UI placed between complexity slider and transport controls
  - **Technical Details**:
    - Swing delays odd-numbered 16th note steps (1,3,5,7,...). At 50% swing, off-beats land on triplet grid
    - Timing humanize adds random ±ms offset per instrument per step for natural feel
    - Velocity humanize adds random ±% variation to each hit's velocity
    - Uses Web Audio API scheduleSound for precise swing timing (not setTimeout)
    - Settings stored in pattern save JSON payload (humanize field)
    - Real-time: changes apply immediately without stopping playback

- **2026-03-15**: Added Song Mode for Pattern Sequencing
  - **New Feature**: Comprehensive song mode allowing users to arrange multiple pattern blocks into full song structures
  - **New Files**:
    - `src/lib/song-types.ts` — SongBlock, Song, SongPlaybackState types, genre colors, part labels, block ID generator
    - `src/hooks/use-song-mode.ts` — Song state management hook: block CRUD, drag-and-drop reorder, sequential playback engine with BPM transitions between blocks, loop support, repeat counts per block (1-16x)
    - `src/components/drum-machine/song-mode-panel.tsx` — Collapsible song timeline UI with genre-colored blocks, drag-and-drop reordering via HTML5 DnD API, per-block repeat controls, play/stop/loop transport, save/load/export buttons, clear with confirmation dialog
    - `src/app/api/songs/route.ts` — GET list songs (with block count), POST create song
    - `src/app/api/songs/[id]/route.ts` — GET fetch song, DELETE song
  - **Modified Files**:
    - `prisma/schema.prisma` — Added SavedSong model (id, name, blocks JSON, loop boolean, userId FK)
    - `src/lib/midi-export.ts` — Added `exportSongAsMidi()` function for exporting entire songs as sequential MIDI files with BPM changes
    - `src/components/drum-machine/drum-machine.tsx` — Integrated song mode toggle, useSongMode hook, song panel, save/load/export song dialogs
    - `src/app/globals.css` — Added song mode CSS (block hover effects, drag-over indicators, timeline scrollbar, pulse animations)
  - **Song Mode Features**:
    - Collapsible panel below main drum machine (toggle button with block count badge)
    - "Add Pattern" captures current sequencer state (pattern, velocity, probability, genre, part, emotion, BPM, complexity)
    - Visual timeline with genre-colored side bars and song part labels (INT/VRS/CHR/BRG/OUT)
    - Drag-and-drop block reordering
    - Per-block repeat count (1-16x) with up/down controls
    - Duplicate and remove individual blocks
    - Click any block to load it back into the main sequencer for editing
    - Play Song: sequential playback through all blocks with automatic BPM transitions
    - Loop toggle for continuous song playback
    - Progress bar on active block during playback
    - Save/Load songs to database (disabled for guest users)
    - Export entire song as MIDI file
    - Clear all with confirmation dialog
    - Song name input and duration display
  - **Database Migration**: `add_saved_song` — creates SavedSong table with userId index
  - **Vintage Styling**: Consistent with drum machine aesthetic (orange accents, monospace fonts, dark panels)

- **2026-03-15**: Fixed song part selector button overflow issue
  - **Issue**: Song part buttons (Intro, Verse, Chorus, Bridge, Outro) were overflowing their container borders on smaller screens
  - **Root Cause**: Horizontal flex layout with `flex-1` on 5 buttons with substantial padding (`px-4 py-2`) and two-line content caused width constraints
  - **Fix**: Replaced flex layout with responsive CSS grid in `src/components/drum-machine/song-part-selector.tsx`
    - Mobile (default): 2-column grid layout for better fit on narrow screens
    - Small tablets (sm: 640px+): 3-column grid layout
    - Large screens (lg: 1024px+): 5-column horizontal layout (all buttons in one row)
  - **Padding Optimization**: Reduced padding responsively (`px-2 py-1.5` on mobile, `px-3 py-2` on larger screens)
  - **Typography**: Made description text size responsive (`text-[0.5rem]` mobile, `text-[0.55rem]` sm+)
  - **Visual Improvements**: Added `font-semibold` to button names and `leading-tight` to descriptions for better hierarchy
  - **Testing**: All 5 song part buttons now properly contained within borders at all screen sizes
  - **Maintained**: Vintage drum machine aesthetic, hover states, active state glow effects, and full accessibility

- **2026-03-14**: Added Pattern Complexity Slider feature
  - **New files**: `src/lib/complexity-engine.ts` (core algorithm), `src/components/drum-machine/complexity-slider.tsx` (UI)
  - **Modified**: `src/components/drum-machine/drum-machine.tsx` (state management, integration)
  - **Complexity scale**: 1-10 (5 = standard preset, 1-4 = simplified, 6-10 = complexified)
  - **Genre-aware**: Each genre has custom simplify/complexify rates, core instruments, syncopation limits, hi-hat roll settings
  - **Simplification** (levels 1-4): Strips non-essential instruments by layer priority, removes weak-beat hits, reduces to bare kick/hi-hat at level 1
  - **Complexification** (levels 6-10): Adds ghost notes (kick/snare), enhances hi-hat density, adds percussion layers (clap/ride/toms), open hi-hat syncopation, velocity humanization, probability variation
  - **BPM adjustment**: Complex patterns suggest slightly slower BPMs for clarity; simple patterns slightly faster
  - **Save/Load**: Complexity level stored in pattern JSON blob (no schema change needed), restored on load
  - **UI**: Vintage-styled slider with LED bar indicators, color gradient (green→orange→red), tooltip with feature explanation
  - **Integration**: Works with all existing features (emotion selector, shuffle, reset, pattern variations, A/B variations)

- **2026-03-14**: Fixed mobile browser authentication (cookie configuration)
  - **Issue**: Login worked on desktop browsers but failed on mobile browsers (iOS Safari, Chrome Android)
  - **Root Cause**: Missing explicit cookie configuration in NextAuth options - was using defaults that aren't mobile-friendly
  - **Fix**: Added comprehensive cookie configuration in `src/lib/auth.ts`:
    - Explicit `cookies` configuration for sessionToken, callbackUrl, and csrfToken
    - `httpOnly: true` for security (prevents JavaScript access to session cookies)
    - `sameSite: "lax"` for cross-site protection while allowing normal navigation (mobile-browser friendly)
    - `secure: true` in production or when using HTTPS (critical for mobile browsers)
    - Proper cookie name prefixes (`__Secure-` and `__Host-` in production) following security best practices
    - `useSecureCookies` flag set dynamically based on environment (production) or NEXTAUTH_URL protocol (HTTPS)
  - **Impact**: Mobile browsers (especially iOS Safari) are strict about cookie security attributes - explicit configuration required
  - **Testing**: Login should now work consistently across all mobile browsers (iOS Safari, Chrome Android, Firefox Mobile)
  - **Environment Detection**: Cookies automatically use secure settings when NODE_ENV=production or NEXTAUTH_URL starts with https://
  - **Backward Compatible**: Desktop browser functionality unchanged, now mobile browsers also work properly

- **2026-03-14**: Added guest session tracking with timed signup banner
  - Created `src/components/guest-signup-banner.tsx` - a dismissible, animated banner that appears after 5 minutes of guest usage
  - Banner features: smooth slide-down/up CSS transitions, "Sign Up" link to /register, dismiss button, auto-dismiss after 30 seconds
  - Uses vintage drum machine styling (gradient backgrounds, #E8732A accent, monospace fonts)
  - Updated `dashboard-content.tsx` to persist guest session start time in `sessionStorage` (survives re-renders)
  - Integrated `GuestSignupBanner` into `drum-machine.tsx` (renders between the existing guest mode banner and the main machine panel)

- **2026-03-14**: Fixed authentication issues for production deployment
  - **Email Normalization**: Both registration and login now normalize emails to lowercase server-side (trim + toLowerCase)
  - **Database Connection Verification**: Added database connectivity checks in both registration and login flows
  - **Enhanced Logging**: Comprehensive logging throughout auth flow to help debug production issues
    - Registration logs: user creation attempts, database connection status, password hashing
    - Login logs: authentication attempts, user lookups, password verification results
    - All logs prefixed with [Registration] or [Auth] for easy filtering
  - **NextAuth Configuration**: Added NEXTAUTH_URL support to authOptions for proper production callback URLs
  - **Environment Variables**: Added NEXTAUTH_URL to .env with production deployment instructions
  - **Diagnostics API**: New endpoint `/api/auth/diagnostics?email=user@example.com` for troubleshooting
    - Returns database connection status, user existence, and password field verification
    - Useful for debugging production authentication issues without exposing sensitive data
  - **Security**: Database connection failures return 503 status with user-friendly messages
  - **Fixes**: Resolves "invalid email or password" errors caused by email case mismatch and missing environment configuration

- **2026-03-14**: Expanded drum pattern library with 10 new variations per genre
  - **Pattern Library Expansion**: Added 70 new pattern variations across all 7 genres
    - Each genre now has 35 total patterns (increased from 25), providing significantly more variety
    - Distribution: ~12 verse patterns, ~12 chorus patterns, ~11 bridge patterns per genre
  - **New House Patterns**: Soulful House, Tribal House, Filtered House, Electro House, Future House, Afro House, Bass House, Minimal Break, Percussive Bridge, Filter Build
  - **New Lo-Fi Patterns**: Dusty Breaks, Study Session, Jazzy Pocket, Anime Montage, Rainy Day Groove, Vinyl Loop, Summer Breeze, Reverb Space, Dreamy Interlude, Tape Stop
  - **New Electronic Patterns**: IDM Glitch, Electro Funk, Future Bass, Big Room Drop, Melodic Dubstep, Hard Electro, Synthwave Drive, Glitch Break, Trance Arpeggio, Minimal Techno Space
  - **New Pop Patterns**: K-Pop Groove, Bedroom Pop, Electropop, Power Pop Anthem, Tropical Pop, Hyperpop Chaos, Stadium Pop, Vocal Break, Half-Time Bridge, Pre-Drop Tension
  - **New Hip-Hop Patterns**: G-Funk Bounce, Drill Beat, Jazz Rap Groove, Hype Chorus, West Coast Anthem, Brooklyn Drill, Trap Soul, Acapella Break, Turntable Scratch, Orchestral Build
  - **New Trap Patterns**: Future Trap, Latin Trap, Memphis Trap, Rage Trap, Cloud Trap, Hard Trap, Reggaeton Trap, Vocal Chop Break, 808 Slide, Reverse Build
  - **New Rock Patterns**: Post-Punk Verse, Blues Rock Shuffle, Math Rock, Hard Rock Chorus, Prog Rock Epic, Stoner Rock Groove, Emo Anthem, Acoustic Break, Double Bass Build, Cymbal Swell
  - **Pattern Count**: Total library now contains 245 genre-specific patterns (35 per genre × 7 genres) + 30 emotion variants = 275+ total patterns
  - **Enhanced Variety**: New patterns include various complexity levels (simple/medium/advanced) and diverse style tags
  - All new patterns follow genre-specific characteristics and work with existing BPM ranges

- **2026-03-14**: Added Fill Preview Mode for Visual Feedback Without Playback
  - **Fill Preview**: Pressing the fill button (or F key) when playback is stopped now displays the fill pattern visually in the sequencer grid
  - **Visual Styling**: Fill preview pads have pulsing animation with dynamic brightness to distinguish from regular patterns
  - **Auto-Revert**: Preview automatically returns to the original pattern after 2.5 seconds
  - **Early Cancellation**: Press F again or click on the grid to cancel preview immediately
  - **Context Awareness**: Preview clears when changing genre, song part, emotion, or starting playback
  - **State Management**: New state tracking (fillPreviewActive, preview timeout ref, pre-preview pattern refs) in DrumMachine component
  - **Grid Enhancement**: PatternGrid component now accepts fillPreviewActive prop and applies special styling with animate-pulse class
  - **Hint Text**: Grid mode hint shows "FILL PREVIEW — Press F to cancel or wait for auto-revert" during preview with pulsing orange text
  - **UX Improvement**: Users can now see what the fill will look like before triggering it during playback
  - **Behavioral Difference**: Fill button behaves differently based on playback state:
    - Stopped: Shows preview for 2.5 seconds
    - Playing: Queues fill for next bar (existing behavior)
  - Toast notification: "Fill preview (press F again to cancel)" when preview starts
  - Fill generation uses same logic as playback fills (smart fill or random fill based on intensity)

- **2026-03-14**: Added MIDI Export Functionality
  - **New Library**: `src/lib/midi-export.ts` — converts drum patterns to Standard MIDI Files using jsmidgen
  - **GM Drum Mapping**: Maps all 8 instruments to General MIDI drum notes (kick=36, snare=38, hihat-closed=42, hihat-open=46, clap=39, tom-high=48, tom-low=45, ride=51)
  - **Export Modes**: Single-track (all drums on one MIDI track) and multi-track (one track per instrument) options
  - **Velocity Support**: Per-step velocity values from the pattern editor are included in the MIDI output
  - **Smart Filenames**: Generated as `BeatForge_{Genre}_{Part}[_{Emotion}]_{BPM}BPM.mid`
  - **UI**: Download button with MIDI label added next to Save/Load controls in drum-machine.tsx, with hover dropdown for multi-track toggle
  - **Dependencies**: Added `jsmidgen` npm package + custom type declarations in `src/types/jsmidgen.d.ts`
  - **Channel**: Uses MIDI Channel 10 (index 9), the standard percussion channel
  - **Timing**: 16th note resolution (32 ticks per step at 128 ticks per beat)

---

# LLM Model Configuration

> **Last updated:** February 26, 2026
> **Purpose:** Always use the latest model strings when calling external LLM APIs. Never use deprecated models.

---

## Anthropic (Claude)

| Model | API String | Use When |
|---|---|---|
| Claude Opus 4.6 | `claude-opus-4-6` | Deepest reasoning, complex agentic coordination, long-horizon tasks |
| Claude Sonnet 4.6 | `claude-sonnet-4-6` | Daily driver — Opus-level intelligence at Sonnet pricing, best computer use |
| Claude Haiku 4.5 | `claude-haiku-4-5-20251001` | High-volume, classification, simple/cheap tasks |

- 200K context default; Opus & Sonnet 4.6 support 1M with `context-1m-2025-08-07` beta header
- Adaptive thinking (`thinking: {type: "adaptive"}`) is the recommended mode for 4.6 models
- ❌ Never use: `claude-3-opus`, `claude-3-sonnet`, `claude-3-haiku`, `claude-3.5-sonnet`, `claude-3.5-haiku`, `claude-sonnet-4-5-20250929`

---

## OpenAI (GPT)

| Model | API String | Use When |
|---|---|---|
| GPT-5.2 | `gpt-5.2` | Flagship reasoning — coding, agentic tasks, complex problems |
| GPT-5.2 Pro | `gpt-5.2-pro` | Max accuracy, extended reasoning (Responses API only) |
| GPT-5.2 Instant | `gpt-5.2-chat-latest` | Fast non-reasoning responses |
| GPT-5.2 Codex | `gpt-5.2-codex` | Repo-scale agentic coding, refactors, migrations |
| GPT-5 mini | `gpt-5-mini` | Cost-efficient for well-defined tasks |
| GPT-5 nano | `gpt-5-nano` | Fastest/cheapest for simple tasks |

- Use Responses API for all new development (Chat Completions is legacy)
- ❌ Never use: `gpt-4`, `gpt-4-turbo`, `gpt-4o`, `gpt-4o-mini`, `o1`, `o3`, `o3-mini`, `o4-mini`

---

## Google (Gemini)

| Model | API String | Use When |
|---|---|---|
| Gemini 3.1 Pro | `gemini-3.1-pro-preview` | Best reasoning, agentic coding, complex multimodal (1M context) |
| Gemini 3 Flash | `gemini-3-flash-preview` | Pro-level intelligence at Flash speed and pricing |
| Gemini 2.5 Flash | `gemini-2.5-flash` | Production-stable, great price-performance with thinking |
| Gemini 2.5 Flash Lite | `gemini-2.5-flash-lite` | Budget — fastest, high-volume simple tasks |

- Gemini 3 series uses dynamic thinking by default; control with `thinking_level` param
- ⚠️ `gemini-3-pro-preview` is deprecated — shuts down March 9, 2026
- ❌ Never use: `gemini-pro`, `gemini-1.5-pro`, `gemini-1.5-flash`, `gemini-2.0-flash`, `gemini-3-pro-preview`

---

## xAI (Grok)

| Model | API String | Use When |
|---|---|---|
| Grok 4.1 Fast (Reasoning) | `grok-4-1-fast-reasoning` | Agentic tool-calling, search, code execution (2M context) |
| Grok 4.1 Fast (Non-Reasoning) | `grok-4-1-fast-non-reasoning` | Instant responses, no thinking tokens, cheaper |
| Grok 4 | `grok-4` | Flagship deep reasoning (always-on reasoning, no off switch) |
| Grok 3 Mini | `grok-3-mini-fast` | Lightweight budget option |

- Grok 4 does NOT support `reasoning_effort`, `presencePenalty`, `frequencyPenalty`, or `stop`
- Native tools: web_search, x_search, code_execution, collections_search
- ❌ Never use: `grok-2`, `grok-beta`, `grok-2-vision-beta`, `grok-3-beta`

- **2026-03-15**: Fixed login form double-click bug
  - **Modified Files**:
    - `src/app/login/page.tsx` — Fixed race condition where login required two button clicks to work. Added `isSubmitting` state guard to prevent concurrent form submissions. Removed premature loading state reset - now keeps loading active during navigation. Added success toast feedback. Updated all form inputs and button to check both `isLoading` and `isSubmitting` flags for proper disabled state management during authentication flow.

- **2026-03-15**: Added Theme Selection System (Default, Dark Neon, Light Neon)
  - **New Files**:
    - `src/hooks/use-theme.ts` — ThemeContext, useTheme hook, useThemeProvider with localStorage persistence. Applies `theme-default`, `theme-dark-neon`, or `theme-light-neon` CSS class to HTML element. Manages dark/light mode class for Tailwind compatibility.
    - `src/components/theme-selector.tsx` — Three-button theme toggle with emoji icons (Vintage/Dark Neon/Light Neon), placed in top bar between logo and user info.
    - `src/lib/theme-colors.ts` — ThemeColors interface and getThemeColors() function providing per-theme color palettes for inline styles across all components.
  - **Modified Files**:
    - `src/app/globals.css` — Added complete CSS variable systems for three themes. All `.vintage-*` utility classes now use CSS custom properties instead of hardcoded colors. Added `.theme-dark-neon` and `.theme-light-neon` variable overrides. Added theme-specific glow effects for dark neon (extra neon glow) and light neon (softer shadows). Theme selector button styles. Updated scrollbar, tour, song mode, and XY pad styles to use variables.
    - `src/components/providers.tsx` — Added ThemeContext.Provider wrapping children, using useThemeProvider hook.
    - `src/components/drum-machine/drum-machine.tsx` — Imported ThemeSelector, useTheme, getThemeColors. All inline color values (backgrounds, borders, text colors, shadows) now use theme color palette. Updated top bar, guest banner, machine header, variation badges, action buttons, song mode toggle, and all dialog components.
    - `src/components/drum-machine/pattern-grid.tsx` — Theme-aware step numbers, beat LEDs, instrument labels, step pad colors, velocity indicators, tooltips, clear buttons, and mode hints.
    - `src/components/drum-machine/transport-controls.tsx` — Theme-aware play/stop buttons, fill trigger, BPM controls, and status LED.
    - `src/components/drum-machine/genre-selector.tsx` — Theme-aware unselected button styling (selected buttons keep genre-specific colors).
    - `src/components/drum-machine/song-part-selector.tsx` — Theme-aware selected/unselected part buttons.
    - `src/components/drum-machine/emotion-selector.tsx` — Theme-aware unselected emotion cards (selected keep emotion-specific colors).
    - `src/components/drum-machine/complexity-slider.tsx` — Theme-aware slider track, markers, thumb, tooltip, and LED indicators.
    - `src/components/drum-machine/variation-controls.tsx` — Theme-aware A/B buttons, fill trigger, intensity buttons, auto-switch select, and fill indicator.
    - `src/components/drum-machine/pattern-editor-toolbar.tsx` — Theme-aware mode buttons, length selector, undo/redo, copy/paste, and clear button.
    - `src/components/drum-machine/swing-humanize-controls.tsx` — Theme-aware slider tracks, thumbs, labels, and tooltip popover.
    - `src/app/dashboard/dashboard-content.tsx` — Theme-aware loading state.
  - **Theme Details**:
    - **Default (Vintage)**: Original warm brown/tan/orange palette. Dark background (#1A1410), cream text, orange accents.
    - **Dark Neon 80s**: Deep blue-black background (#0A0A1A), cyan/magenta/yellow neon accents, enhanced glow effects, synthwave aesthetic.
    - **Light Neon 80s**: Light purple background (#F0E8FF), vibrant purple/pink accents, white panels, retro-futuristic pastel styling.
  - **Implementation Architecture**:
    - CSS variables in globals.css provide base theming (scrollbars, vintage utility classes, animations)
    - ThemeColors TypeScript object provides inline style colors for components
    - Theme persists in localStorage under `beatforge-theme` key
    - HTML class toggling (`theme-default`, `theme-dark-neon`, `theme-light-neon`) drives CSS variable switching
    - Light neon theme removes `dark` class from HTML element for proper Tailwind compatibility

- **2026-03-15**: Added RESEND_API_KEY Environment Variable Documentation and Setup Guides
  - **New Files**:
    - `.env.example` — Comprehensive environment configuration template with detailed documentation for all variables including RESEND_API_KEY setup instructions
    - `SETUP.md` — Complete setup guide covering environment configuration, Resend account creation, API key retrieval, domain verification, and troubleshooting
    - `RESEND_SETUP.md` — Quick reference guide for RESEND_API_KEY setup with step-by-step instructions for getting API key, adding to environment, testing, and FAQ
  - **Modified Files**:
    - `README.md` — Updated with project overview, features, tech stack, quick start guide, links to setup documentation, and troubleshooting section. Added references to SETUP.md, CLAUDE.md, and PRODUCTION_AUTH_FIX.md
    - `CLAUDE.md` — Email Configuration section already documents RESEND_API_KEY, EMAIL_FROM, and NEXT_PUBLIC_APP_URL requirements. Now referenced in README.md
  - **Key Documentation Improvements**:
    - Clear explanation of what RESEND_API_KEY is and why it's needed
    - Step-by-step instructions for creating Resend account and retrieving API key
    - Guidance for both development (console logging fallback) and production (real emails) modes
    - Instructions for adding secrets via Avery platform and local development
    - Domain verification instructions for production email delivery
    - Comprehensive troubleshooting section for common issues
    - Reference to console output format for development mode testing
    - FAQ answering common questions about setup and features
  - **Feature Details**:
    - Development mode (without RESEND_API_KEY): Password reset links logged to console instead of sent via email
    - Production mode (with RESEND_API_KEY): Real emails sent via Resend service with branded templates
    - Email templates already support HTML and plain text formats with BeatForge 808 branding
    - 1-hour expiration for password reset tokens with security best practices implemented


---

### 2026-03-15: Authentication Debugging & Diagnostics for Preview Environment
- **Added**: `/api/runtime-check` endpoint to diagnose environment variable loading at runtime
- **Fixed**: Reset password for demo@example.com to known test value (demo123) for testing
- **Created**: Comprehensive documentation for preview environment auth debugging
  - `PREVIEW_AUTH_FIX.md` - Full troubleshooting guide with root cause analysis, diagnostic steps, and solutions
  - `AUTH_DEBUG_GUIDE.md` - Quick reference for diagnostic endpoints, test credentials, and common fixes
- **Identified**: Root cause of CredentialsSignin error in preview environment:
  - Environment variables from .env file may not be loaded at runtime in containerized/preview environments
  - NextAuth requires NEXTAUTH_SECRET to be available at runtime for JWT signing and verification
  - Database connection works but authentication fails due to missing NEXTAUTH_SECRET
- **Solution**: Configure environment variables in Avery platform settings (not just .env file):
  - NEXTAUTH_SECRET (from .env file)
  - DATABASE_URL (from .env file)
  - NODE_ENV=production (for proper cookie security)
  - Then redeploy preview environment
- **Verified Working**:
  - ✅ Database connection established successfully
  - ✅ Users exist with correct email/password hashes
  - ✅ Password verification logic works correctly
  - ✅ Auth configuration is correct
  - ✅ Build succeeds without errors
- **Diagnostic Endpoints**:
  - `/api/runtime-check` - Shows which environment variables are loaded at runtime
  - `/api/auth/env-check` - Verifies NextAuth configuration and provides recommendations
  - `/api/auth/diagnostics?email=user@example.com` - Checks database connection and user existence
- **Test Credentials**: demo@example.com / demo123 (verified working in database)
- **Next Steps for User**: Set environment variables in platform settings and redeploy

---

### 2026-03-15: XY Kaoss Pad Size Reduction & Press-and-Hold Fix
- **Resized**: XY Kaoss Pad reduced to approximately 1/3 of original size (from `aspect-square w-full` to fixed `w-48 h-48` = 192px)
- **Fixed**: Touch/mouse interaction - effects now only apply while actively pressing/holding
  - Added `engaged` state to `AudioEffectsEngine` (separate from `enabled` master toggle)
  - Effects route to audio only when: `enabled === true AND engaged === true`
  - Mouse/touch down calls `audioEffects.setEngaged(true)`
  - Mouse/touch up calls `audioEffects.setEngaged(false)` - immediately bypasses effects and returns to dry signal
- **Enhanced Visual Feedback**:
  - Pad background glow increases when actively engaged (opacity 10 → 25)
  - Added inset glow and outer shadow when dragging for clearer press feedback
  - Added "ENGAGED" indicator badge (color-coded, animated pulse) that appears only when pressing
  - Crosshair/position indicator scales up when engaged for better visibility
- **Audio Engine Changes** (`src/lib/audio-effects.ts`):
  - Added `private engaged: boolean` state
  - Added `setEngaged(engaged: boolean)` public method
  - Added `updateEffectState()` private method to coordinate enabled/engaged routing
  - Effects properly bypass when not engaged (disconnectWetPath restores dry signal)
- **Component Changes** (`src/components/drum-machine/xy-pad.tsx`):
  - All mouse/touch down handlers call `audioEffects.setEngaged(true)`
  - All mouse/touch up handlers call `audioEffects.setEngaged(false)`
  - Visual styling updated to reflect engaged state with enhanced glow effects
  - ENGAGED badge displays only when `enabled && isDragging`
- **Behavior**: User must hold mouse button or keep finger on pad for effects to apply - releasing immediately returns audio to normal (no lingering effects based on last position)
- **Verified**: Build succeeds, effects properly engage/disengage on press/release across desktop (mouse) and mobile (touch) interactions

---

### 2026-03-15: Guest Login Button Added to Login Screen
- **Added**: Prominent "I'm just a guest!" button to login page (`src/app/login/page.tsx`)
- **Features**:
  - Guest mode button routes directly to `/dashboard?guest=true` (leverages existing guest mode functionality)
  - Green button styling (#27AE60 with hover state) to distinguish from login (orange) - fits vintage drum machine aesthetic
  - Clear explanation text: "🎛️ GUEST MODE: Play with full access · No account needed · Patterns not saved"
  - Visual divider ("or") separates guest button from login form
  - Skeleton/loading state also includes guest button for consistency
- **Implementation**:
  - No new API endpoints needed (guest mode already fully implemented in dashboard-content.tsx)
  - Uses existing sessionStorage for guest session tracking
  - Full drum machine access without authentication or account creation
  - Guest sessions not persisted (expires on browser close per session-only storage)
- **Styling**:
  - Matches vintage drum machine theme with monospace font and tracking-wider letter spacing
  - Green color (#27AE60) and hover state (#229954) provide clear visual distinction
  - Info box uses muted colors (tan text on dark brown) for non-intrusive information display
  - Responsive layout maintains vintage aesthetic across all screen sizes
- **Verified**: Build succeeds with no TypeScript or compilation errors

---

### 2026-03-15: Fixed Guest Login Button Race Condition
- **Issue**: Guest login button navigated to dashboard but immediately redirected back to login screen (flash of drum machine then stuck on login)
- **Root Cause**: Race condition in `src/app/dashboard/dashboard-content.tsx` between two useEffects
  - First useEffect (lines 18-36) reads `guest=true` from URL searchParams and sets `isGuest` state
  - Second useEffect (lines 38-42) checks if user should be redirected: `if (!isGuest && status === "unauthenticated")`
  - When dashboard first mounts, both useEffects run simultaneously. The redirect check executed before `isGuest` state was updated from initial `false` value, causing immediate redirect back to `/login`
- **Fix**: Modified redirect useEffect to read `guest` parameter directly from searchParams instead of relying on `isGuest` state
  - Changed dependency array from `[status, router, isGuest]` to `[status, router, searchParams]`
  - Reads `const guest = searchParams.get("guest") === "true"` directly in effect body
  - Eliminates state-based race condition - searchParams always has correct value synchronously
- **Modified Files**:
  - `src/app/dashboard/dashboard-content.tsx` — Fixed redirect logic to avoid race condition by reading searchParams directly
- **Verified**: Build succeeds, guest login now works correctly without redirect loop

---

### 2026-03-15: Fixed Login Success Infinite Loading State
- **Issue**: After successful username/password login, users saw "successfully logged in" toast but remained stuck on spinning loading screen instead of being redirected to dashboard
- **Root Cause**: Session update timing issue between login page and dashboard
  - Login page called `router.push("/dashboard")` immediately after `signIn()` success
  - Dashboard component's `useSession()` hook returned `status: "loading"` because session hadn't fully updated yet
  - Dashboard remained in loading state indefinitely waiting for session to become "authenticated"
  - No timeout or error handling to recover from this stuck state
- **Fix**: Added `router.refresh()` call and proper navigation timing in login form handler
  - Call `router.refresh()` after successful sign-in to force session update
  - Add 100ms delay before `router.push("/dashboard")` to ensure session is refreshed
  - Add 5-second safety timeout to reset loading state if navigation doesn't complete
  - This ensures the session is updated before dashboard mounts and checks authentication status
- **Modified Files**:
  - `src/app/login/page.tsx` — Updated handleSubmit to refresh router and add navigation delay with safety timeout
- **Verified**: Build succeeds, login now properly redirects to dashboard after successful authentication

---

### 2026-03-15: Made Neon Themes More Vibrant and Fun
- **Changes**: Enhanced Dark Neon and Light Neon themes with more electric, saturated colors and stronger glow effects for a more striking, retro-futuristic aesthetic
- **Dark Neon Theme Improvements**:
  - Darker background (#050510 instead of #0A0A1A) for better contrast against bright neons
  - More electric cyan (#00FFFF) and hot pink (#FF0099) as primary accent colors
  - Brighter green (#00FF99) for active states and LEDs
  - Enhanced glow effects: larger shadow radius (up to 60px) with higher opacity (0.2-0.4) for more pronounced neon glow
  - Increased text brightness (#F0EFFF) for better legibility against dark backgrounds
  - More vibrant velocity and intensity colors (brighter purple, magenta, pink)
- **Light Neon Theme Improvements**:
  - Slightly darker background (#E8DEFF) to provide more contrast for neon colors
  - More saturated, electric purple (#6600FF) as primary accent color
  - Hot pink (#FF0099) for maximum pop against light backgrounds
  - Enhanced glow effects: cyan and pink shadows up to 40px for more visible neon effect
  - Darker text (#1A0A3A) for better contrast and readability
  - More vibrant secondary colors and accent LEDs
- **Both Themes**:
  - Increased glow opacity and size: primary glows now 0 0 20px with 0.35-0.5 opacity (previously 12px, 0.2-0.3)
  - LED glow effects enhanced: now 32-60px range with 0.2-0.4 opacity for more visible neon aesthetic
  - Pad active states now have multiple shadow layers for cumulative glow effect
  - Theme-specific panel shadows and borders more vibrant and saturated
  - Selector active states more prominent with increased opacity and glow
- **Modified Files**:
  - `src/lib/theme-colors.ts` — Updated darkNeonColors and lightNeonColors with more vibrant hex values
  - `src/app/globals.css` — Enhanced CSS variables for both neon themes, stronger glow effects, improved contrast
- **Verified**: Build succeeds with no compilation errors; themes now visually striking with neon aesthetic fully realized

- **2026-03-15**: Added Dancing Character Animation Box (Teenage Engineering × Fallout Vault-Boy style)
  - **New File**: `src/components/drum-machine/dancing-character.tsx` — SVG-based animated mascot with:
    - 7 dance move sequences (finger point, head bob, two-step, arm pump, robot dance, thumbs-up sway, groove slide), each with 4 interpolated poses
    - BPM-synced animation: pose changes on quarter notes (every 4 steps), smooth cubic ease interpolation via requestAnimationFrame
    - Genre-weighted dance selection: each genre favors different moves (e.g., electronic → robot dance, lo-fi → head bob, hip-hop → groove slide)
    - Idle bobbing animation when playback is stopped
    - Dance move changes every 4 bars for variety
    - Retro CRT scan-line overlay, beat flash LED indicator, theme-aware colors
    - Vault-Boy-inspired clear-line SVG character with hat, vest, expressive face (smile/grin/open/wink)
  - **Modified Files**:
    - `src/components/drum-machine/drum-machine.tsx` — Imported DancingCharacter, placed alongside TransportControls in a flex row
    - `src/app/globals.css` — Added `@keyframes beatFlash` for beat indicator pulse
  - **Props**: `isPlaying`, `bpm`, `currentStep`, `genre` — fully synced with drum machine state
  - **Verified**: Build succeeds with no compilation errors

- **2026-03-15**: Added Rate Limiting to Authentication Endpoints
  - **New File**: `src/lib/rate-limit.ts` — In-memory sliding window rate limiter with:
    - Per-IP tracking using configurable windows and max attempts
    - Exponential backoff on repeated violations (2x → 4x → 8x multiplier, capped at 1h)
    - Automatic memory cleanup every 5 minutes to prevent leaks
    - Standard `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` response headers
    - `applyRateLimit()` function returns 429 NextResponse or null (pass-through)
  - **Rate Limits Applied**:
    - `/api/auth/register` — 5 attempts per IP per hour
    - `/api/auth/[...nextauth]` (login POST) — 10 attempts per IP per 15 minutes
    - `/api/auth/password-reset/request` — 3 attempts per IP per hour
    - `/api/auth/password-reset/confirm` — 5 attempts per IP per hour
  - **Modified Files**:
    - `src/app/api/auth/register/route.ts` — Added rate limit check before processing
    - `src/app/api/auth/[...nextauth]/route.ts` — Wrapped POST handler with rate limit; GET (session/CSRF) remains unprotected
    - `src/app/api/auth/password-reset/request/route.ts` — Added rate limit check
    - `src/app/api/auth/password-reset/confirm/route.ts` — Added rate limit check
  - **No new dependencies** — uses in-memory Map store (no Redis required)
  - **Verified**: Build succeeds with no compilation errors


---

### 2026-03-15: Added Comprehensive Input Validation for Pattern Data
- **Changes**: Implemented comprehensive input validation and sanitization to prevent malformed data, XSS attacks, and DoS attacks via pattern/song storage
- **New File**: `src/lib/validation.ts` — Zod-based validation library with:
  - **Schema Validation**:
    - Validates drum pattern structure: max 32 steps per instrument, valid instrument IDs only
    - Validates velocity values (0-127 range) and probability values (0-100 range)
    - Validates BPM range (40-300)
    - Validates genre, songPart, and emotion against allowed enum values
    - Validates pattern lengths (8, 16, 24, or 32 steps only)
    - Validates song blocks: max 100 blocks, valid repeat counts (1-16), proper fill config structure
  - **Sanitization**:
    - `sanitizeText()`: Removes HTML/script tags, JavaScript protocols, event handlers to prevent XSS
    - `sanitizeName()`: Trims and limits pattern/song names (max 100 characters)
    - Applied automatically during validation via Zod transforms
  - **Size Limits**:
    - Max pattern JSON size: 100KB (prevents DoS)
    - Max song JSON size: 500KB (prevents DoS)
    - Max patterns per user: 500
    - Max songs per user: 100
    - Max song blocks: 100
    - `validateJsonSize()` checks payload size before processing
  - **Storage Limit Helpers**:
    - `checkPatternLimit()`: Verifies user hasn't exceeded pattern quota before saving
    - `checkSongLimit()`: Verifies user hasn't exceeded song quota before saving
- **Modified Files**:
  - `src/app/api/patterns/route.ts` — Added validation:
    - Checks pattern storage limit before processing (returns 403 if exceeded)
    - Validates all incoming pattern data with `validatePatternData()`
    - Returns detailed error messages for validation failures (field path, error message)
    - Handles ZodError with proper 400 responses
  - `src/app/api/songs/route.ts` — Added validation:
    - Checks song storage limit before processing (returns 403 if exceeded)
    - Validates all incoming song data with `validateSongData()`
    - Returns detailed error messages for validation failures
    - Handles ZodError with proper 400 responses
- **Dependencies**: Added `zod` for type-safe schema validation
- **Security Improvements**:
  - Prevents XSS attacks via sanitized text inputs
  - Prevents DoS attacks via size limits and storage quotas
  - Validates all data types before database insertion
  - Rejects invalid enum values (genre, songPart, emotion)
  - Ensures pattern data conforms to expected structure
- **Verified**: Build succeeds with no TypeScript or compilation errors

- **2026-03-15**: Drum Sound Variation Selector with Genre-Specific Options
  - **New File**: `src/lib/drum-sound-variations.ts` — Sound variation definitions with synthesis parameters for all 7 genres and 8 instruments (3-5 variations each)
  - **New File**: `src/components/drum-machine/drum-sound-selector.tsx` — Dropdown UI component for per-instrument sound selection with hover preview, tooltips, and Shift+click cycling
  - **Modified File**: `src/lib/audio-engine.ts` — Extended all synthesis methods to accept `SynthParams` overrides (frequency, envelope, filter, noise, saturation); added `setInstrumentVariation()`, `clearAllVariations()`, `playSoundWithVariation()` APIs; added waveshaper-based saturation for lo-fi effects
  - **Modified File**: `src/components/drum-machine/pattern-grid.tsx` — Integrated `DrumSoundSelector` into instrument label row; added genre, soundVariations, and handler props
  - **Modified File**: `src/components/drum-machine/drum-machine.tsx` — Added `soundVariations` state with `getDefaultVariations()`; syncs variations to audio engine via useEffect; migrates variations on genre change; added `handleSoundVariationChange` and `handlePreviewSoundVariation` callbacks
  - **Features**: Per-drum sound selection dropdown, genre-specific variations (House deep/punchy/sub kicks, Electronic 808/synth/distorted kicks, Lo-Fi vinyl/dusty/warm kicks, etc.), hover-to-preview sounds, auto-dismiss tooltips with descriptions, Shift+click to cycle variations, sound selections migrate when switching genres
  - **Verified**: Build succeeds with no TypeScript or compilation errors

- **2026-03-15**: Humanize All User-Facing Text Content
  - **Scope**: Complete text content humanization across all pages, components, and API routes
  - **Writing Style**: Conversational tone, contractions, natural language, friendly guidance, music producer persona
  - **Modified Pages**:
    - `src/app/forgot-password/page.tsx` — Changed "FORGOT PASSWORD?" → "OOPS, FORGOT IT?", "Send reset link" → "Send the link", success message humanized to reference spam folder
    - `src/app/reset-password/page.tsx` — Changed title to "CREATE NEW PASSWORD", improved error messages ("That link isn't ringing any bells", "You already used that link!"), success message changed to "YOU'RE ALL SET!" with "Time to get back to making beats"
    - `src/app/login/page.tsx` — Updated error messages ("Email or password isn't matching up", "Something went sideways"), success toast "You're in! Let's make some noise", changed "Forgot password?" → "Lost it?", updated description to "Time to get back to your beats"
    - `src/app/register/page.tsx` — Humanized description and error messages ("Couldn't create your account. Give it another shot?", "Welcome! Let's sign you in."), improved validation messages
    - `src/app/dashboard/dashboard-content.tsx` — Changed loading message "LOADING MACHINE..." → "POWERING UP..."
    - `src/app/admin/page.tsx` — Updated loading message to "FIRE UP THE CONSOLE...", changed all toast messages and dialogs to be more conversational, dialog titles updated ("REMOVE THIS USER", "NEW PASSWORD"), confirmation messages humanized ("Seriously, are you sure? All their patterns and data go away too.")
  - **Modified API Routes**:
    - `src/app/api/auth/register/route.ts` — Humanized all error messages ("We need your email, a password, and your name...", "We're having some backend trouble", "Looks like that email's already in the system"), success message changed to "Welcome aboard! Time to make some beats."
    - `src/app/api/auth/password-reset/request/route.ts` — Changed errors and success messages to friendly tone ("We'll need your email...", "check your inbox for a reset link (and your spam folder just in case!)", "Something went sideways on our end")
    - `src/app/api/auth/password-reset/verify/route.ts` — Humanized all error messages ("We need that reset link, friend", "That link isn't ringing any bells", "You already used that link!", "That link expired...")
    - `src/app/api/auth/password-reset/confirm/route.ts` — Updated error messages ("We need both the reset link and your new password...", "Pick something at least 8 characters long"), success message "Password changed! You're all set to get back to making beats."
    - `src/app/api/patterns/route.ts` — Updated error messages ("You'll need to sign in first", "You've hit the pattern limit", "Couldn't load your patterns"), changed storage limit message to user-friendly format
    - `src/app/api/songs/route.ts` — Similar humanization as patterns route, friendly storage limit notifications
  - **Writing Patterns Applied**:
    - Contractions used throughout ("you'll", "we're", "it's", "isn't")
    - Casual phrases ("something went sideways", "mind trying again", "give it a shot")
    - Direct address ("you," "friend")
    - Conversational error explanations with helpful context
    - Positive reinforcement in success messages ("You're in!", "Welcome aboard!")
    - Tone reflects music producer personality (references to beats, vibes, making noise)
  - **Verified**: npm run build succeeds with no errors; all changes are UI/UX only with no functionality changes

- **2026-03-15**: Real-Time Collaboration & Live Jam Features
  - **New API Routes**:
    - `src/app/api/collab/sessions/route.ts` — GET list user's sessions, POST create session (5 active limit, unique invite code)
    - `src/app/api/collab/sessions/join/route.ts` — POST join session by invite code (max 4 participants)
    - `src/app/api/collab/sessions/[id]/route.ts` — GET/PATCH/DELETE session (host-only for PATCH/DELETE)
    - `src/app/api/collab/sessions/[id]/leave/route.ts` — POST leave session (host leaving closes session)
    - `src/app/api/collab/sessions/[id]/sync/route.ts` — GET opens SSE stream (in-memory buffer polled every 300ms), POST broadcasts sync messages and persists state changes
    - `src/app/api/collab/sessions/[id]/recordings/route.ts` — GET/POST session recordings (max 50 per session)
  - **New Components**:
    - `src/components/drum-machine/stream-controls.tsx` — Live streaming panel with Twitch/YouTube platform selector, Go Live toggle, viewer count, stream duration, audience chat toggle (stub UI, renders when collab active)
  - **Pre-existing Infrastructure** (already in codebase, used by new routes):
    - `src/lib/collab-types.ts` — Complete type system for collaboration (CollabSession, SyncMessage, VirtualBandMember, etc.)
    - `src/lib/collab-sync.ts` — CollabSyncManager with SSE + POST real-time sync, exponential backoff reconnection
    - `src/lib/virtual-band-engine.ts` — AI pattern generation (bass/melody/harmony/percussion) with music theory algorithms, Web Audio synthesis
    - `src/lib/session-recording.ts` — SessionRecorder and RecordingPlayer classes
    - `src/hooks/use-collab-session.ts` — Full collaboration hook with create/join/leave/close/sync/chat
    - `src/hooks/use-virtual-band.ts` — Virtual band member management (toggle, volume, key, scale, intelligence, octave, pattern generation)
    - `src/hooks/use-session-recording.ts` — Recording state management with playback controls
    - `src/components/drum-machine/collab-panel.tsx` — Collaboration UI (create/join dialogs, participants, chat)
    - `src/components/drum-machine/virtual-band-panel.tsx` — Per-instrument controls (key, scale, intelligence, octave, follow intensity)
    - `src/components/drum-machine/session-recording-panel.tsx` — Recording UI with save/load/playback
  - **Modified File**: `src/components/drum-machine/drum-machine.tsx` — Integrated StreamControls into JSX; fixed onPatternUpdate callback to use editor.setPattern() for remote updates; wired virtual band audio init
  - **Database**: CollabSession, CollabParticipant, CollabRecording models (migration already applied)
  - **Architecture**: SSE + POST pattern for real-time sync (no WebSocket needed), in-memory message buffer (Map<sessionId, SyncMessage[]>), pure client-side music theory for virtual band (no external AI APIs)
  - **Verified**: Build succeeds with all 6 new API routes registered

- **2026-03-15**: Removed Live Jam Collaboration UI
  - **Removed from UI**:
    - Removed CollabPanel component from drum-machine.tsx (component file still exists but not rendered)
    - Removed useCollabSession hook usage from drum-machine.tsx
    - Removed StreamControls component (was dependent on active collab session)
    - Removed collab session references from SessionRecordingPanel (now uses "local" session ID and empty participants array)
  - **Preserved Backend Infrastructure** (kept for potential future use):
    - All `/api/collab/*` API routes remain functional
    - `src/hooks/use-collab-session.ts` hook still available
    - `src/lib/collab-sync.ts` SSE sync manager intact
    - `src/lib/collab-types.ts` type definitions preserved
    - `src/components/drum-machine/collab-panel.tsx` component file still exists
    - `src/components/drum-machine/stream-controls.tsx` component file still exists
    - Database models (CollabSession, CollabParticipant, CollabRecording) unchanged
  - **UI Changes**:
    - Virtual Band Panel now takes full width instead of being in 2-column grid with CollabPanel
    - Removed "Live Jam & Virtual Band" grid section, Virtual Band Panel now standalone
    - Session recordings now always use local session ID instead of collab session ID
  - **Verified**: npm run build succeeds; all collaboration backend routes still functional but UI removed from interface

- **2026-03-15**: iOS Silent Mode Detection & Audio Context Workaround
  - **New File** (`src/lib/audio-context-manager.ts`): Singleton `AudioContextManager` class that monitors AudioContext state, detects iOS silent mode via oscillator timing analysis, handles user-gesture-based audio context unlocking (plays silent buffer to fully unlock on iOS), periodic state monitoring (2s interval), and subscriber pattern for state change notifications. Exports `audioContextManager` singleton with `registerContext()`, `unlock()`, `subscribe()`, `checkSilentMode()`, `dispose()` methods.
  - **New File** (`src/hooks/use-audio-context.ts`): React hook `useAudioContext()` that subscribes to audio context manager state changes. Returns `{ state, issue, isReady, isIOS, needsAttention, unlock, isDismissed, dismiss }`. Auto-detects when user attention is needed for suspended context or silent mode.
  - **New File** (`src/components/drum-machine/audio-unlock-banner.tsx`): `AudioUnlockBanner` component with vintage-themed UI showing: "AUDIO SUSPENDED" banner with "ENABLE AUDIO" button for suspended contexts; "SILENT MODE DETECTED" banner with iOS-specific instructions (flip hardware switch) for muted devices. Features flashing indicator animation, dismiss button, and loading state during unlock.
  - **Modified** (`src/lib/audio-engine.ts`): Integrated `audioContextManager` — `init()` now registers context with manager and auto-resumes suspended contexts; added `resumeContext()` and `getContextState()` public methods; `ensureContext()` now attempts resume on every call; `dispose()` cleans up manager.
  - **Modified** (`src/components/drum-machine/transport-controls.tsx`): Added `audioIssue` and `onAudioUnlock` props. Shows animated "MUTED" or "NO AUDIO" indicator button in transport bar when audio issues detected, with `VolumeX` icon.
  - **Modified** (`src/components/drum-machine/drum-machine.tsx`): Added `useAudioContext` hook, `AudioUnlockBanner` component rendering before main panel, `handleAudioUnlock` callback. `ensureAudio()` now calls `resumeContext()` on every interaction. Passes `audioIssue` and `onAudioUnlock` to `TransportControls`.

- **2026-03-16**: Security Patch Verification for CVE-2025-55182 & CVE-2025-66478 (React2Shell)
  - **Context**: Critical RCE vulnerabilities (CVSS 10.0) affecting React Server Components were disclosed in December 2025 and are actively exploited in the wild
  - **Verification Results**: ✅ Application is FULLY PATCHED and secure
    - Next.js 16.1.6 (current version) includes all security patches for CVE-2025-66478, CVE-2025-55182, CVE-2025-55184, CVE-2025-55183, and CVE-2025-67779
    - React 19.2.4 and React-DOM 19.2.4 are secure (vulnerable versions were 19.0, 19.1.0, 19.1.1, 19.2.0)
    - npm audit: 0 vulnerabilities found
  - **Actions Performed**:
    - Verified current dependency versions against security advisories
    - Ran `npm update` to update compatible dependencies (9 packages updated)
    - Regenerated Prisma Client (v6.19.2) for compatibility verification
    - Executed full production build: ✅ Compiled successfully
    - Re-ran security audit: ✅ 0 vulnerabilities
  - **Updated Dependencies**: Minor updates to @tailwindcss/postcss (4.2.1), tailwindcss (4.2.1), @types/react (19.2.14), @types/react-dom (19.2.3), shadcn (4.0.8), and others
  - **Recommendation**: Application is production-ready from security perspective. As advised by Vercel, consider rotating application secrets as a precautionary measure post-deployment
  - **Verified**: Full build succeeds, all API routes functional, Prisma client generated, 0 security vulnerabilities

- **2026-03-16**: Pattern Variations Expansion for Intro, Outro, and Bridge Song Parts
  - **Enhanced Pattern Library** (`src/lib/pattern-library.ts`): Added 84 new pattern variations across all 7 genres
    - **Intro Variations (28 total - 4 per genre)**: Minimal Start (kick-only, DJ-friendly), Build-Up Intro (gradual instrument addition), Drop Intro (immediate full pattern), Ambient Intro (soft percussion, atmospheric)
    - **Outro Variations (28 total - 4 per genre)**: Fade Outro (gradual instrument removal), Hard Stop Outro (immediate end, abrupt), Echo Outro (reverb tail effect), Loop Outro (repeating minimal pattern)
    - **Bridge Variations (28 total - 4 additional per genre)**: Breakdown Bridge (simplified pattern), Intensity Build Bridge (crescendo), Rhythmic Shift Bridge (different time feel, syncopated), Solo Bridge (single instrument focus)
  - **Genre Coverage**: All variations implemented for House, Electronic, Lo-Fi, Pop, Rock, Hip-Hop, and Trap genres
  - **Pattern ID Scheme**: Intro (i1-i4), Outro (o1-o4), Additional Bridge (b13-b16 for rock/house/lofi/electronic/pop/hiphop, b12-b15 for trap)
  - **Complexity Levels**: Balanced mix of complexity 1 (simple/minimal), 2 (medium), and 3 (advanced/experimental) patterns
  - **BPM Ranges**: Genre-appropriate BPM ranges maintained (e.g., Lo-Fi: 68-85, House: 120-128, Trap: 135-155)
  - **Tags**: Descriptive tags added for easy filtering (e.g., "minimal", "build-up", "fade", "breakdown", "solo", "atmospheric")
  - **UI Integration**: Pattern Variation Selector (`src/components/drum-machine/pattern-variation-selector.tsx`) automatically displays new variations via `getPatternVariants()` function
  - **Total Pattern Count**: Pattern library now contains 359+ pattern variants (up from 275+), providing comprehensive coverage for all song parts
  - **Verified**: npm run build succeeds, all new patterns properly typed and integrated


- **2026-03-16**: Removed MIDI Device Panel (Complete Cleanup)
  - **Deleted File**: `src/components/drum-machine/midi-device-panel.tsx` — Removed MIDI device connection interface
  - **Modified**: `src/components/drum-machine/drum-machine.tsx` — Removed MidiDevicePanel import and CollapsibleSection for MIDI Device
  - **Modified**: `src/hooks/use-collapsible-sections.ts` — Removed "midiDevice" from SectionId type union and DEFAULT_STATES (now 8 sections instead of 9)
  - **Modified**: `src/lib/collab-types.ts` — Removed MIDI device stub types (MIDIDeviceStatus, MIDISyncConfig) that were marked for future integration
  - **Modified**: `CLAUDE.md` — Removed all references to MidiDevicePanel from UI Components lists and New Files documentation
  - **Preserved**: MIDI file export functionality (`src/lib/midi-export.ts` and `jsmidgen` dependency) remains intact — this is for exporting patterns/songs as .mid files, not device connection
  - **UI Changes**: MIDI Device section removed from drum machine collapsible panels
  - **Verified**: npm run build succeeds, no MIDI device references remain anywhere in the codebase (UI or types)

- **2026-03-16**: Dual Tutorial System (Basic + Advanced)
  - **Modified: `src/components/in-app-tour.tsx`** - Complete rewrite with dual tutorial support:
    - Tutorial selection modal with Quick Start (6 steps, ~2 min) and Full Tour (18 steps, ~5 min) options
    - Basic tutorial covers: welcome, genre/part selection, transport, pattern grid, saving
    - Advanced tutorial covers all basic content plus: editor toolbar, pattern variations, A/B variations, complexity, swing/humanize, emotion selector, style DNA, song mode, XY pad, virtual band, session recording
    - Progress bar showing completion percentage
    - Restart and switch-mode buttons available mid-tour
    - Auto-shows selector on first visit; remembers completion per mode in localStorage
    - Vintage-styled modal with Rocket/BookOpen icons matching design reference
  - **Modified: `src/app/dashboard/dashboard-content.tsx`** - Tour now shows for both authenticated and guest users (removed `!isGuest` guard)
  - **Modified: `src/components/drum-machine/song-mode-panel.tsx`** - Added `data-tour="song-mode"` attribute
  - **Modified: `src/components/drum-machine/virtual-band-panel.tsx`** - Added `data-tour="virtual-band"` attribute
  - **Modified: `src/components/drum-machine/session-recording-panel.tsx`** - Added `data-tour="session-recording"` attribute
  - **Modified: `src/components/drum-machine/xy-pad.tsx`** - Added `data-tour="xy-pad"` attribute
  - **All data-tour targets**: drum-machine, genre-selector, song-part-selector, transport-controls, pattern-grid, editor-toolbar, pattern-variation, variation-controls, complexity-slider, swing-humanize, emotion-selector, style-dna, song-mode, xy-pad, virtual-band, session-recording, save-button, load-button
  - **Verified**: npm run build succeeds

- **2026-03-16**: Expanded Pattern Variations for Intro, Outro, and Bridge Sections
  - **Modified: `src/lib/pattern-library.ts`** - Added 12 new pattern variations per genre (4 intros, 4 bridges, 4 outros) across all 7 genres (84 total new patterns):
    - **New Intro Variations** (i5-i8):
      - Reverse Cymbal Build - complexity 2, build-up with reverse cymbal sweeps and tom rolls
      - Filtered Build - complexity 2, filter sweep effect with progressive hi-hat introduction
      - Percussion Roll Intro - complexity 2, dynamic tom and clap roll build-up
      - Minimal Kick Build - complexity 1, sparse kick-only pattern for subtle intro
    - **New Bridge Variations** (b16-b20 for rock, b16-b19 for others):
      - Double-Time Intensity - complexity 3, intense 16th-note hi-hats with doubled kick pattern
      - Percussion Break - complexity 2, tom-focused break with call-and-response tom patterns
      - Minimal Stripped - complexity 1, ultra-sparse pattern for dramatic contrast
      - Reverse Pattern Bridge - complexity 2, experimental reversed kick/snare pattern
    - **New Outro Variations** (o5-o8):
      - Reverse Pattern Ending - complexity 2, reversed step sequence for experimental fade
      - Gradual Element Removal - complexity 1, progressive stripping of instruments
      - Reverb Tail Outro - complexity 2, atmospheric ending with open hats and ride emphasis
      - Echo Fade Outro - complexity 2, layered echo effect with gradual decay
  - **Genre Coverage**: All 7 genres (rock, house, electronic, lo-fi, pop, hip-hop, trap) now have comprehensive intro/bridge/outro options
  - **Total Pattern Count**: Pattern library expanded from 359+ to 443+ pattern variants
  - **BPM Ranges**: Each variation includes genre-appropriate BPM ranges (e.g., lo-fi 68-78, trap 135-150)
  - **Tags**: All patterns tagged with descriptive metadata (reverse, build, minimal, sparse, etc.)
  - **Complexity Levels**: Mix of simple (1), medium (2), and advanced (3) variations for all skill levels
  - **UI Integration**: Pattern Variation Selector automatically displays all new variations via existing `getPatternVariants()` function
  - **Verified**: npm run build succeeds, all 84 new patterns properly typed and integrated with Web Audio API synthesis
- 2026-03-16: Added spacebar keyboard shortcut for play/stop control:
  - **Global Spacebar Control**: Press spacebar to play/stop audio playback from anywhere in the app
  - **Smart Playback Toggle**:
    - If song mode is playing → stops song playback
    - If pattern mode is playing → stops pattern playback
    - If nothing is playing → starts pattern mode playback
  - **Input Field Protection**: Spacebar shortcut is disabled when typing in text inputs, textareas, or select elements
  - **Implementation**: Separate keyboard event listener added after all playback handlers are defined
  - **User Experience**: Provides immediate response to spacebar press, consistent with common audio software conventions
  - **Accessibility**: Uses `e.code === "Space"` for reliable detection across different keyboard layouts
  - **Existing Shortcuts**: Spacebar joins existing keyboard shortcuts (Ctrl+Z/Ctrl+Y for undo/redo, F key for fill trigger)

- **2026-03-16**: Redesigned XY Pad Component - Ultra-Compact Layout with Effect Categories Dropdown
  - **Modified: `src/components/drum-machine/xy-pad.tsx`** - Complete redesign for improved aesthetics and reduced footprint:
    - **Size Reduction**: Pad reduced from original 192px to final 112px (w-28 h-28) - approximately 42% smaller overall
    - **Effect Categories Dropdown**: Replaced horizontal tab system with compact dropdown selector featuring 8 comprehensive effect categories based on real Kaoss Pad models (KP3+, KP Quad):
      - **FILTERS** (4 effects): Low Pass, High Pass, Band Pass, Morphing
      - **MODULATION** (4 effects): Vinyl Break, Ring Mod, Decimator, Distortion
      - **LFO EFFECTS** (4 effects): LFO Filter, Flanger, Auto Pan, Slicer
      - **DELAY** (4 effects): Smooth Delay, Ping Pong, Multi Tap, Tape Echo
      - **REVERB** (4 effects): Hall, Room, Spring, Pump Reverb
      - **LOOPER** (4 effects): Forward Loop, Reverse Loop, Slice Loop, Break Loop
      - **VOCODER** (3 effects): Unison, Chord, Noise Voc
      - **SYNTHESIZER** (3 effects): Rez Noise, Pump Noise, Disco Siren
    - **Total Effects**: Expanded from 5 to 30+ effect types across 8 categories
    - **Space Optimization**:
      - Reduced component padding from p-4 → p-3 → p-2 (final)
      - Reduced vertical gaps from space-y-3 → space-y-2 → space-y-1.5 (final)
      - Minimized LED sizes from w-1.5 h-1.5 → w-1 h-1 → w-0.5 h-0.5 (final)
      - Reduced crosshair center dot from w-4 h-4 → w-3 h-3 → w-2.5 h-2.5 (final)
      - Reduced outer ring from w-8 h-8 → w-6 h-6 → w-5 h-5 (final)
      - Smaller axis labels (text-[0.5rem] → text-[0.45rem] → text-[0.4rem] final)
      - Compact parameter readout displays (text-[0.6rem] → text-[0.55rem] → text-[0.5rem] final)
      - Reduced all button padding and font sizes by ~15-20%
      - Reduced gaps between elements from gap-2 to gap-1.5 to gap-1
    - **Layout Improvements**:
      - Effect dropdown now spans flex-1 with max-w-[10rem] for optimal space usage
      - Target selector reduced in size (max-w-[3rem], text-[0.48rem])
      - Lock button uses smaller icon (w-2.5 h-2.5)
      - Engaged indicator with negative margin to reduce vertical space
      - Parameter displays use min-w-[5.5rem] for compact consistency
      - Dropdown max height reduced to 18rem with tighter item spacing
    - **Dropdown UX**:
      - Organized by category headers with sticky positioning
      - Scrollable dropdown (max-h-[18rem]) for comprehensive effect library
      - Active effect highlighted with arrow indicator and color coding
      - Each effect shows custom X/Y axis labels (e.g., CUTOFF/RESONANCE, TIME/FEEDBACK)
      - Reduced padding in dropdown items for more compact presentation
    - **Preserved Functionality**: All existing features maintained including:
      - XY position tracking with crosshair visualization
      - Effect intensity controls
      - Target selection (master or individual instruments)
      - Lock/unlock position
      - Power on/off
      - Radial gradient glow effect on engagement
      - LED meters for X/Y axes
      - Touch and mouse support
  - **Verified**: npm run build succeeds, component is 42% more compact while expanding effect variety by 6x and maintaining full usability

- **2026-03-16**: Added Comprehensive 3-Slot Audio Effects Rack System
  - **New File: `src/lib/effects-rack-types.ts`** - Type definitions and effect catalog for the multi-slot effects system. Defines 11 effect types (Reverb, Delay, Distortion, Low-Pass/High-Pass/Band-Pass Filter, Chorus, Flanger, Phaser, Compressor, Bitcrusher) with per-effect metadata (category, color, param labels, defaults). Includes EffectSlot, EffectTargetMode, EffectSlotParams types.
  - **New File: `src/lib/multi-effects-engine.ts`** - Web Audio API multi-slot effects processor. Supports 3 simultaneous effect slots chained in series (input → slot1 → slot2 → slot3 → output). Each slot has independent dry/wet mixing, bypass, and effect-specific parameter control. Builds audio node graphs for each effect type: convolution reverb, feedback delay, waveshaper distortion, biquad filters, LFO-modulated chorus/flanger/phaser, dynamics compressor, and ScriptProcessor bitcrusher. 30ms parameter smoothing.
  - **New File: `src/hooks/use-effects-rack.ts`** - React state management hook for the effects rack. Manages 3 EffectSlot states, master enable/disable, localStorage persistence, and syncs all changes to the multiEffectsEngine audio processor. Provides: setSlotEffect, toggleSlotEnabled, updateSlotParams, clearSlot, setSlotTargetMode, setSlotTargetInstrument.
  - **New File: `src/components/drum-machine/effects-rack-panel.tsx`** - Effects rack UI panel with vintage drum machine styling. Features: 3 effect slot rows with categorized dropdown effect selector (Space/Drive/Filter/Modulation/Dynamics/Lo-Fi), per-slot enable/bypass toggle, global vs individual drum targeting dropdown, clear button, and 3 parameter sliders (Mix, Param1, Param2) with touch support. Signal flow indicator shows active effect chain. All colors theme-aware via ThemeColors.
  - **Modified: `src/hooks/use-collapsible-sections.ts`** - Added "effectsRack" to SectionId union and DEFAULT_STATES (default: collapsed).
  - **Modified: `src/components/drum-machine/drum-machine.tsx`** - Added EffectsRackPanel import and CollapsibleSection for "Effects Rack" with AudioLines icon, positioned after XY Kaoss Pad section.
  - **Modified: `src/lib/audio-engine.ts`** - Integrated multiEffectsEngine alongside existing audioEffects engine. Both are initialized on audio context creation and disposed on cleanup.

- **2026-03-16**: Security Hardening - Rate Limiting & Header Protection
  - **Enhanced Middleware** (`src/middleware.ts`):
    - Expanded CVE-2025-29927 protection to block additional internal Next.js headers (`x-middleware-invoke`, `x-middleware-next`, `x-nextjs-data`)
    - Added `Permissions-Policy` header to middleware security headers
  - **Added Rate Limiting to All API Routes**:
    - `src/app/api/patterns/[id]/route.ts` - Added rate limiting (120 reads/min, 30 deletes/min) + existing ID validation
    - `src/app/api/songs/[id]/route.ts` - Added rate limiting (120 reads/min, 30 deletes/min) + ID validation
    - `src/app/api/style-profile/route.ts` - Added rate limiting (60 reads/min, 20 writes/min)
    - `src/app/api/collab/sessions/route.ts` - Added rate limiting to GET (60 reads/min)
    - `src/app/api/collab/sessions/[id]/route.ts` - Added rate limiting + ID validation for GET/PATCH/DELETE
    - `src/app/api/collab/sessions/[id]/leave/route.ts` - Added rate limiting (10/min) + ID validation
    - `src/app/api/collab/sessions/[id]/recordings/route.ts` - Added rate limiting + ID validation for GET/POST
    - `src/app/api/collab/recordings/route.ts` - Added rate limiting for GET (60/min) and POST (10/min)
    - `src/app/api/collab/recordings/[id]/route.ts` - Added rate limiting + ID validation for GET/DELETE
  - **New Route**: `src/app/.well-known/security.txt/route.ts` - RFC 9116 security.txt endpoint
  - **Security Audit Notes**: App already had excellent security posture including WAF (SQLi/XSS/path traversal/command injection detection), global rate limiting, CSP headers, HSTS, account lockout, timing attack prevention, and audit logging. These changes close remaining gaps in per-endpoint rate limiting and input ID validation.

- **2026-03-17**: Database Sync Verification & Email Service Configuration
  - **Database Status**: Verified database schema is up to date with all 9 migrations applied successfully
    - All models synced including User, PasswordResetToken, UserSession, SavedPattern, SavedSong, etc.
    - PostgreSQL connection verified and operational
    - No schema changes required - database already properly configured
  - **Enhanced Authentication Logging** (`src/lib/auth.ts`):
    - Added detailed logging for password comparison: `[Auth] Comparing password for: u***@example.com`
    - Enhanced login failure messages to differentiate between "user not found" and "invalid password"
    - Improved debugging for authentication flow with masked email addresses
  - **Enhanced Password Reset Logging** (`src/app/api/auth/password-reset/confirm/route.ts`):
    - Added `[Password Reset] Confirm request received` log at start of password reset process
    - Added `[Password Reset] Missing token or password` for validation failures
    - Added `[Password Reset] Token not found in database` for invalid tokens
    - Added `[Password Reset] Token already used` for reused tokens
    - Added `[Password Reset] Token expired` for expired tokens
    - Added `[Password Reset] Token validated successfully` after successful validation
    - Added `[Password Reset] ✅ Password successfully reset for user {id}` on completion
  - **New API Route**: `src/app/api/diagnostics/db/route.ts` - Database diagnostics endpoint
    - **GET /api/diagnostics/db** - Comprehensive database health check
    - Tests database connection with `SELECT 1` query
    - Verifies User table accessibility and counts users
    - Verifies PasswordResetToken table with total and active token counts
    - Verifies UserSession table with total and active session counts
    - Checks all critical environment variables (DATABASE_URL, NEXTAUTH_SECRET, RESEND_API_KEY, EMAIL_FROM, etc.)
    - Returns overall system status and readiness flag
    - Includes timestamp and detailed error messages for failed checks
    - No-cache headers for real-time diagnostics
  - **Updated Environment Configuration** (`.env`):
    - Added placeholders for `RESEND_API_KEY`, `EMAIL_FROM`, and `NEXT_PUBLIC_APP_URL`
    - Added clear comments directing users to configure these in Avery Secrets panel for production
    - Email service gracefully falls back to console logging when RESEND_API_KEY is not configured
  - **New Documentation**: `EMAIL_SETUP_GUIDE.md` - Comprehensive email configuration guide
    - Quick diagnostics section with curl commands for testing
    - Step-by-step Resend API key setup instructions
    - Domain verification guide for production use
    - Environment variable configuration for Avery Secrets panel
    - Testing methods: password reset flow and database diagnostics
    - Database sync verification using `npx prisma migrate status`
    - Troubleshooting section covering:
      - Emails not sending
      - Invalid reset links
      - Password reset failures
      - Authentication issues after password reset
      - Database sync issues and session conflicts
    - Development mode explanation (console-only email logging)
    - Production deployment checklist
    - Security notes on rate limiting, token expiry, and session invalidation
  - **Verified**: npm run build succeeds, all diagnostics endpoints operational, enhanced logging active

- **2026-03-17**: Critical Authentication System Fix — Login & Registration
  - **`src/app/api/auth/[...nextauth]/route.ts`**: Fixed critical bug where POST handler passed `{} as never` as route context, causing NextAuth to incorrectly route to Pages Router handler (`NextAuthApiHandler`) instead of App Router handler (`NextAuthRouteHandler`). The Pages Router handler expects `req.query`, `res.status()`, etc. which don't exist on App Router Request objects, causing crashes on every login attempt. Fix: properly pass `context: { params: Promise<{ nextauth: string[] }> }` to the handler.
  - **`src/lib/auth.ts`**: Simplified cookie configuration — removed conflicting explicit `cookies` config that duplicated `useSecureCookies` logic. Now relies solely on `useSecureCookies` with HTTPS detection from `NEXT_PUBLIC_APP_URL` / `NEXTAUTH_URL`. Previous config had both `useSecureCookies: true` and manual `__Secure-`/`__Host-` cookie name prefixes which could conflict.
  - **`src/app/register/page.tsx`**: Added missing `required` attribute to name input field. Without it, empty name submissions passed HTML validation but failed server-side validation with a 400 error, appearing as a broken registration flow.
  - **Verified**: npm run build succeeds, database connected with 3 existing users, bcryptjs v3 hash/compare working correctly
