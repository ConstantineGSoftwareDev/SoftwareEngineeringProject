
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Reservation = {
  rsvpId: number;
  eventId: number;
  eventTitle: string;
  attendeeEmail: string;
  createdAt: string;
};

export default function MyRsvps() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadReservations() {
      try {
        const response = await fetch(
          "http://localhost:8080/api/events/my-rsvps",
          {
            credentials: "include",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Unable to load your reservations.");
        }

        const data: Reservation[] = await response.json();

        if (active) {
          setReservations(data);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadReservations();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
        My RSVPs
      </h2>

      <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
        Events you have registered for.
      </p>

      {loading && (
        <p className="mt-4 text-sm">Loading reservations...</p>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      )}

      {!loading && !error && reservations.length === 0 && (
        <p className="mt-4 text-sm text-gray-500">
          You have not registered for any events yet.
        </p>
      )}

      {!loading && !error && reservations.length > 0 && (
        <div className="mt-5 space-y-3">
          {reservations.map((reservation) => (
            <div
              key={reservation.rsvpId}
              className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 dark:border-zinc-700 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {reservation.eventTitle}
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Registered on{" "}
                  {new Date(
                    reservation.createdAt
                  ).toLocaleDateString()}
                </p>

                <p className="mt-1 text-sm font-medium text-emerald-600">
                  RSVP Confirmed
                </p>
              </div>

              <Link
                href={`/events/${reservation.eventId}`}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-700"
              >
                View Event
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
