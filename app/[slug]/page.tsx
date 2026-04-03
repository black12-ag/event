export const runtime = "edge";

import { notFound } from "next/navigation";
import EventExperience from "../components/EventExperience";
import { getEventSettings, getInviteBySlug, getMediaAssets, listWishes } from "@/lib/event-data";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";


type SlugPageProps = {
  params: { slug: string };
};

export default async function SlugPage({ params }: SlugPageProps) {
  const [settings, media, wishesData, invite] = await Promise.all([
    getEventSettings(),
    getMediaAssets(),
    listWishes(1, 6),
    getInviteBySlug(params.slug),
  ]);

  if (!invite) {
    notFound();
  }

  return <EventExperience invite={invite} settings={settings} media={media} initialWishes={wishesData.wishes} />;
}
