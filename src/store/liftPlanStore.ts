// Lift Plan Store - Zustand State Management

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  WizardStep, 
  CraneModel, 
  LoadDefinition, 
  RiggingDesign, 
  SiteConditions,
  CranePosition,
  LiftCalculation,
  ApprovalSignature,
  PreLiftChecklist,
  LiftClassification
} from '@/types';
import { liebherrLTM1100 } from '@/data/craneLibrary';

// ==================== INITIAL STATE ====================

const initialWizardSteps: WizardStep[] = [
  {
    id: 1,
    title: { en: 'Project Info', ar: 'معلومات المشروع' },
    description: { 
      en: 'Site details, project number, lift date/time, weather forecast',
      ar: 'تفاصيل الموقع، رقم المشروع، تاريخ/وقت الرفع، توقعات الطقس'
    },
    isComplete: false,
    isValid: false,
  },
  {
    id: 2,
    title: { en: 'Load Definition', ar: 'تعريف الحمولة' },
    description: { 
      en: 'Weight, CoG, dimensions, lift point coordinates',
      ar: 'الوزن، مركز الثقل، الأبعاد، إحداثيات نقاط الرفع'
    },
    isComplete: false,
    isValid: false,
  },
  {
    id: 3,
    title: { en: 'Rigging Design', ar: 'تصميم الأسلاك' },
    description: { 
      en: 'Sling type, angle, SWL check, hardware selection',
      ar: 'نوع الأسلاك، الزاوية، فحص SWL، اختيار المعدات'
    },
    isComplete: false,
    isValid: false,
  },
  {
    id: 4,
    title: { en: 'Crane Selection', ar: 'اختيار الرافعة' },
    description: { 
      en: 'Auto-match + manual override, utilization display',
      ar: 'المطابقة التلقائية + التجاوز اليدوي، عرض الاستخدام'
    },
    isComplete: false,
    isValid: false,
  },
  {
    id: 5,
    title: { en: 'Site Setup', ar: 'إعداد الموقع' },
    description: { 
      en: 'Crane position on 3D/2D map, outrigger plan, GBP check',
      ar: 'موقع الرافعة على الخريطة ثلاثية/ثنائية الأبعاد، خطة الدعامات، فحص GBP'
    },
    isComplete: false,
    isValid: false,
  },
  {
    id: 6,
    title: { en: 'Risk Assessment', ar: 'تقييم المخاطر' },
    description: { 
      en: 'Auto-generated matrix + pre-lift checklist',
      ar: 'مصفوفة تلقائية + قائمة ما قبل الرفع'
    },
    isComplete: false,
    isValid: false,
  },
  {
    id: 7,
    title: { en: 'Review & Submit', ar: 'مراجعة وإرسال' },
    description: { 
      en: 'Calculation sheet preview, classification badge, send for approval',
      ar: 'معاينة ورقة الحساب، شارة التصنيف، إرسال للموافقة'
    },
    isComplete: false,
    isValid: false,
  },
];

const initialLoad: LoadDefinition = {
  id: 'load-001',
  name: 'Vessel V-201',
  weight: 50000, // 50 tonnes
  dimensions: {
    length: 8.5,
    width: 3.2,
    height: 4.0,
  },
  cog: {
    x: 150, // mm offset from center
    y: 0,
    z: 2000, // mm from bottom
  },
  liftPoints: [
    { id: 'lp1', x: -3.5, y: -1.2, z: 3.8 },
    { id: 'lp2', x: 3.5, y: -1.2, z: 3.8 },
    { id: 'lp3', x: -3.5, y: 1.2, z: 3.8 },
    { id: 'lp4', x: 3.5, y: 1.2, z: 3.8 },
  ],
  description: 'Process vessel - Unit 3',
};

const initialRigging: RiggingDesign = {
  slings: [
    {
      id: 'sling-001',
      type: 'wire-rope',
      diameter: 32,
      length: 20,
      angle: 60,
      swl: 25000,
      quantity: 4,
      legs: 4,
    },
  ],
  hardware: [
    {
      id: 'hw-001',
      type: 'shackle',
      name: 'Bow Shackle 25T',
      swl: 25000,
      weight: 8.5,
      quantity: 4,
    },
    {
      id: 'hw-002',
      type: 'hook',
      name: 'Swivel Hook 50T',
      swl: 50000,
      weight: 12.0,
      quantity: 1,
    },
  ],
  totalRiggingWeight: 850, // kg
};

const initialSiteConditions: SiteConditions = {
  name: 'Refinery Unit 3',
  location: {
    lat: 26.3927,
    lng: 50.0916,
  },
  soilBearingCapacity: 800, // kPa
  windSpeed: 8, // m/s
  temperature: 35, // Celsius
  weatherCondition: 'Clear',
  hazards: [
    {
      id: 'haz-001',
      type: 'h2s',
      description: 'H2S Hazard Zone',
      distance: 15,
      direction: 'North',
    },
    {
      id: 'haz-002',
      type: 'pipe-rack',
      description: 'Overhead Pipe Rack',
      distance: 8,
      direction: 'East',
      height: 8,
    },
    {
      id: 'haz-003',
      type: 'live-process',
      description: 'Live Process Line',
      distance: 5,
      direction: 'Below',
    },
  ],
};

const initialCranePosition: CranePosition = {
  x: 0,
  y: 0,
  rotation: 0,
  boomAngle: 65,
  boomLength: 32,
};

const initialChecklist: PreLiftChecklist[] = [
  { id: 'chk-001', item: 'Crane inspection certificate valid', category: 'Equipment', completed: false },
  { id: 'chk-002', item: 'Rigging equipment inspected and certified', category: 'Equipment', completed: false },
  { id: 'chk-003', item: 'Operator certified and competent', category: 'Personnel', completed: false },
  { id: 'chk-004', item: 'Riggers certified and competent', category: 'Personnel', completed: false },
  { id: 'chk-005', item: 'Lift plan reviewed and understood by all personnel', category: 'Documentation', completed: false },
  { id: 'chk-006', item: 'Site barricaded and exclusion zone established', category: 'Safety', completed: false },
  { id: 'chk-007', item: 'Communication method established and tested', category: 'Safety', completed: false },
  { id: 'chk-008', item: 'Weather conditions acceptable for lifting', category: 'Environment', completed: false },
  { id: 'chk-009', item: 'Load weight verified and marked', category: 'Load', completed: false },
  { id: 'chk-010', item: 'Ground conditions verified for outrigger placement', category: 'Site', completed: false },
];

// ==================== STORE INTERFACE ====================

interface LiftPlanState {
  // Wizard state
  currentStep: number;
  steps: WizardStep[];
  
  // Lift plan data
  planId: string;
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
  load: LoadDefinition;
  rigging: RiggingDesign;
  selectedCrane: CraneModel;
  cranePosition: CranePosition;
  siteConditions: SiteConditions;
  checklist: PreLiftChecklist[];
  calculations: LiftCalculation | null;
  classification: LiftClassification;
  signatures: ApprovalSignature[];
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'void';
  
  // Actions
  setCurrentStep: (step: number) => void;
  updateStepStatus: (stepId: number, isComplete: boolean, isValid: boolean) => void;
  updateProjectInfo: (info: Partial<LiftPlanState['projectInfo']>) => void;
  updateLoad: (load: Partial<LoadDefinition>) => void;
  updateRigging: (rigging: Partial<RiggingDesign>) => void;
  updateSelectedCrane: (crane: CraneModel) => void;
  updateCranePosition: (position: Partial<CranePosition>) => void;
  updateSiteConditions: (conditions: Partial<SiteConditions>) => void;
  updateChecklistItem: (itemId: string, completed: boolean, notes?: string) => void;
  setCalculations: (calculations: LiftCalculation) => void;
  setClassification: (classification: LiftClassification) => void;
  addSignature: (signature: ApprovalSignature) => void;
  setStatus: (status: LiftPlanState['status']) => void;
  resetPlan: () => void;
  
  // Computed
  isStepValid: (stepId: number) => boolean;
  canProceedToNext: () => boolean;
  canSubmit: () => boolean;
}

// ==================== STORE IMPLEMENTATION ====================

export const useLiftPlanStore = create<LiftPlanState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentStep: 1,
      steps: initialWizardSteps,
      
      planId: `LP-${Date.now()}`,
      projectInfo: {
        name: 'Refinery Unit 3 Turnaround',
        number: 'PRJ-2024-001',
        location: 'Jubail Industrial City',
        liftDate: new Date().toISOString().split('T')[0],
        liftTime: '08:00',
        weatherForecast: 'Clear, Wind 8 m/s',
        preparedBy: 'Alaa Mohammed',
        datePrepared: new Date().toISOString().split('T')[0],
      },
      load: initialLoad,
      rigging: initialRigging,
      selectedCrane: liebherrLTM1100,
      cranePosition: initialCranePosition,
      siteConditions: initialSiteConditions,
      checklist: initialChecklist,
      calculations: null,
      classification: 'critical',
      signatures: [],
      status: 'draft',
      
      // Actions
      setCurrentStep: (step) => set({ currentStep: step }),
      
      updateStepStatus: (stepId, isComplete, isValid) => {
        const steps = get().steps.map(s => 
          s.id === stepId ? { ...s, isComplete, isValid } : s
        );
        set({ steps });
      },
      
      updateProjectInfo: (info) => {
        set((state) => ({
          projectInfo: { ...state.projectInfo, ...info },
        }));
      },
      
      updateLoad: (loadUpdate) => {
        set((state) => ({
          load: { ...state.load, ...loadUpdate },
        }));
      },
      
      updateRigging: (riggingUpdate) => {
        set((state) => ({
          rigging: { ...state.rigging, ...riggingUpdate },
        }));
      },
      
      updateSelectedCrane: (crane) => {
        set({ selectedCrane: crane });
      },
      
      updateCranePosition: (position) => {
        set((state) => ({
          cranePosition: { ...state.cranePosition, ...position },
        }));
      },
      
      updateSiteConditions: (conditions) => {
        set((state) => ({
          siteConditions: { ...state.siteConditions, ...conditions },
        }));
      },
      
      updateChecklistItem: (itemId, completed, notes) => {
        set((state) => ({
          checklist: state.checklist.map(item =>
            item.id === itemId ? { ...item, completed, notes: notes || item.notes } : item
          ),
        }));
      },
      
      setCalculations: (calculations) => {
        set({ calculations });
      },
      
      setClassification: (classification) => {
        set({ classification });
      },
      
      addSignature: (signature) => {
        set((state) => ({
          signatures: [...state.signatures, signature],
        }));
      },
      
      setStatus: (status) => {
        set({ status });
      },
      
      resetPlan: () => {
        set({
          currentStep: 1,
          steps: initialWizardSteps,
          planId: `LP-${Date.now()}`,
          projectInfo: {
            name: '',
            number: '',
            location: '',
            liftDate: '',
            liftTime: '',
            weatherForecast: '',
            preparedBy: '',
            datePrepared: '',
          },
          load: initialLoad,
          rigging: initialRigging,
          selectedCrane: liebherrLTM1100,
          cranePosition: initialCranePosition,
          siteConditions: initialSiteConditions,
          checklist: initialChecklist,
          calculations: null,
          classification: 'routine',
          signatures: [],
          status: 'draft',
        });
      },
      
      // Computed
      isStepValid: (stepId) => {
        const step = get().steps.find(s => s.id === stepId);
        return step?.isValid || false;
      },
      
      canProceedToNext: () => {
        const currentStep = get().currentStep;
        const step = get().steps.find(s => s.id === currentStep);
        return step?.isValid || false;
      },
      
      canSubmit: () => {
        const state = get();
        return (
          state.steps.every(s => s.isComplete && s.isValid) &&
          state.calculations !== null &&
          state.calculations.utilization.status !== 'danger'
        );
      },
    }),
    {
      name: 'lift-plan-storage',
      partialize: (state) => ({
        planId: state.planId,
        projectInfo: state.projectInfo,
        load: state.load,
        rigging: state.rigging,
        selectedCrane: state.selectedCrane,
        cranePosition: state.cranePosition,
        siteConditions: state.siteConditions,
        checklist: state.checklist,
        classification: state.classification,
        signatures: state.signatures,
        status: state.status,
      }),
    }
  )
);

// ==================== SELECTOR HOOKS ====================

export function useCurrentStep() {
  return useLiftPlanStore((state) => state.currentStep);
}

export function useWizardSteps() {
  return useLiftPlanStore((state) => state.steps);
}

export function useProjectInfo() {
  return useLiftPlanStore((state) => state.projectInfo);
}

export function useLoad() {
  return useLiftPlanStore((state) => state.load);
}

export function useRigging() {
  return useLiftPlanStore((state) => state.rigging);
}

export function useSelectedCrane() {
  return useLiftPlanStore((state) => state.selectedCrane);
}

export function useCranePosition() {
  return useLiftPlanStore((state) => state.cranePosition);
}

export function useSiteConditions() {
  return useLiftPlanStore((state) => state.siteConditions);
}

export function useCalculations() {
  return useLiftPlanStore((state) => state.calculations);
}

export function useClassification() {
  return useLiftPlanStore((state) => state.classification);
}
