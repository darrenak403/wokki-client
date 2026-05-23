import { LocationsPanel } from "@/app/(app)/admin/locations/components/LocationsPanel";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Chi nhánh — Admin",
  path: "/admin/locations",
  noindex: true,
});

export default function AdminLocationsPage() {
  return <LocationsPanel canWrite />;
}
