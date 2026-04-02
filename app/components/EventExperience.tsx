"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaTelegramPlane, FaTiktok, FaWhatsapp } from "react-icons/fa";
import { EventSettings, Invite, MediaAsset, Wish } from "@/lib/types";

type EventExperienceProps = {
  invite: Invite | null;
  settings: EventSettings;
  media: MediaAsset[];
  initialWishes: Wish[];
};

const getAssetUrl = (media: MediaAsset[], slotKey: string, fallback = "") =>
  media.find((item) => item.slotKey === slotKey)?.publicUrl || fallback;

const formatDate = (value: string) =>
  new Date(value).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const getTimeLeft = (value: string) => {
  const targetDate = new Date(value);
  const now = new Date();
  const difference = targetDate.getTime() - now.getTime();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
};

export default function EventExperience({
  invite,
  settings,
  media,
  initialWishes,
}: EventExperienceProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(settings.eventDate));
  const [wishes, setWishes] = useState<Wish[]>(initialWishes);
  const [wishStatus, setWishStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [attendance, setAttendance] = useState("attending");

  const heroBackground = getAssetUrl(media, "hero-background", "/foto_2.jpg");
  const heroSide = getAssetUrl(media, "hero-side", "/foto_1_samping.jpg");
  const storyImage = getAssetUrl(media, "story-image", "/slide_4.jpg");
  const musicUrl = getAssetUrl(media, "background-music", settings.musicUrl);
  const gallery = useMemo(
    () =>
      ["gallery-1", "gallery-2", "gallery-3", "gallery-4"].map((slot, index) =>
        getAssetUrl(media, slot, `/slide_${index + 1}.jpg`)
      ),
    [media]
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft(getTimeLeft(settings.eventDate));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [settings.eventDate]);

  useEffect(() => {
    if (!invite) return;
    fetch(`/api/invitation/${invite.slug}/open`, { method: "POST" }).catch(() => null);
  }, [invite]);

  useEffect(() => {
    const audio = document.getElementById("event-audio") as HTMLAudioElement | null;
    if (!audio) return;
    if (isOpen && settings.autoplayMusic) {
      audio.play().then(() => setIsPlaying(true)).catch(() => null);
    }
  }, [isOpen, settings.autoplayMusic]);

  const toggleMusic = async () => {
    const audio = document.getElementById("event-audio") as HTMLAudioElement | null;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const handleWishSubmit = async (formData: FormData) => {
    setSubmitting(true);
    setWishStatus("");

    const payload = {
      name: String(formData.get("name") || invite?.guestName || ""),
      message: String(formData.get("message") || ""),
      attendance: String(formData.get("attendance") || "attending"),
      guests: Number(formData.get("guests") || 1),
      inviteSlug: invite?.slug || "",
    };

    const endpoint = invite ? `/api/invitation/${invite.slug}/rsvp` : "/api/submit";
    const body = invite
      ? {
          name: payload.name,
          message: payload.message,
          attendanceStatus: payload.attendance,
          bringingCount: payload.guests,
        }
      : payload;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      setWishStatus("Unable to save your response right now.");
      setSubmitting(false);
      return;
    }

    const wishesResponse = await fetch("/api/get?page=1&limit=6");
    if (wishesResponse.ok) {
      const next = await wishesResponse.json();
      setWishes(next.wishes || []);
    }

    setWishStatus("Your response has been saved.");
    setSubmitting(false);
  };

  const handleWishFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    await handleWishSubmit(formData);
    form.reset();
  };

  const isOpenInvite = invite?.inviteType === "open";
  const displayedGuestName =
    invite && invite.inviteType === "named" && invite.guestName
      ? invite.guestName
      : "Honored Guest";

  return (
    <div className="min-h-screen bg-[#120f0c] text-white">
      <audio id="event-audio" src={musicUrl} preload="auto" />

      {!isOpen ? (
        <section className="flex min-h-screen w-full flex-col md:flex-row">
          <div
            className="hidden md:flex md:w-2/3 items-end justify-center pb-12"
            style={{
              backgroundImage: `url(${heroSide})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <p className="font-ovo text-lg uppercase tracking-[5px] text-white">
              {settings.eventName}
            </p>
          </div>

          <div
            className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-6 py-16 md:w-1/3"
            style={{
              backgroundImage: `linear-gradient(rgba(14, 10, 7, 0.62), rgba(14, 10, 7, 0.84)), url(${heroBackground})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_40%)]" />
            <div className="relative flex h-full w-full max-w-md flex-col justify-between py-16 text-center">
              <div className="space-y-4">
                <p className="font-legan text-sm uppercase tracking-[0.32em] text-white">
                  {settings.subtitle}
                </p>
                <h1 className="font-ovo text-3xl uppercase tracking-[0.2em] text-white sm:text-4xl">
                  {settings.eventName}
                </h1>
                <p className="font-legan text-sm uppercase tracking-[0.18em] text-white/90">
                  {formatDate(settings.eventDate)}
                </p>
              </div>

              <div>
                <p className="text-lg uppercase tracking-[0.28em] text-white">
                  {invite && invite.inviteType === "named" && invite.guestName
                    ? `Dear ${invite.guestName},`
                    : "Welcome,"}
                </p>
                <p className="mx-auto mt-5 max-w-sm text-sm leading-7 text-white/80">
                  {settings.heroDescription}
                </p>
                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  className="mt-8 rounded-full border border-white bg-white px-6 py-2 text-xs uppercase tracking-[0.28em] text-black transition hover:bg-transparent hover:text-white"
                >
                  {settings.primaryButtonLabel}
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {isOpen ? (
        <main>
          <section
            className="relative overflow-hidden px-6 py-24"
            style={{
              backgroundImage: `linear-gradient(rgba(10, 7, 5, 0.8), rgba(10, 7, 5, 0.92)), url(${heroBackground})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <p className="font-legan text-sm uppercase tracking-[0.35em] text-[#d5b37b]">
                  Grand Opening Invitation
                </p>
                <h2 className="mt-4 font-ovo text-5xl leading-tight sm:text-6xl">
                  {settings.heroTitle}
                </h2>
                <p className="mt-6 max-w-2xl text-base leading-8 text-white/76">
                  {settings.openingNote}
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={toggleMusic}
                    className="rounded-full border border-[#d5b37b]/50 px-5 py-3 text-xs uppercase tracking-[0.3em] text-[#f1d5a4]"
                  >
                    {isPlaying ? "Pause Music" : "Play Music"}
                  </button>
                  <Link
                    href={settings.mapLink}
                    target="_blank"
                    className="rounded-full bg-[#d5b37b] px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#120f0c]"
                  >
                    {settings.directionsButtonLabel}
                  </Link>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-[#18120d]/80 p-6 backdrop-blur">
                <div className="grid gap-6 sm:grid-cols-2">
                  {[
                    { label: "Days", value: timeLeft.days },
                    { label: "Hours", value: timeLeft.hours },
                    { label: "Minutes", value: timeLeft.minutes },
                    { label: "Seconds", value: timeLeft.seconds },
                  ].map((item) => (
                    <div key={item.label} className="rounded-[1.5rem] border border-white/8 bg-white/5 p-5 text-center">
                      <p className="font-ovo text-4xl text-[#f7e4bf]">{item.value}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.24em] text-white/55">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 border-t border-white/10 pt-6">
                  <p className="text-sm uppercase tracking-[0.25em] text-white/50">Event Date</p>
                  <p className="mt-2 font-ovo text-2xl">{formatDate(settings.eventDate)}</p>
                  <p className="mt-5 text-sm uppercase tracking-[0.25em] text-white/50">Venue</p>
                  <p className="mt-2 font-ovo text-2xl">{settings.venueName}</p>
                  <p className="mt-2 text-sm leading-7 text-white/72">{settings.venueAddress}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-[#17120e] px-6 py-20">
            <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="overflow-hidden rounded-[2rem] border border-white/10">
                <img src={storyImage} alt={settings.storyTitle} className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="font-legan text-sm uppercase tracking-[0.35em] text-[#d5b37b]">
                  {settings.storyTitle}
                </p>
                <p className="mt-5 text-lg leading-9 text-white/76">{settings.storyBody}</p>
                <div className="mt-8 rounded-[1.5rem] border border-white/8 bg-white/5 p-6">
                  <p className="font-legan text-xs uppercase tracking-[0.3em] text-white/45">
                    Guest Greeting
                  </p>
                  <p className="mt-3 font-ovo text-3xl">
                    {invite && invite.inviteType === "named" && invite.guestName
                      ? `Welcome, ${invite.guestName}`
                      : "Welcome to Buna House"}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-white/68">
                    {invite
                      ? invite.inviteType === "open"
                        ? `This shareable invitation allows up to ${invite.allowedGuests} guest${invite.allowedGuests > 1 ? "s" : ""}. Please enter your name below before sending your reply.`
                        : `Your private invitation allows up to ${invite.allowedGuests} guest${invite.allowedGuests > 1 ? "s" : ""}.`
                      : "Explore the event details, leave a message, and join us for the opening celebration."}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-[#120f0c] px-6 py-20">
            <div className="mx-auto max-w-6xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="font-legan text-sm uppercase tracking-[0.35em] text-[#d5b37b]">
                    {settings.scheduleTitle}
                  </p>
                  <h3 className="mt-3 font-ovo text-4xl">What To Expect</h3>
                </div>
                <p className="max-w-2xl text-sm leading-7 text-white/68">
                  {settings.scheduleDescription}
                </p>
              </div>

              <div className="mt-10 grid gap-5 lg:grid-cols-4">
                {gallery.map((item, index) => (
                  <div key={item} className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5">
                    <img src={item} alt={`Event gallery ${index + 1}`} className="h-72 w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-[#17120e] px-6 py-20">
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
                <p className="font-legan text-sm uppercase tracking-[0.35em] text-[#d5b37b]">
                  Venue & Directions
                </p>
                <h3 className="mt-4 font-ovo text-4xl">{settings.venueName}</h3>
                <p className="mt-4 text-sm leading-7 text-white/72">{settings.venueAddress}</p>
                <Link
                  href={settings.mapLink}
                  target="_blank"
                  className="mt-6 inline-flex rounded-full bg-[#d5b37b] px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#120f0c]"
                >
                  Open In Google Maps
                </Link>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-4">
                {settings.mapEmbedUrl ? (
                  <iframe
                    src={settings.mapEmbedUrl}
                    className="h-[22rem] w-full rounded-[1.5rem]"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-[22rem] items-center justify-center rounded-[1.5rem] border border-dashed border-white/15 text-center text-sm text-white/45">
                    Add an embedded map in the admin dashboard to show it here.
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="bg-[#120f0c] px-6 py-20">
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
                <p className="font-legan text-sm uppercase tracking-[0.35em] text-[#d5b37b]">
                  {settings.rsvpTitle}
                </p>
                <h3 className="mt-4 font-ovo text-4xl">
                  {invite && invite.inviteType === "named" && invite.guestName
                    ? `Confirm Your Attendance, ${invite.guestName}`
                    : "Leave Your Response"}
                </h3>
                <p className="mt-4 text-sm leading-7 text-white/68">{settings.rsvpDescription}</p>

                <form className="mt-8 space-y-4" onSubmit={handleWishFormSubmit}>
                  <input
                    name="name"
                    defaultValue={invite && invite.inviteType === "named" ? invite.guestName : ""}
                    placeholder={isOpenInvite ? "Your name" : "Your name"}
                    className="w-full rounded-2xl border border-white/10 bg-[#0e0b09] px-4 py-3 text-sm text-white outline-none"
                    required
                    readOnly={Boolean(invite && invite.inviteType === "named" && invite.guestName)}
                  />
                  <select
                    name="attendance"
                    defaultValue="attending"
                    onChange={(event) => setAttendance(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#0e0b09] px-4 py-3 text-sm text-white outline-none"
                  >
                    <option value="attending">Attending</option>
                    <option value="not_attending">Not Attending</option>
                  </select>
                  <select
                    name="guests"
                    defaultValue={invite ? String(Math.max(1, invite.allowedGuests)) : "1"}
                    className="w-full rounded-2xl border border-white/10 bg-[#0e0b09] px-4 py-3 text-sm text-white outline-none"
                    disabled={attendance === "not_attending"}
                  >
                    {Array.from({ length: invite?.allowedGuests || 4 }, (_, index) => index + 1).map((count) => (
                      <option key={count} value={count}>
                        Bringing {count} {count === 1 ? "person" : "people"}
                      </option>
                    ))}
                  </select>
                  {invite ? (
                    <p className="text-xs leading-6 text-white/45">
                      Maximum allowed guests for this link: {invite.allowedGuests}
                    </p>
                  ) : null}
                  <textarea
                    name="message"
                    placeholder="Write your wishes or note for the event"
                    rows={5}
                    className="w-full rounded-2xl border border-white/10 bg-[#0e0b09] px-4 py-3 text-sm text-white outline-none"
                    required
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-full bg-[#d5b37b] px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#120f0c]"
                  >
                    {submitting ? "Saving..." : "Save Response"}
                  </button>
                  {wishStatus ? (
                    <p className="text-sm text-[#f5d9a4]">{wishStatus}</p>
                  ) : null}
                </form>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
                <p className="font-legan text-sm uppercase tracking-[0.35em] text-[#d5b37b]">
                  {settings.wishesTitle}
                </p>
                <div className="mt-6 space-y-5">
                  {wishes.length === 0 ? (
                    <div className="rounded-[1.5rem] border border-dashed border-white/15 p-6 text-sm text-white/50">
                      No messages yet. Be the first guest to leave a note.
                    </div>
                  ) : (
                    wishes.map((wish) => (
                      <div key={wish.id} className="rounded-[1.5rem] border border-white/8 bg-[#0f0c09] p-5">
                        <div className="flex items-center justify-between gap-4">
                          <p className="font-ovo text-xl">{wish.name}</p>
                          <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                            {wish.attendanceStatus.replace(/_/g, " ")}
                          </p>
                        </div>
                        <p className="mt-3 text-sm leading-7 text-white/70">{wish.message}</p>
                        <p className="mt-4 text-xs text-white/35">
                          {wish.createdAt
                            ? new Date(wish.createdAt).toLocaleString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              })
                            : ""}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>

          <footer className="bg-[#0b0908] px-6 py-16">
            <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-ovo text-3xl">{settings.eventName}</p>
                <p className="mt-3 max-w-xl text-sm leading-7 text-white/62">{settings.footerNote}</p>
              </div>

              <div className="flex flex-wrap gap-3 text-lg">
                {settings.instagramUrl ? (
                  <Link href={settings.instagramUrl} target="_blank" className="rounded-full border border-white/10 p-3">
                    <FaInstagram />
                  </Link>
                ) : null}
                {settings.facebookUrl ? (
                  <Link href={settings.facebookUrl} target="_blank" className="rounded-full border border-white/10 p-3">
                    <FaFacebookF />
                  </Link>
                ) : null}
                {settings.tiktokUrl ? (
                  <Link href={settings.tiktokUrl} target="_blank" className="rounded-full border border-white/10 p-3">
                    <FaTiktok />
                  </Link>
                ) : null}
                {settings.whatsappUrl ? (
                  <Link href={settings.whatsappUrl} target="_blank" className="rounded-full border border-white/10 p-3">
                    <FaWhatsapp />
                  </Link>
                ) : null}
                {settings.telegramUrl ? (
                  <Link href={settings.telegramUrl} target="_blank" className="rounded-full border border-white/10 p-3">
                    <FaTelegramPlane />
                  </Link>
                ) : null}
              </div>
            </div>
          </footer>
        </main>
      ) : null}
    </div>
  );
}
