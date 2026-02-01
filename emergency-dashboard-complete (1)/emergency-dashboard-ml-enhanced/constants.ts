
import { EmergencyRequest, ResourceUnit, Severity, ResourceType, ResourceStatus, DisasterType, EmergencyArea, SurvivalTip } from './types';

export const AREAS: EmergencyArea[] = [
  { id: 'Z-01', name: 'South Delhi Metro', district: 'Delhi' },
  { id: 'Z-02', name: 'Bandra West Coastal', district: 'Mumbai' },
  { id: 'Z-03', name: 'Whitefield Tech Corridor', district: 'Bengaluru' },
  { id: 'Z-04', name: 'Salt Lake Sector V', district: 'Kolkata' },
  { id: 'Z-05', name: 'Anna Nagar West', district: 'Chennai' },
];

export const SURVIVAL_GUIDES: SurvivalTip[] = [
  {
    id: 'G-01',
    disasterType: DisasterType.FLOOD,
    title: 'Flood Survival Protocol',
    priority: 'Primary',
    content: [
      'Move to the highest floor or roof. Do not climb into closed attics.',
      'Turn off main power and gas valves if you can safely reach them.',
      'Do not walk, swim, or drive through flood waters.',
      'Keep a battery-powered radio for official emergency updates.'
    ]
  },
  {
    id: 'G-02',
    disasterType: DisasterType.EARTHQUAKE,
    title: 'Earthquake: Drop, Cover, Hold',
    priority: 'Primary',
    content: [
      'DROP to the ground before the earthquake drops you.',
      'COVER your head and neck under a sturdy table or desk.',
      'HOLD ON to your shelter until the shaking stops.',
      'If outdoors, move away from buildings, streetlights, and utility wires.'
    ]
  },
  {
    id: 'G-03',
    disasterType: DisasterType.CHEMICAL_SPILL,
    title: 'Chemical Safety',
    priority: 'Secondary',
    content: [
      'Go indoors immediately and close all windows and doors.',
      'Turn off all ventilation systems (AC, fans).',
      'Use wet towels to seal gaps under doors or windows.',
      'Listen for evacuation orders via radio or megaphone.'
    ]
  },
  {
    id: 'G-04',
    disasterType: DisasterType.MEDICAL_EMERGENCY,
    title: 'basic Life Support (CPR)',
    priority: 'Primary',
    content: [
      'Check for responsiveness and breathing.',
      'Call for help immediately.',
      'Push hard and fast in the center of the chest (100-120 bpm).',
      'Continue until help arrives or the person starts breathing.'
    ]
  },
  {
    id: 'G-05',
    disasterType: DisasterType.FIRE,
    title: 'Fire Escape Plan',
    priority: 'Primary',
    content: [
      'Stay low to the ground to avoid smoke inhalation.',
      'Touch doors with the back of your hand before opening. If hot, do not open.',
      'Use the nearest exit or window. Do not use elevators.',
      'Stop, Drop, and Roll if your clothes catch fire.'
    ]
  }
];

export const INITIAL_REQUESTS: EmergencyRequest[] = [
  {
    id: 'REQ-1001',
    disasterType: DisasterType.FLOOD,
    severity: Severity.CRITICAL,
    location: { lat: 34.0522, lng: -118.2437 },
    areaId: 'Z-01',
    resourceNeeded: ResourceType.RESCUE_UNIT,
    timestamp: new Date().toISOString(),
    description: 'Sudden flash flood. Water levels rising rapidly near metro station.',
    status: 'Pending',
    priorityScore: 95,
    syncStatus: 'synced'
  },
  {
    id: 'REQ-1002',
    disasterType: DisasterType.EARTHQUAKE,
    severity: Severity.HIGH,
    location: { lat: 34.0822, lng: -118.2737 },
    areaId: 'Z-02',
    resourceNeeded: ResourceType.MEDICAL_TEAM,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    description: 'Old building structural compromise. Potential injuries inside.',
    status: 'Pending',
    priorityScore: 75,
    syncStatus: 'synced'
  },
  {
    id: 'REQ-1003',
    disasterType: DisasterType.MEDICAL_EMERGENCY,
    severity: Severity.CRITICAL,
    location: { lat: 34.0722, lng: -118.2637 },
    areaId: 'Z-02',
    resourceNeeded: ResourceType.AMBULANCE,
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    description: 'Severe cardiac arrest incident at public park.',
    status: 'Pending',
    priorityScore: 90,
    syncStatus: 'synced'
  },
  {
    id: 'REQ-1004',
    disasterType: DisasterType.TRAFFIC_ACCIDENT,
    severity: Severity.MEDIUM,
    location: { lat: 34.0922, lng: -118.2837 },
    areaId: 'Z-03',
    resourceNeeded: ResourceType.AMBULANCE,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    description: 'Two car collision, minor injuries reported.',
    status: 'Pending',
    priorityScore: 50,
    syncStatus: 'synced'
  },
  {
    id: 'REQ-1005',
    disasterType: DisasterType.FIRE,
    severity: Severity.HIGH,
    location: { lat: 34.0622, lng: -118.2537 },
    areaId: 'Z-01',
    resourceNeeded: ResourceType.RESCUE_UNIT,
    timestamp: new Date(Date.now() - 900000).toISOString(),
    description: 'Apartment complex fire, smoke visible from 3rd floor.',
    status: 'Pending',
    priorityScore: 85,
    syncStatus: 'synced'
  }
];

export const INITIAL_RESOURCES: ResourceUnit[] = [
  {
    id: 'RES-001',
    name: 'NDRF Response Alpha',
    type: ResourceType.RESCUE_UNIT,
    quantity: 1,
    status: ResourceStatus.AVAILABLE,
    location: { lat: 34.0400, lng: -118.2500 }
  },
  {
    id: 'RES-002',
    name: 'Apollo Medical Van 3',
    type: ResourceType.MEDICAL_TEAM,
    quantity: 1,
    status: ResourceStatus.AVAILABLE,
    location: { lat: 34.1000, lng: -118.2000 }
  },
  {
    id: 'RES-003',
    name: 'State Relief Hub',
    type: ResourceType.FOOD_SUPPLY,
    quantity: 1000,
    status: ResourceStatus.AVAILABLE,
    location: { lat: 33.9500, lng: -118.3500 }
  },
  {
    id: 'RES-004',
    name: 'EMS 108 Responder',
    type: ResourceType.AMBULANCE,
    quantity: 1,
    status: ResourceStatus.AVAILABLE,
    location: { lat: 34.0600, lng: -118.2200 }
  },
  {
    id: 'RES-005',
    name: 'City Fire Brigade 1',
    type: ResourceType.RESCUE_UNIT, // Using Rescue for Fire for now or expand ResourceType
    quantity: 1,
    status: ResourceStatus.AVAILABLE,
    location: { lat: 34.0550, lng: -118.2450 }
  },
  {
    id: 'RES-006',
    name: 'Rapid Response Bike',
    type: ResourceType.MEDICAL_TEAM,
    quantity: 1,
    status: ResourceStatus.AVAILABLE,
    location: { lat: 34.0750, lng: -118.2650 }
  }
];
