# BeatForge 808 🥁

A vintage drum machine pattern generator web app with real-time playback, 7 music genres, and comprehensive user authentication.

## Features

- 🎵 **Pattern Generation** - Create 16-step drum patterns across 7 genres (House, Electronic, Lo-Fi, Pop, Rock, Hip-Hop, Trap)
- 🎼 **Song Mode** - Arrange patterns into complete songs with intro, verse, chorus, bridge, and outro
- 🎚️ **Advanced Controls** - Swing, humanization, complexity sliders, and XY pad effects
- 🎹 **Web Audio API** - Real-time synthesized drum sounds (no sample files)
- 💾 **Save/Load** - Persist your patterns and songs to the database
- 🎵 **MIDI Export** - Export patterns and full songs as MIDI files
- 👤 **User Accounts** - Register, login, and manage your creations
- 🔐 **Secure Auth** - NextAuth.js with email-based password reset via Resend
- 🎨 **Theme Support** - Default, Dark Neon, and Light Neon themes

## Quick Start

### 1. Environment Setup

Copy the environment template and configure required variables:

```bash
cp .env.example .env.local
```

See **[SETUP.md](./SETUP.md)** for detailed configuration instructions, especially for:
- Setting up Resend for password reset emails
- Configuring NextAuth
- Production deployment

### 2. Key Environment Variables

**Required:**
- `DATABASE_URL` - PostgreSQL database (managed by Avery)
- `NEXTAUTH_SECRET` - Session encryption key

**For Email Features (Password Reset):**
- `RESEND_API_KEY` - Get from [https://resend.com/api-keys](https://resend.com/api-keys)
- `EMAIL_FROM` - Sender email address
- `NEXT_PUBLIC_APP_URL` - Application URL for email links

**For Production:**
- `NEXTAUTH_URL` - Your production domain

### 3. Development Server

The preview system automatically starts the development server. The app will be available in the preview panel.

## Documentation

- **[SETUP.md](./SETUP.md)** - Complete setup guide including Resend email configuration
- **[CLAUDE.md](./CLAUDE.md)** - Architecture documentation and codebase overview
- **[PRODUCTION_AUTH_FIX.md](./PRODUCTION_AUTH_FIX.md)** - Production authentication setup

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── login/                # Login form
│   ├── register/             # Registration form
│   ├── forgot-password/      # Password reset request
│   ├── reset-password/       # Password reset confirmation
│   ├── dashboard/            # Main drum machine interface
│   ├── admin/                # Admin user management
│   └── api/
│       ├── auth/             # Authentication endpoints
│       ├── patterns/         # Pattern save/load endpoints
│       └── songs/            # Song save/load endpoints
├── components/
│   └── drum-machine/         # Drum machine UI components
├── lib/
│   ├── auth.ts              # NextAuth configuration
│   ├── email.ts             # Email service (Resend)
│   ├── audio-engine.ts      # Web Audio synthesizer
│   └── ...
└── types/
```

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Database**: PostgreSQL with Prisma ORM v6
- **Authentication**: NextAuth.js v4
- **Email**: Resend (password reset emails)
- **Audio**: Web Audio API
- **Icons**: Lucide React

## Common Tasks

### Setting Up Password Reset Emails

1. Sign up for free at [https://resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Add to your environment:
   ```env
   RESEND_API_KEY=re_your_api_key_here
   EMAIL_FROM=noreply@yourdomain.com
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```
4. For production, verify your domain in Resend dashboard

See **[SETUP.md](./SETUP.md)** for detailed instructions.

### Testing Password Reset in Development

- With `RESEND_API_KEY` configured: Real emails sent via Resend
- Without configuration: Reset links logged to console (perfect for testing)

### Deploying to Production

1. Set environment variables in Avery Secrets panel
2. Ensure `NEXTAUTH_URL` matches your production domain
3. Verify your email domain in Resend dashboard
4. See **[PRODUCTION_AUTH_FIX.md](./PRODUCTION_AUTH_FIX.md)** for checklist

## Architecture

See **[CLAUDE.md](./CLAUDE.md)** for detailed architecture documentation including:
- Database schema (User, PasswordResetToken, SavedPattern, SavedSong)
- API routes and endpoints
- Component architecture
- State management patterns

## Troubleshooting

### Password Reset Emails Not Working

1. Check that `RESEND_API_KEY` is set in environment variables
2. Verify the key starts with `re_`
3. Check console for development mode messages
4. See **[SETUP.md](./SETUP.md#troubleshooting)** for detailed troubleshooting

### Authentication Issues

See **[PRODUCTION_AUTH_FIX.md](./PRODUCTION_AUTH_FIX.md)** for:
- Email case sensitivity fixes
- Database connection verification
- NextAuth configuration
- Diagnostic tools

## Next Steps

1. **Users**: Create your first account via the register page
2. **Explore**: Try creating patterns across different genres
3. **Save**: Save your favorite patterns and songs
4. **Export**: Download your creations as MIDI files
5. **Customize**: Modify drum machine sounds in `src/lib/audio-engine.ts`

## Support

- Review the setup guides above
- Check the codebase in `src/`
- Look at the diagnostic endpoints in `src/app/api/auth/`

---

Built with ❤️ using Next.js and Web Audio API
