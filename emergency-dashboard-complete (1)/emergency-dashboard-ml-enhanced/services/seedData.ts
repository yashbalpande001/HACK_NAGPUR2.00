import { EmergencyRequest, ResourceUnit, Severity, ResourceType, ResourceStatus, DisasterType, User } from '../types';

const INDIAN_CITIES = [
  { city: 'Delhi', lat: 28.6139, lng: 77.2090 },
  { city: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { city: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
  { city: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { city: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  { city: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  { city: 'Pune', lat: 18.5204, lng: 73.8567 },
  { city: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { city: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  { city: 'Lucknow', lat: 26.8467, lng: 80.9462 }
];

const DISASTER_TEMPLATES = [
  { type: DisasterType.FLOOD, descriptions: [
    'Heavy rainfall causing waterlogging', 'River overflow flooding streets', 'Flash flood emergency',
    'Basement flooding in residential area', 'Road submerged under water', 'Drainage system overflow'
  ]},
  { type: DisasterType.FIRE, descriptions: [
    'Building fire with smoke visible', 'Electrical fire in commercial complex', 'Vehicle fire blocking road',
    'Forest fire spreading rapidly', 'Kitchen fire in apartment', 'Factory fire emergency'
  ]},
  { type: DisasterType.EARTHQUAKE, descriptions: [
    'Building collapse after tremors', 'Structural damage to old building', 'Cracks in residential complex',
    'Bridge structural compromise', 'Landslide blocking highway', 'Building evacuation needed'
  ]},
  { type: DisasterType.MEDICAL_EMERGENCY, descriptions: [
    'Cardiac arrest at public place', 'Accident victim needs ambulance', 'Elderly person unconscious',
    'Child with severe allergic reaction', 'Snake bite emergency', 'Heat stroke victim'
  ]},
  { type: DisasterType.TRAFFIC_ACCIDENT, descriptions: [
    'Multi-vehicle collision', 'Pedestrian hit by vehicle', 'Bus accident with injuries',
    'Two-wheeler accident', 'Truck overturned blocking road', 'Hit and run case'
  ]}
];

export function generateLargeDataset() {
  const requests: EmergencyRequest[] = [];
  const resources: ResourceUnit[] = [];
  const users: User[] = [];

  // Generate 500+ emergency requests
  for (let i = 0; i < 500; i++) {
    const city = INDIAN_CITIES[Math.floor(Math.random() * INDIAN_CITIES.length)];
    const template = DISASTER_TEMPLATES[Math.floor(Math.random() * DISASTER_TEMPLATES.length)];
    const severity = [Severity.LOW, Severity.MEDIUM, Severity.HIGH, Severity.CRITICAL][Math.floor(Math.random() * 4)];
    const description = template.descriptions[Math.floor(Math.random() * template.descriptions.length)];
    
    // 20% spam as per Mutation A
    const isSpam = Math.random() < 0.2;
    const spamScore = isSpam ? 0.6 + Math.random() * 0.3 : Math.random() * 0.4;
    
    // Random time within last 7 days
    const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();
    
    // Random status distribution
    let status: 'Pending' | 'Allocated' | 'Resolved';
    const rand = Math.random();
    if (rand < 0.3) status = 'Pending';
    else if (rand < 0.6) status = 'Allocated';
    else status = 'Resolved';

    const request: EmergencyRequest = {
      id: `REQ-${String(1000 + i).padStart(5, '0')}`,
      disasterType: template.type,
      severity,
      location: {
        lat: city.lat + (Math.random() - 0.5) * 0.2,
        lng: city.lng + (Math.random() - 0.5) * 0.2
      },
      resourceNeeded: [ResourceType.AMBULANCE, ResourceType.RESCUE_UNIT, ResourceType.MEDICAL_TEAM][Math.floor(Math.random() * 3)],
      timestamp,
      description: `${description} - ${city.city}`,
      status,
      priorityScore: severity === Severity.CRITICAL ? 90 + Math.random() * 10 :
                     severity === Severity.HIGH ? 70 + Math.random() * 20 :
                     severity === Severity.MEDIUM ? 40 + Math.random() * 30 : Math.random() * 40,
      syncStatus: 'synced',
      reporterId: `user-${Math.floor(Math.random() * 100)}`,
      verificationStatus: isSpam ? 'reviewing' : 'approved',
      spamScore,
      trustScore: isSpam ? 20 + Math.random() * 30 : 60 + Math.random() * 40,
      verificationReasons: isSpam ? 
        ['⚠️ Flagged by spam detection', '⚠️ Low trust score', 'ℹ️ Under review'] :
        ['✓ Image verified', '✓ Trust verified', '✓ Location confirmed'],
      imageData: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2U8L3RleHQ+PC9zdmc+',
      completionVerified: status === 'Resolved' ? true : undefined,
      completedAt: status === 'Resolved' ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString() : undefined
    };

    if (status === 'Allocated' || status === 'Resolved') {
      request.assignedResourceId = `RES-${String(Math.floor(Math.random() * 100)).padStart(3, '0')}`;
    }

    requests.push(request);
  }

  // Generate 100+ resources across cities
  for (let i = 0; i < 100; i++) {
    const city = INDIAN_CITIES[Math.floor(Math.random() * INDIAN_CITIES.length)];
    const types = [ResourceType.AMBULANCE, ResourceType.RESCUE_UNIT, ResourceType.MEDICAL_TEAM, ResourceType.FOOD_SUPPLY];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const names = {
      [ResourceType.AMBULANCE]: ['EMS Ambulance', 'Rapid Response', 'Mobile ICU', 'Trauma Care Unit'],
      [ResourceType.RESCUE_UNIT]: ['NDRF Team', 'Fire Brigade', 'Quick Response Team', 'Rescue Squad'],
      [ResourceType.MEDICAL_TEAM]: ['Medical Team', 'Paramedic Unit', 'Health Response', 'Emergency Medics'],
      [ResourceType.FOOD_SUPPLY]: ['Relief Camp', 'Food Distribution', 'Supply Hub', 'Aid Center']
    };

    const resource: ResourceUnit = {
      id: `RES-${String(i).padStart(3, '0')}`,
      name: `${names[type][Math.floor(Math.random() * names[type].length)]} ${i + 1}`,
      type,
      quantity: type === ResourceType.FOOD_SUPPLY ? 500 + Math.floor(Math.random() * 500) : 1,
      status: Math.random() < 0.7 ? ResourceStatus.AVAILABLE : ResourceStatus.IN_USE,
      location: {
        lat: city.lat + (Math.random() - 0.5) * 0.1,
        lng: city.lng + (Math.random() - 0.5) * 0.1
      }
    };

    resources.push(resource);
  }

  // Generate 50 users with varying trust scores
  for (let i = 0; i < 50; i++) {
    const roles: ('citizen' | 'authority' | 'civil_servant')[] = ['citizen', 'citizen', 'citizen', 'civil_servant', 'authority'];
    const role = roles[Math.floor(Math.random() * roles.length)];
    
    const totalReports = Math.floor(Math.random() * 20);
    const verifiedReports = Math.floor(totalReports * (0.6 + Math.random() * 0.3));
    const spamReports = Math.floor(totalReports * Math.random() * 0.2);

    users.push({
      id: `user-${i}`,
      name: `User ${i + 1}`,
      email: `user${i}@example.com`,
      contactNumber: `+91-${String(Math.floor(Math.random() * 9000000000) + 1000000000)}`,
      role,
      trustScore: 50 + (verifiedReports / (totalReports || 1)) * 40 - (spamReports / (totalReports || 1)) * 60,
      totalReports,
      verifiedReports,
      spamReports,
      lastReportTime: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
    });
  }

  return { requests, resources, users };
}

export function initializeSeedData() {
  return generateLargeDataset();
}
