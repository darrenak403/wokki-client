import { LocationsPanel } from "@/app/(app)/admin/locations/components/locations-panel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Chi nhánh — Manager",
  path: "/manager/locations",
  noindex: true,
});

export default function ManagerLocationsPage() {
  return <LocationsPanel canWrite={false} />;
}
