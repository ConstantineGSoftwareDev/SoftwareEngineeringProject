
"use client";

import { useEffect, useState, use } from "react";
import GoogleMapsDirections from "../../GoogleMapsDirections";
import {
  getEventByIdAction,
  type EventResponse,
} from "../actions";

export default function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [event, setEvent] = useState<EventResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { id } = use(params);

  useEffect(() => {
    async function loadEvent() {
      try {
        const eventId = Number(id);

        if (!Number.isSafeInteger(eventId) || eventId <= 0) {
          throw new Error("Invalid event ID");
        }

        const data = await getEventByIdAction(eventId);
        setEvent(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load event"
        );
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [id]);

  if (loading) {
    return <main className="p-8">Loading event...</main>;
  }

  if (error || !event) {
    return (
      <main className="p-8">
        {error || "Event not found"}
      </main>
    );
  }

  if (event.status !== "PUBLISHED") {
    return (
      <main className="p-8">
        This event is not available.
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="mb-4 text-3xl font-bold">
        {event.title}
      </h1>

      <p className="mb-4">{event.description}</p>

      <p className="mb-4">
        <strong>Location:</strong> {event.location}
      </p>

      <GoogleMapsDirections location={event.location} />
    </main>
  );
}
