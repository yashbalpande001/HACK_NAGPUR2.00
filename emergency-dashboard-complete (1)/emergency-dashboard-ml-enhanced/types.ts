
export enum Severity {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export enum ResourceStatus {
  AVAILABLE = 'Available',
  IN_USE = 'In-Use',
  MAINTENANCE = 'Maintenance'
}

export enum ResourceType {
  AMBULANCE = 'Ambulance',
  MEDICAL_TEAM = 'Medical Team',
  FOOD_SUPPLY = 'Food Supply',
  RESCUE_UNIT = 'Rescue Unit'
}

export enum DisasterType {
  EARTHQUAKE = 'Earthquake',
  FLOOD = 'Flood',
  WILDFIRE = 'Wildfire',
  HURRICANE = 'Hurricane',
  CHEMICAL_SPILL = 'Chemical Spill',
  MEDICAL_EMERGENCY = 'Medical Emergency',
  FIRE = 'Fire',
  TRAFFIC_ACCIDENT = 'Traffic Accident',
  THEFT = 'Theft',
  DOMESTIC_VIOLENCE = 'Domestic Violence',
  OTHER = 'Other'
}

// Added missing ZoneType for map visualization features
export enum ZoneType {
  ALERT = 'alert',
  SAFE = 'safe',
  RESTRICTED = 'restricted'
}

export type UserRole = 'guest' | 'citizen' | 'authority' | 'civil_servant';
export type ActiveView = 'home' | 'report' | 'dashboard' | 'inventory' | 'intelligence' | 'guidelines' | 'task';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  contactNumber: string;
  trustScore: number;
  totalReports: number;
  verifiedReports: number;
  spamReports: number;
  lastReportTime: number;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

// Added missing MapZone interface for geographic alerting
export interface MapZone {
  id: string;
  type: ZoneType;
  points: Coordinates[];
  color: string;
}

export interface EmergencyArea {
  id: string;
  name: string;
  district: string;
}

export interface SurvivalTip {
  id: string;
  title: string;
  disasterType: DisasterType;
  content: string[];
  priority: 'Primary' | 'Secondary';
}

export interface EmergencyRequest {
  id: string;
  disasterType: DisasterType;
  severity: Severity;
  computedSeverity?: Severity; // AI-suggested severity
  location: Coordinates;
  areaId?: string; // Manual area selection for DPI compatibility
  resourceNeeded: ResourceType; // Primary resource needed
  requestedResources?: ResourceType[]; // For multi-resource requests
  timestamp: string;
  description: string;
  voiceTranscript?: string; // Original voice input
  status: 'Pending' | 'Allocated' | 'Resolved';
  assignedResourceId?: string;
  priorityScore: number;
  syncStatus: 'synced' | 'pending';
  reporterId?: string; // Link to user
  
  // ML Verification Fields
  imageData?: string; // Base64 image (MANDATORY)
  imageAnalysis?: {
    hasDisaster: boolean;
    disasterType: DisasterType | null;
    confidence: number;
    features: string[];
  };
  verificationStatus?: 'approved' | 'reviewing' | 'rejected';
  spamScore?: number;
  trustScore?: number;
  verificationReasons?: string[];
  
  // Completion Verification
  completionImageData?: string;
  completionVerified?: boolean;
  completedBy?: string;
  completedAt?: string;
}

export interface ResourceUnit {
  id: string;
  type: ResourceType;
  quantity: number;
  status: ResourceStatus;
  location: Coordinates;
  name: string;
  assignedRequestId?: string;
}

export interface IntelligenceInsight {
  hotspots: Array<{ area: string; riskLevel: Severity; prediction: string }>;
  recommendations: Array<{ resourceType: ResourceType; location: string; reason: string }>;
  summary: string;
  timestamp: string;
}

export interface AllocationRecommendation {
  resourceId: string;
  distance: number;
  score: number;
  reason: string;
}
