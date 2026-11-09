
"use client";
import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getEventByIdAction,
  type EventResponse,
} from "../actions";
import RsvpButton from "../RsvpButton";

function EventDetailsContent() {
  const params = useParams();
  const eventId = Number(params.id);

  const [event, setEvent] = useState<EventResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!Number.isSafeInteger(eventId) || eventId <= 0) {
      setError("Invalid event ID.");
      setLoading(false);
      return;
    }

    getEventByIdAction(eventId)
      .then(setEvent)
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load event."
        );
      })
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) {
    return <main><p>Loading event...</p></main>;
  }

  if (error || !event) {
    return (
      <main>
        <p role="alert">{error || "Event not found."}</p>
      </main>
    );
  }

  const isFree = Number(event.price) === 0;
  const canRsvp = event.status === "PUBLISHED" && isFree;

  return (
    <main style={{ padding: "24px", maxWidth: "720px" }}>
      <h1>{event.title}</h1>

      <p>{event.description}</p>
      <p><strong>Location:</strong> {event.location}</p>
      <p><strong>Capacity:</strong> {event.capacity}</p>
      <p>
        <strong>Price:</strong>{" "}
        {isFree ? "Free" : `$${event.price}`}
      </p>
      <p><strong>Status:</strong> {event.status}</p>

      {canRsvp ? (
        <RsvpButton eventId={event.id} />
      ) : (
        <p>Free RSVP is not available for this event.</p>
      )}
    </main>
  );
}



export default function EventDetailsPage() {
  return (
    <Suspense fallback={<main><p>Loading event...</p></main>}>
      <EventDetailsContent />
    </Suspense>
  );
}
