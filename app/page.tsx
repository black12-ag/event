export const runtime = "edge";

import EventExperience from "./components/EventExperience";
import { getEventSettings, getMediaAssets, listWishes } from "@/lib/event-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [settings, media, wishesData] = await Promise.all([
    getEventSettings(),
    getMediaAssets(),
    listWishes(1, 6),
  ]);

  return <EventExperience invite={null} settings={settings} media={media} initialWishes={wishesData.wishes} />;
}
