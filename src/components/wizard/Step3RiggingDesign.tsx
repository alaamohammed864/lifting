// Step 3: Rigging Design
// Sling type, angle, SWL check, hardware selection

import { useEffect, useState } from 'react';
import { 
  Link2, 
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Calculator
} from 'lucide-react';
import { useLiftPlanStore } from '@/store/liftPlanStore';
import { calculateSlingTension } from '@/lib/calculationEngine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { SlingType } from '@/types';

export function Step3RiggingDesign() {
  const { rigging, load, updateStepStatus } = useLiftPlanStore();
  const [slingAngle, setSlingAngle] = useState(60);
  const [slingLength, setSlingLength] = useState(20);
  const [slingType, setSlingType] = useState<SlingType>('wire-rope');
  
  // Calculate sling tension
  const slingTension = calculateSlingTension(load.weight, slingAngle, 4);
  
  // Check if sling SWL is adequate
  const slingSWL = 25000; // kg per sling
  const isSWLAdequate = slingTension.value <= slingSWL;
  
  // Check sling angle warning
  const isAngleWarning = slingAngle > 60;
  const isAngleDanger = slingAngle > 120;
  
  useEffect(() => {
    const isValid = isSWLAdequate && !isAngleDanger;
    updateStepStatus(3, isValid, isValid);
  }, [isSWLAdequate, isAngleDanger, updateStepStatus]);
  
  const slingTypeOptions: { value: SlingType; label: string }[] = [
    { value: 'wire-rope', label: 'Wire Rope' },
    { value: 'chain', label: 'Chain' },
    { value: 'synthetic', label: 'Synthetic Webbing' },
    { value: 'round-sling', label: 'Round Sling' },
  ];
  
  return (
    <div className="space-y-6" dir="ltr">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Step 3: Rigging Design</h2>
          <p className="text-slate-500">Configure slings, angles, and hardware - ASME B30.9</p>
        </div>
        <Badge variant={isSWLAdequate && !isAngleDanger ? 'default' : 'destructive'} className="text-sm">
          {isSWLAdequate && !isAngleDanger ? (
            <><CheckCircle2 className="w-4 h-4 mr-1" /> Valid</>
          ) : (
            <><AlertCircle className="w-4 h-4 mr-1" /> Issue Detected</>
          )}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sling Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-blue-600" />
              Sling Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Sling Type</Label>
              <Select value={slingType} onValueChange={(v) => setSlingType(v as SlingType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sling type" />
                </SelectTrigger>
                <SelectContent>
                  {slingTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sling Angle (degrees)</Label>
                <Input
                  type="number"
                  value={slingAngle}
                  onChange={(e) => setSlingAngle(Number(e.target.value))}
                  min="15"
                  max="120"
                  className={isAngleDanger ? 'border-red-500' : isAngleWarning ? 'border-amber-500' : ''}
                />
                <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isAngleDanger ? 'bg-red-500' : isAngleWarning ? 'bg-amber-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${(slingAngle / 120) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>15°</span>
                  <span>60°</span>
                  <span>120°</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Sling Length (m)</Label>
                <Input
                  type="number"
                  value={slingLength}
                  onChange={(e) => setSlingLength(Number(e.target.value))}
                  min="1"
                  step="0.5"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Number of Legs</Label>
              <Select defaultValue="4">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Single Leg</SelectItem>
                  <SelectItem value="2">2-Leg Bridle</SelectItem>
                  <SelectItem value="4">4-Leg Bridle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {isAngleWarning && (
              <Alert variant={isAngleDanger ? 'destructive' : 'default'} className="py-2">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription className="text-xs">
                  {isAngleDanger 
                    ? 'CRITICAL: Sling angle exceeds 120° - LIFT NOT PERMITTED per ASME B30.9'
                    : 'WARNING: Sling angle >60° results in high tension - Consider longer slings'
                  }
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
        
        {/* Tension Calculation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-green-600" />
              Sling Tension Calculation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Formula (ASME B30.9 Eq. 3.1):</span>
              </div>
              <code className="block bg-slate-800 text-green-400 p-3 rounded text-sm">
                T = W ÷ (n × cos θ)
              </code>
              
              <div className="border-t border-slate-200 pt-3" />
              
              <div className="space-y-2">
                <p className="text-sm text-slate-600">Calculation:</p>
                <p className="font-mono text-sm">
                  T = {load.weight.toLocaleString()} ÷ (4 × cos({slingAngle}°))
                </p>
                <p className="font-mono text-sm">
                  T = {load.weight.toLocaleString()} ÷ (4 × {Math.cos((slingAngle * Math.PI) / 180).toFixed(4)})
                </p>
                <p className="font-mono text-lg font-bold text-blue-600 mt-2">
                  T = {slingTension.value.toFixed(2)} kg per leg
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
              <span className="text-sm">Sling SWL:</span>
              <Badge variant="outline">{slingSWL.toLocaleString()} kg</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
              <span className="text-sm">Utilization:</span>
              <Badge variant={isSWLAdequate ? 'default' : 'destructive'}>
                {((slingTension.value / slingSWL) * 100).toFixed(1)}%
              </Badge>
            </div>
            
            <Alert className={isSWLAdequate ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
              <div className="flex items-center gap-2">
                {isSWLAdequate ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <AlertDescription className={isSWLAdequate ? 'text-green-700' : 'text-red-700'}>
                  {isSWLAdequate 
                    ? 'Sling SWL is adequate for this lift'
                    : 'Sling SWL exceeded - Select higher capacity slings'
                  }
                </AlertDescription>
              </div>
            </Alert>
          </CardContent>
        </Card>
      </div>
      
      {/* Hardware Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-purple-600" />
            Rigging Hardware
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>SWL (kg)</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rigging.hardware.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="capitalize">{item.type}</TableCell>
                  <TableCell>{item.swl.toLocaleString()}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    <Badge variant={item.swl > slingTension.value ? 'default' : 'destructive'}>
                      {item.swl > slingTension.value ? 'OK' : 'INADEQUATE'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Live Preview */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            Rigging Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-3 rounded-lg border">
              <p className="text-xs text-slate-500 uppercase">Sling Type</p>
              <p className="font-medium capitalize">{slingType.replace('-', ' ')}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <p className="text-xs text-slate-500 uppercase">Sling Angle</p>
              <p className={`font-medium ${isAngleWarning ? 'text-amber-600' : ''}`}>{slingAngle}°</p>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <p className="text-xs text-slate-500 uppercase">Tension per Leg</p>
              <p className={`font-medium ${!isSWLAdequate ? 'text-red-600' : ''}`}>
                {slingTension.value.toFixed(0)} kg
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <p className="text-xs text-slate-500 uppercase">Total Rigging Weight</p>
              <p className="font-medium">{rigging.totalRiggingWeight} kg</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
