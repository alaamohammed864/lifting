// Step 2: Load Definition
// Weight, CoG, dimensions, lift point coordinates

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Package, 
  Ruler, 
  Crosshair, 
  Weight,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';
import { useLiftPlanStore } from '@/store/liftPlanStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

// ==================== VALIDATION SCHEMA ====================

const loadDefinitionSchema = z.object({
  loadName: z.string().min(2, 'Load name is required'),
  weight: z.number().min(100, 'Weight must be at least 100 kg'),
  length: z.number().min(0.1, 'Length is required'),
  width: z.number().min(0.1, 'Width is required'),
  height: z.number().min(0.1, 'Height is required'),
  cogX: z.number(),
  cogY: z.number(),
  cogZ: z.number(),
  description: z.string().optional(),
});

type LoadDefinitionForm = z.infer<typeof loadDefinitionSchema>;

// ==================== COMPONENT ====================

export function Step2LoadDefinition() {
  const { load, updateLoad, updateStepStatus } = useLiftPlanStore();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoadDefinitionForm>({
    resolver: zodResolver(loadDefinitionSchema),
    mode: 'onChange',
    defaultValues: {
      loadName: load.name,
      weight: load.weight,
      length: load.dimensions.length,
      width: load.dimensions.width,
      height: load.dimensions.height,
      cogX: load.cog.x,
      cogY: load.cog.y,
      cogZ: load.cog.z,
      description: load.description || '',
    },
  });
  
  const formValues = watch();
  
  // Check if form is valid
  const isFormValid: boolean = 
    !!formValues.loadName && 
    formValues.loadName.length >= 2 &&
    !!formValues.weight &&
    formValues.weight >= 100 &&
    !!formValues.length &&
    formValues.length >= 0.1 &&
    !!formValues.width &&
    formValues.width >= 0.1 &&
    !!formValues.height &&
    formValues.height >= 0.1;
  
  useEffect(() => {
    updateStepStatus(2, isFormValid, isFormValid);
  }, [isFormValid, updateStepStatus]);
  
  const onSubmit = (data: LoadDefinitionForm) => {
    updateLoad({
      name: data.loadName,
      weight: data.weight,
      dimensions: {
        length: data.length,
        width: data.width,
        height: data.height,
      },
      cog: {
        x: data.cogX,
        y: data.cogY,
        z: data.cogZ,
      },
      description: data.description,
    });
  };
  
  // Calculate load volume
  const volume = (formValues.length || 0) * (formValues.width || 0) * (formValues.height || 0);
  
  // Check if load is heavy (for classification)
  const isHeavyLoad = (formValues.weight || 0) > 50000;
  
  return (
    <div className="space-y-6" dir="ltr">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Step 2: Load Definition</h2>
          <p className="text-slate-500">Define load characteristics and center of gravity</p>
        </div>
        <Badge variant={isFormValid ? 'default' : 'secondary'} className="text-sm">
          {isFormValid ? (
            <><CheckCircle2 className="w-4 h-4 mr-1" /> Valid</>
          ) : (
            <><AlertCircle className="w-4 h-4 mr-1" /> Incomplete</>
          )}
        </Badge>
      </div>
      
      <form onChange={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Load Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Load Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loadName">
                  Load Name/Tag <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="loadName"
                  {...register('loadName')}
                  placeholder="e.g., Vessel V-201"
                  className={errors.loadName ? 'border-red-500' : ''}
                />
                {errors.loadName && (
                  <p className="text-sm text-red-500">{errors.loadName.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="weight">
                  <Weight className="w-4 h-4 inline mr-1" />
                  Net Weight (kg) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="weight"
                  type="number"
                  {...register('weight', { valueAsNumber: true })}
                  placeholder="e.g., 50000"
                  className={errors.weight ? 'border-red-500' : ''}
                />
                {errors.weight && (
                  <p className="text-sm text-red-500">{errors.weight.message}</p>
                )}
                {isHeavyLoad && (
                  <Alert className="py-2 bg-amber-50 border-amber-200">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <AlertDescription className="text-xs text-amber-700">
                      Heavy load (&gt;50T) - Critical lift classification
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  {...register('description')}
                  placeholder="e.g., Process vessel - Unit 3"
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Dimensions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="w-5 h-5 text-green-600" />
                Dimensions (meters)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="length">Length <span className="text-red-500">*</span></Label>
                  <Input
                    id="length"
                    type="number"
                    step="0.1"
                    {...register('length', { valueAsNumber: true })}
                    placeholder="m"
                    className={errors.length ? 'border-red-500' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="width">Width <span className="text-red-500">*</span></Label>
                  <Input
                    id="width"
                    type="number"
                    step="0.1"
                    {...register('width', { valueAsNumber: true })}
                    placeholder="m"
                    className={errors.width ? 'border-red-500' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height <span className="text-red-500">*</span></Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    {...register('height', { valueAsNumber: true })}
                    placeholder="m"
                    className={errors.height ? 'border-red-500' : ''}
                  />
                </div>
              </div>
              
              <div className="border-t pt-4" />
              
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-sm text-slate-600">
                  <Info className="w-4 h-4 inline mr-1" />
                  Load Volume: <span className="font-medium">{volume.toFixed(2)} m³</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Center of Gravity Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crosshair className="w-5 h-5 text-purple-600" />
              Center of Gravity (CoG) Offset
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="cogX">X Offset (mm from center)</Label>
                <Input
                  id="cogX"
                  type="number"
                  {...register('cogX', { valueAsNumber: true })}
                  placeholder="e.g., 150"
                />
                <p className="text-xs text-slate-500">+Right, -Left from load center</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cogY">Y Offset (mm from center)</Label>
                <Input
                  id="cogY"
                  type="number"
                  {...register('cogY', { valueAsNumber: true })}
                  placeholder="e.g., 0"
                />
                <p className="text-xs text-slate-500">+Forward, -Backward from center</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cogZ">Z Height (mm from bottom)</Label>
                <Input
                  id="cogZ"
                  type="number"
                  {...register('cogZ', { valueAsNumber: true })}
                  placeholder="e.g., 2000"
                />
                <p className="text-xs text-slate-500">Height of CoG from load base</p>
              </div>
            </div>
            
            <Alert className="mt-4 bg-blue-50 border-blue-200">
              <Info className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-700">
                CoG offset affects sling length calculations. Ensure accurate measurement from load drawings or physical verification.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
        
        {/* Live Preview Panel */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              Load Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-3 rounded-lg border">
                <p className="text-xs text-slate-500 uppercase">Load Name</p>
                <p className="font-medium truncate">{formValues.loadName || '-'}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <p className="text-xs text-slate-500 uppercase">Weight</p>
                <p className="font-medium">
                  {formValues.weight ? `${(formValues.weight / 1000).toFixed(1)} T` : '-'}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <p className="text-xs text-slate-500 uppercase">Dimensions (L×W×H)</p>
                <p className="font-medium">
                  {formValues.length && formValues.width && formValues.height 
                    ? `${formValues.length}×${formValues.width}×${formValues.height} m` 
                    : '-'}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <p className="text-xs text-slate-500 uppercase">CoG Offset</p>
                <p className="font-medium">
                  X:{formValues.cogX || 0}, Y:{formValues.cogY || 0}, Z:{formValues.cogZ || 0} mm
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
