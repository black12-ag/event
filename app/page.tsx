export const runtime = "edge";

import EventExperience from "./components/EventExperience";
import { getEventSettings, getMediaAssets, listWishes } from "@/lib/event-data";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";


export default async function Home() {
  console.log("Rendering Home Page on Edge...");
  const [settings, media, wishesData] = await Promise.all([
    getEventSettings(),
    getMediaAssets(),
    listWishes(1, 6),
  ]);
  console.log("Home Page data fetched successfully.");

  return <EventExperience invite={null} settings={settings} media={media} initialWishes={wishesData.wishes} />;
}
