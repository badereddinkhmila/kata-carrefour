import type { EventView } from "@/schemas";

export interface Event {
  id: string;
  title: string;
  date: string;
  location?: string;
  imageUrl?: string;
  category: string;
  description?: string;
}

export function eventViewToEvent(v: EventView): Event {
  return {
    id: v.id,
    title: v.name,
    date: v.startsAt,
    imageUrl: v.banner,
    category: "Event",
  };
}
