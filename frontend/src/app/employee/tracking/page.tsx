'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useRouter } from 'next/navigation';

export default function EmployeeTrackingPage() {
  const [tracking, setTracking] = useState(false);
  const [status, setStatus] = useState('Idle');
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check auth
    const token = localStorage.getItem('token');
    const employeeId = localStorage.getItem('employeeId');
    if (!token || !employeeId) {
      router.push('/login');
      return;
    }

    // Initialize socket
    socketRef.current = io('http://localhost:5000');

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      socketRef.current?.disconnect();
    };
  }, [router]);

  const startTracking = () => {
    if (!navigator.geolocation) {
      setStatus('Geolocation is not supported by your browser');
      return;
    }

    setTracking(true);
    setStatus('Locating...');

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        setStatus('Tracking Active');

        const employeeId = localStorage.getItem('employeeId');
        const token = localStorage.getItem('token');
        
        let batteryLevel = 100;
        try {
          if ('getBattery' in navigator) {
            const battery: any = await (navigator as any).getBattery();
            batteryLevel = Math.round(battery.level * 100);
          }
        } catch (e) {
          // ignore
        }

        const payload = {
          employeeId,
          latitude,
          longitude,
          batteryLevel
        };

        // Emit real-time update
        socketRef.current?.emit('updateLocation', payload);

        // Save to DB
        fetch('http://localhost:5000/api/tracking/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        }).catch(err => console.error('Error saving location', err));

      },
      (error) => {
        setStatus(`Error: ${error.message}`);
        setTracking(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000
      }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTracking(false);
    setStatus('Tracking Stopped');
  };

  const logout = () => {
    localStorage.clear();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <div className="bg-white rounded-lg shadow-md w-full max-w-md p-6 mt-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Live Tracking</h1>
          <div className="space-x-4">
            <button onClick={() => router.push('/employee/chat')} className="text-sm text-blue-600 hover:text-blue-800">Chat</button>
            <button onClick={logout} className="text-sm text-red-600 hover:text-red-800">Logout</button>
          </div>
        </div>
        
        <div className="mb-8 text-center">
          <div className={`mx-auto flex items-center justify-center w-32 h-32 rounded-full border-4 ${tracking ? 'border-green-500 animate-pulse' : 'border-gray-300'}`}>
            <span className={`text-5xl ${tracking ? 'text-green-500' : 'text-gray-400'}`}>
              📍
            </span>
          </div>
          <p className="mt-4 text-lg font-medium text-gray-700">{status}</p>
          {location && (
            <p className="text-sm text-gray-500 mt-2">
              Lat: {location.lat.toFixed(5)}, Lng: {location.lng.toFixed(5)}
            </p>
          )}
        </div>

        <div className="flex flex-col space-y-4">
          {!tracking ? (
            <button 
              onClick={startTracking}
              className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded shadow hover:bg-blue-700 transition"
            >
              Start Sharing Location
            </button>
          ) : (
            <button 
              onClick={stopTracking}
              className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded shadow hover:bg-red-700 transition"
            >
              Stop Sharing
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
