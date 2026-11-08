
"use client";

import { useState } from "react";

type Reservation = {
  rsvpId: number;
  eventId: number;
  eventTitle: string;
  attendeeEmail: string;
  createdAt: string;
};

type Props = {
  eventId: number;
};

export default function EventAttendees({ eventId }: Props) {
  const [attendees, setAttendees] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  async function handleViewAttendees() {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:8080/api/events/${eventId}/rsvps`,
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          response.status === 403
            ? "Only the event creator can view attendees."
            : "Unable to load attendees."
        );
      }

      const data: Reservation[] = await response.json();
      setAttendees(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={handleViewAttendees}
        className="rounded-lg border border-indigo-300 px-3 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950"
      >
        {isOpen ? "Hide Attendees" : "View Attendees"}
      </button>

      {isOpen && (
        <div className="mt-3 rounded-lg border border-gray-200 p-3 dark:border-zinc-700">
          {loading && (
            <p className="text-sm text-gray-500">
              Loading attendees...
            </p>
          )}

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {!loading && !error && attendees.length === 0 && (
            <p className="text-sm text-gray-500">
              No attendees registered yet.
            </p>
          )}

          {!loading && !error && attendees.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold">
                Registered Attendees: {attendees.length}
              </p>

              {attendees.map((attendee) => (
                <div
                  key={attendee.rsvpId}
                  className="rounded-md bg-gray-50 p-3 dark:bg-zinc-800"
                >
                  <p className="break-all text-sm font-medium text-gray-900 dark:text-white">
                    {attendee.attendeeEmail}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Registered:{" "}
                    {new Date(
                      attendee.createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
