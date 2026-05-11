'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { io, Socket } from 'socket.io-client';
import type { LocationData } from '../../../components/MapComponent';

// Dynamically import MapComponent to disable SSR
const MapComponent = dynamic(() => import('../../../components/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-100">Loading Map...</div>
});

export default function AdminTrackingPage() {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const fetchActiveLocations = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/tracking/active', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          // Transform to MapComponent LocationData format
          const formattedLocations = data.map((emp: any) => ({
            id: emp.employeeId,
            name: `${emp.firstName} ${emp.lastName}`,
            lat: emp.latitude,
            lng: emp.longitude,
            batteryLevel: emp.batteryLevel,
            timestamp: emp.timestamp
          }));
          setLocations(formattedLocations);
        }
      } catch (error) {
        console.error('Error fetching active locations', error);
      }
    };

    fetchActiveLocations();

    // Setup Socket.io
    socketRef.current = io('http://localhost:5000');
    socketRef.current.on('employeeLocationUpdate', (data: any) => {
      setLocations((prev) => {
        const index = prev.findIndex(loc => loc.id === data.employeeId);
        
        const updatedLoc: LocationData = index >= 0 
          ? { ...prev[index], lat: data.latitude, lng: data.longitude, batteryLevel: data.batteryLevel, timestamp: new Date().toISOString() }
          : { id: data.employeeId, lat: data.latitude, lng: data.longitude, name: `Employee ${data.employeeId}`, batteryLevel: data.batteryLevel, timestamp: new Date().toISOString() };
        
        if (index >= 0) {
          const newLocations = [...prev];
          newLocations[index] = updatedLoc;
          return newLocations;
        } else {
          return [...prev, updatedLoc];
        }
      });
    });

    socketRef.current.on('employeeDeleted', (data: any) => {
      setLocations((prev) => prev.filter(loc => loc.id !== data.employeeId));
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-800">Live Employee Tracking</h1>
        <p className="text-gray-600">Real-time monitoring of field employees</p>
      </div>
      
      <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <MapComponent locations={locations} />
      </div>
    </div>
  );
}
