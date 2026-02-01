import { EmergencyRequest, ResourceUnit, ResourceStatus, Severity, ResourceType } from '../types';

export const calculatePriorityScore = (request: EmergencyRequest): number => {
    let score = 0;

    // Base score from severity
    switch (request.severity) {
        case Severity.CRITICAL:
            score += 100;
            break;
        case Severity.HIGH:
            score += 75;
            break;
        case Severity.MEDIUM:
            score += 50;
            break;
        case Severity.LOW:
            score += 25;
            break;
    }

    // Time factor: +1 point for every 10 minutes pending
    const now = new Date().getTime();
    const requestTime = new Date(request.timestamp).getTime();
    const minutesPending = (now - requestTime) / (1000 * 60);
    score += Math.floor(minutesPending / 10);

    return score;
};

// Simple distance calculation (Haversine approximation or just Euclidean for short distances)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
};

const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
};

export interface AllocationResult {
    resourceId: string;
    distance: number;
}

export const getBestResource = (request: EmergencyRequest, resources: ResourceUnit[]): ResourceUnit | null => {
    if (!request.location) return null;

    // Filter for available resources of the correct type
    const availableResources = resources.filter(
        r => r.type === request.resourceNeeded && r.status === ResourceStatus.AVAILABLE
    );

    if (availableResources.length === 0) return null;

    // Find nearest resource
    let nearestResource: ResourceUnit | null = null;
    let minDistance = Infinity;

    for (const resource of availableResources) {
        if (!resource.location) continue;

        const distance = calculateDistance(
            request.location.lat,
            request.location.lng,
            resource.location.lat,
            resource.location.lng
        );

        if (distance < minDistance) {
            minDistance = distance;
            nearestResource = resource;
        }
    }

    return nearestResource;
};
