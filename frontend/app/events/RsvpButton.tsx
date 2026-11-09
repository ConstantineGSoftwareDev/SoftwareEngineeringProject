
"use client";

import { useState } from "react";
import { getCsrfToken } from "@/lib/api";

type RsvpButtonProps = {
  eventId: number;
};

export default function RsvpButton({ eventId }: RsvpButtonProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleRsvp() {
    setLoading(true);
    setError("");

    try {
      const csrfToken = await getCsrfToken();
      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

      const response = await fetch(
        `${backendUrl}/api/events/${eventId}/rsvp`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            [csrfToken.headerName]: csrfToken.token,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error(
            "Reservation was blocked by authentication or CSRF protection."
          );
        }

        if (response.status === 409) {
          throw new Error(
            "You have already RSVP'd, or this event is full."
          );
        }

        throw new Error("Unable to RSVP. Please try again.");
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleRsvp}
        disabled={loading || success}
      >
        {loading
          ? "Reserving..."
          : success
          ? "RSVP Confirmed"
          : "RSVP for Free"}
      </button>

      {success && <p>Your reservation was successful!</p>}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
