// Step 5: Site Setup
// Crane position on 3D/2D map, outrigger plan, GBP check

import { useEffect, useState } from 'react';
import { 
  MapPin, 
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Calculator,
  Layers
} from 'lucide-react';
import { useLiftPlanStore } from '@/store/liftPlanStore';
import { calculateGBP } from '@/lib/calculationEngine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function Step5SiteSetup() {
  const { 
    selectedCrane, 
    siteConditions,
    updateSiteConditions,
    load,
    rigging,
    updateStepStatus
  } = useLiftPlanStore();
  
  const [padSize, setPadSize] = useState(1.5); // meters
  const padArea = padSize * padSize;
  
  // Calculate GBP
  const craneWeight = selectedCrane.carrierWeight + selectedCrane.counterweight;
  const grossLoad = load.weight + rigging.totalRiggingWeight + selectedCrane.hookBlockWeight;
  const gbp = calculateGBP(craneWeight, grossLoad, padArea);
  
  // Check if GBP is within limits
  const isGBPAcceptable = gbp.value <= siteConditions.soilBearingCapacity;
  
  useEffect(() => {
    const isValid = isGBPAcceptable;
    updateStepStatus(5, isValid, isValid);
  }, [isGBPAcceptable, updateStepStatus]);
  
  const hazardTypes: Record<string, { label: string; color: string }> = {
    'h2s': { label: 'H2S Hazard', color: 'bg-purple-100 text-purple-700' },
    'overhead-line': { label: 'Overhead Line', color: 'bg-red-100 text-red-700' },
    'pipe-rack': { label: 'Pipe Rack', color: 'bg-blue-100 text-blue-700' },
    'vessel': { label: 'Vessel', color: 'bg-green-100 text-green-700' },
    'flare': { label: 'Flare Stack', color: 'bg-orange-100 text-orange-700' },
    'live-process': { label: 'Live Process', color: 'bg-red-100 text-red-700' },
    'power-line': { label: 'Power Line', color: 'bg-yellow-100 text-yellow-700' },
    'other': { label: 'Other', color: 'bg-slate-100 text-slate-700' },
  };
  
  return (
    <div className="space-y-6" dir="ltr">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Step 5: Site Setup</h2>
          <p className="text-slate-500">Crane position, outrigger plan, and ground bearing pressure</p>
        </div>
        <Badge variant={isGBPAcceptable ? 'default' : 'destructive'} className="text-sm">
          {isGBPAcceptable ? (
            <><CheckCircle2 className="w-4 h-4 mr-1" /> GBP OK</>
          ) : (
            <><AlertCircle className="w-4 h-4 mr-1" /> GBP Exceeded</>
          )}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Site Hazards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Site Hazards & Obstacles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Direction</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {siteConditions.hazards.map((hazard) => (
                  <TableRow key={hazard.id}>
                    <TableCell>
                      <Badge className={hazardTypes[hazard.type]?.color || 'bg-slate-100'}>
                        {hazardTypes[hazard.type]?.label || hazard.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{hazard.description}</TableCell>
                    <TableCell>{hazard.distance} m</TableCell>
                    <TableCell>{hazard.direction}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <Alert className="mt-4 bg-red-50 border-red-200">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-sm text-red-700">
                <strong>CRITICAL:</strong> Live process line detected 5m below lift area. 
                This classifies as a CRITICAL LIFT per site procedures.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
        
        {/* Outrigger & GBP Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              Outrigger & GBP Calculation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Outrigger Pad Size (m)</Label>
              <Input
                type="number"
                value={padSize}
                onChange={(e) => setPadSize(Number(e.target.value))}
                min="1"
                max="3"
                step="0.1"
              />
              <p className="text-xs text-slate-500">
                Standard: 1.5m × 1.5m = 2.25 m² per pad
              </p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Pad Area (each):</span>
                <span className="font-medium">{padArea.toFixed(2)} m²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Total Pad Area (4 pads):</span>
                <span className="font-medium">{(padArea * 4).toFixed(2)} m²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Outrigger Span:</span>
                <span className="font-medium">{selectedCrane.outriggerSpan} m</span>
              </div>
            </div>
            
            <div className="border-t pt-4" />
            
            <div className="space-y-2">
              <Label>Site Soil Bearing Capacity (kPa)</Label>
              <Input
                type="number"
                value={siteConditions.soilBearingCapacity}
                onChange={(e) => updateSiteConditions({ soilBearingCapacity: Number(e.target.value) })}
                min="50"
                max="2000"
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* GBP Calculation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-green-600" />
            Ground Bearing Pressure (GBP) Calculation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-4 rounded-lg space-y-3">
              <p className="text-sm text-slate-600">Formula:</p>
              <code className="block bg-slate-800 text-green-400 p-3 rounded text-sm">
                GBP (kPa) = [(Crane Wt + Gross Load) × g] ÷ (n × Pad Area)
              </code>
              
              <div className="border-t border-slate-200 pt-3" />
              
              <div className="space-y-2">
                <p className="text-sm text-slate-600">Calculation:</p>
                <p className="font-mono text-sm">
                  = [({craneWeight.toLocaleString()} + {grossLoad.toLocaleString()}) × 9.81] ÷ (4 × {padArea.toFixed(2)})
                </p>
                <p className="font-mono text-sm">
                  = [{(craneWeight + grossLoad).toLocaleString()} × 9.81] ÷ {(padArea * 4).toFixed(2)}
                </p>
                <p className="font-mono text-lg font-bold text-blue-600">
                  = {gbp.value.toFixed(2)} kPa
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Calculated GBP:</span>
                  <span className={`font-bold ${!isGBPAcceptable ? 'text-red-600' : 'text-green-600'}`}>
                    {gbp.value.toFixed(2)} kPa
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Site Capacity:</span>
                  <span className="font-medium">{siteConditions.soilBearingCapacity} kPa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Utilization:</span>
                  <Badge variant={isGBPAcceptable ? 'default' : 'destructive'}>
                    {((gbp.value / siteConditions.soilBearingCapacity) * 100).toFixed(1)}%
                  </Badge>
                </div>
              </div>
              
              {/* GBP Gauge */}
              <div className="bg-slate-100 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">GBP vs Site Capacity</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all ${
                      isGBPAcceptable ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min((gbp.value / siteConditions.soilBearingCapacity) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>0 kPa</span>
                  <span>Site Limit: {siteConditions.soilBearingCapacity} kPa</span>
                </div>
              </div>
              
              {!isGBPAcceptable && (
                <Alert variant="destructive">
                  <AlertCircle className="w-5 h-5" />
                  <AlertDescription>
                    <strong>CRITICAL:</strong> GBP exceeds site bearing capacity. 
                    Use larger outrigger pads or crane mats.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 2D Site Plan Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-purple-600" />
            2D Site Plan Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-100 rounded-lg p-4 h-64 relative overflow-hidden">
            {/* Simple 2D representation */}
            <svg viewBox="0 0 400 200" className="w-full h-full">
              {/* Grid */}
              {[...Array(9)].map((_, i) => (
                <line key={`h${i}`} x1="0" y1={i * 25} x2="400" y2={i * 25} stroke="#e2e8f0" strokeWidth="1" />
              ))}
              {[...Array(17)].map((_, i) => (
                <line key={`v${i}`} x1={i * 25} y1="0" x2={i * 25} y2="200" stroke="#e2e8f0" strokeWidth="1" />
              ))}
              
              {/* Crane position */}
              <circle cx="200" cy="100" r="8" fill="#2563eb" />
              <text x="210" y="95" fontSize="10" fill="#2563eb">Crane</text>
              
              {/* Outrigger span */}
              <rect 
                x={200 - (selectedCrane.outriggerSpan * 5)} 
                y={100 - (selectedCrane.outriggerSpan * 5)} 
                width={selectedCrane.outriggerSpan * 10} 
                height={selectedCrane.outriggerSpan * 10} 
                fill="none" 
                stroke="#2563eb" 
                strokeWidth="2"
                strokeDasharray="4"
              />
              
              {/* Load position */}
              <rect x="280" y="80" width="40" height="40" fill="#22c55e" opacity="0.7" />
              <text x="285" y="105" fontSize="10" fill="white">Load</text>
              
              {/* Hazards */}
              <circle cx="200" cy="30" r="15" fill="#a855f7" opacity="0.5" />
              <text x="220" y="35" fontSize="9" fill="#a855f7">H2S</text>
              
              <rect x="360" y="60" width="8" height="80" fill="#ef4444" opacity="0.5" />
              <text x="340" y="55" fontSize="9" fill="#ef4444">Pipe Rack</text>
              
              {/* Working radius */}
              <circle cx="200" cy="100" r="80" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2" />
              <text x="280" y="100" fontSize="9" fill="#f59e0b">R=12m</text>
            </svg>
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">
            Simplified 2D view. Full 3D visualization available in Step 6.
          </p>
        </CardContent>
      </Card>
      
      {/* Live Preview */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            Site Setup Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-3 rounded-lg border">
              <p className="text-xs text-slate-500 uppercase">Pad Size</p>
              <p className="font-medium">{padSize} × {padSize} m</p>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <p className="text-xs text-slate-500 uppercase">Outrigger Span</p>
              <p className="font-medium">{selectedCrane.outriggerSpan} m</p>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <p className="text-xs text-slate-500 uppercase">Calculated GBP</p>
              <p className={`font-medium ${!isGBPAcceptable ? 'text-red-600' : ''}`}>
                {gbp.value.toFixed(1)} kPa
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <p className="text-xs text-slate-500 uppercase">Site Capacity</p>
              <p className="font-medium">{siteConditions.soilBearingCapacity} kPa</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
