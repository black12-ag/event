# Wedding Invitation App

A customizable wedding invitation web app built with Next.js, TypeScript, Tailwind CSS, and MongoDB.

## Overview

This project is a single-page wedding invitation experience with:

- animated opening screen
- personalized guest route support
- countdown section
- couple story and event timeline
- RSVP form with database storage
- wishes list with pagination
- mobile-friendly invitation layout

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- MongoDB
- Mongoose

## Project Structure

```text
app/
  [slug]/page.tsx
  api/
    get/route.ts
    submit/route.ts
  components/
    Countdown.tsx
    Form.tsx
    MainContent.tsx
    ScreenStart.tsx
    WishesList.tsx
lib/
  config.ts
  db.ts
  models/
public/
```

## Features

- configurable couple and event details through environment variables
- optional holy matrimony, reception, livestream, and prewedding sections
- personalized invitation link support through the dynamic route
- RSVP submission API backed by MongoDB
- wishes listing API with server-side pagination
- background music and image-driven invitation slides

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file and add your event and database values.

Suggested variables:

```env
MONGODB_URI=
NEXT_PUBLIC_COUPLE_NAMES=
NEXT_PUBLIC_EVENT_DATE=
NEXT_PUBLIC_GROOM_NAME=
NEXT_PUBLIC_GROOM_NICKNAME=
NEXT_PUBLIC_GROOM_INSTAGRAM=
NEXT_PUBLIC_GROOM_BIO=
NEXT_PUBLIC_BRIDE_NAME=
NEXT_PUBLIC_BRIDE_NICKNAME=
NEXT_PUBLIC_BRIDE_INSTAGRAM=
NEXT_PUBLIC_BRIDE_BIO=
NEXT_PUBLIC_BIBLE_VERSE=
NEXT_PUBLIC_BIBLE_VERSE_CONTENT=
NEXT_PUBLIC_YEAR_1=
NEXT_PUBLIC_YEAR_1_CONTENT=
NEXT_PUBLIC_YEAR_2=
NEXT_PUBLIC_YEAR_2_CONTENT=
NEXT_PUBLIC_YEAR_3=
NEXT_PUBLIC_YEAR_3_CONTENT=
NEXT_PUBLIC_HOLY_MATRIMONY=
NEXT_PUBLIC_HOLY_MATRIMONY_TIME=
NEXT_PUBLIC_HOLY_MATRIMONY_PLACE=
NEXT_PUBLIC_HOLY_MATRIMONY_PLACE_DETAILS=
NEXT_PUBLIC_HOLY_MATRIMONY_GOOGLE_MAPS=
NEXT_PUBLIC_WEDDING_RECEPTION=
NEXT_PUBLIC_WEDDING_RECEPTION_TIME=
NEXT_PUBLIC_WEDDING_RECEPTION_PLACE=
NEXT_PUBLIC_WEDDING_RECEPTION_PLACE_DETAILS=
NEXT_PUBLIC_WEDDING_RECEPTION_GOOGLE_MAPS=
NEXT_PUBLIC_LIVE_STREAMING=
NEXT_PUBLIC_LIVE_STREAMING_TIME=
NEXT_PUBLIC_LIVE_STREAMING_LINK=
NEXT_PUBLIC_LIVE_STREAMING_DETAIL=
NEXT_PUBLIC_PREWEDDING=
NEXT_PUBLIC_PREWEDDING_CODE_LINK_EMBED=
NEXT_PUBLIC_PREWEDDING_DETAIL=
NEXT_PUBLIC_RSVP=
NEXT_PUBLIC_RSVP_DETAIL=
NEXT_PUBLIC_THANKYOU=
NEXT_PUBLIC_THANKYOU_DETAIL=
```

3. Start the development server:

```bash
npm run dev
```

4. Open:

```text
http://localhost:3000
```

## Personalized Guest Links

The app supports guest-specific invitation routes through the dynamic page:

```text
/to:Guest%20Name
```

Example:

```text
http://localhost:3000/to:Abel%20Kebede
```

## Database Notes

- RSVP submissions are stored through `app/api/submit/route.ts`
- guest wishes are read from `app/api/get/route.ts`
- MongoDB connection logic lives in `lib/db.ts`

## Customization

You can customize:

- couple names
- event date
- bride and groom bios
- timeline content
- ceremony and reception details
- livestream details
- prewedding video embed
- thank-you message
- public images and music assets

## Media Assets

Update assets in `public/` to match your event branding:

- `slide_1.jpg` to `slide_9.jpg`
- `foto_1.jpg` to `foto_4.jpg`
- `foto_1_samping.jpg`
- `music/wedding_song.mp3`

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Deployment

This app can be deployed on any Next.js-compatible platform after setting the required environment variables and MongoDB connection string.

## Cloudflare Pages Setup

If you connect this repository from the Cloudflare Pages screen shown in your screenshot, use these values:

- Production branch: `main`
- Framework preset: `Next.js`
- Build command: `npm install && npm run build`
- Build output directory: `.next`
- Root directory: leave empty unless you move the project into a subfolder

### Environment Variables

Add these in Cloudflare Pages before deploying:

```env
MONGODB_URI=
NEXT_PUBLIC_COUPLE_NAMES=
NEXT_PUBLIC_EVENT_DATE=
NEXT_PUBLIC_GROOM_NAME=
NEXT_PUBLIC_GROOM_NICKNAME=
NEXT_PUBLIC_GROOM_INSTAGRAM=
NEXT_PUBLIC_GROOM_BIO=
NEXT_PUBLIC_BRIDE_NAME=
NEXT_PUBLIC_BRIDE_NICKNAME=
NEXT_PUBLIC_BRIDE_INSTAGRAM=
NEXT_PUBLIC_BRIDE_BIO=
NEXT_PUBLIC_BIBLE_VERSE=
NEXT_PUBLIC_BIBLE_VERSE_CONTENT=
NEXT_PUBLIC_YEAR_1=
NEXT_PUBLIC_YEAR_1_CONTENT=
NEXT_PUBLIC_YEAR_2=
NEXT_PUBLIC_YEAR_2_CONTENT=
NEXT_PUBLIC_YEAR_3=
NEXT_PUBLIC_YEAR_3_CONTENT=
NEXT_PUBLIC_HOLY_MATRIMONY=
NEXT_PUBLIC_HOLY_MATRIMONY_TIME=
NEXT_PUBLIC_HOLY_MATRIMONY_PLACE=
NEXT_PUBLIC_HOLY_MATRIMONY_PLACE_DETAILS=
NEXT_PUBLIC_HOLY_MATRIMONY_GOOGLE_MAPS=
NEXT_PUBLIC_WEDDING_RECEPTION=
NEXT_PUBLIC_WEDDING_RECEPTION_TIME=
NEXT_PUBLIC_WEDDING_RECEPTION_PLACE=
NEXT_PUBLIC_WEDDING_RECEPTION_PLACE_DETAILS=
NEXT_PUBLIC_WEDDING_RECEPTION_GOOGLE_MAPS=
NEXT_PUBLIC_LIVE_STREAMING=
NEXT_PUBLIC_LIVE_STREAMING_TIME=
NEXT_PUBLIC_LIVE_STREAMING_LINK=
NEXT_PUBLIC_LIVE_STREAMING_DETAIL=
NEXT_PUBLIC_PREWEDDING=
NEXT_PUBLIC_PREWEDDING_CODE_LINK_EMBED=
NEXT_PUBLIC_PREWEDDING_DETAIL=
NEXT_PUBLIC_RSVP=
NEXT_PUBLIC_RSVP_DETAIL=
NEXT_PUBLIC_THANKYOU=
NEXT_PUBLIC_THANKYOU_DETAIL=
```

### Important Note

This repository is currently a standard Next.js application using MongoDB and API routes.
If Cloudflare Pages gives you build or runtime limitations for server-side routes, the next step would be converting it to a Cloudflare Worker/OpenNext setup.
