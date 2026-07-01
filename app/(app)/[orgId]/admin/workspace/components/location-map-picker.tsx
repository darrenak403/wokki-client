"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Loader2, LocateFixed } from "lucide-react";

// Default Leaflet marker icon assets are served from a CDN path that doesn't resolve under
// Next.js's bundler; point them at unpkg explicitly so the pin renders.
const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const DEFAULT_CENTER: [number, number] = [10.7769, 106.7009]; // Ho Chi Minh City fallback

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "Accept-Language": "vi" } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { display_name?: string };
    return data.display_name ?? null;
  } catch {
    return null;
  }
}

interface LocationMapPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (latitude: number, longitude: number) => void;
  onAddressFound?: (address: string) => void;
}

function ClickHandler({ onChange }: Pick<LocationMapPickerProps, "onChange">) {
  useMapEvents({
    click: (event) => onChange(event.latlng.lat, event.latlng.lng),
  });
  return null;
}

function SetViewOnTarget({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.setView(target, 17);
  }, [map, target]);
  return null;
}

export function LocationMapPicker({
  latitude,
  longitude,
  onChange,
  onAddressFound,
}: LocationMapPickerProps) {
  const position: [number, number] | null =
    latitude !== null && longitude !== null ? [latitude, longitude] : null;

  const [viewTarget, setViewTarget] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const hasInitialView = useRef(false);

  // Center map once when saved position loads from null → non-null (drawer reopened with existing data)
  useEffect(() => {
    if (!hasInitialView.current && latitude !== null && longitude !== null) {
      hasInitialView.current = true;
      setViewTarget([latitude, longitude]);
    }
  }, [latitude, longitude]);

  const triggerGeocode = useCallback(
    async (lat: number, lng: number) => {
      if (!onAddressFound) return;
      const address = await reverseGeocode(lat, lng);
      if (address) onAddressFound(address);
    },
    [onAddressFound],
  );

  const handleChange = useCallback(
    (lat: number, lng: number) => {
      onChange(lat, lng);
      void triggerGeocode(lat, lng);
    },
    [onChange, triggerGeocode],
  );

  const handleMarkerDrag = useCallback(
    (event: L.LeafletEvent) => {
      const marker = event.target as L.Marker;
      const { lat, lng } = marker.getLatLng();
      handleChange(lat, lng);
    },
    [handleChange],
  );

  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const lat = coords.latitude;
        const lng = coords.longitude;
        handleChange(lat, lng);
        setViewTarget([lat, lng]);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 },
    );
  }, [handleChange]);

  return (
    <div className="relative h-64 w-full overflow-hidden rounded-lg border">
      <MapContainer
        center={position ?? DEFAULT_CENTER}
        zoom={position ? 16 : 12}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onChange={handleChange} />
        <SetViewOnTarget target={viewTarget} />
        {position ? (
          <Marker
            position={position}
            icon={markerIcon}
            draggable
            eventHandlers={{ dragend: handleMarkerDrag }}
          />
        ) : null}
      </MapContainer>

      <div className="absolute bottom-2 right-2 z-[1000]">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={handleUseCurrentLocation}
          disabled={locating}
          className="shadow-md"
        >
          {locating ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <LocateFixed className="mr-1.5 h-3.5 w-3.5" />
          )}
          Vị trí hiện tại
        </Button>
      </div>
    </div>
  );
}
