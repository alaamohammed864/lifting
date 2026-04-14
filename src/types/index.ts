// Lift Plan Management System - Type Definitions
// ASME B30.9, ASME B30.26, API RP 2D, EN 13155, OSHA 1926.1400, LOLER 1998

// ==================== CRANE TYPES ====================

export interface LoadChartEntry {
  radius: number; // meters
  capacity: number; // kg
}

export interface CraneModel {
  id: string;
  manufacturer: string;
  model: string;
  type: 'mobile' | 'all-terrain' | 'crawler' | 'tower';
  maxCapacity: number; // kg
  boomLengths: number[]; // meters
  loadChart: LoadChartEntry[];
  outriggerSpan: number; // meters
  hookBlockWeight: number; // kg
  maxGBP: number; // kPa
  carrierWeight: number; // kg
  counterweight: number; // kg
  maxBoomLength: number; // meters
  minBoomLength: number; // meters
}

// ==================== LOAD TYPES ====================

export interface LoadDimensions {
  length: number; // meters
  width: number; // meters
  height: number; // meters
}

export interface CenterOfGravity {
  x: number; // mm from center
  y: number; // mm from center
  z: number; // mm from bottom
}

export interface LiftPoint {
  id: string;
  x: number; // meters from load center
  y: number; // meters from load center
  z: number; // meters from load bottom
}

export interface LoadDefinition {
  id: string;
  name: string;
  weight: number; // kg (net load)
  dimensions: LoadDimensions;
  cog: CenterOfGravity;
  liftPoints: LiftPoint[];
  description?: string;
}

// ==================== RIGGING TYPES ====================

export type SlingType = 'wire-rope' | 'chain' | 'synthetic' | 'round-sling';

export interface SlingConfig {
  id: string;
  type: SlingType;
  diameter: number; // mm
  length: number; // meters
  angle: number; // degrees from horizontal
  swl: number; // kg (Safe Working Load)
  quantity: number;
  legs: number; // 1, 2, or 4 legs
}

export interface RiggingHardware {
  id: string;
  type: 'shackle' | 'hook' | 'swivel' | 'spreader-bar' | 'lifting-beam';
  name: string;
  swl: number; // kg
  weight: number; // kg
  quantity: number;
}

export interface RiggingDesign {
  slings: SlingConfig[];
  hardware: RiggingHardware[];
  totalRiggingWeight: number; // kg
}

// ==================== SITE TYPES ====================

export interface SiteConditions {
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  soilBearingCapacity: number; // kPa
  windSpeed: number; // m/s
  temperature: number; // Celsius
  weatherCondition: string;
  hazards: SiteHazard[];
}

export interface SiteHazard {
  id: string;
  type: 'h2s' | 'overhead-line' | 'pipe-rack' | 'vessel' | 'flare' | 'live-process' | 'power-line' | 'other';
  description: string;
  distance: number; // meters
  direction: string;
  height?: number; // meters (for overhead obstacles)
}

export interface CranePosition {
  x: number; // meters from site origin
  y: number; // meters from site origin
  rotation: number; // degrees (slew angle)
  boomAngle: number; // degrees from horizontal
  boomLength: number; // meters
}

// ==================== CALCULATION TYPES ====================

export interface CalculationStep {
  formula: string;
  substitution: string;
  result: string;
  unit: string;
}

export interface LiftCalculation {
  grossLoad: {
    value: number;
    steps: CalculationStep[];
  };
  workingRadius: {
    value: number;
    steps: CalculationStep[];
  };
  chartCapacity: {
    value: number;
    steps: CalculationStep[];
  };
  utilization: {
    value: number;
    steps: CalculationStep[];
    status: 'safe' | 'warning' | 'danger';
  };
  slingTension: {
    value: number;
    steps: CalculationStep[];
  };
  angleDerating: {
    factor: number;
    steps: CalculationStep[];
  };
  gbp: {
    value: number;
    steps: CalculationStep[];
    status: 'safe' | 'warning' | 'danger';
  };
  windForce: {
    value: number;
    steps: CalculationStep[];
  };
}

// ==================== LIFT PLAN TYPES ====================

export type LiftClassification = 'routine' | 'standard' | 'critical';

export interface RiskAssessment {
  probability: number; // 1-5
  severity: number; // 1-5
  riskLevel: number; // 1-25
  matrix: {
    row: number;
    col: number;
  };
  mitigations: string[];
}

export interface PreLiftChecklist {
  id: string;
  item: string;
  category: string;
  completed: boolean;
  notes?: string;
  photoUrl?: string;
}

export interface ApprovalSignature {
  role: string;
  name: string;
  signature: string; // base64 or hash
  timestamp: Date;
  gpsLocation?: {
    lat: number;
    lng: number;
  };
  ipAddress?: string;
}

export interface LiftPlan {
  id: string;
  projectNumber: string;
  siteName: string;
  liftDate: Date;
  liftTime: string;
  classification: LiftClassification;
  
  // Step 1: Project Info
  projectInfo: {
    name: string;
    number: string;
    location: string;
    liftDate: string;
    liftTime: string;
    weatherForecast: string;
    preparedBy: string;
    datePrepared: string;
  };
  
  // Step 2: Load Definition
  load: LoadDefinition;
  
  // Step 3: Rigging Design
  rigging: RiggingDesign;
  
  // Step 4: Crane Selection
  selectedCrane: CraneModel;
  cranePosition: CranePosition;
  
  // Step 5: Site Setup
  siteConditions: SiteConditions;
  
  // Step 6: Risk Assessment
  riskAssessment: RiskAssessment;
  checklist: PreLiftChecklist[];
  
  // Step 7: Review & Submit
  calculations: LiftCalculation;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'void';
  signatures: ApprovalSignature[];
  
  createdAt: Date;
  updatedAt: Date;
}

// ==================== WIZARD TYPES ====================

export interface WizardStep {
  id: number;
  title: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  isComplete: boolean;
  isValid: boolean;
}

export interface WizardState {
  currentStep: number;
  steps: WizardStep[];
  plan: Partial<LiftPlan>;
}

// ==================== 3D VISUALIZATION TYPES ====================

export interface CameraView {
  name: string;
  position: [number, number, number];
  target: [number, number, number];
}

export interface CollisionInfo {
  object1: string;
  object2: string;
  distance: number;
  severity: 'none' | 'warning' | 'critical';
}

// ==================== AI TYPES ====================

export interface CraneRecommendation {
  crane: CraneModel;
  utilization: number;
  score: number;
  reason: string;
}

export interface RiggingOptimization {
  slingLength: number;
  angle: number;
  isBalanced: boolean;
  recommendation: string;
}

// ==================== PDF REPORT TYPES ====================

export interface PDFReportData {
  plan: LiftPlan;
  generatedAt: Date;
  generatedBy: string;
}
