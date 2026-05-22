import { LocationsPanel } from "@/app/(app)/admin/locations/components/locations-panel";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Chi nhánh — Admin",
  path: "/admin/locations",
  noindex: true,
});

export default function AdminLocationsPage() {
  return <LocationsPanel canWrite />;
}
