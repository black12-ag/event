import crypto from "crypto";
import { defaultEventSettings, defaultMediaAssets } from "./defaults";
import { getSupabaseAdmin } from "./db";
import { EventSettings, Invite, InviteSummary, MediaAsset, Wish } from "./types";

const EVENT_SETTINGS_TABLE = "event_settings";
const INVITES_TABLE = "invites";
const WISHES_TABLE = "wishes";
const MEDIA_TABLE = "media_assets";
const IMAGE_BUCKET = "event-images";
const AUDIO_BUCKET = "event-audio";

const toSnakeEventSettings = (settings: EventSettings) => ({
  event_name: settings.eventName,
  subtitle: settings.subtitle,
  hero_title: settings.heroTitle,
  hero_description: settings.heroDescription,
  opening_note: settings.openingNote,
  event_date: settings.eventDate,
  venue_name: settings.venueName,
  venue_address: settings.venueAddress,
  map_link: settings.mapLink,
  map_embed_url: settings.mapEmbedUrl,
  music_url: settings.musicUrl,
  autoplay_music: settings.autoplayMusic,
  story_title: settings.storyTitle,
  story_body: settings.storyBody,
  schedule_title: settings.scheduleTitle,
  schedule_description: settings.scheduleDescription,
  rsvp_title: settings.rsvpTitle,
  rsvp_description: settings.rsvpDescription,
  wishes_title: settings.wishesTitle,
  footer_note: settings.footerNote,
  primary_button_label: settings.primaryButtonLabel,
  directions_button_label: settings.directionsButtonLabel,
  instagram_url: settings.instagramUrl,
  facebook_url: settings.facebookUrl,
  tiktok_url: settings.tiktokUrl,
  whatsapp_url: settings.whatsappUrl,
  telegram_url: settings.telegramUrl,
});

const toCamelEventSettings = (item: any): EventSettings => ({
  id: item.id,
  eventName: item.event_name ?? defaultEventSettings.eventName,
  subtitle: item.subtitle ?? defaultEventSettings.subtitle,
  heroTitle: item.hero_title ?? defaultEventSettings.heroTitle,
  heroDescription: item.hero_description ?? defaultEventSettings.heroDescription,
  openingNote: item.opening_note ?? defaultEventSettings.openingNote,
  eventDate: item.event_date ?? defaultEventSettings.eventDate,
  venueName: item.venue_name ?? defaultEventSettings.venueName,
  venueAddress: item.venue_address ?? defaultEventSettings.venueAddress,
  mapLink: item.map_link ?? defaultEventSettings.mapLink,
  mapEmbedUrl: item.map_embed_url ?? defaultEventSettings.mapEmbedUrl,
  musicUrl: item.music_url ?? defaultEventSettings.musicUrl,
  autoplayMusic: Boolean(item.autoplay_music ?? defaultEventSettings.autoplayMusic),
  storyTitle: item.story_title ?? defaultEventSettings.storyTitle,
  storyBody: item.story_body ?? defaultEventSettings.storyBody,
  scheduleTitle: item.schedule_title ?? defaultEventSettings.scheduleTitle,
  scheduleDescription:
    item.schedule_description ?? defaultEventSettings.scheduleDescription,
  rsvpTitle: item.rsvp_title ?? defaultEventSettings.rsvpTitle,
  rsvpDescription: item.rsvp_description ?? defaultEventSettings.rsvpDescription,
  wishesTitle: item.wishes_title ?? defaultEventSettings.wishesTitle,
  footerNote: item.footer_note ?? defaultEventSettings.footerNote,
  primaryButtonLabel:
    item.primary_button_label ?? defaultEventSettings.primaryButtonLabel,
  directionsButtonLabel:
    item.directions_button_label ?? defaultEventSettings.directionsButtonLabel,
  instagramUrl: item.instagram_url ?? defaultEventSettings.instagramUrl,
  facebookUrl: item.facebook_url ?? defaultEventSettings.facebookUrl,
  tiktokUrl: item.tiktok_url ?? defaultEventSettings.tiktokUrl,
  whatsappUrl: item.whatsapp_url ?? defaultEventSettings.whatsappUrl,
  telegramUrl: item.telegram_url ?? defaultEventSettings.telegramUrl,
});

const toCamelMedia = (item: any): MediaAsset => ({
  id: item.id,
  slotKey: item.slot_key,
  type: item.type,
  label: item.label,
  publicUrl: item.public_url,
  storagePath: item.storage_path,
  sortOrder: item.sort_order ?? 0,
  active: item.active ?? true,
});

const toCamelInvite = (item: any): Invite => ({
  id: item.id,
  guestName: item.guest_name ?? "",
  slug: item.slug,
  inviteType: item.is_generic ? "open" : "named",
  allowedGuests: item.allowed_guests ?? 1,
  attendanceStatus: item.attendance_status ?? "pending",
  bringingCount: item.bringing_count ?? 0,
  openedAt: item.opened_at ?? null,
  respondedAt: item.responded_at ?? null,
  notes: item.notes ?? "",
  createdAt: item.created_at ?? null,
  updatedAt: item.updated_at ?? null,
});

const toCamelWish = (item: any): Wish => ({
  id: item.id,
  inviteId: item.invite_id ?? null,
  name: item.name,
  message: item.message,
  attendanceStatus: item.attendance_status ?? "pending",
  guests: item.guests ?? 0,
  createdAt: item.created_at ?? null,
});

const mediaDefaultsMap = new Map(defaultMediaAssets.map((item) => [item.slotKey, item]));

const getSlug = (value: string) => {
  const base = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const token = crypto.randomBytes(3).toString("hex");
  return `${base || "guest"}-${token}`;
};

export const getDefaultImage = (slotKey: string) =>
  mediaDefaultsMap.get(slotKey)?.publicUrl || "";

export const getDefaultAudio = () =>
  defaultMediaAssets.find((asset) => asset.type === "audio")?.publicUrl || "";

export const ensureSeedData = async () => {
  try {
    const supabase = getSupabaseAdmin();

    const { data: settingsRows } = await supabase
      .from(EVENT_SETTINGS_TABLE)
      .select("id")
      .limit(1);

    if (!settingsRows || settingsRows.length === 0) {
      await supabase.from(EVENT_SETTINGS_TABLE).insert([toSnakeEventSettings(defaultEventSettings)]);
    }

    const { data: mediaRows } = await supabase
      .from(MEDIA_TABLE)
      .select("slot_key")
      .limit(20);

    const existing = new Set((mediaRows || []).map((row: any) => row.slot_key));
    const missing = defaultMediaAssets.filter((item) => !existing.has(item.slotKey));

    if (missing.length > 0) {
      await supabase.from(MEDIA_TABLE).insert(
        missing.map((item) => ({
          slot_key: item.slotKey,
          type: item.type,
          label: item.label,
          public_url: item.publicUrl,
          storage_path: item.storagePath,
          sort_order: item.sortOrder,
          active: item.active,
        }))
      );
    }
  } catch (error) {
    console.error("Seed data error:", error);
  }
};

export const getEventSettings = async (): Promise<EventSettings> => {
  try {
    await ensureSeedData();
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from(EVENT_SETTINGS_TABLE)
      .select("*")
      .limit(1)
      .single();

    if (error || !data) {
      return defaultEventSettings;
    }

    return toCamelEventSettings(data);
  } catch {
    return defaultEventSettings;
  }
};

export const saveEventSettings = async (settings: EventSettings) => {
  const supabase = getSupabaseAdmin();
  const payload = {
    ...toSnakeEventSettings(settings),
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase
    .from(EVENT_SETTINGS_TABLE)
    .select("id")
    .limit(1)
    .single();

  if (existing?.id) {
    await supabase.from(EVENT_SETTINGS_TABLE).update(payload).eq("id", existing.id);
  } else {
    await supabase.from(EVENT_SETTINGS_TABLE).insert([payload]);
  }

  return getEventSettings();
};

export const getMediaAssets = async (): Promise<MediaAsset[]> => {
  try {
    await ensureSeedData();
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from(MEDIA_TABLE)
      .select("*")
      .order("sort_order", { ascending: true });

    if (error || !data) {
      return defaultMediaAssets;
    }

    return defaultMediaAssets.map((item) => {
      const found = data.find((row: any) => row.slot_key === item.slotKey);
      return found ? toCamelMedia(found) : item;
    });
  } catch {
    return defaultMediaAssets;
  }
};

export const uploadMediaAsset = async (slotKey: string, type: "image" | "audio", file: File) => {
  const supabase = getSupabaseAdmin();
  const bucket = type === "audio" ? AUDIO_BUCKET : IMAGE_BUCKET;
  const extension = file.name.split(".").pop() || "bin";
  const path = `${slotKey}/${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);
  const fallback = mediaDefaultsMap.get(slotKey);

  const payload = {
    slot_key: slotKey,
    type,
    label: fallback?.label || slotKey,
    public_url: publicData.publicUrl,
    storage_path: `${bucket}/${path}`,
    sort_order: fallback?.sortOrder ?? 0,
    active: true,
  };

  const { data: existing } = await supabase
    .from(MEDIA_TABLE)
    .select("id")
    .eq("slot_key", slotKey)
    .maybeSingle();

  if (existing?.id) {
    await supabase.from(MEDIA_TABLE).update(payload).eq("id", existing.id);
  } else {
    await supabase.from(MEDIA_TABLE).insert([payload]);
  }

  return payload;
};

export const clearMediaAsset = async (slotKey: string) => {
  const supabase = getSupabaseAdmin();
  const fallback = mediaDefaultsMap.get(slotKey);

  if (!fallback) return null;

  const payload = {
    public_url: fallback.publicUrl,
    storage_path: null,
    updated_at: new Date().toISOString(),
  };

  await supabase.from(MEDIA_TABLE).update(payload).eq("slot_key", slotKey);
  return getMediaAssets();
};

export const listInvites = async (): Promise<Invite[]> => {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from(INVITES_TABLE)
      .select("*")
      .order("created_at", { ascending: true });

    if (error || !data) return [];
    return data.map(toCamelInvite);
  } catch {
    return [];
  }
};

export const getInviteSummary = async (): Promise<InviteSummary> => {
  const invites = await listInvites();
  return {
    totalInvites: invites.length,
    openedCount: invites.filter((item) => Boolean(item.openedAt)).length,
    respondedCount: invites.filter((item) => item.attendanceStatus !== "pending").length,
    attendingCount: invites.filter((item) => item.attendanceStatus === "attending").length,
    notAttendingCount: invites.filter((item) => item.attendanceStatus === "not_attending").length,
    totalBringingCount: invites.reduce((sum, item) => sum + (item.bringingCount || 0), 0),
  };
};

export const createInvite = async (
  guestName: string,
  allowedGuests: number,
  notes: string,
  inviteType: "named" | "open" = "named"
) => {
  const supabase = getSupabaseAdmin();
  const normalizedName =
    inviteType === "open" ? "" : guestName.trim();
  const payload = {
    guest_name: normalizedName,
    slug: getSlug(normalizedName || "open-invite"),
    is_generic: inviteType === "open",
    allowed_guests: Math.max(1, allowedGuests),
    attendance_status: "pending",
    bringing_count: 0,
    notes,
  };

  const { data, error } = await supabase
    .from(INVITES_TABLE)
    .insert([payload])
    .select("*")
    .single();

  if (error) throw error;
  return toCamelInvite(data);
};

export const updateInvite = async (id: string, updates: Partial<Invite>) => {
  const supabase = getSupabaseAdmin();
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.guestName !== undefined) payload.guest_name = updates.guestName;
  if (updates.inviteType !== undefined) payload.is_generic = updates.inviteType === "open";
  if (updates.allowedGuests !== undefined) payload.allowed_guests = updates.allowedGuests;
  if (updates.notes !== undefined) payload.notes = updates.notes;
  if (updates.attendanceStatus !== undefined) payload.attendance_status = updates.attendanceStatus;
  if (updates.bringingCount !== undefined) payload.bringing_count = updates.bringingCount;
  if (updates.openedAt !== undefined) payload.opened_at = updates.openedAt;
  if (updates.respondedAt !== undefined) payload.responded_at = updates.respondedAt;

  const { error } = await supabase.from(INVITES_TABLE).update(payload).eq("id", id);
  if (error) throw error;
};

export const deleteInvite = async (id: string) => {
  const supabase = getSupabaseAdmin();
  await supabase.from(WISHES_TABLE).delete().eq("invite_id", id);
  await supabase.from(INVITES_TABLE).delete().eq("id", id);
};

export const getInviteBySlug = async (slug: string): Promise<Invite | null> => {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from(INVITES_TABLE)
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) return null;
    return toCamelInvite(data);
  } catch {
    return null;
  }
};

export const markInviteOpened = async (slug: string) => {
  const invite = await getInviteBySlug(slug);
  if (!invite) return null;

  const now = new Date().toISOString();
  await updateInvite(invite.id, {
    openedAt: invite.openedAt || now,
  });

  return now;
};

export const submitInviteRsvp = async (
  slug: string,
  name: string,
  message: string,
  attendanceStatus: "attending" | "not_attending",
  bringingCount: number
) => {
  const supabase = getSupabaseAdmin();
  const invite = await getInviteBySlug(slug);

  if (!invite) {
    throw new Error("Invite not found.");
  }

  const cappedGuests =
    attendanceStatus === "attending"
      ? Math.min(Math.max(bringingCount, 1), invite.allowedGuests)
      : 0;

  await updateInvite(invite.id, {
    attendanceStatus,
    bringingCount: cappedGuests,
    respondedAt: new Date().toISOString(),
  });

  const { data: existing } = await supabase
    .from(WISHES_TABLE)
    .select("id")
    .eq("invite_id", invite.id)
    .maybeSingle();

  const payload = {
    invite_id: invite.id,
    name,
    message,
    attendance_status: attendanceStatus,
    guests: cappedGuests,
    updated_at: new Date().toISOString(),
  };

  if (existing?.id) {
    await supabase.from(WISHES_TABLE).update(payload).eq("id", existing.id);
  } else {
    await supabase.from(WISHES_TABLE).insert([payload]);
  }

};

export const listWishes = async (page = 1, limit = 6) => {
  try {
    const supabase = getSupabaseAdmin();
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, count, error } = await supabase
      .from(WISHES_TABLE)
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error || !data) {
      return { wishes: [], totalPages: 1, currentPage: page };
    }

    return {
      wishes: data.map(toCamelWish),
      totalPages: Math.max(1, Math.ceil((count || 0) / limit)),
      currentPage: page,
    };
  } catch {
    return { wishes: [], totalPages: 1, currentPage: page };
  }
};

export const submitGeneralWish = async (
  name: string,
  message: string,
  attendanceStatus: string,
  guests: number
) => {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from(WISHES_TABLE).insert([
    {
      name,
      message,
      attendance_status: attendanceStatus,
      guests: Math.max(0, guests),
    },
  ]);

  if (error) throw error;
};
