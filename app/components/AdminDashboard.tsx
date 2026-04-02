"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { EventSettings, Invite, InviteSummary, MediaAsset } from "@/lib/types";

type AdminDashboardProps = {
  initialAuthenticated: boolean;
};

const emptySettings: EventSettings = {
  eventName: "",
  subtitle: "",
  heroTitle: "",
  heroDescription: "",
  openingNote: "",
  eventDate: "",
  venueName: "",
  venueAddress: "",
  mapLink: "",
  mapEmbedUrl: "",
  musicUrl: "",
  autoplayMusic: false,
  storyTitle: "",
  storyBody: "",
  scheduleTitle: "",
  scheduleDescription: "",
  rsvpTitle: "",
  rsvpDescription: "",
  wishesTitle: "",
  footerNote: "",
  primaryButtonLabel: "",
  directionsButtonLabel: "",
  instagramUrl: "",
  facebookUrl: "",
  tiktokUrl: "",
  whatsappUrl: "",
  telegramUrl: "",
};

const emptySummary: InviteSummary = {
  totalInvites: 0,
  openedCount: 0,
  respondedCount: 0,
  attendingCount: 0,
  notAttendingCount: 0,
  totalBringingCount: 0,
};

const fieldHelp: Record<string, string> = {
  eventName: "Shown as the main event name on the public opening screen and footer.",
  subtitle: "Small line above the event name on the opening screen.",
  heroTitle: "Large hero headline guests see after opening the invitation.",
  heroDescription: "Intro text shown on the first invitation screen.",
  openingNote: "Main welcome message shown in the public hero section.",
  eventDate: "Used for the event date display and live countdown.",
  venueName: "Venue name shown in the event details and map section.",
  venueAddress: "Full address shown to guests on the public page.",
  mapLink: "Google Maps directions link opened when guests click the directions button.",
  mapEmbedUrl: "Embedded map shown on the public venue section.",
  storyTitle: "Heading for the story/about section.",
  storyBody: "Main story or event description shown in the public story section.",
  scheduleTitle: "Heading above the highlights/gallery section.",
  scheduleDescription: "Short text explaining what guests should expect at the event.",
  rsvpTitle: "Heading shown above the RSVP form.",
  rsvpDescription: "Instructions shown above the RSVP form.",
  wishesTitle: "Heading above the public wishes/messages section.",
  footerNote: "Closing message shown at the bottom of the public page.",
  primaryButtonLabel: "Text on the button guests click to open the invitation.",
  directionsButtonLabel: "Text on the directions button.",
  instagramUrl: "Instagram icon link shown in the footer.",
  facebookUrl: "Facebook icon link shown in the footer.",
  tiktokUrl: "TikTok icon link shown in the footer.",
  whatsappUrl: "WhatsApp icon link shown in the footer.",
  telegramUrl: "Telegram icon link shown in the footer.",
};

const mediaHelp: Record<string, string> = {
  "hero-background": "Background image on the opening screen and the public hero section.",
  "hero-side": "Side image displayed next to the opening text on the first screen.",
  "story-image": "Main image used in the story/about section.",
  "gallery-1": "First image in the public event gallery.",
  "gallery-2": "Second image in the public event gallery.",
  "gallery-3": "Third image in the public event gallery.",
  "gallery-4": "Fourth image in the public event gallery.",
  "background-music": "Music file used by the public page audio player.",
};

export default function AdminDashboard({
  initialAuthenticated,
}: AdminDashboardProps) {
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [settings, setSettings] = useState<EventSettings>(emptySettings);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [summary, setSummary] = useState<InviteSummary>(emptySummary);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mediaBusyKey, setMediaBusyKey] = useState("");
  const [mediaMessage, setMediaMessage] = useState("");
  const [newInvite, setNewInvite] = useState({ guestName: "", allowedGuests: 1, notes: "" });

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [sessionRes, settingsRes, invitesRes, mediaRes] = await Promise.all([
        fetch("/api/admin/session"),
        fetch("/api/admin/settings"),
        fetch("/api/admin/invites"),
        fetch("/api/admin/media"),
      ]);

      if (sessionRes.status === 401 || settingsRes.status === 401) {
        setAuthenticated(false);
        return;
      }

      const settingsPayload = await settingsRes.json();
      const invitesPayload = await invitesRes.json();
      const mediaPayload = await mediaRes.json();

      setSettings(settingsPayload.settings);
      setInvites(invitesPayload.invites || []);
      setSummary(invitesPayload.summary || emptySummary);
      setMedia(mediaPayload.media || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated) loadDashboard();
  }, [authenticated]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    if (!response.ok) {
      setError("Incorrect PIN.");
      return;
    }
    setAuthenticated(true);
    setPin("");
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (response.ok) {
      const payload = await response.json();
      setSettings(payload.settings);
    }
    setSaving(false);
  };

  const handleMediaUpload = async (slotKey: string, type: "image" | "audio", file: File | null) => {
    if (!file) return;
    setMediaBusyKey(slotKey);
    setMediaMessage("");
    const formData = new FormData();
    formData.append("slotKey", slotKey);
    formData.append("type", type);
    formData.append("file", file);

    const response = await fetch("/api/admin/media", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const payload = await response.json();
      setMedia(payload.media);
      if (slotKey === "background-music") {
        setSettings((current) => ({ ...current, musicUrl: payload.updated.public_url }));
      }
      setMediaMessage("Media updated.");
    } else {
      setMediaMessage("Unable to upload that file.");
    }
    setMediaBusyKey("");
  };

  const handleMediaClear = async (slotKey: string) => {
    setMediaBusyKey(slotKey);
    setMediaMessage("");
    const response = await fetch("/api/admin/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotKey }),
    });
    if (response.ok) {
      const payload = await response.json();
      setMedia(payload.media);
      setMediaMessage("Media slot reset.");
    } else {
      setMediaMessage("Unable to clear media.");
    }
    setMediaBusyKey("");
  };

  const handleInviteCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const response = await fetch("/api/admin/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newInvite),
    });
    if (response.ok) {
      setNewInvite({ guestName: "", allowedGuests: 1, notes: "" });
      loadDashboard();
    }
  };

  const handleInviteUpdate = async (invite: Invite) => {
    await fetch(`/api/admin/invites/${invite.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invite),
    });
    loadDashboard();
  };

  const handleInviteDelete = async (id: string) => {
    await fetch(`/api/admin/invites/${id}`, { method: "DELETE" });
    loadDashboard();
  };

  const groupedMedia = useMemo(
    () => [...media].sort((a, b) => a.sortOrder - b.sortOrder),
    [media]
  );

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#110d09] px-6 text-white">
        <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur">
          <p className="font-legan text-sm uppercase tracking-[0.35em] text-[#d5b37b]">
            Admin Access
          </p>
          <h1 className="mt-4 font-ovo text-4xl">Buna House Control Room</h1>
          <form className="mt-8 space-y-4" onSubmit={handleLogin}>
            <input
              type="password"
              maxLength={4}
              inputMode="numeric"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-[#0d0a08] px-4 py-3 text-center text-2xl tracking-[0.6em] text-white outline-none"
              placeholder="2580"
            />
            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
            <button
              type="submit"
              className="w-full rounded-full bg-[#d5b37b] px-5 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-[#120f0c]"
            >
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0b08] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-legan text-sm uppercase tracking-[0.35em] text-[#d5b37b]">
              Admin Dashboard
            </p>
            <h1 className="mt-3 font-ovo text-5xl">Buna House Event Manager</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/62">
              This dashboard controls the public event page. Update the event content first, then
              replace media, then create guest links and watch responses.
            </p>
          </div>
          <button
            type="button"
            onClick={async () => {
              await fetch("/api/admin/logout", { method: "POST" });
              setAuthenticated(false);
            }}
            className="rounded-full border border-white/10 px-5 py-3 text-xs uppercase tracking-[0.25em]"
          >
            Sign Out
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          {[
            ["Invites", summary.totalInvites],
            ["Opened", summary.openedCount],
            ["Responded", summary.respondedCount],
            ["Attending", summary.attendingCount],
            ["Not Attending", summary.notAttendingCount],
            ["Total Guests", summary.totalBringingCount],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-white/45">{label}</p>
              <p className="mt-3 font-ovo text-3xl">{value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-[2rem] border border-[#d5b37b]/20 bg-[#17120d] p-8">
          <p className="font-legan text-sm uppercase tracking-[0.35em] text-[#d5b37b]">
            Admin Guide
          </p>
          <div className="mt-5 grid gap-5 md:grid-cols-4">
            <div className="rounded-[1.5rem] border border-white/8 bg-white/5 p-5">
              <p className="font-ovo text-2xl">1. Event Setup</p>
              <p className="mt-3 text-sm leading-7 text-white/68">
                Update the event name, hero text, event date, venue, map, and footer links.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/8 bg-white/5 p-5">
              <p className="font-ovo text-2xl">2. Media Slots</p>
              <p className="mt-3 text-sm leading-7 text-white/68">
                Replace each image or music slot and it will update that same place on the public page.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/8 bg-white/5 p-5">
              <p className="font-ovo text-2xl">3. Invite Guests</p>
              <p className="mt-3 text-sm leading-7 text-white/68">
                Add guest names, choose how many people they may bring, then copy each unique link.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/8 bg-white/5 p-5">
              <p className="font-ovo text-2xl">4. Track Results</p>
              <p className="mt-3 text-sm leading-7 text-white/68">
                Check who opened the link, who replied, and how many guests they confirmed.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-legan text-sm uppercase tracking-[0.35em] text-[#d5b37b]">Event Settings</p>
                <h2 className="mt-3 font-ovo text-3xl">Public Site Content</h2>
              </div>
              <button
                type="button"
                onClick={handleSaveSettings}
                className="rounded-full bg-[#d5b37b] px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#120f0c]"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>

            <div className="mt-8">
              <div className="rounded-[1.5rem] border border-white/8 bg-[#0c0907] p-5">
                <p className="font-ovo text-2xl">Hero & Opening</p>
                <p className="mt-2 text-sm leading-7 text-white/62">
                  These fields control the first screen guests see before and after opening the invitation.
                </p>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {[
                    ["eventName", "Event Name"],
                    ["subtitle", "Subtitle"],
                    ["heroTitle", "Hero Title"],
                    ["primaryButtonLabel", "Hero Button Label"],
                  ].map(([field, label]) => (
                    <label key={String(field)} className="grid gap-2 text-sm text-white/75">
                      {label}
                      <input
                        value={(settings as any)[field]}
                        onChange={(event) =>
                          setSettings((current) => ({ ...current, [field]: event.target.value }))
                        }
                        className="rounded-2xl border border-white/10 bg-[#17120d] px-4 py-3 text-white outline-none"
                      />
                      <span className="text-xs leading-6 text-white/42">
                        {fieldHelp[String(field)]}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="mt-4 grid gap-4">
                  {[
                    ["heroDescription", "Hero Description"],
                    ["openingNote", "Opening Note"],
                  ].map(([field, label]) => (
                    <label key={String(field)} className="grid gap-2 text-sm text-white/75">
                      {label}
                      <textarea
                        value={(settings as any)[field]}
                        onChange={(event) =>
                          setSettings((current) => ({ ...current, [field]: event.target.value }))
                        }
                        rows={4}
                        className="rounded-2xl border border-white/10 bg-[#17120d] px-4 py-3 text-white outline-none"
                      />
                      <span className="text-xs leading-6 text-white/42">
                        {fieldHelp[String(field)]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-[1.5rem] border border-white/8 bg-[#0c0907] p-5">
              <p className="font-ovo text-2xl">Event Details</p>
              <p className="mt-2 text-sm leading-7 text-white/62">
                These values drive the countdown, venue block, and directions button.
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {[
                  ["eventDate", "Event Date"],
                  ["venueName", "Venue Name"],
                  ["venueAddress", "Venue Address"],
                  ["directionsButtonLabel", "Directions Button Label"],
                ].map(([field, label]) => (
                  <label key={String(field)} className="grid gap-2 text-sm text-white/75">
                    {label}
                    <input
                      value={(settings as any)[field]}
                      onChange={(event) =>
                        setSettings((current) => ({ ...current, [field]: event.target.value }))
                      }
                      className="rounded-2xl border border-white/10 bg-[#17120d] px-4 py-3 text-white outline-none"
                    />
                    <span className="text-xs leading-6 text-white/42">
                      {fieldHelp[String(field)]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-[1.5rem] border border-white/8 bg-[#0c0907] p-5">
              <p className="font-ovo text-2xl">Map & Venue</p>
              <p className="mt-2 text-sm leading-7 text-white/62">
                Set the map link and optional embed shown in the venue section.
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {[
                  ["mapLink", "Google Maps Link"],
                  ["mapEmbedUrl", "Embedded Map URL"],
                ].map(([field, label]) => (
                  <label key={String(field)} className="grid gap-2 text-sm text-white/75">
                    {label}
                    <input
                      value={(settings as any)[field]}
                      onChange={(event) =>
                        setSettings((current) => ({ ...current, [field]: event.target.value }))
                      }
                      className="rounded-2xl border border-white/10 bg-[#17120d] px-4 py-3 text-white outline-none"
                    />
                    <span className="text-xs leading-6 text-white/42">
                      {fieldHelp[String(field)]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-[1.5rem] border border-white/8 bg-[#0c0907] p-5">
              <p className="font-ovo text-2xl">Story & Schedule</p>
              <p className="mt-2 text-sm leading-7 text-white/62">
                These fields control the story section and the event highlights area on the public page.
              </p>
              <div className="mt-5 grid gap-4">
                {[
                  ["storyTitle", "Story Title"],
                  ["storyBody", "Story Body"],
                  ["scheduleTitle", "Schedule Title"],
                  ["scheduleDescription", "Schedule Description"],
                ].map(([field, label]) => (
                  <label key={String(field)} className="grid gap-2 text-sm text-white/75">
                    {label}
                    {String(field).toLowerCase().includes("body") ||
                    String(field).toLowerCase().includes("description") ? (
                      <textarea
                        value={(settings as any)[field]}
                        onChange={(event) =>
                          setSettings((current) => ({ ...current, [field]: event.target.value }))
                        }
                        rows={4}
                        className="rounded-2xl border border-white/10 bg-[#17120d] px-4 py-3 text-white outline-none"
                      />
                    ) : (
                      <input
                        value={(settings as any)[field]}
                        onChange={(event) =>
                          setSettings((current) => ({ ...current, [field]: event.target.value }))
                        }
                        className="rounded-2xl border border-white/10 bg-[#17120d] px-4 py-3 text-white outline-none"
                      />
                    )}
                    <span className="text-xs leading-6 text-white/42">
                      {fieldHelp[String(field)]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-[1.5rem] border border-white/8 bg-[#0c0907] p-5">
              <p className="font-ovo text-2xl">RSVP & Wishes</p>
              <p className="mt-2 text-sm leading-7 text-white/62">
                These fields explain the RSVP form and the public guest message section.
              </p>
              <div className="mt-5 grid gap-4">
                {[
                  ["rsvpTitle", "RSVP Title"],
                  ["rsvpDescription", "RSVP Description"],
                  ["wishesTitle", "Wishes Title"],
                  ["footerNote", "Footer Note"],
                ].map(([field, label]) => (
                  <label key={String(field)} className="grid gap-2 text-sm text-white/75">
                    {label}
                    {String(field).toLowerCase().includes("description") ||
                    String(field).toLowerCase().includes("note") ? (
                      <textarea
                        value={(settings as any)[field]}
                        onChange={(event) =>
                          setSettings((current) => ({ ...current, [field]: event.target.value }))
                        }
                        rows={4}
                        className="rounded-2xl border border-white/10 bg-[#17120d] px-4 py-3 text-white outline-none"
                      />
                    ) : (
                      <input
                        value={(settings as any)[field]}
                        onChange={(event) =>
                          setSettings((current) => ({ ...current, [field]: event.target.value }))
                        }
                        className="rounded-2xl border border-white/10 bg-[#17120d] px-4 py-3 text-white outline-none"
                      />
                    )}
                    <span className="text-xs leading-6 text-white/42">
                      {fieldHelp[String(field)]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-[1.5rem] border border-white/8 bg-[#0c0907] p-5">
              <p className="font-ovo text-2xl">Social Links & Music</p>
              <p className="mt-2 text-sm leading-7 text-white/62">
                These links appear in the footer and the music toggle controls the public audio player.
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[
                ["instagramUrl", "Instagram"],
                ["facebookUrl", "Facebook"],
                ["tiktokUrl", "TikTok"],
                ["whatsappUrl", "WhatsApp"],
                ["telegramUrl", "Telegram"],
              ].map(([field, label]) => (
                <label key={String(field)} className="grid gap-2 text-sm text-white/75">
                  {label}
                  <input
                    value={(settings as any)[field]}
                    onChange={(event) =>
                      setSettings((current) => ({ ...current, [field]: event.target.value }))
                    }
                    className="rounded-2xl border border-white/10 bg-[#17120d] px-4 py-3 text-white outline-none"
                  />
                  <span className="text-xs leading-6 text-white/42">
                    {fieldHelp[String(field)]}
                  </span>
                </label>
              ))}
              </div>
              <label className="flex items-center gap-3 text-sm text-white/75">
                <input
                  type="checkbox"
                  checked={settings.autoplayMusic}
                  onChange={(event) =>
                    setSettings((current) => ({ ...current, autoplayMusic: event.target.checked }))
                  }
                />
                Autoplay music on the public site
              </label>
              <p className="mt-2 text-xs leading-6 text-white/42">
                Turn this on only if you want the public page music to start automatically after the
                invitation is opened.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
              <p className="font-legan text-sm uppercase tracking-[0.35em] text-[#d5b37b]">Create Invite</p>
              <h2 className="mt-3 font-ovo text-3xl">Guest Access</h2>
              <p className="mt-3 text-sm leading-7 text-white/62">
                Add one guest at a time. Their name will appear on the public hero section and their
                invite link will track opens and RSVP replies.
              </p>
              <form className="mt-6 space-y-4" onSubmit={handleInviteCreate}>
                <input
                  value={newInvite.guestName}
                  onChange={(event) => setNewInvite((current) => ({ ...current, guestName: event.target.value }))}
                  placeholder="Guest name"
                  className="w-full rounded-2xl border border-white/10 bg-[#0c0907] px-4 py-3 text-white outline-none"
                  required
                />
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={newInvite.allowedGuests}
                  onChange={(event) =>
                    setNewInvite((current) => ({ ...current, allowedGuests: Number(event.target.value) || 1 }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-[#0c0907] px-4 py-3 text-white outline-none"
                />
                <textarea
                  value={newInvite.notes}
                  onChange={(event) => setNewInvite((current) => ({ ...current, notes: event.target.value }))}
                  placeholder="Admin notes"
                  rows={4}
                  className="w-full rounded-2xl border border-white/10 bg-[#0c0907] px-4 py-3 text-white outline-none"
                />
                <button
                  type="submit"
                  className="rounded-full bg-[#d5b37b] px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#120f0c]"
                >
                  Add Invite
                </button>
              </form>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
              <p className="font-legan text-sm uppercase tracking-[0.35em] text-[#d5b37b]">Media Manager</p>
              {mediaMessage ? (
                <p className="mt-3 text-sm text-[#f1d5a4]">{mediaMessage}</p>
              ) : null}
              <div className="mt-6 space-y-5">
                {groupedMedia.map((item) => (
                  <div key={item.slotKey} className="rounded-[1.5rem] border border-white/8 bg-[#0c0907] p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-ovo text-xl">{item.label}</p>
                        <p className="text-xs uppercase tracking-[0.24em] text-white/38">{item.slotKey}</p>
                        <p className="mt-2 text-xs leading-6 text-white/42">
                          {mediaHelp[item.slotKey] || "This slot updates one part of the public page."}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleMediaClear(item.slotKey)}
                        disabled={mediaBusyKey === item.slotKey}
                        className="text-xs uppercase tracking-[0.28em] text-rose-300"
                      >
                        {mediaBusyKey === item.slotKey ? "Working..." : "Clear"}
                      </button>
                    </div>
                    <div className="mt-4">
                      {item.type === "image" ? (
                        <img src={item.publicUrl} alt={item.label} className="h-40 w-full rounded-2xl object-cover" />
                      ) : (
                        <audio controls className="w-full" src={item.publicUrl} />
                      )}
                    </div>
                    <input
                      type="file"
                      accept={item.type === "image" ? "image/*" : "audio/*"}
                      className="mt-4 block w-full text-sm text-white/75"
                      disabled={mediaBusyKey === item.slotKey}
                      onChange={(event) => handleMediaUpload(item.slotKey, item.type, event.target.files?.[0] || null)}
                    />
                    <p className="mt-2 text-xs leading-6 text-white/38">
                      {item.type === "image"
                        ? "Upload a replacement image for this exact slot on the public page."
                        : "Upload a replacement music file for the public audio player."}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-legan text-sm uppercase tracking-[0.35em] text-[#d5b37b]">Invite Manager</p>
              <h2 className="mt-3 font-ovo text-3xl">Guest Links and Attendance</h2>
              <p className="mt-3 text-sm leading-7 text-white/62">
                Use this list to manage guest names, copy each unique link, and monitor opens, replies,
                and total guests coming with them.
              </p>
            </div>
            {loading ? <p className="text-sm text-white/50">Refreshing...</p> : null}
          </div>

          <div className="mt-8 grid gap-5">
            {invites.map((invite) => {
              const inviteLink =
                typeof window === "undefined"
                  ? `/${invite.slug}`
                  : `${window.location.origin}/${invite.slug}`;

              return (
                <div key={invite.id} className="rounded-[1.5rem] border border-white/8 bg-[#0c0907] p-5">
                  <div className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
                    <div className="grid gap-4 md:grid-cols-2">
                      <input
                        value={invite.guestName}
                        onChange={(event) =>
                          setInvites((current) =>
                            current.map((item) =>
                              item.id === invite.id ? { ...item, guestName: event.target.value } : item
                            )
                          )
                        }
                        className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                      />
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={invite.allowedGuests}
                        onChange={(event) =>
                          setInvites((current) =>
                            current.map((item) =>
                              item.id === invite.id
                                ? { ...item, allowedGuests: Number(event.target.value) || 1 }
                                : item
                            )
                          )
                        }
                        className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                      />
                      <textarea
                        value={invite.notes}
                        onChange={(event) =>
                          setInvites((current) =>
                            current.map((item) =>
                              item.id === invite.id ? { ...item, notes: event.target.value } : item
                            )
                          )
                        }
                        rows={3}
                        className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none md:col-span-2"
                      />
                      <input
                        readOnly
                        value={inviteLink}
                        className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white/70 outline-none md:col-span-2"
                      />
                    </div>
                    <div className="rounded-[1.5rem] border border-white/8 bg-white/5 p-4 text-sm text-white/72">
                      <p>Opened: <span className="text-white">{invite.openedAt ? "Yes" : "No"}</span></p>
                      <p className="mt-2">Response: <span className="text-white">{invite.attendanceStatus}</span></p>
                      <p className="mt-2">Bringing: <span className="text-white">{invite.bringingCount}</span></p>
                      <p className="mt-2">Opened at: <span className="text-white">{invite.openedAt || "Not yet"}</span></p>
                      <p className="mt-2">Responded at: <span className="text-white">{invite.respondedAt || "Not yet"}</span></p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={async () => {
                        await navigator.clipboard.writeText(inviteLink);
                      }}
                      className="rounded-full border border-white/10 px-5 py-2 text-xs uppercase tracking-[0.25em]"
                    >
                      Copy Link
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInviteUpdate(invite)}
                      className="rounded-full bg-[#d5b37b] px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#120f0c]"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInviteDelete(invite.id)}
                      className="rounded-full border border-rose-300/25 px-5 py-2 text-xs uppercase tracking-[0.25em] text-rose-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
