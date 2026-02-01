import { EmergencyRequest, ResourceUnit, User } from '../types';

interface ProximityMatch {
  resourceId: string;
  distance: number; // in km
  eta: number; // in minutes
  name: string;
  isNearby: boolean; // within 5km
}

interface ResponderProximity {
  responderId: string;
  name: string;
  nearbyIncidents: {
    requestId: string;
    distance: number;
    severity: string;
    disasterType: string;
    description: string;
  }[];
  totalNearby: number;
}

class ProximityService {
  private readonly EARTH_RADIUS_KM = 6371;
  private readonly NEARBY_THRESHOLD_KM = 5;
  private readonly AVG_SPEED_KMH = 40; // Average speed in city

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return this.EARTH_RADIUS_KM * c;
  }

  /**
   * Find nearest resources for an emergency request
   */
  findNearestResources(
    request: EmergencyRequest,
    allResources: ResourceUnit[],
    limit: number = 5
  ): ProximityMatch[] {
    if (!request.location) return [];

    const matches = allResources
      .filter(r => r.type === request.resourceNeeded)
      .map(resource => {
        const distance = this.calculateDistance(
          request.location!.lat,
          request.location!.lng,
          resource.location.lat,
          resource.location.lng
        );

        const eta = Math.round((distance / this.AVG_SPEED_KMH) * 60);

        return {
          resourceId: resource.id,
          distance: parseFloat(distance.toFixed(2)),
          eta,
          name: resource.name,
          isNearby: distance <= this.NEARBY_THRESHOLD_KM
        };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return matches;
  }

  /**
   * Find nearby incidents for a responder based on their current location
   */
  findNearbyIncidentsForResponder(
    responderLocation: { lat: number; lng: number },
    allRequests: EmergencyRequest[],
    maxDistance: number = 10
  ): ResponderProximity['nearbyIncidents'] {
    return allRequests
      .filter(req => req.status === 'Pending' && req.location)
      .map(req => {
        const distance = this.calculateDistance(
          responderLocation.lat,
          responderLocation.lng,
          req.location!.lat,
          req.location!.lng
        );

        return {
          requestId: req.id,
          distance: parseFloat(distance.toFixed(2)),
          severity: req.severity,
          disasterType: req.disasterType,
          description: req.description
        };
      })
      .filter(match => match.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);
  }

  /**
   * Get proximity alerts for all responders
   */
  getProximityAlertsForResponders(
    responders: User[],
    requests: EmergencyRequest[]
  ): ResponderProximity[] {
    return responders
      .filter(r => r.role === 'civil_servant')
      .map(responder => {
        // Assume responder location from their last activity or default location
        // In real app, this would come from GPS tracking
        const responderLat = 28.6139 + (Math.random() - 0.5) * 0.1;
        const responderLng = 77.2090 + (Math.random() - 0.5) * 0.1;

        const nearbyIncidents = this.findNearbyIncidentsForResponder(
          { lat: responderLat, lng: responderLng },
          requests
        );

        return {
          responderId: responder.id,
          name: responder.name,
          nearbyIncidents,
          totalNearby: nearbyIncidents.length
        };
      })
      .filter(r => r.totalNearby > 0)
      .sort((a, b) => b.totalNearby - a.totalNearby);
  }

  /**
   * Estimate time to reach location
   */
  estimateETA(distance: number, trafficFactor: number = 1.2): number {
    // trafficFactor: 1.0 = no traffic, 1.5 = heavy traffic
    const baseTime = (distance / this.AVG_SPEED_KMH) * 60;
    return Math.round(baseTime * trafficFactor);
  }

  /**
   * Check if resource is in vicinity of incident
   */
  isInVicinity(
    resourceLocation: { lat: number; lng: number },
    incidentLocation: { lat: number; lng: number },
    thresholdKm: number = 5
  ): boolean {
    const distance = this.calculateDistance(
      resourceLocation.lat,
      resourceLocation.lng,
      incidentLocation.lat,
      incidentLocation.lng
    );
    return distance <= thresholdKm;
  }

  /**
   * Get geographical clusters of incidents
   */
  getIncidentClusters(
    requests: EmergencyRequest[],
    radiusKm: number = 2
  ): Array<{
    center: { lat: number; lng: number };
    incidents: string[];
    count: number;
    avgSeverity: string;
  }> {
    const clusters: Array<{
      center: { lat: number; lng: number };
      incidents: string[];
      count: number;
      avgSeverity: string;
    }> = [];

    const processed = new Set<string>();

    requests.forEach(req => {
      if (!req.location || processed.has(req.id)) return;

      const nearby = requests.filter(r => {
        if (!r.location || processed.has(r.id)) return false;
        
        const distance = this.calculateDistance(
          req.location!.lat,
          req.location!.lng,
          r.location.lat,
          r.location.lng
        );

        return distance <= radiusKm;
      });

      if (nearby.length >= 2) {
        nearby.forEach(r => processed.add(r.id));
        
        clusters.push({
          center: req.location!,
          incidents: nearby.map(r => r.id),
          count: nearby.length,
          avgSeverity: this.calculateAverageSeverity(nearby)
        });
      }
    });

    return clusters.sort((a, b) => b.count - a.count);
  }

  private calculateAverageSeverity(requests: EmergencyRequest[]): string {
    const severityMap = { Low: 1, Medium: 2, High: 3, Critical: 4 };
    const avg = requests.reduce((sum, r) => sum + severityMap[r.severity], 0) / requests.length;
    
    if (avg >= 3.5) return 'Critical';
    if (avg >= 2.5) return 'High';
    if (avg >= 1.5) return 'Medium';
    return 'Low';
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export const proximityService = new ProximityService();
