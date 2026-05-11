'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { io, Socket } from 'socket.io-client';
import type { LocationData } from '../../components/MapComponent';

// Dynamically import MapComponent to disable SSR
const MapComponent = dynamic(() => import('../../components/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-100">Loading Map...</div>
});

export default function AdminDashboard() {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [totalEmployees, setTotalEmployees] = useState<number | string>('...');
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

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/employees', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setTotalEmployees(data.length);
        }
      } catch (err) {
        console.error('Error fetching employees stat', err);
      }
    };

    fetchActiveLocations();
    fetchStats();

    // Setup Socket.io for live updates on the dashboard
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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Cards */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Total Employees</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{totalEmployees}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Active Trackers</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{locations.length}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Total Customers</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">890</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow border border-gray-100 flex flex-col" style={{ height: '500px' }}>
        <h3 className="text-gray-800 text-lg font-bold mb-4">Live Employee Tracking</h3>
        <div className="flex-1 rounded overflow-hidden">
          <MapComponent locations={locations} />
        </div>
      </div>
    </div>
  );
}
