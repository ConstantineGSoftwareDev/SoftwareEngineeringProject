"use server";

export type AgeRestriction = "ALL_AGES" | "THIRTEEN_PLUS" | "EIGHTEEN_PLUS" | "TWENTY_ONE_PLUS";
export type EventStatus = "DRAFT" | "PUBLISHED";

export interface CreateEventPayload {
  title: string;
  description: string | null;
  location: string;
  capacity: number;
  ageRestriction: AgeRestriction;
  price: number;
  status: EventStatus;
}

export interface EventResponse {
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

export async function createEventAction(payload: CreateEventPayload): Promise<EventResponse> {
  const backendUrl = process.env.INTERNAL_API_URL || "http://localhost:8080";

  let res: Response;
  try {
    res = await fetch(`${backendUrl}/api/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "An unexpected error occured.";
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
