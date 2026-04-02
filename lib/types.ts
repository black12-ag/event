export type EventSettings = {
  id?: string;
  eventName: string;
  subtitle: string;
  heroTitle: string;
  heroDescription: string;
  openingNote: string;
  eventDate: string;
  venueName: string;
  venueAddress: string;
  mapLink: string;
  mapEmbedUrl: string;
  musicUrl: string;
  autoplayMusic: boolean;
  storyTitle: string;
  storyBody: string;
  scheduleTitle: string;
  scheduleDescription: string;
  rsvpTitle: string;
  rsvpDescription: string;
  wishesTitle: string;
  footerNote: string;
  primaryButtonLabel: string;
  directionsButtonLabel: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  whatsappUrl: string;
  telegramUrl: string;
};

export type MediaAsset = {
  id?: string;
  slotKey: string;
  type: "image" | "audio";
  label: string;
  publicUrl: string;
  storagePath: string | null;
  sortOrder: number;
  active: boolean;
};

export type Invite = {
  id: string;
  guestName: string;
  slug: string;
  inviteType: "named" | "open";
  allowedGuests: number;
  attendanceStatus: "pending" | "attending" | "not_attending";
  bringingCount: number;
  openedAt: string | null;
  respondedAt: string | null;
  notes: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type Wish = {
  id: string;
  inviteId: string | null;
  name: string;
  message: string;
  attendanceStatus: string;
  guests: number;
  createdAt: string | null;
};

export type InviteSummary = {
  totalInvites: number;
  openedCount: number;
  respondedCount: number;
  attendingCount: number;
  notAttendingCount: number;
  totalBringingCount: number;
};
