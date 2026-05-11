'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in leaflet with nextjs
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export interface LocationData {
  id: string;
  lat: number;
  lng: number;
  name: string;
  batteryLevel?: number;
  timestamp?: string;
}

interface MapComponentProps {
  locations: LocationData[];
  center?: [number, number];
  zoom?: number;
}

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function MapComponent({ locations, center = [0, 0], zoom = 2 }: MapComponentProps) {
  // Auto-center based on first location if default is used
  const mapCenter: [number, number] = locations.length > 0 && center[0] === 0 ? [locations[0].lat, locations[0].lng] : center;
  const mapZoom = locations.length > 0 && zoom === 2 ? 14 : zoom;

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%', zIndex: 0 }}>
        <ChangeView center={mapCenter} zoom={mapZoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((loc) => (
          <Marker key={loc.id} position={[loc.lat, loc.lng]}>
            <Popup>
              <strong>{loc.name}</strong><br />
              {loc.batteryLevel !== undefined && <>Battery: {loc.batteryLevel}%<br /></>}
              {loc.timestamp && <>Last updated: {new Date(loc.timestamp).toLocaleTimeString()}</>}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
