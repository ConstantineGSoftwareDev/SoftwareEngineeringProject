"use server";

export type AgeRestriction = "ALL_AGES" | "THIRTEEN_PLUS" | "EIGHTEEN_PLUS" | "TWENTY_ONE_PLUS";
export type EventStatus = "DRAFT" | "PUBLISHED" | "CLOSED" | "SOLD_OUT";

export interface CreateEventPayload {
  title: string;
  description: string | null;
  location: string;
  capacity: number;
  ageRestriction: AgeRestriction;
  price: number;
  status: EventStatus;
}

export interface UpdateEventPayload {
  title: string;
  description: string | null;
  location: string;
  capacity: number;
  ageRestriction: AgeRestriction;
  price: number;
  status?: EventStatus;
}

export interface EventResponse {
  id: number;
  creatorId: number | null;
  creatorEmail: string | null;
  title: string;
  description: string;
  location: string;
  capacity: number;
  ageRestriction: AgeRestriction;
  price: number;
  status: EventStatus;
  createdAt: string;
}

const getBackendUrl = () => process.env.INTERNAL_API_URL || "http://localhost:8080";

export async function createEventAction(payload: CreateEventPayload): Promise<EventResponse> {
  const backendUrl = getBackendUrl();

  let res: Response;
  try {
    res = await fetch(`${backendUrl}/api/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("An unexpected error occured.");
  }

  if (!res.ok) {
    let errorMessage = `Server returned status ${res.status}`;
    try {
      const errorData = await res.json();
      if (errorData?.message) {
        errorMessage = errorData.message;
      }
    } catch {
      if (res.status === 502 || res.status === 504 || res.status === 500) {
        errorMessage = "An unexpected error occured.";
      }
    }
    throw new Error(errorMessage);
  }

  return await res.json();
}

export async function getCreatorEventsAction(): Promise<EventResponse[]> {
  const backendUrl = getBackendUrl();

  let res: Response;
  try {
    res = await fetch(`${backendUrl}/api/events/creator`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
  } catch {
    throw new Error("Unable to connect to the server. Please check your backend.");
  }

  if (!res.ok) {
    let errorMessage = `Failed to fetch events (${res.status})`;
    try {
      const errorData = await res.json();
      if (errorData?.message) errorMessage = errorData.message;
    } catch {
      // fallback
    }
    throw new Error(errorMessage);
  }

  return await res.json();
}

export async function updateEventAction(
  id: number,
  payload: UpdateEventPayload
): Promise<EventResponse> {
  const backendUrl = getBackendUrl();

  let res: Response;
  try {
    res = await fetch(`${backendUrl}/api/events/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("Unable to connect to the server.");
  }

  if (!res.ok) {
    let errorMessage = `Failed to update event (${res.status})`;
    try {
      const errorData = await res.json();
      if (errorData?.message) errorMessage = errorData.message;
    } catch {
      // fallback
    }
    throw new Error(errorMessage);
  }

  return await res.json();
}

export async function updateEventStatusAction(
  id: number,
  status: EventStatus
): Promise<EventResponse> {
  const backendUrl = getBackendUrl();

  let res: Response;
  try {
    res = await fetch(`${backendUrl}/api/events/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });
  } catch {
    throw new Error("Unable to connect to the server.");
  }

  if (!res.ok) {
    let errorMessage = `Failed to update event status (${res.status})`;
    try {
      const errorData = await res.json();
      if (errorData?.message) errorMessage = errorData.message;
    } catch {
      // fallback
    }
    throw new Error(errorMessage);
  }

  return await res.json();
}
