import { EmergencyRequest, ResourceUnit, Severity, ResourceStatus, DisasterType, ResourceType } from '../types';
import { INITIAL_REQUESTS, INITIAL_RESOURCES } from '../constants';

const STORAGE_KEY_REQUESTS = 'dpi4_requests';
const STORAGE_KEY_RESOURCES = 'dpi4_resources';

export const DataService = {
  getRequests: (): EmergencyRequest[] => {
    const stored = localStorage.getItem(STORAGE_KEY_REQUESTS);
    return stored ? JSON.parse(stored) : [];
  },

  getResources: (): ResourceUnit[] => {
    const stored = localStorage.getItem(STORAGE_KEY_RESOURCES);
    return stored ? JSON.parse(stored) : [];
  },

  saveData: (requests: EmergencyRequest[], resources: ResourceUnit[]) => {
    localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(requests));
    localStorage.setItem(STORAGE_KEY_RESOURCES, JSON.stringify(resources));
  },

  generateMockAlert: (): EmergencyRequest => {
    const id = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;

    // Pick a random disaster type
    const disasterTypes = Object.values(DisasterType);
    const type = disasterTypes[Math.floor(Math.random() * disasterTypes.length)];

    // Pick a random severity
    const severities = [Severity.LOW, Severity.MEDIUM, Severity.HIGH, Severity.CRITICAL];
    const severity = severities[Math.floor(Math.random() * severities.length)];

    // Determine appropriate resource based on disaster type


    // Simple mapping logic
    const getResourceForType = (dType: DisasterType): ResourceType => {
      switch (dType) {
        case DisasterType.MEDICAL_EMERGENCY:
        case DisasterType.TRAFFIC_ACCIDENT:
        case DisasterType.DOMESTIC_VIOLENCE:
          return ResourceType.AMBULANCE;
        case DisasterType.FLOOD:
        case DisasterType.HURRICANE:
        case DisasterType.EARTHQUAKE:
          return ResourceType.RESCUE_UNIT;
        case DisasterType.WILDFIRE:
        case DisasterType.FIRE:
        case DisasterType.CHEMICAL_SPILL:
          return ResourceType.RESCUE_UNIT;
        case DisasterType.THEFT:
          // No police in ResourceType? 
          // Maybe add Police to ResourceType or map to Rescue Unit for now.
          return ResourceType.RESCUE_UNIT;
        default:
          return ResourceType.RESCUE_UNIT;
      }
    };

    const resourceNeeded = getResourceForType(type);

    return {
      id,
      status: 'Pending',
      timestamp: new Date().toISOString(),
      location: {
        lat: 34.0522 + (Math.random() - 0.5) * 0.1,
        lng: -118.2437 + (Math.random() - 0.5) * 0.1
      },
      priorityScore: 0, // Will be calculated by allocation engine
      disasterType: type,
      severity,
      resourceNeeded,
      description: `Simulated alert: ${type} reported near downtown area.`,
      syncStatus: 'synced'
    };
  }
};
