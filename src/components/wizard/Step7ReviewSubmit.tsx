// Step 7: Review & Submit
// Calculation sheet preview, classification badge, send for approval

import { useState } from 'react';
import { 
  FileCheck, 
  Send,
  CheckCircle2,
  AlertCircle,
  Printer,
  Download,
  UserCheck,
  Calendar,
  Shield,
  Info
} from 'lucide-react';
import { useLiftPlanStore } from '@/store/liftPlanStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

export function Step7ReviewSubmit() {
  const { 
    projectInfo,
    load,
    selectedCrane,
    siteConditions,
    classification,
    calculations,
    checklist,
    canSubmit,
    setStatus
  } = useLiftPlanStore();
  
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  
  const completedChecklist = checklist.filter(c => c.completed).length;
  const checklistProgress = (completedChecklist / checklist.length) * 100;
  
  const handleSubmit = () => {
    setStatus('pending');
    setShowSubmitDialog(false);
  };
  
  // Approval chain based on classification
  const getApprovalChain = () => {
    const baseApprovers = [
      { role: 'Lift Supervisor', required: true },
      { role: 'Crane Operator', required: true },
    ];
    
    if (classification === 'standard' || classification === 'critical') {
      baseApprovers.push({ role: 'Site Engineer', required: true });
    }
    
    if (classification === 'critical') {
      baseApprovers.push({ role: 'Operations Manager', required: true });
      baseApprovers.push({ role: 'HSE Manager', required: true });
    }
    
    return baseApprovers;
  };
  
  return (
    <div className="space-y-6" dir="ltr">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Step 7: Review & Submit</h2>
          <p className="text-slate-500">Final review and submission for approval</p>
        </div>
        <Badge 
          variant={classification === 'critical' ? 'destructive' : classification === 'standard' ? 'secondary' : 'default'} 
          className="text-lg px-4 py-2"
        >
          {classification === 'critical' ? (
            <><AlertCircle className="w-5 h-5 mr-2" /> CRITICAL LIFT</>
          ) : classification === 'standard' ? (
            <><Shield className="w-5 h-5 mr-2" /> STANDARD LIFT</>
          ) : (
            <><CheckCircle2 className="w-5 h-5 mr-2" /> ROUTINE LIFT</>
          )}
        </Badge>
      </div>
      
      {/* Validation Summary */}
      <Card className={canSubmit() ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {canSubmit() ? (
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            ) : (
              <AlertCircle className="w-8 h-8 text-amber-600" />
            )}
            <div>
              <h3 className={`font-semibold ${canSubmit() ? 'text-green-700' : 'text-amber-700'}`}>
                {canSubmit() ? 'Lift Plan Ready for Submission' : 'Validation Issues Detected'}
              </h3>
              <p className={`text-sm ${canSubmit() ? 'text-green-600' : 'text-amber-600'}`}>
                {canSubmit() 
                  ? 'All requirements met. Ready to submit for approval.'
                  : 'Please resolve issues before submitting.'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lift Summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-600" />
              Lift Plan Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs text-slate-500 uppercase">Project</p>
                <p className="font-medium">{projectInfo.name}</p>
                <p className="text-sm text-slate-500">{projectInfo.number}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs text-slate-500 uppercase">Lift Date/Time</p>
                <p className="font-medium">{projectInfo.liftDate}</p>
                <p className="text-sm text-slate-500">{projectInfo.liftTime}</p>
              </div>
            </div>
            
            <div className="border-t pt-4" />
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-500 uppercase">Load</p>
                <p className="font-medium">{load.name}</p>
                <p className="text-sm">{(load.weight / 1000).toFixed(1)} tonnes</p>
                <p className="text-xs text-slate-500">{load.dimensions.length}×{load.dimensions.width}×{load.dimensions.height} m</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Crane</p>
                <p className="font-medium">{selectedCrane.manufacturer}</p>
                <p className="text-sm">{selectedCrane.model}</p>
                <p className="text-xs text-slate-500">{(selectedCrane.maxCapacity / 1000).toFixed(0)}T capacity</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Utilization</p>
                <p className={`font-bold text-lg ${
                  calculations?.utilization.status === 'danger' ? 'text-red-600' :
                  calculations?.utilization.status === 'warning' ? 'text-amber-600' : 'text-green-600'
                }`}>
                  {calculations?.utilization.value.toFixed(1)}%
                </p>
                <p className="text-xs text-slate-500">
                  @ {calculations?.workingRadius.value || 12}m radius
                </p>
              </div>
            </div>
            
            <div className="border-t pt-4" />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 uppercase">Site Conditions</p>
                <p className="text-sm">{siteConditions.name}</p>
                <p className="text-xs text-slate-500">
                  Wind: {siteConditions.windSpeed} m/s | Temp: {siteConditions.temperature}°C
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Checklist Progress</p>
                <p className={`font-medium ${checklistProgress < 80 ? 'text-amber-600' : 'text-green-600'}`}>
                  {checklistProgress.toFixed(0)}% Complete
                </p>
                <p className="text-xs text-slate-500">
                  {completedChecklist}/{checklist.length} items
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Approval Chain */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-purple-600" />
              Approval Chain
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getApprovalChain().map((approver, index) => (
                <div key={approver.role} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{approver.role}</p>
                    <Badge variant="outline" className="text-xs">
                      {approver.required ? 'Required' : 'Optional'}
                    </Badge>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-slate-300" />
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 mt-4" />
            
            <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-sm text-slate-600">
                <Calendar className="w-4 h-4 inline mr-1" />
                Estimated approval time: {classification === 'critical' ? '24-48 hours' : '4-8 hours'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Calculation Sheet Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-green-600" />
            Calculation Sheet Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-xs text-slate-500 uppercase mb-2">Gross Load</p>
              <code className="block text-xs bg-slate-800 text-green-400 p-2 rounded mb-2">
                = Net + Rigging + Hook
              </code>
              <p className="font-mono text-lg font-bold text-blue-600">
                {calculations?.grossLoad.value.toLocaleString()} kg
              </p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-xs text-slate-500 uppercase mb-2">Chart Capacity</p>
              <code className="block text-xs bg-slate-800 text-green-400 p-2 rounded mb-2">
                @ {calculations?.workingRadius.value || 12}m radius
              </code>
              <p className="font-mono text-lg font-bold text-blue-600">
                {calculations?.chartCapacity.value.toLocaleString()} kg
              </p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-xs text-slate-500 uppercase mb-2">Utilization</p>
              <code className="block text-xs bg-slate-800 text-green-400 p-2 rounded mb-2">
                = (Gross ÷ Capacity) × 100
              </code>
              <p className={`font-mono text-lg font-bold ${
                calculations?.utilization.status === 'danger' ? 'text-red-600' :
                calculations?.utilization.status === 'warning' ? 'text-amber-600' : 'text-green-600'
              }`}>
                {calculations?.utilization.value.toFixed(2)}%
              </p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-xs text-slate-500 uppercase mb-2">Ground Bearing</p>
              <code className="block text-xs bg-slate-800 text-green-400 p-2 rounded mb-2">
                GBP (kPa)
              </code>
              <p className="font-mono text-lg font-bold text-blue-600">
                {calculations?.gbp.value.toFixed(1)} kPa
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button
          variant="outline"
          onClick={() => setShowPDFPreview(true)}
          className="flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          Preview PDF Report
        </Button>
        
        <Button
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export Data
        </Button>
        
        <div className="flex-1" />
        
        <Button
          onClick={() => setShowSubmitDialog(true)}
          disabled={!canSubmit()}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
        >
          <Send className="w-4 h-4" />
          Submit for Approval
        </Button>
      </div>
      
      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Confirm Submission
            </DialogTitle>
            <DialogDescription>
              You are about to submit this lift plan for approval. All calculations will be locked.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-slate-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Project:</span>
                <span className="font-medium">{projectInfo.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Load:</span>
                <span className="font-medium">{load.name} ({(load.weight / 1000).toFixed(1)}T)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Classification:</span>
                <Badge variant={classification === 'critical' ? 'destructive' : 'default'}>
                  {classification.toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Utilization:</span>
                <span className={`font-medium ${
                  calculations?.utilization.status === 'danger' ? 'text-red-600' :
                  calculations?.utilization.status === 'warning' ? 'text-amber-600' : 'text-green-600'
                }`}>
                  {calculations?.utilization.value.toFixed(1)}%
                </span>
              </div>
            </div>
            
            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                Once submitted, modifications will void existing approvals.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
              <Send className="w-4 h-4 mr-2" />
              Confirm Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* PDF Preview Dialog */}
      <Dialog open={showPDFPreview} onOpenChange={setShowPDFPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>PDF Report Preview</DialogTitle>
            <DialogDescription>
              A3 Landscape, 5-page lift plan report
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Page 1: Cover */}
            <div className="border-2 border-slate-300 p-8 bg-white">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <Badge className="text-2xl px-6 py-3" variant={classification === 'critical' ? 'destructive' : 'default'}>
                    {classification === 'critical' ? '⚠️ CRITICAL LIFT' : classification.toUpperCase() + ' LIFT'}
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold">LIFT PLAN</h1>
                <p className="text-xl">{projectInfo.name}</p>
                <p className="text-lg text-slate-500">{projectInfo.number}</p>
                
                <div className="border-t border-b py-4 my-4" />
                
                <div className="grid grid-cols-2 gap-8 text-left">
                  <div>
                    <p className="text-sm text-slate-500">Load:</p>
                    <p className="font-medium">{load.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Weight:</p>
                    <p className="font-medium">{(load.weight / 1000).toFixed(1)} tonnes</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Crane:</p>
                    <p className="font-medium">{selectedCrane.manufacturer} {selectedCrane.model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Date/Time:</p>
                    <p className="font-medium">{projectInfo.liftDate} {projectInfo.liftTime}</p>
                  </div>
                </div>
                
                <div className="border-t pt-4" />
                
                <p className="text-sm text-slate-500">
                  Prepared by: {projectInfo.preparedBy} | Date: {projectInfo.datePrepared}
                </p>
              </div>
            </div>
            
            <p className="text-center text-sm text-slate-500">
              Pages 2-5 would include: Load & Rigging details, Crane Data with load chart, 
              Site Plan, and Risk Assessment matrix.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
