"use client";

import { useState } from "react";
import {
  createEventAction,
  type AgeRestriction,
  type EventStatus,
  type EventResponse,
} from "./actions";

export default function EventCreateForm() {
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
      const data = await createEventAction(payload);
      setCreatedEvent(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred";
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {serverError && (
        <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-900/60 dark:text-red-300 text-sm">
          <strong>Error: </strong> {serverError}
        </div>
      )}

      {createdEvent && (
        <div className="mb-6 p-5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-900/60 dark:text-emerald-200">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base">
              🎉 Event successfully generated!
            </span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                createdEvent.status === "PUBLISHED"
                  ? "bg-emerald-600 text-white dark:bg-emerald-700"
                  : "bg-amber-500 text-white dark:bg-amber-600"
              }`}
            >
              {createdEvent.status}
            </span>
          </div>
          <p className="mt-2 text-sm text-emerald-800 dark:text-emerald-300">
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
        className="space-y-6 bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm transition-colors"
      >
        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-800 dark:text-zinc-200"
          >
            Event Title <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="e.g. Austin Outdoor Summer Jam"
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 px-3 py-2 text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm"
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-800 dark:text-zinc-200"
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
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 px-3 py-2 text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm"
          />
        </div>

        {/* Location */}
        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-800 dark:text-zinc-200"
          >
            Location / Venue <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <input
            id="location"
            type="text"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            placeholder="e.g. Zilker Park, Austin, TX"
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 px-3 py-2 text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm"
          />
          {errors.location && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.location}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Capacity */}
          <div>
            <label
              htmlFor="capacity"
              className="block text-sm font-medium text-gray-800 dark:text-zinc-200"
            >
              Capacity Limit <span className="text-red-500 dark:text-red-400">*</span>
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
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 px-3 py-2 text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm"
            />
            {errors.capacity && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.capacity}</p>
            )}
          </div>

          {/* Age Restriction */}
          <div>
            <label
              htmlFor="ageRestriction"
              className="block text-sm font-medium text-gray-800 dark:text-zinc-200"
            >
              Age Restriction <span className="text-red-500 dark:text-red-400">*</span>
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
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 px-3 py-2 text-gray-900 dark:text-zinc-100 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm"
            >
              <option value="ALL_AGES" className="dark:bg-zinc-800 dark:text-zinc-100">All Ages</option>
              <option value="THIRTEEN_PLUS" className="dark:bg-zinc-800 dark:text-zinc-100">13+ Only</option>
              <option value="EIGHTEEN_PLUS" className="dark:bg-zinc-800 dark:text-zinc-100">18+ Only</option>
              <option value="TWENTY_ONE_PLUS" className="dark:bg-zinc-800 dark:text-zinc-100">21+ Only</option>
            </select>
          </div>
        </div>

        {/* Pricing */}
        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-800 dark:text-zinc-200"
          >
            Ticket Price (USD) <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 dark:text-zinc-400 sm:text-sm">$</span>
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
              className="block w-full rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 pl-7 pr-3 py-2 text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
            Set to 0.00 for free RSVP events.
          </p>
          {errors.price && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.price}</p>
          )}
        </div>

        {/* Actions */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-gray-100 dark:border-zinc-800">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit("DRAFT")}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-zinc-900 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "Saving..." : "Save as Draft"}
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit("PUBLISHED")}
            className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-zinc-900 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "Publishing..." : "Publish Event"}
          </button>
        </div>
      </form>
    </>
  );
}
