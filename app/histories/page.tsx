import type { Metadata } from "next";
import { HistoriesScreen } from "@/screens/histories";

export const metadata: Metadata = {
  title: "Booking Histories",
  description: "Your local Classic Coffee Class booking histories.",
  alternates: {
    canonical: "/histories"
  }
};

export default function Page() {
  return <HistoriesScreen />;
}
