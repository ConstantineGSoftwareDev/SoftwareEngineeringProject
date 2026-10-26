"use client";

import { useState } from "react";

// Use relative /api/events by default so Next.js rewrites proxy to backend (defined in next.config.ts),
// or use NEXT_PUBLIC_BACKEND_URL if provided.
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL
  ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/events`
  : "/api/events";

type AgeRestriction = "ALL_AGES" | "THIRTEEN_PLUS" | "EIGHTEEN_PLUS" | "TWENTY_ONE_PLUS";
type EventStatus = "DRAFT" | "PUBLISHED";

interface EventResponse {
  id: number;
  creatorId: number | null;
  creatorEmail: string | null;
  title: string;
  description: string;
  location: string;
  capacity: number;
  ageRestriction: string;
  price: number;
  status: EventStatus;
  createdAt: string;
}

export default function CreateEventPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    capacity: "",
    ageRestriction: "ALL_AGES" as AgeRestriction,
    price: "0.00",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdEvent, setCreatedEvent] = useState<EventResponse | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Event title is required.";
    } else if (formData.title.length > 150) {
      newErrors.title = "Title cannot exceed 150 characters.";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required.";
    }

    const capacityNum = parseInt(formData.capacity, 10);
    if (!formData.capacity || isNaN(capacityNum) || capacityNum < 1) {
      newErrors.capacity = "Capacity must be at least 1 attendee.";
    }

    const priceNum = parseFloat(formData.price);
    if (formData.price === "" || isNaN(priceNum) || priceNum < 0) {
      newErrors.price = "Price must be 0.00 or higher.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (targetStatus: EventStatus) => {
    setServerError(null);
    setCreatedEvent(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      location: formData.location.trim(),
      capacity: parseInt(formData.capacity, 10),
      ageRestriction: formData.ageRestriction,
      price: parseFloat(formData.price),
      status: targetStatus,
    };

    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errorMessage = `Server returned status ${res.status}`;
        try {
          const errorData = await res.json();
          if (errorData?.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // If response was not JSON (e.g. 502/504 gateway error from Next.js proxy when backend is offline)
          if (res.status === 502 || res.status === 504 || res.status === 500) {
            errorMessage = `Cannot connect to backend server at http://localhost:8080 (Status ${res.status}). Please make sure Spring Boot is running.`;
          }
        }
        throw new Error(errorMessage);
      }

      const data: EventResponse = await res.json();
      setCreatedEvent(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred";
      if (msg.includes("NetworkError") || msg.includes("Failed to fetch")) {
        setServerError(
          "NetworkError: Could not reach the backend. Please check that Spring Boot is running on http://localhost:8080."
        );
      } else {
        setServerError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Create New Event
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Fill in the details below to create your outdoor event. You can save it as
          a draft or publish it immediately.
        </p>
      </div>

      {serverError && (
        <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm">
          <strong>Error: </strong> {serverError}
        </div>
      )}

      {createdEvent && (
        <div className="mb-6 p-5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base">
              🎉 Event successfully generated!
            </span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                createdEvent.status === "PUBLISHED"
                  ? "bg-emerald-600 text-white"
                  : "bg-amber-500 text-white"
              }`}
            >
              {createdEvent.status}
            </span>
          </div>
          <p className="mt-2 text-sm">
            <strong>ID:</strong> {createdEvent.id} |{" "}
            <strong>Title:</strong> {createdEvent.title} |{" "}
            <strong>Location:</strong> {createdEvent.location} |{" "}
            <strong>Capacity:</strong> {createdEvent.capacity} |{" "}
            <strong>Price:</strong> ${createdEvent.price.toFixed(2)}
          </p>
        </div>
      )}

      <form
        onSubmit={(e) => e.preventDefault()}
        className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
      >
        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-800"
          >
            Event Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="e.g. Austin Outdoor Summer Jam"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-800"
          >
            Description (Optional)
          </label>
          <textarea
            id="description"
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Provide attendees with key information about the event..."
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        {/* Location */}
        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-800"
          >
            Location / Venue <span className="text-red-500">*</span>
          </label>
          <input
            id="location"
            type="text"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            placeholder="e.g. Zilker Park, Austin, TX"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.location && (
            <p className="mt-1 text-xs text-red-600">{errors.location}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Capacity */}
          <div>
            <label
              htmlFor="capacity"
              className="block text-sm font-medium text-gray-800"
            >
              Capacity Limit <span className="text-red-500">*</span>
            </label>
            <input
              id="capacity"
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) =>
                setFormData({ ...formData, capacity: e.target.value })
              }
              placeholder="e.g. 250"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
            />
            {errors.capacity && (
              <p className="mt-1 text-xs text-red-600">{errors.capacity}</p>
            )}
          </div>

          {/* Age Restriction */}
          <div>
            <label
              htmlFor="ageRestriction"
              className="block text-sm font-medium text-gray-800"
            >
              Age Restriction <span className="text-red-500">*</span>
            </label>
            <select
              id="ageRestriction"
              value={formData.ageRestriction}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  ageRestriction: e.target.value as AgeRestriction,
                })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="ALL_AGES">All Ages</option>
              <option value="THIRTEEN_PLUS">13+ Only</option>
              <option value="EIGHTEEN_PLUS">18+ Only</option>
              <option value="TWENTY_ONE_PLUS">21+ Only</option>
            </select>
          </div>
        </div>

        {/* Pricing */}
        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-800"
          >
            Ticket Price (USD) <span className="text-red-500">*</span>
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              placeholder="0.00"
              className="block w-full rounded-md border border-gray-300 pl-7 pr-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Set to 0.00 for free RSVP events.
          </p>
          {errors.price && (
            <p className="mt-1 text-xs text-red-600">{errors.price}</p>
          )}
        </div>

        {/* Actions */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-gray-100">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit("DRAFT")}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save as Draft"}
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit("PUBLISHED")}
            className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? "Publishing..." : "Publish Event"}
          </button>
        </div>
      </form>
    </div>
  );
}
