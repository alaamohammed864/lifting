// Step 4: Crane Selection
// Auto-match + manual override, utilization display

import { useEffect, useState } from 'react';
import { 
  Truck, 
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Calculator,
  Star
} from 'lucide-react';
import { useLiftPlanStore } from '@/store/liftPlanStore';
import { craneLibrary, getCapacityAtRadius } from '@/data/craneLibrary';
import { calculateGrossLoad, calculateChartCapacity, calculateUtilization } from '@/lib/calculationEngine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { CraneModel } from '@/types';

export function Step4CraneSelection() {
  const { 
    selectedCrane, 
    updateSelectedCrane, 
    load, 
    rigging, 
    updateStepStatus,
    siteConditions,
    setCalculations,
    setClassification
  } = useLiftPlanStore();
  
  const [workingRadius, setWorkingRadius] = useState(12);
  const [boomLength, setBoomLength] = useState(32);
  
  // Calculate values
  const grossLoad = calculateGrossLoad(load.weight, rigging.totalRiggingWeight, selectedCrane.hookBlockWeight);
  const chartCapacity = calculateChartCapacity(selectedCrane, workingRadius);
  const utilization = calculateUtilization(grossLoad.value, chartCapacity.value);
  
  // Auto-select best crane
  const [recommendedCranes, setRecommendedCranes] = useState<{
    crane: CraneModel;
    utilization: number;
    score: number;
  }[]>([]);
  
  useEffect(() => {
    // Calculate utilization for all cranes
    const recommendations = craneLibrary.map((crane) => {
      const capacity = getCapacityAtRadius(crane, workingRadius);
      const util = (grossLoad.value / capacity) * 100;
      // Score: optimal utilization is 75-85%
      let score = 100 - Math.abs(util - 80);
      if (util > 100) score = 0; // Can't use if over capacity
      return { crane, utilization: util, score };
    }).filter(r => r.utilization <= 100).sort((a, b) => b.score - a.score);
    
    setRecommendedCranes(recommendations);
  }, [workingRadius, grossLoad.value]);
  
  useEffect(() => {
    const isValid = utilization.status !== 'danger';
    updateStepStatus(4, isValid, isValid);
    
    // Store calculations in global state
    const mockCalculations = {
      grossLoad,
      workingRadius: { value: workingRadius, steps: [] },
      chartCapacity,
      utilization,
      slingTension: { value: 0, steps: [] },
      angleDerating: { factor: 1, steps: [] },
      gbp: { value: 0, steps: [], status: 'safe' as const },
      windForce: { value: 0, steps: [] },
    };
    setCalculations(mockCalculations);
    
    // Set classification
    const isOverLiveProcess = siteConditions.hazards.some(h => h.type === 'live-process');
    
    let classification: 'routine' | 'standard' | 'critical' = 'routine';
    
    if (utilization.value > 85) {
      classification = 'critical';
    } else if (isOverLiveProcess) {
      classification = 'critical';
    } else if (load.weight > 50000) {
      classification = 'standard';
    }
    
    setClassification(classification);
  }, [utilization, updateStepStatus, setCalculations, setClassification, siteConditions, load.weight, grossLoad, chartCapacity, workingRadius]);
  
  const handleCraneSelect = (craneId: string) => {
    const crane = craneLibrary.find(c => c.id === craneId);
    if (crane) {
      updateSelectedCrane(crane);
    }
  };
  
  return (
    <div className="space-y-6" dir="ltr">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Step 4: Crane Selection</h2>
          <p className="text-slate-500">Auto-match cranes by optimal utilization (75-85%)</p>
        </div>
        <Badge 
          variant={utilization.status === 'safe' ? 'default' : utilization.status === 'warning' ? 'secondary' : 'destructive'} 
          className="text-sm"
        >
          {utilization.status === 'safe' ? (
            <><CheckCircle2 className="w-4 h-4 mr-1" /> Safe</>
          ) : utilization.status === 'warning' ? (
            <><AlertTriangle className="w-4 h-4 mr-1" /> Warning</>
          ) : (
            <><AlertCircle className="w-4 h-4 mr-1" /> Danger</>
          )}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crane Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              AI Crane Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Crane</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Utilization</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recommendedCranes.map((rec, index) => (
                  <TableRow 
                    key={rec.crane.id}
                    className={selectedCrane.id === rec.crane.id ? 'bg-blue-50' : ''}
                  >
                    <TableCell>
                      <Badge variant={index === 0 ? 'default' : 'outline'}>
                        #{index + 1}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {rec.crane.manufacturer} {rec.crane.model}
                    </TableCell>
                    <TableCell>{(rec.crane.maxCapacity / 1000).toFixed(0)}T</TableCell>
                    <TableCell>
                      <Badge 
                        variant={rec.utilization > 85 ? 'destructive' : rec.utilization > 75 ? 'secondary' : 'default'}
                      >
                        {rec.utilization.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant={selectedCrane.id === rec.crane.id ? 'outline' : 'default'}
                        onClick={() => handleCraneSelect(rec.crane.id)}
                        disabled={selectedCrane.id === rec.crane.id}
                      >
                        {selectedCrane.id === rec.crane.id ? 'Selected' : 'Select'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/* Selected Crane & Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              Selected Crane Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-slate-600">Selected Crane:</p>
              <p className="text-xl font-bold text-blue-700">
                {selectedCrane.manufacturer} {selectedCrane.model}
              </p>
              <p className="text-sm text-slate-500">
                Max Capacity: {(selectedCrane.maxCapacity / 1000).toFixed(0)} tonnes
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Working Radius (m)</Label>
                <Input
                  type="number"
                  value={workingRadius}
                  onChange={(e) => setWorkingRadius(Number(e.target.value))}
                  min="2"
                  max="60"
                  step="0.5"
                />
              </div>
              <div className="space-y-2">
                <Label>Boom Length (m)</Label>
                <Select 
                  value={boomLength.toString()} 
                  onValueChange={(v) => setBoomLength(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCrane.boomLengths.map((length) => (
                      <SelectItem key={length} value={length.toString()}>
                        {length} m
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="border-t pt-4" />
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Hook Block Weight:</span>
                <span className="font-medium">{selectedCrane.hookBlockWeight} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Outrigger Span:</span>
                <span className="font-medium">{selectedCrane.outriggerSpan} m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Max GBP:</span>
                <span className="font-medium">{selectedCrane.maxGBP} kPa</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Utilization Calculation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-green-600" />
            Utilization Calculation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-sm text-slate-600 mb-2">Gross Load</p>
              <code className="block text-xs bg-slate-800 text-green-400 p-2 rounded mb-2">
                = Net + Rigging + Hook
              </code>
              <p className="font-mono text-sm">
                = {load.weight.toLocaleString()} + {rigging.totalRiggingWeight} + {selectedCrane.hookBlockWeight}
              </p>
              <p className="font-mono text-lg font-bold text-blue-600 mt-2">
                = {grossLoad.value.toLocaleString()} kg
              </p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-sm text-slate-600 mb-2">Chart Capacity @ {workingRadius}m</p>
              <code className="block text-xs bg-slate-800 text-green-400 p-2 rounded mb-2">
                Interpolated from load chart
              </code>
              <p className="font-mono text-sm">
                Radius: {workingRadius} m
              </p>
              <p className="font-mono text-lg font-bold text-blue-600 mt-2">
                = {chartCapacity.value.toLocaleString()} kg
              </p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-sm text-slate-600 mb-2">Utilization %</p>
              <code className="block text-xs bg-slate-800 text-green-400 p-2 rounded mb-2">
                = (Gross ÷ Capacity) × 100
              </code>
              <p className="font-mono text-sm">
                = ({grossLoad.value.toLocaleString()} ÷ {chartCapacity.value.toLocaleString()}) × 100
              </p>
              <p className={`font-mono text-lg font-bold mt-2 ${
                utilization.status === 'danger' ? 'text-red-600' : 
                utilization.status === 'warning' ? 'text-amber-600' : 'text-green-600'
              }`}>
                = {utilization.value.toFixed(2)}%
              </p>
            </div>
          </div>
          
          {/* Utilization Gauge */}
          <div className="mt-6 bg-slate-100 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Utilization Gauge</span>
              <Badge 
                variant={utilization.status === 'safe' ? 'default' : utilization.status === 'warning' ? 'secondary' : 'destructive'}
              >
                {utilization.value.toFixed(1)}%
              </Badge>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all ${
                  utilization.status === 'danger' ? 'bg-red-500' : 
                  utilization.status === 'warning' ? 'bg-amber-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(utilization.value, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>0%</span>
              <span>75% (Standard)</span>
              <span>85% (Critical)</span>
              <span>100% (Max)</span>
            </div>
          </div>
          
          {utilization.status === 'danger' && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="w-5 h-5" />
              <AlertDescription>
                <strong>CRITICAL:</strong> Utilization exceeds 100%. This lift is NOT PERMITTED. 
                Select a larger crane or reduce working radius.
              </AlertDescription>
            </Alert>
          )}
          
          {utilization.status === 'warning' && (
            <Alert className="mt-4 bg-amber-50 border-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <AlertDescription className="text-amber-700">
                <strong>WARNING:</strong> Utilization above 85% classifies this as a CRITICAL LIFT. 
                Additional approvals and risk controls required.
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
            Crane Selection Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-3 rounded-lg border">
              <p className="text-xs text-slate-500 uppercase">Selected Crane</p>
              <p className="font-medium">{selectedCrane.manufacturer} {selectedCrane.model}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <p className="text-xs text-slate-500 uppercase">Working Radius</p>
              <p className="font-medium">{workingRadius} m</p>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <p className="text-xs text-slate-500 uppercase">Gross Load</p>
              <p className="font-medium">{(grossLoad.value / 1000).toFixed(1)} T</p>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <p className="text-xs text-slate-500 uppercase">Utilization</p>
              <p className={`font-medium ${
                utilization.status === 'danger' ? 'text-red-600' : 
                utilization.status === 'warning' ? 'text-amber-600' : 'text-green-600'
              }`}>
                {utilization.value.toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
