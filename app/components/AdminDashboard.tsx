"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { EventSettings, Invite, InviteSummary, MediaAsset } from "@/lib/types";
import dynamic from "next/dynamic";

const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });


type AdminDashboardProps = {
  initialAuthenticated: boolean;
};

const emptySettings: EventSettings = {
  eventName: "",
  subtitle: "",
  openingEyebrow: "",
  openingTitle: "",
  openingDescription: "",
  heroTitle: "",
  heroDescription: "",
  heroGuestPrefix: "",
  heroPendingLabel: "",
  heroAttendingLabel: "",
  heroNotAttendingLabel: "",
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
  openingEyebrow: "Small line shown before the guest clicks Open Invitation.",
  openingTitle: "Main title shown on the very first screen before the invitation is opened.",
  openingDescription: "Opening text shown before the guest clicks Open Invitation.",
  heroTitle: "Large headline shown after the invitation opens in the same hero area.",
  heroDescription: "Supporting text shown after the invitation opens.",
  heroGuestPrefix: "Short word shown before a named guest, such as Dear or Welcome.",
  heroPendingLabel: "Status label shown in the hero when the guest has not responded yet.",
  heroAttendingLabel: "Status label shown in the hero after the guest confirms attendance.",
  heroNotAttendingLabel: "Status label shown in the hero when the guest declines.",
  openingNote: "Extra welcome note shown in the hero after opening.",
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
  const [notice, setNotice] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [activePanel, setActivePanel] = useState<
    "setup" | "media" | "invites" | "tracking"
  >("setup");
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
  const [inviteBusyId, setInviteBusyId] = useState("");
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [newInvite, setNewInvite] = useState({
    guestName: "",
    allowedGuests: 1,
    notes: "",
    inviteType: "named" as "named" | "open",
  });

  const showNotice = (type: "success" | "error" | "info", message: string) => {
    setNotice({ type, message });
  };

  const clearNotice = () => setNotice(null);

  const getResponseMessage = async (response: Response, fallback: string) => {
    try {
      const payload = await response.json();
      return payload?.message || fallback;
    } catch {
      return fallback;
    }
  };

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
        showNotice("error", "Your admin session expired. Please sign in again.");
        return;
      }

      if (!settingsRes.ok || !invitesRes.ok || !mediaRes.ok) {
        showNotice("error", "We could not load all dashboard data. Please refresh and try again.");
        return;
      }

      const settingsPayload = await settingsRes.json();
      const invitesPayload = await invitesRes.json();
      const mediaPayload = await mediaRes.json();

      setSettings(settingsPayload.settings);
      setInvites(invitesPayload.invites || []);
      setSummary(invitesPayload.summary || emptySummary);
      setMedia(mediaPayload.media || []);
      clearNotice();
    } catch {
      showNotice("error", "We could not connect to Supabase right now. Please try again.");
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
    clearNotice();
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (!response.ok) {
        setError("Incorrect PIN. Please try again.");
        return;
      }
      setAuthenticated(true);
      setPin("");
      showNotice("success", "Dashboard unlocked.");
    } catch {
      setError("Unable to sign in right now. Please refresh and try again.");
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    clearNotice();
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!response.ok) {
        showNotice("error", await getResponseMessage(response, "We could not save the event settings."));
        return;
      }
      const payload = await response.json();
      setSettings(payload.settings);
      showNotice("success", "Event settings saved.");
    } catch {
      showNotice("error", "We could not save the event settings. Please try again.");
    }
    setSaving(false);
  };

  const handleMediaUpload = async (slotKey: string, type: "image" | "audio", file: File | null) => {
    if (!file) return;
    setMediaBusyKey(slotKey);
    clearNotice();
    try {
      const formData = new FormData();
      formData.append("slotKey", slotKey);
      formData.append("type", type);
      formData.append("file", file);

      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        showNotice("error", await getResponseMessage(response, "We could not upload that file."));
        return;
      }
      const payload = await response.json();
      setMedia(payload.media);
      if (slotKey === "background-music") {
        setSettings((current) => ({ ...current, musicUrl: payload.updated.public_url }));
      }
      showNotice("success", `${mediaHelp[slotKey] || "Media slot"} updated.`);
    } catch {
      showNotice("error", "We could not upload that file. Please try again.");
    }
    setMediaBusyKey("");
  };

  const handleMediaClear = async (slotKey: string) => {
    setMediaBusyKey(slotKey);
    clearNotice();
    try {
      const response = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotKey }),
      });
      if (!response.ok) {
        showNotice("error", await getResponseMessage(response, "We could not reset that media slot."));
        return;
      }
      const payload = await response.json();
      setMedia(payload.media);
      showNotice("success", "Media slot reset to the current default.");
    } catch {
      showNotice("error", "We could not reset that media slot. Please try again.");
    }
    setMediaBusyKey("");
  };

  const handleInviteCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearNotice();
    if (newInvite.inviteType === "named" && !newInvite.guestName.trim()) {
      showNotice("error", "Please enter a guest name for a named invite.");
      return;
    }
    setCreatingInvite(true);
    try {
      const response = await fetch("/api/admin/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInvite),
      });
      if (!response.ok) {
        showNotice("error", await getResponseMessage(response, "We could not create that invite."));
        return;
      }
      setNewInvite({ guestName: "", allowedGuests: 1, notes: "", inviteType: "named" });
      await loadDashboard();
      showNotice("success", "Invite created successfully.");
    } catch {
      showNotice("error", "We could not create that invite. Please try again.");
    } finally {
      setCreatingInvite(false);
    }
  };

  const handleInviteUpdate = async (invite: Invite) => {
    clearNotice();
    if (invite.inviteType === "named" && !invite.guestName.trim()) {
      showNotice("error", "Named invites must have a guest name.");
      return;
    }
    setInviteBusyId(invite.id);
    try {
      const response = await fetch(`/api/admin/invites/${invite.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invite),
      });
      if (!response.ok) {
        showNotice("error", await getResponseMessage(response, "We could not save that invite."));
        return;
      }
      await loadDashboard();
      showNotice("success", "Invite updated.");
    } catch {
      showNotice("error", "We could not save that invite. Please try again.");
    } finally {
      setInviteBusyId("");
    }
  };

  const handleInviteDelete = async (id: string) => {
    clearNotice();
    setInviteBusyId(id);
    try {
      const response = await fetch(`/api/admin/invites/${id}`, { method: "DELETE" });
      if (!response.ok) {
        showNotice("error", await getResponseMessage(response, "We could not delete that invite."));
        return;
      }
      await loadDashboard();
      showNotice("success", "Invite deleted.");
    } catch {
      showNotice("error", "We could not delete that invite. Please try again.");
    } finally {
      setInviteBusyId("");
    }
  };

  const groupedMedia = useMemo(
    () => [...media].sort((a, b) => a.sortOrder - b.sortOrder),
    [media]
  );

  const panelButtonClass = (panel: "setup" | "media" | "invites" | "tracking") =>
    `rounded-full px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] transition ${
      activePanel === panel
        ? "bg-[#d5b37b] text-[#120f0c]"
        : "border border-white/10 text-white/72 hover:border-white/20 hover:text-white"
    }`;

  const buildShareText = (invite: Invite) =>
    invite.inviteType === "open"
      ? `You are invited to ${settings.eventName}. Open your invitation here:`
      : `${invite.guestName}, you are invited to ${settings.eventName}. Open your invitation here:`;

  const shareInvite = async (invite: Invite) => {
    const inviteLink = `${window.location.origin}/${invite.slug}`;
    const text = `${buildShareText(invite)} ${inviteLink}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: settings.eventName,
          text: buildShareText(invite),
          url: inviteLink,
        });
        showNotice("success", "Share sheet opened.");
        return;
      }
      await navigator.clipboard.writeText(text);
      showNotice("success", "Invite link copied.");
    } catch {
      showNotice("error", "We could not share that link on this device.");
    }
  };

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
              placeholder="Enter 4-digit PIN"
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

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => setActivePanel("setup")} className={panelButtonClass("setup")}>
              1. Event Setup
            </button>
            <button type="button" onClick={() => setActivePanel("media")} className={panelButtonClass("media")}>
              2. Images & Music
            </button>
            <button type="button" onClick={() => setActivePanel("invites")} className={panelButtonClass("invites")}>
              3. Guest Links
            </button>
            <button type="button" onClick={() => setActivePanel("tracking")} className={panelButtonClass("tracking")}>
              4. Tracking
            </button>
          </div>
          <p className="mt-4 text-sm leading-7 text-white/62">
            Work one step at a time. The organizer does not need to use every section on every visit.
          </p>
          {notice ? (
            <div
              className={`mt-4 rounded-2xl px-4 py-3 text-sm ${
                notice.type === "success"
                  ? "bg-emerald-500/15 text-emerald-200"
                  : notice.type === "error"
                  ? "bg-rose-500/15 text-rose-200"
                  : "bg-white/10 text-white"
              }`}
            >
              {notice.message}
            </div>
          ) : null}
        </div>

        {activePanel === "setup" ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-legan text-sm uppercase tracking-[0.35em] text-[#d5b37b]">Event Settings</p>
                <h2 className="mt-3 font-ovo text-3xl">Public Site Content</h2>
                <p className="mt-3 text-sm leading-7 text-white/62">
                  Start here. These are the main words and links guests will see on the public page.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={saving}
                className="rounded-full bg-[#d5b37b] px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#120f0c] disabled:cursor-not-allowed disabled:opacity-60"
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
                    ["openingEyebrow", "Opening Eyebrow"],
                    ["openingTitle", "Opening Title"],
                    ["eventName", "Event Name"],
                    ["subtitle", "Subtitle"],
                    ["heroTitle", "Hero Title"],
                    ["primaryButtonLabel", "Open Button Label"],
                    ["heroGuestPrefix", "Guest Prefix"],
                    ["heroPendingLabel", "Pending Status Label"],
                    ["heroAttendingLabel", "Attending Status Label"],
                    ["heroNotAttendingLabel", "Not Attending Status Label"],
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
                    ["openingDescription", "Opening Description"],
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
        ) : null}

        {activePanel === "media" ? (
          <div className="space-y-8">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
              <p className="font-legan text-sm uppercase tracking-[0.35em] text-[#d5b37b]">Media Manager</p>
              <h2 className="mt-3 font-ovo text-3xl">Images & Music</h2>
              <p className="mt-3 text-sm leading-7 text-white/62">
                Replace any image or music file and it will update the same place on the public page.
              </p>
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
                        <div className="space-y-4">
                          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-2">
                            <ReactPlayer
                              url={item.slotKey === "background-music" ? (settings.musicUrl || item.publicUrl) : item.publicUrl}
                              width="100%"
                              height={item.slotKey === "background-music" ? "60px" : "40px"}
                              controls
                              config={{ file: { forceAudio: true } }}
                            />
                          </div>

                          {item.slotKey === "background-music" && (
                            <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-wider text-[#d5b37b]">
                                  YouTube or External Link
                                </p>
                                {settings.musicUrl && settings.musicUrl !== "/music/wedding_song.mp3" && (
                                  <span className="text-[10px] uppercase tracking-widest text-green-400/80">
                                    Link Active
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={settings.musicUrl}
                                  onChange={(e) => setSettings({ ...settings, musicUrl: e.target.value })}
                                  placeholder="https://www.youtube.com/watch?v=..."
                                  className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[#d5b37b]/50"
                                />
                                <button
                                  type="button"
                                  onClick={handleSaveSettings}
                                  disabled={saving}
                                  className="rounded-xl bg-[#d5b37b]/20 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#d5b37b] hover:bg-[#d5b37b]/30"
                                >
                                  Save
                                </button>
                              </div>
                              <p className="text-[10px] leading-relaxed text-white/40">
                                <span className="font-bold text-[#d5b37b]">Note:</span> Uploading an MP3 file below will take priority over this link. Clear the MP3 slot to use the YouTube link.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex flex-col gap-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-white/50">
                        {item.type === "image" ? "Upload New Image" : "Upload MP3 File"}
                      </label>
                      <input
                        type="file"
                        accept={item.type === "image" ? "image/*" : "audio/*"}
                        className="block w-full text-sm text-white/75 file:mr-4 file:rounded-full file:border-0 file:bg-[#d5b37b]/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-widest file:text-[#d5b37b] file:transition hover:file:bg-[#d5b37b]/20"
                        disabled={mediaBusyKey === item.slotKey}
                        onChange={(event) => handleMediaUpload(item.slotKey, item.type, event.target.files?.[0] || null)}
                      />
                    </div>
                    <p className="mt-2 text-xs leading-6 text-white/38">
                      {item.type === "image"
                        ? "Upload a replacement image for this exact slot on the public page."
                        : "Upload a replacement music file for the public audio player. YouTube links are also supported via the field above."}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {activePanel === "invites" ? (
          <div className="space-y-8">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
              <p className="font-legan text-sm uppercase tracking-[0.35em] text-[#d5b37b]">Create Invite</p>
              <h2 className="mt-3 font-ovo text-3xl">Guest Access</h2>
              <p className="mt-3 text-sm leading-7 text-white/62">
                Add one guest at a time. Their name will appear on the public hero section and their
                invite link will track opens and RSVP replies.
              </p>
              <form className="mt-6 space-y-4" onSubmit={handleInviteCreate}>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="grid gap-2 text-sm text-white/75">
                    Invite Type
                    <select
                      value={newInvite.inviteType}
                      onChange={(event) =>
                        setNewInvite((current) => ({
                          ...current,
                          inviteType: event.target.value === "open" ? "open" : "named",
                        }))
                      }
                      className="w-full rounded-2xl border border-white/10 bg-[#0c0907] px-4 py-3 text-white outline-none"
                    >
                      <option value="named">Named invite</option>
                      <option value="open">Open share link</option>
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm text-white/75">
                    Guest Name
                    <input
                      value={newInvite.guestName}
                      onChange={(event) => setNewInvite((current) => ({ ...current, guestName: event.target.value }))}
                      placeholder={newInvite.inviteType === "open" ? "Optional label for admin only" : "Guest name"}
                      className="w-full rounded-2xl border border-white/10 bg-[#0c0907] px-4 py-3 text-white outline-none"
                      required={newInvite.inviteType === "named"}
                    />
                  </label>
                </div>
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
                <p className="text-xs leading-6 text-white/42">
                  {newInvite.inviteType === "open"
                    ? "Create one generic link that can be shared freely. The public page will not show a fixed guest name."
                    : "Create a personalized link that shows the guest name on the public page."}
                </p>
                <textarea
                  value={newInvite.notes}
                  onChange={(event) => setNewInvite((current) => ({ ...current, notes: event.target.value }))}
                  placeholder="Admin notes"
                  rows={4}
                  className="w-full rounded-2xl border border-white/10 bg-[#0c0907] px-4 py-3 text-white outline-none"
                />
                <button
                  type="submit"
                  disabled={creatingInvite}
                  className="rounded-full bg-[#d5b37b] px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#120f0c] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creatingInvite ? "Creating Invite..." : "Add Invite"}
                </button>
              </form>
            </div>
          </div>
        ) : null}

        {activePanel === "tracking" || activePanel === "invites" ? (
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
            {invites.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-white/12 bg-[#0c0907] p-8 text-center">
                <p className="font-ovo text-2xl text-white">No guest links yet</p>
                <p className="mt-3 text-sm leading-7 text-white/62">
                  Create your first named invite or open share link in step 3, and it will appear here
                  for editing, sharing, and tracking.
                </p>
              </div>
            ) : null}
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
                        placeholder={invite.inviteType === "open" ? "Optional admin label" : "Guest name"}
                        className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                      />
                      <select
                        value={invite.inviteType}
                        onChange={(event) =>
                          setInvites((current) =>
                            current.map((item) =>
                              item.id === invite.id
                                ? { ...item, inviteType: event.target.value === "open" ? "open" : "named" }
                                : item
                            )
                          )
                        }
                        className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                      >
                        <option value="named">Named invite</option>
                        <option value="open">Open share link</option>
                      </select>
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
                      <p>Type: <span className="text-white">{invite.inviteType === "open" ? "Open share link" : "Named invite"}</span></p>
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
                        try {
                          await navigator.clipboard.writeText(inviteLink);
                          showNotice("success", "Invite link copied.");
                        } catch {
                          showNotice("error", "We could not copy that link on this device.");
                        }
                      }}
                      className="rounded-full border border-white/10 px-5 py-2 text-xs uppercase tracking-[0.25em]"
                      disabled={inviteBusyId === invite.id}
                    >
                      Copy Link
                    </button>
                    <button
                      type="button"
                      onClick={() => shareInvite(invite)}
                      className="rounded-full border border-white/10 px-5 py-2 text-xs uppercase tracking-[0.25em]"
                      disabled={inviteBusyId === invite.id}
                    >
                      Share
                    </button>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`${buildShareText(invite)} ${inviteLink}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-white/10 px-5 py-2 text-xs uppercase tracking-[0.25em]"
                    >
                      WhatsApp
                    </a>
                    <a
                      href={`https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(buildShareText(invite))}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-white/10 px-5 py-2 text-xs uppercase tracking-[0.25em]"
                    >
                      Telegram
                    </a>
                    <button
                      type="button"
                      onClick={() => handleInviteUpdate(invite)}
                      className="rounded-full bg-[#d5b37b] px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#120f0c]"
                      disabled={inviteBusyId === invite.id}
                    >
                      {inviteBusyId === invite.id ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInviteDelete(invite.id)}
                      className="rounded-full border border-rose-300/25 px-5 py-2 text-xs uppercase tracking-[0.25em] text-rose-300"
                      disabled={inviteBusyId === invite.id}
                    >
                      {inviteBusyId === invite.id ? "Working..." : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        ) : null}
      </div>
    </div>
  );
}
