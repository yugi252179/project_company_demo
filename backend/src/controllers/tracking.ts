import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/tracking/update
export const updateLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId, latitude, longitude, batteryLevel } = req.body;

    if (!employeeId || latitude === undefined || longitude === undefined) {
      res.status(400).json({ message: 'Missing required location fields' });
      return;
    }

    const log = await prisma.gpsLog.create({
      data: {
        employeeId,
        latitude,
        longitude,
        batteryLevel
      }
    });

    res.status(201).json({ message: 'Location updated', log });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/tracking/active
// For simplicity, we fetch the latest log for each employee from today.
export const getActiveLocations = async (req: Request, res: Response): Promise<void> => {
  try {
    // In a real production system, you might want a "LatestLocation" table or use Redis.
    // Here we query the latest GpsLog per employee.
    const employees = await prisma.employee.findMany({
      where: {
        user: {
          isActive: true
        }
      },
      include: {
        user: { select: { email: true, role: true } },
        gpsLogs: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      }
    });

    const activeLocations = employees
      .filter(emp => emp.gpsLogs.length > 0)
      .map(emp => ({
        employeeId: emp.id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.user.email,
        role: emp.user.role,
        latitude: emp.gpsLogs[0].latitude,
        longitude: emp.gpsLogs[0].longitude,
        batteryLevel: emp.gpsLogs[0].batteryLevel,
        timestamp: emp.gpsLogs[0].timestamp
      }));

    res.json(activeLocations);
  } catch (error) {
    console.error('Get active locations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
