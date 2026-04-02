"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaTelegramPlane, FaTiktok, FaWhatsapp } from "react-icons/fa";
import { IoIosArrowUp } from "react-icons/io";
import { useInView } from "react-intersection-observer";
import { EventSettings, Invite, MediaAsset, Wish } from "@/lib/types";

type EventExperienceProps = {
  invite: Invite | null;
  settings: EventSettings;
  media: MediaAsset[];
  initialWishes: Wish[];
};

const getAssetUrl = (media: MediaAsset[], slotKey: string, fallback = "") =>
  media.find((item) => item.slotKey === slotKey)?.publicUrl || fallback;

const formatDate = (value: string, options?: Intl.DateTimeFormatOptions) =>
  new Date(value).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
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

type SlideProps = {
  backgroundImage: string;
  children: React.ReactNode;
  className?: string;
};

function Slide({ backgroundImage, children, className = "" }: SlideProps) {
  return (
    <section
      className={`snap-start min-h-screen bg-cover bg-center bg-no-repeat text-white ${className}`}
      style={{
        backgroundImage: `linear-gradient(rgba(10, 8, 6, 0.38), rgba(10, 8, 6, 0.72)), url(${backgroundImage})`,
      }}
    >
      {children}
    </section>
  );
}

function CountdownStrip({ eventDate }: { eventDate: string }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(eventDate));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft(getTimeLeft(eventDate));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [eventDate]);

  return (
    <div className="mt-5 flex space-x-4 text-center font-legan">
      {[
        ["Days", timeLeft.days],
        ["Hours", timeLeft.hours],
        ["Minutes", timeLeft.minutes],
        ["Seconds", timeLeft.seconds],
      ].map(([label, value]) => (
        <div key={String(label)} className="flex flex-col">
          <span className="text-4xl font-bold">{value}</span>
          <span className="text-sm uppercase">{label}</span>
        </div>
      ))}
    </div>
  );
}

export default function EventExperience({
  invite,
  settings,
  media,
  initialWishes,
}: EventExperienceProps) {
  const [fadeClass, setFadeClass] = useState("opacity-0");
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wishes, setWishes] = useState<Wish[]>(initialWishes);
  const [wishStatus, setWishStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [attendance, setAttendance] = useState("attending");
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const displayedGuestName =
    invite && invite.inviteType === "named" && invite.guestName
      ? invite.guestName
      : "Honored Guest";

  const inviteGreeting =
    invite && invite.inviteType === "named" && invite.guestName
      ? `Dear ${invite.guestName},`
      : "Welcome,";

  const { ref: slide1Ref, inView: slide1InView } = useInView({ threshold: 0.4 });
  const { ref: slide2Ref, inView: slide2InView } = useInView({ threshold: 0.4 });
  const { ref: slide3Ref, inView: slide3InView } = useInView({ threshold: 0.4 });
  const { ref: slide4Ref, inView: slide4InView } = useInView({ threshold: 0.4 });
  const { ref: slide5Ref, inView: slide5InView } = useInView({ threshold: 0.4 });
  const { ref: slide6Ref, inView: slide6InView } = useInView({ threshold: 0.4 });
  const { ref: slide7Ref, inView: slide7InView } = useInView({ threshold: 0.4 });
  const { ref: slide8Ref, inView: slide8InView } = useInView({ threshold: 0.4 });
  const { ref: slide9Ref, inView: slide9InView } = useInView({ threshold: 0.4 });

  useEffect(() => {
    const timer = setTimeout(() => setFadeClass("opacity-100"), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!invite) return;
    fetch(`/api/invitation/${invite.slug}/open`, { method: "POST" }).catch(() => null);
  }, [invite]);

  const handleOpen = async () => {
    setIsOpen(true);
    if (audioRef.current) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    }
  };

  const toggleMusic = async () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }
    try {
      await audioRef.current.play();
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
      guests:
        String(formData.get("attendance") || "attending") === "not_attending"
          ? 0
          : Number(formData.get("guests") || 1),
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

  return (
    <div className={`h-screen w-screen flex flex-col md:flex-row ${fadeClass} transition-opacity duration-1000`}>
      <div
        className="hidden md:flex md:w-2/3 justify-center items-end pb-12"
        style={{
          backgroundImage: `url(${heroSide})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="font-ovo text-lg text-white tracking-[5px] uppercase">
          {settings.eventName}
        </div>
      </div>

      <div className="md:w-1/3 h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth bg-[#0f0b08]">
        <section
          className="snap-start w-full min-h-screen flex items-center justify-center"
          style={{
            backgroundImage: `linear-gradient(rgba(12, 9, 7, 0.48), rgba(12, 9, 7, 0.7)), url(${heroBackground})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="text-center p-5 flex flex-col h-full justify-between py-20 w-full">
            <div className="gap-y-2 md:gap-y-4 flex flex-col">
              <h5 className="text-sm font-legan text-white uppercase tracking-wide">
                {settings.subtitle}
              </h5>
              <h1 className="text-2xl md:text-3xl font-ovo text-white uppercase">
                {settings.eventName}
              </h1>
              <h5 className="text-sm font-legan text-white uppercase tracking-wide">
                {formatDate(settings.eventDate, { hour: undefined, minute: undefined })}
              </h5>
            </div>
            <div>
              <p className="mt-5 text-lg uppercase tracking-widest text-white">
                {inviteGreeting}
              </p>
              <p className="mx-auto mt-5 max-w-sm text-sm font-legan text-white/90">
                {settings.heroDescription}
              </p>
              {!isOpen ? (
                <button
                  className="animate-bounce mt-5 px-5 py-1 uppercase text-xs border border-white hover:text-white hover:bg-transparent rounded-full bg-white text-black transition"
                  onClick={handleOpen}
                >
                  {settings.primaryButtonLabel}
                </button>
              ) : (
                <IoIosArrowUp className="mx-auto mt-20 animate-upDown text-white text-3xl" />
              )}
            </div>
          </div>
        </section>

        {isOpen && (
          <>
            <Slide backgroundImage={heroBackground} className="flex pt-12 p-5 px-12">
              <div ref={slide1Ref} className={`fadeInMove ${slide1InView ? "active" : ""}`}>
                <h1 className="text-xl md:text-2xl font-ovo tracking-wide text-white uppercase">
                  {settings.heroTitle}
                </h1>
                <p className="text-sm mt-5 font-legan">{settings.openingNote}</p>
                <p className="text-6xl mt-5 font-wonder">{settings.eventName}</p>
              </div>
            </Slide>

            <Slide backgroundImage={storyImage} className="flex items-end pb-16 px-12">
              <div ref={slide2Ref} className={`fadeInMove ${slide2InView ? "active" : ""}`}>
                <p className="font-legan text-sm my-2 uppercase">Guest Invitation</p>
                <h1 className="text-xl md:text-3xl text-white font-ovo">
                  {displayedGuestName}
                </h1>
                <h3 className="font-thesignature text-2xl">
                  {invite?.inviteType === "open" ? "Open Share Link" : "Personal Invite"}
                </h3>
                <p className="text-sm mt-5 font-legan text-[#CCCCCC]">
                  {invite
                    ? invite.inviteType === "open"
                      ? `This shareable invitation allows up to ${invite.allowedGuests} guest${invite.allowedGuests > 1 ? "s" : ""}.`
                      : `This private invitation allows up to ${invite.allowedGuests} guest${invite.allowedGuests > 1 ? "s" : ""}.`
                    : "Explore the opening event details and join us for the celebration."}
                </p>
              </div>
            </Slide>

            <Slide backgroundImage={gallery[0]} className="pt-8 px-12">
              <div ref={slide3Ref}>
                <h1 className={`text-xl md:text-5xl text-white font-ovo fadeInMove ${slide3InView ? "active" : ""}`}>
                  {settings.storyTitle}
                </h1>
                <p className={`text-sm mt-5 font-legan text-white fadeInLeftSlow ${slide3InView ? "active" : ""}`}>
                  {settings.storyBody}
                </p>
                <div className={`relative flex items-center mt-5 fadeInLeft ${slide3InView ? "active" : ""}`}>
                  <hr className="w-[120px] mx-2 border-t border-gray-300" />
                  <span className="px-2 font-thesignature text-3xl">
                    {settings.eventName}
                  </span>
                </div>
              </div>
            </Slide>

            <Slide backgroundImage={gallery[1]} className="flex flex-col items-center px-12">
              <div ref={slide4Ref} className={`${slide4InView ? "active" : ""} fadeInMove flex items-center flex-col pt-32`}>
                <h3 className="uppercase font-legan text-xs tracking-wide mt-5 mb-2">
                  {settings.scheduleTitle}
                </h3>
                <h1 className="text-2xl w-[240px] text-center text-white font-ovo uppercase">
                  {formatDate(settings.eventDate, { weekday: "long", hour: undefined, minute: undefined })}
                </h1>
                <p className="text-sm text-center font-legan text-white mt-5">
                  {settings.scheduleDescription}
                </p>
                <div className="mt-5 mx-auto flex flex-col items-center">
                  <h3 className="uppercase font-ovo text-sm text-center mt-5 mb-2">
                    {settings.venueName}
                  </h3>
                  <p className="text-sm text-center font-legan text-white">
                    {settings.venueAddress}
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-3">
                    <Link
                      href={settings.mapLink}
                      target="_blank"
                      className="cursor-pointer hover:text-white/70 text-sm rounded-full flex items-center gap-x-2 text-center font-legan bg-[#808080] w-fit px-4 py-2 text-white"
                    >
                      {settings.directionsButtonLabel}
                    </Link>
                    <button
                      type="button"
                      onClick={toggleMusic}
                      className="cursor-pointer hover:text-white/70 text-sm rounded-full flex items-center gap-x-2 text-center font-legan bg-[#4E4E4E] w-fit px-4 py-2 text-white"
                    >
                      {isPlaying ? "Pause Music" : "Play Music"}
                    </button>
                  </div>
                </div>
              </div>
            </Slide>

            <Slide backgroundImage={gallery[2]} className="flex flex-col items-center justify-end pb-16 px-12">
              <div ref={slide5Ref} className={`${slide5InView ? "active" : ""} fadeInMove flex items-center flex-col`}>
                <h1 className="text-2xl text-center text-white font-ovo uppercase">
                  Almost Time For Our Celebration
                </h1>
                <CountdownStrip eventDate={settings.eventDate} />
              </div>
            </Slide>

            <Slide backgroundImage={gallery[3]} className="flex flex-col justify-between pt-16 pb-24 px-12">
              <h1 ref={slide6Ref} className={`text-2xl text-white font-ovo fadeInMoveSlow ${slide6InView ? "active" : ""}`}>
                Venue And Directions
              </h1>
              <div className={`mt-5 mx-auto flex flex-col fadeInMove ${slide6InView ? "active" : ""}`} ref={slide6Ref}>
                <h3 className="uppercase font-ovo text-sm mt-5 mb-2">
                  {settings.venueName}
                </h3>
                <p className="text-sm font-legan text-white">
                  {settings.venueAddress}
                </p>
                <Link
                  href={settings.mapLink}
                  target="_blank"
                  className="cursor-pointer hover:text-white/70 text-sm rounded-full flex items-center gap-x-2 text-center font-legan mt-5 bg-[#3B3B3B] w-fit px-6 py-2 text-white"
                >
                  Open In Google Maps
                </Link>
                {settings.mapEmbedUrl ? (
                  <div className="mt-6 overflow-hidden rounded-3xl border border-white/20">
                    <iframe
                      src={settings.mapEmbedUrl}
                      className="h-56 w-full"
                      loading="lazy"
                    />
                  </div>
                ) : null}
              </div>
            </Slide>

            <Slide backgroundImage={heroBackground} className="flex flex-col justify-center pt-16 pb-16 px-8">
              <div ref={slide7Ref} className={`${slide7InView ? "active" : ""} fadeInMove`}>
                <h1 className="text-3xl text-white font-ovo text-center uppercase">
                  {settings.rsvpTitle}
                </h1>
                <p className="text-sm font-legan text-white/80 text-center">
                  {settings.rsvpDescription}
                </p>

                <form onSubmit={handleWishFormSubmit} className="mt-8 space-y-4 rounded-2xl bg-black/40 p-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-white">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      defaultValue={invite && invite.inviteType === "named" ? invite.guestName : ""}
                      readOnly={Boolean(invite && invite.inviteType === "named" && invite.guestName)}
                      className="block w-full p-2 mt-1 bg-white/10 text-white border border-gray-300 rounded-md shadow-sm sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="attendance" className="block text-sm font-medium text-white">
                      Attendance
                    </label>
                    <select
                      id="attendance"
                      name="attendance"
                      onChange={(event) => setAttendance(event.target.value)}
                      className="block w-full p-2 mt-1 bg-black/40 text-white border border-gray-300 rounded-md shadow-sm sm:text-sm"
                      required
                    >
                      <option value="attending">Attending</option>
                      <option value="not_attending">Not Attending</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="guests" className="block text-sm font-medium text-white">
                      Number Of Guests
                    </label>
                    <select
                      id="guests"
                      name="guests"
                      disabled={attendance === "not_attending"}
                      className="block w-full p-2 mt-1 bg-black/40 text-white border border-gray-300 rounded-md shadow-sm sm:text-sm"
                      required
                    >
                      {Array.from({ length: invite?.allowedGuests || 4 }, (_, index) => index + 1).map((count) => (
                        <option key={count} value={count}>
                          {count}
                        </option>
                      ))}
                    </select>
                    {invite ? (
                      <p className="mt-2 text-xs text-white/70">
                        Maximum allowed for this link: {invite.allowedGuests}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-white">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      className="block w-full p-2 mt-1 bg-white/10 text-white border border-gray-300 rounded-md shadow-sm sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="block w-full p-2 text-sm font-medium text-center text-black bg-white border border-transparent rounded-md shadow-sm"
                      disabled={submitting}
                    >
                      {submitting ? "Submitting..." : "Submit"}
                    </button>
                  </div>

                  {wishStatus ? <p className="text-sm text-white">{wishStatus}</p> : null}
                </form>
              </div>
            </Slide>

            <Slide backgroundImage={storyImage} className="flex flex-col justify-center pt-16 pb-16 px-8">
              <div ref={slide8Ref} className={`${slide8InView ? "active" : ""} fadeInMove`}>
                <h1 className="text-3xl text-white font-ovo text-center uppercase">
                  {settings.wishesTitle}
                </h1>
                <div className="bg-black/50 text-white p-4 rounded-md mt-5">
                  <div className="max-h-[420px] overflow-y-auto">
                    {wishes.length === 0 ? (
                      <p>No wishes available</p>
                    ) : (
                      wishes.map((wish) => (
                        <div key={wish.id} className="mb-4">
                          <p className="font-bold font-legan">{wish.name}</p>
                          <p className="text-sm my-2 opacity-50">
                            {wish.createdAt
                              ? new Date(wish.createdAt).toLocaleString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "numeric",
                                })
                              : ""}
                          </p>
                          <p className="text-sm">{wish.message}</p>
                          <hr className="my-2 border-gray-400" />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </Slide>

            <Slide backgroundImage={heroSide} className="flex flex-col justify-end pt-16 pb-16 px-12">
              <div ref={slide9Ref} className={`${slide9InView ? "active" : ""} fadeInMove`}>
                <h1 className="text-3xl text-white font-ovo text-center uppercase">
                  {settings.footerNote}
                </h1>

                <div className="mt-5 mx-auto flex flex-col items-center">
                  <p className="text-sm font-legan text-white text-center">
                    {settings.eventName}
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3 text-lg">
                    {settings.instagramUrl ? (
                      <Link href={settings.instagramUrl} target="_blank" className="cursor-pointer hover:bg-black text-sm rounded-full flex items-center gap-x-2 text-center font-legan bg-[#4E4E4E] w-fit px-4 py-2 text-[#CCCCCC]">
                        <FaInstagram />
                      </Link>
                    ) : null}
                    {settings.facebookUrl ? (
                      <Link href={settings.facebookUrl} target="_blank" className="cursor-pointer hover:bg-black text-sm rounded-full flex items-center gap-x-2 text-center font-legan bg-[#4E4E4E] w-fit px-4 py-2 text-[#CCCCCC]">
                        <FaFacebookF />
                      </Link>
                    ) : null}
                    {settings.tiktokUrl ? (
                      <Link href={settings.tiktokUrl} target="_blank" className="cursor-pointer hover:bg-black text-sm rounded-full flex items-center gap-x-2 text-center font-legan bg-[#4E4E4E] w-fit px-4 py-2 text-[#CCCCCC]">
                        <FaTiktok />
                      </Link>
                    ) : null}
                    {settings.whatsappUrl ? (
                      <Link href={settings.whatsappUrl} target="_blank" className="cursor-pointer hover:bg-black text-sm rounded-full flex items-center gap-x-2 text-center font-legan bg-[#4E4E4E] w-fit px-4 py-2 text-[#CCCCCC]">
                        <FaWhatsapp />
                      </Link>
                    ) : null}
                    {settings.telegramUrl ? (
                      <Link href={settings.telegramUrl} target="_blank" className="cursor-pointer hover:bg-black text-sm rounded-full flex items-center gap-x-2 text-center font-legan bg-[#4E4E4E] w-fit px-4 py-2 text-[#CCCCCC]">
                        <FaTelegramPlane />
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            </Slide>
          </>
        )}
      </div>

      <audio ref={audioRef} src={musicUrl} preload="auto" />
    </div>
  );
}
