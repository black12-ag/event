# Buna House Event Platform

An admin-managed event website for a coffee house opening, built with Next.js, Tailwind CSS, and Supabase.

## Overview

This project turns the old invitation flow into a live event platform with:

- a public landing page for the opening event
- personalized guest pages with unique invite links
- a protected admin dashboard at `/ad`
- invite tracking for link opens and RSVP responses
- editable event copy, map links, music, social links, and media slots
- Supabase-backed storage for settings, invites, wishes, and uploaded assets

## Main Routes

- `/` public event page
- `/[slug]` personalized invite page
- `/ad` admin dashboard protected by a 4-digit PIN

## Admin Features

- event settings editor
- guest invite creation with unique links
- per-invite guest allowance
- open tracking and RSVP analytics
- media upload, preview, replacement, and reset
- editable Google Maps link and embedded map URL
- editable Instagram, Facebook, TikTok, WhatsApp, and Telegram links

Default admin PIN:

```text
2580
```

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Supabase Postgres
- Supabase Storage

## Project Structure

```text
app/
  ad/page.tsx
  [slug]/page.tsx
  api/
    admin/
    get/route.ts
    invitation/[slug]/
    submit/route.ts
  components/
    AdminDashboard.tsx
    EventExperience.tsx
lib/
  admin-auth.ts
  db.ts
  defaults.ts
  event-data.ts
  types.ts
public/
supabase_schema.sql
```

## Supabase Setup

Create these environment variables before running locally or deploying:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PIN=2580
ADMIN_SESSION_SECRET=
```

Apply the database and storage schema from:

```text
/Users/munir/Documents/invetation/supabase_schema.sql
```

The schema creates:

- `event_settings`
- `invites`
- `wishes`
- `media_assets`
- storage buckets:
  - `event-images`
  - `event-audio`

## Local Development

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Admin:

```text
http://localhost:3000/ad
```

## Deployment Notes

For Cloudflare Pages:

- Production branch: `main`
- Framework preset: `Next.js`
- Build command: `npm install && npm run build`

Make sure all Supabase environment variables are configured in the deployment settings.

## Content Model

The public site is fully editable from the admin dashboard:

- event name and hero copy
- story/about section
- date and time
- venue and map links
- RSVP messaging
- footer note
- music
- image slots
- social links

## Invite Flow

Each guest gets a unique slug-based link. When they open it:

- their name appears in the hero section
- the invite is marked as opened
- they can confirm attendance
- they can choose how many guests they are bringing, up to the admin-set limit
- the admin dashboard updates with response and guest totals

## Media Behavior

- images and audio are managed by named slots
- replacing an asset updates the active public URL
- clearing a slot resets it to the default fallback asset
- old uploaded files remain in storage unless manually cleaned later

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```
