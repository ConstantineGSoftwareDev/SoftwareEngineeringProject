import type { Metadata } from "next";
import CreatorDashboard from "./CreatorDashboard";

export const metadata: Metadata = {
  title: "Creator Dashboard | OpenFest",
  description: "Manage your outdoor events, edit details, and track event status",
};

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <CreatorDashboard />
    </div>
  );
}
