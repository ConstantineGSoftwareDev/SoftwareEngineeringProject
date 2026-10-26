import type { Metadata } from "next";
import EventCreateForm from "./EventCreateForm";

export const metadata: Metadata = {
  title: "Create Event | OpenFest",
  description: "Host and create a new outdoor activity",
};

export default function CreateEventPage() {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">
          Create New Event
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400">
          Fill in the details below to create your outdoor event. You can save it as
          a draft or publish it immediately.
        </p>
      </div>

      <EventCreateForm />
    </div>
  );
}
