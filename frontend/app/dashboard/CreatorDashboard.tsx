
"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import GoogleMapsDirections from "../GoogleMapsDirections";
import { useRouter } from "next/navigation";
import { getCurrentUser, logout } from "@/lib/api";
import {
  getCreatorEventsAction,
  updateEventAction,
  updateEventStatusAction,
  type EventResponse,
  type EventStatus,
  type AgeRestriction,
  type UpdateEventPayload,
} from "../events/actions";

export default function CreatorDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] =
    useState<string | null>(null);

  const [isLoggingOut, setIsLoggingOut] = useState(false);  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Edit Modal State
  const [editingEvent, setEditingEvent] =
    useState<EventResponse | null>(null);

  const [editFormData, setEditFormData] = useState<UpdateEventPayload>({
    title: "",
    description: "",
    location: "",
    capacity: 100,
    ageRestriction: "ALL_AGES",
    price: 0,
    status: "DRAFT",
  });

  const [editErrors, setEditErrors] =
    useState<Record<string, string>>({});

  const [isUpdating, setIsUpdating] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] =
    useState<number | null>(null);

  const fetchEvents = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await getCreatorEventsAction();
      setEvents(data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to load events.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Authentication verification
  useEffect(() => {
    let active = true;

    async function verifySession() {
      try {
        const user = await getCurrentUser();

        if (!active) return;

        if (!user) {
          router.replace("/login");
          return;
        }

        setCurrentUser(user.email);
      } catch (error) {
        console.error("Unable to verify session:", error);

        if (active) {
          router.replace("/login");
        }
      } finally {
        if (active) {
          setCheckingAuth(false);
        }
      }
    }

    void verifySession();

    return () => {
      active = false;
    };
  }, [router]);

  // Load events after authentication
  useEffect(() => {
    if (currentUser) {
      void fetchEvents();
    }
  }, [currentUser]);

  const showNotification = (msg: string) => {
    setActionSuccessMessage(msg);

    setTimeout(() => {
      setActionSuccessMessage(null);
    }, 4000);
  };

  // Status toggle handler
  const handleStatusChange = async (
    event: EventResponse,
    targetStatus: EventStatus
  ) => {
    setStatusUpdatingId(event.id);

    try {
      const updated = await updateEventStatusAction(
        event.id,
        targetStatus
      );

      setEvents((prev) =>
        prev.map((e) => (e.id === updated.id ? updated : e))
      );

      showNotification(
        `Event "${updated.title}" status updated to ${updated.status}.`
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to change status.";

      setErrorMessage(msg);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (event: EventResponse) => {
    setEditingEvent(event);

    setEditFormData({
      title: event.title,
      description: event.description || "",
      location: event.location,
      capacity: event.capacity,
      ageRestriction: event.ageRestriction,
      price: event.price,
      status: event.status,
    });

    setEditErrors({});
  };

  const validateEdit = (): boolean => {
    const errors: Record<string, string> = {};

    if (!editFormData.title.trim()) {
      errors.title = "Event title is required.";
    } else if (editFormData.title.length > 150) {
      errors.title = "Title cannot exceed 150 characters.";
    }

    if (!editFormData.location.trim()) {
      errors.location = "Location is required.";
    }

    if (!editFormData.capacity || editFormData.capacity < 1) {
      errors.capacity = "Capacity must be at least 1 attendee.";
    }

    if (
      editFormData.price === undefined ||
      editFormData.price < 0
    ) {
      errors.price = "Price must be 0.00 or higher.";
    }

    setEditErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // Save Edit Form
  const handleSaveEdit = async () => {
    if (!editingEvent || !validateEdit()) return;

    setIsUpdating(true);

    try {
      const updated = await updateEventAction(editingEvent.id, {
        ...editFormData,
        title: editFormData.title.trim(),
        description: editFormData.description
          ? editFormData.description.trim()
          : null,
        location: editFormData.location.trim(),
        capacity: Number(editFormData.capacity),
        price: Number(editFormData.price),
      });

      setEvents((prev) =>
        prev.map((e) => (e.id === updated.id ? updated : e))
      );

      setEditingEvent(null);

      showNotification(
        `Event "${updated.title}" updated successfully.`
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to update event.";

      setErrorMessage(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  // Metrics
  const stats = useMemo(() => {
    const total = events.length;

    const published = events.filter(
      (e) => e.status === "PUBLISHED"
    ).length;

    const drafts = events.filter(
      (e) => e.status === "DRAFT"
    ).length;

    const closed = events.filter(
      (e) => e.status === "CLOSED"
    ).length;

    return { total, published, drafts, closed };
  }, [events]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesSearch =
        e.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        e.location
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatus === "ALL" ||
        e.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [events, searchQuery, selectedStatus]);

  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
      case "PUBLISHED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
            ● Published
          </span>
        );

      case "DRAFT":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
            ● Draft
          </span>
        );

      case "CLOSED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">
            ● Closed
          </span>
        );

      case "SOLD_OUT":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
            ● Sold Out
          </span>
        );

      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-zinc-300">
            {status}
          </span>
        );
    }
  };

  const formatAgeRestriction = (age: string) => {
    switch (age) {
      case "ALL_AGES":
        return "All Ages";
      case "THIRTEEN_PLUS":
        return "13+";
      case "EIGHTEEN_PLUS":
        return "18+";
      case "TWENTY_ONE_PLUS":
        return "21+";
      default:
        return age;
    }
  };

  // Authentication loading state
  if (checkingAuth || !currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">
          {checkingAuth
            ? "Verifying your session..."
            : "Redirecting to login..."}
        </p>
      </div>
    );
  }
  
  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setErrorMessage(null);

    try {
      await logout();

      // Clear authentication-dependent UI state.
      setCurrentUser(null);
      setEvents([]);

      // Redirect to login.
      router.replace("/login");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to log out"
      );
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-zinc-100">
            Event Creator Dashboard
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
            Manage your outdoor events, inspect attendance details,
            edit information, or close sign-ups.
          </p>

          <p className="mt-2 text-sm text-indigo-600 dark:text-indigo-400">
            Signed in as: {currentUser}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchEvents}
            disabled={isLoading}
            className="px-3.5 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
            title="Refresh event list"
          >
            {isLoading ? "Refreshing..." : "↻ Refresh"}
          </button>

          <Link
            href="/events/create"
            className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-zinc-900 transition-colors"
          >
            + Create New Event
          </Link>
          

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="px-4 py-2 text-sm font-semibold rounded-lg border border-red-500/40 bg-red-950/30 text-red-400 hover:bg-red-900/40 transition-colors disabled:opacity-50"
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccessMessage && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900/60 dark:text-emerald-300 text-sm flex items-center justify-between">
          <span>✓ {actionSuccessMessage}</span>

          <button
            onClick={() => setActionSuccessMessage(null)}
            className="text-emerald-600 dark:text-emerald-400 hover:underline text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-900/60 dark:text-red-300 text-sm flex items-center justify-between">
          <span>⚠ {errorMessage}</span>

          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-600 dark:text-red-400 hover:underline text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
            Total Events
          </span>

          <div className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-zinc-100">
            {stats.total}
          </div>

          <p className="mt-1 text-xs text-gray-400 dark:text-zinc-500">
            All created events
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Published & Active
          </span>

          <div className="mt-2 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {stats.published}
          </div>

          <p className="mt-1 text-xs text-gray-400 dark:text-zinc-500">
            Live for registrations
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Drafts
          </span>

          <div className="mt-2 text-3xl font-extrabold text-amber-600 dark:text-amber-400">
            {stats.drafts}
          </div>

          <p className="mt-1 text-xs text-gray-400 dark:text-zinc-500">
            Unpublished listings
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            Closed
          </span>

          <div className="mt-2 text-3xl font-extrabold text-rose-600 dark:text-rose-400">
            {stats.closed}
          </div>

          <p className="mt-1 text-xs text-gray-400 dark:text-zinc-500">
            Sign-ups disabled
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search events by title or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            "ALL",
            "PUBLISHED",
            "DRAFT",
            "CLOSED",
            "SOLD_OUT",
          ].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                selectedStatus === st
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700"
              }`}
            >
              {st === "ALL" ? "All Statuses" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      {isLoading ? (
        <div className="py-16 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>

          <p className="mt-4 text-sm text-gray-500 dark:text-zinc-400">
            Loading your events...
          </p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-gray-300 dark:border-zinc-800">
          <div className="mx-auto w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl font-bold">
            📅
          </div>

          <h3 className="mt-3 text-lg font-semibold text-gray-900 dark:text-zinc-100">
            {events.length === 0
              ? "No events created yet"
              : "No matching events found"}
          </h3>

          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400 max-w-sm mx-auto">
            {events.length === 0
              ? "You haven't generated any events. Create your first outdoor event to start tracking attendees and ticket statuses."
              : "Try adjusting your search keywords or status filter to see other events."}
          </p>

          {events.length === 0 && (
            <div className="mt-6">
              <Link
                href="/events/create"
                className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
              >
                + Create Your First Event
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="flex flex-col justify-between bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3
                    className="text-lg font-bold text-gray-900 dark:text-zinc-100 line-clamp-1"
                    title={evt.title}
                  >
                    {evt.title}
                  </h3>

                  <div>{getStatusBadge(evt.status)}</div>
                </div>

                {evt.description && (
                  <p className="text-sm text-gray-600 dark:text-zinc-400 line-clamp-2 mb-4">
                    {evt.description}
                  </p>
                )}

                <div className="space-y-2 text-xs text-gray-500 dark:text-zinc-400 pt-2 border-t border-gray-100 dark:border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700 dark:text-zinc-300">
                      Location:
                    </span>

                    <span
                      className="truncate max-w-[180px]"
                      title={evt.location}
                    >
                      {evt.location}
                    </span>
                  </div>
                  <div className="flex justify-end mt-2">
                  <GoogleMapsDirections location={evt.location} />
                  </div> 

                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700 dark:text-zinc-300">
                      Capacity:
                    </span>

                    <span>
                      {evt.capacity.toLocaleString()} attendees
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700 dark:text-zinc-300">
                      Price:
                    </span>

                    <span className="font-semibold text-gray-800 dark:text-zinc-200">
                      {evt.price === 0
                        ? "Free RSVP"
                        : `$${evt.price.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700 dark:text-zinc-300">
                      Age:
                    </span>

                    <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-medium">
                      {formatAgeRestriction(evt.ageRestriction)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700 dark:text-zinc-300">
                      Created:
                    </span>

                    <span>
                      {new Date(evt.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenEdit(evt)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                >
                  ✏ Edit
                </button>

                <div className="flex items-center gap-2">
                  {evt.status === "DRAFT" && (
                    <button
                      disabled={statusUpdatingId === evt.id}
                      onClick={() =>
                        handleStatusChange(evt, "PUBLISHED")
                      }
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50"
                    >
                      {statusUpdatingId === evt.id
                        ? "Publishing..."
                        : "Publish"}
                    </button>
                  )}

                  {evt.status === "PUBLISHED" && (
                    <button
                      disabled={statusUpdatingId === evt.id}
                      onClick={() =>
                        handleStatusChange(evt, "CLOSED")
                      }
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/60 transition-colors disabled:opacity-50"
                      title="Disable further registrations immediately (US-04 AC 3)"
                    >
                      {statusUpdatingId === evt.id
                        ? "Closing..."
                        : "Close Sign-ups"}
                    </button>
                  )}

                  {evt.status === "CLOSED" && (
                    <button
                      disabled={statusUpdatingId === evt.id}
                      onClick={() =>
                        handleStatusChange(evt, "PUBLISHED")
                      }
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60 transition-colors disabled:opacity-50"
                    >
                      {statusUpdatingId === evt.id
                        ? "Reopening..."
                        : "Reopen"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Event Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-zinc-800 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">
                Edit Event #{editingEvent.id}
              </h2>

              <button
                onClick={() => setEditingEvent(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 text-xl font-semibold leading-none"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Title *
                </label>

                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                {editErrors.title && (
                  <p className="mt-1 text-xs text-red-600">
                    {editErrors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Description
                </label>

                <textarea
                  rows={2}
                  value={editFormData.description || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Location *
                </label>

                <input
                  type="text"
                  value={editFormData.location}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      location: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                {editErrors.location && (
                  <p className="mt-1 text-xs text-red-600">
                    {editErrors.location}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    Capacity Limit *
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={editFormData.capacity}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        capacity:
                          parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  {editErrors.capacity && (
                    <p className="mt-1 text-xs text-red-600">
                      {editErrors.capacity}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    Age Restriction *
                  </label>

                  <select
                    value={editFormData.ageRestriction}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        ageRestriction:
                          e.target.value as AgeRestriction,
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="ALL_AGES">All Ages</option>
                    <option value="THIRTEEN_PLUS">13+ Only</option>
                    <option value="EIGHTEEN_PLUS">18+ Only</option>
                    <option value="TWENTY_ONE_PLUS">
                      21+ Only
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    Ticket Price ($) *
                  </label>

                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editFormData.price}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        price:
                          parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  {editErrors.price && (
                    <p className="mt-1 text-xs text-red-600">
                      {editErrors.price}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    Status
                  </label>

                  <select
                    value={editFormData.status}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        status:
                          e.target.value as EventStatus,
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="CLOSED">Closed</option>
                    <option value="SOLD_OUT">Sold Out</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setEditingEvent(null)}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isUpdating}
                onClick={handleSaveEdit}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {isUpdating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
