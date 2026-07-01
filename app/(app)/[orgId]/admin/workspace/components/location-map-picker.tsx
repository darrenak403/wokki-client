"use client";

import { useCallback } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

interface LocationMapPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (latitude: number, longitude: number) => void;
}

function ClickHandler({ onChange }: Pick<LocationMapPickerProps, "onChange">) {
  useMapEvents({
    click: (event) => onChange(event.latlng.lat, event.latlng.lng),
  });
  return null;
}

export function LocationMapPicker({ latitude, longitude, onChange }: LocationMapPickerProps) {
  const position: [number, number] | null =
    latitude !== null && longitude !== null ? [latitude, longitude] : null;

  const handleMarkerDrag = useCallback(
    (event: L.LeafletEvent) => {
      const marker = event.target as L.Marker;
      const { lat, lng } = marker.getLatLng();
      onChange(lat, lng);
    },
    [onChange]
  );

  return (
    <div className="h-64 w-full overflow-hidden rounded-lg border">
      <MapContainer
        center={position ?? DEFAULT_CENTER}
        zoom={position ? 16 : 12}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onChange={onChange} />
        {position ? (
          <Marker
            position={position}
            icon={markerIcon}
            draggable
            eventHandlers={{ dragend: handleMarkerDrag }}
          />
        ) : null}
      </MapContainer>
    </div>
  );
}
