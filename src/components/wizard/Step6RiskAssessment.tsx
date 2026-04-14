// Step 6: Risk Assessment
// Auto-generated matrix + pre-lift checklist

import { useEffect, useState } from 'react';
import { 
  Shield, 
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ClipboardCheck
} from 'lucide-react';
import { useLiftPlanStore } from '@/store/liftPlanStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';

export function Step6RiskAssessment() {
  const { 
    checklist, 
    updateChecklistItem,
    classification,
    siteConditions,
    load,
    updateStepStatus
  } = useLiftPlanStore();
  
  // Calculate risk matrix
  const [probability, setProbability] = useState(3); // 1-5
  const [severity, setSeverity] = useState(4); // 1-5
  const riskLevel = probability * severity;
  
  // Determine risk rating
  const getRiskRating = (level: number) => {
    if (level <= 4) return { label: 'LOW', color: 'bg-green-500' };
    if (level <= 9) return { label: 'MEDIUM', color: 'bg-yellow-500' };
    if (level <= 14) return { label: 'HIGH', color: 'bg-orange-500' };
    return { label: 'EXTREME', color: 'bg-red-500' };
  };
  
  const riskRating = getRiskRating(riskLevel);
  
  // Auto-determine probability and severity based on lift parameters
  useEffect(() => {
    let prob = 2;
    let sev = 3;
    
    // Probability factors
    if (siteConditions.windSpeed > 8) prob += 1;
    if (siteConditions.hazards.length > 2) prob += 1;
    if (classification === 'critical') prob += 1;
    
    // Severity factors
    if (load.weight > 50000) sev += 1;
    if (siteConditions.hazards.some(h => h.type === 'live-process')) sev += 1;
    if (classification === 'critical') sev += 1;
    
    setProbability(Math.min(prob, 5));
    setSeverity(Math.min(sev, 5));
  }, [siteConditions, load.weight, classification]);
  
  // Checklist completion
  const completedItems = checklist.filter(item => item.completed).length;
  const checklistProgress = (completedItems / checklist.length) * 100;
  
  useEffect(() => {
    const isValid = checklistProgress >= 80; // At least 80% of checklist complete
    updateStepStatus(6, isValid, isValid);
  }, [checklistProgress, updateStepStatus]);
  
  // Risk matrix data (5x5)
  const riskMatrix = [
    [1, 2, 3, 4, 5],
    [2, 4, 6, 8, 10],
    [3, 6, 9, 12, 15],
    [4, 8, 12, 16, 20],
    [5, 10, 15, 20, 25],
  ];
  
  const getCellColor = (value: number) => {
    if (value <= 4) return 'bg-green-200';
    if (value <= 9) return 'bg-yellow-200';
    if (value <= 14) return 'bg-orange-200';
    return 'bg-red-200';
  };
  
  return (
    <div className="space-y-6" dir="ltr">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Step 6: Risk Assessment</h2>
          <p className="text-slate-500">Auto-generated risk matrix and pre-lift checklist</p>
        </div>
        <Badge 
          variant={classification === 'critical' ? 'destructive' : classification === 'standard' ? 'secondary' : 'default'} 
          className="text-sm"
        >
          {classification === 'critical' ? (
            <><AlertCircle className="w-4 h-4 mr-1" /> CRITICAL LIFT</>
          ) : classification === 'standard' ? (
            <><AlertTriangle className="w-4 h-4 mr-1" /> STANDARD LIFT</>
          ) : (
            <><CheckCircle2 className="w-4 h-4 mr-1" /> ROUTINE LIFT</>
          )}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Matrix */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Risk Matrix (5×5)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Matrix Grid */}
              <div className="grid grid-cols-6 gap-1">
                {/* Header row */}
                <div className="text-xs text-slate-500 text-center">P\S</div>
                {[1, 2, 3, 4, 5].map(s => (
                  <div key={s} className="text-xs text-slate-500 text-center">{s}</div>
                ))}
                
                {/* Matrix rows */}
                {riskMatrix.map((row, pIndex) => (
                  <>
                    <div key={`p${pIndex}`} className="text-xs text-slate-500 text-center flex items-center justify-center">
                      {pIndex + 1}
                    </div>
                    {row.map((value, sIndex) => (
                      <div
                        key={`${pIndex}-${sIndex}`}
                        className={`
                          aspect-square flex items-center justify-center text-xs font-medium rounded
                          ${getCellColor(value)}
                          ${pIndex === probability - 1 && sIndex === severity - 1 ? 'ring-2 ring-blue-500' : ''}
                        `}
                      >
                        {value}
                      </div>
                    ))}
                  </>
                ))}
              </div>
              
              <div className="border-t pt-4" />
              
              {/* Current Risk Level */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Current Risk Level:</span>
                  <Badge className={riskRating.color}>{riskRating.label}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Probability: {probability}/5</span>
                  <span className="text-sm text-slate-600">Severity: {severity}/5</span>
                  <span className="text-lg font-bold">{riskLevel}/25</span>
                </div>
              </div>
              
              {/* Risk Factors */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Risk Factors Identified:</p>
                <ul className="text-sm space-y-1">
                  {classification === 'critical' && (
                    <li className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      Critical lift classification
                    </li>
                  )}
                  {load.weight > 50000 && (
                    <li className="flex items-center gap-2 text-amber-600">
                      <AlertTriangle className="w-4 h-4" />
                      Heavy load ({(load.weight / 1000).toFixed(0)} tonnes)
                    </li>
                  )}
                  {siteConditions.hazards.some(h => h.type === 'live-process') && (
                    <li className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      Lift over live process line
                    </li>
                  )}
                  {siteConditions.windSpeed > 8 && (
                    <li className="flex items-center gap-2 text-amber-600">
                      <AlertTriangle className="w-4 h-4" />
                      Elevated wind speed ({siteConditions.windSpeed} m/s)
                    </li>
                  )}
                  {siteConditions.hazards.length > 2 && (
                    <li className="flex items-center gap-2 text-amber-600">
                      <AlertTriangle className="w-4 h-4" />
                      Multiple site hazards ({siteConditions.hazards.length})
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Mitigations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Required Mitigations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {classification === 'critical' && (
                <li className="flex items-start gap-2 p-2 bg-red-50 rounded">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-700">Critical Lift Approval Required</p>
                    <p className="text-sm text-red-600">Operations Manager + HSE Manager signatures required</p>
                  </div>
                </li>
              )}
              <li className="flex items-start gap-2 p-2 bg-slate-50 rounded">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Toolbox Talk (TBT)</p>
                  <p className="text-sm text-slate-600">All personnel must attend pre-lift briefing</p>
                </div>
              </li>
              <li className="flex items-start gap-2 p-2 bg-slate-50 rounded">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Exclusion Zone</p>
                  <p className="text-sm text-slate-600">Establish 1.5× boom length exclusion zone</p>
                </div>
              </li>
              <li className="flex items-start gap-2 p-2 bg-slate-50 rounded">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Dedicated Banksman</p>
                  <p className="text-sm text-slate-600">Certified rigger assigned as signalman</p>
                </div>
              </li>
              {siteConditions.hazards.some(h => h.type === 'h2s') && (
                <li className="flex items-start gap-2 p-2 bg-purple-50 rounded">
                  <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-purple-700">H2S Monitoring</p>
                    <p className="text-sm text-purple-600">Gas detectors required for all personnel</p>
                  </div>
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
      
      {/* Pre-Lift Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-amber-600" />
            Pre-Lift Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Completion Progress</span>
              <span>{completedItems}/{checklist.length} ({checklistProgress.toFixed(0)}%)</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  checklistProgress >= 80 ? 'bg-green-500' : checklistProgress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${checklistProgress}%` }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {checklist.map((item) => (
              <div 
                key={item.id} 
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  item.completed ? 'bg-green-50 border-green-200' : 'bg-white'
                }`}
              >
                <Checkbox
                  id={item.id}
                  checked={item.completed}
                  onCheckedChange={(checked) => 
                    updateChecklistItem(item.id, checked as boolean)
                  }
                />
                <div className="flex-1">
                  <Label 
                    htmlFor={item.id}
                    className={`text-sm cursor-pointer ${item.completed ? 'line-through text-slate-500' : ''}`}
                  >
                    {item.item}
                  </Label>
                  <Badge variant="outline" className="text-xs mt-1">
                    {item.category}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          
          {checklistProgress < 80 && (
            <Alert className="mt-4 bg-amber-50 border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <AlertDescription className="text-sm text-amber-700">
                At least 80% of checklist items must be completed before submission.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      {/* Live Preview */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            Risk Assessment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-3 rounded-lg border">
              <p className="text-xs text-slate-500 uppercase">Lift Classification</p>
              <p className={`font-medium capitalize ${classification === 'critical' ? 'text-red-600' : ''}`}>
                {classification}
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <p className="text-xs text-slate-500 uppercase">Risk Level</p>
              <Badge className={riskRating.color}>{riskRating.label}</Badge>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <p className="text-xs text-slate-500 uppercase">Risk Score</p>
              <p className="font-medium">{riskLevel}/25</p>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <p className="text-xs text-slate-500 uppercase">Checklist</p>
              <p className={`font-medium ${checklistProgress < 80 ? 'text-amber-600' : 'text-green-600'}`}>
                {checklistProgress.toFixed(0)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
