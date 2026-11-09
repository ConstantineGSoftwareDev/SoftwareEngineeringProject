
import type { Metadata } from "next";
import CreatorDashboard from "./CreatorDashboard";
import MyRsvps from "./MyRsvps";

export const metadata: Metadata = {
  title: "Dashboard | OpenFest",
  description: "Manage your events and view your reservations",
};

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <CreatorDashboard />
      <MyRsvps />
    </div>
  );
}
