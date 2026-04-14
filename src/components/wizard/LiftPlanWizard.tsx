// Lift Plan Wizard - 7-Step Wizard UI
// Main container for all wizard steps

import { useState } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  Send,
  FileText,
  CheckCircle2,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { useLiftPlanStore } from '@/store/liftPlanStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Step1ProjectInfo } from './Step1ProjectInfo';
import { Step2LoadDefinition } from './Step2LoadDefinition';
import { Step3RiggingDesign } from './Step3RiggingDesign';
import { Step4CraneSelection } from './Step4CraneSelection';
import { Step5SiteSetup } from './Step5SiteSetup';
import { Step6RiskAssessment } from './Step6RiskAssessment';
import { Step7ReviewSubmit } from './Step7ReviewSubmit';

// ==================== STEP COMPONENTS MAP ====================

const stepComponents: Record<number, React.ComponentType> = {
  1: Step1ProjectInfo,
  2: Step2LoadDefinition,
  3: Step3RiggingDesign,
  4: Step4CraneSelection,
  5: Step5SiteSetup,
  6: Step6RiskAssessment,
  7: Step7ReviewSubmit,
};

// ==================== WIZARD HEADER ====================

function WizardHeader() {
  const { steps, currentStep } = useLiftPlanStore();
  
  return (
    <div className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Lift Plan Management System</h1>
            <p className="text-sm text-slate-500">Oil & Gas Facilities - ASME B30.9 / API RP 2D Compliant</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <FileText className="w-3 h-3 mr-1" />
              LP-{Date.now().toString().slice(-6)}
            </Badge>
          </div>
        </div>
        
        {/* Step Progress */}
        <div className="flex items-center gap-1">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div 
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  step.id === currentStep 
                    ? 'bg-blue-600 text-white' 
                    : step.isComplete 
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-200 text-slate-600'
                }`}
              >
                {step.isComplete && step.id !== currentStep ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  step.id
                )}
              </div>
              <div className="ml-2 hidden md:block">
                <p className={`text-xs font-medium ${
                  step.id === currentStep ? 'text-blue-600' : 'text-slate-600'
                }`}>
                  {step.title.en}
                </p>
                <p className="text-[10px] text-slate-400">{step.title.ar}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${
                  step.isComplete ? 'bg-green-500' : 'bg-slate-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== WIZARD NAVIGATION ====================

function WizardNavigation() {
  const { currentStep, setCurrentStep, steps, canProceedToNext, canSubmit, resetPlan } = useLiftPlanStore();
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === 7;
  const currentStepData = steps.find(s => s.id === currentStep);
  
  const handleNext = () => {
    if (!isLastStep && canProceedToNext()) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleSubmit = () => {
    if (canSubmit()) {
      setShowSubmitConfirm(true);
    }
  };
  
  return (
    <div className="bg-white border-t sticky bottom-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {}}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Draft
            </Button>
            
            <Button
              variant="ghost"
              onClick={resetPlan}
              className="flex items-center gap-2 text-slate-500"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm text-slate-600">
                Step {currentStep} of 7
              </p>
              <p className="text-xs text-slate-400">
                {currentStepData?.isValid ? 'Valid' : 'Incomplete'}
              </p>
            </div>
            
            {isLastStep ? (
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit()}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Send className="w-4 h-4" />
                Submit for Approval
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceedToNext()}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Validation Warnings */}
        {!currentStepData?.isValid && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="w-4 h-4" />
            <AlertTitle>Validation Required</AlertTitle>
            <AlertDescription>
              Please complete all required fields before proceeding to the next step.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Submit Confirmation Dialog */}
        {showSubmitConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardContent className="p-6">
                <div className="text-center">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Submit Lift Plan?</h3>
                  <p className="text-sm text-slate-500 mb-6">
                    This will send the lift plan for approval. All calculations will be locked.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" onClick={() => setShowSubmitConfirm(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => {
                        setShowSubmitConfirm(false);
                        // Submit logic here
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Confirm Submit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== MAIN WIZARD COMPONENT ====================

export function LiftPlanWizard() {
  const { currentStep } = useLiftPlanStore();
  const CurrentStepComponent = stepComponents[currentStep];
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <WizardHeader />
      
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Card className="min-h-[600px]">
            <CardContent className="p-6">
              {CurrentStepComponent && <CurrentStepComponent />}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <WizardNavigation />
    </div>
  );
}
