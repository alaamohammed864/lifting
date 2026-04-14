// Step 1: Project Info
// Site details, project number, lift date/time, weather forecast

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Building2, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  CloudSun,
  Wind,
  Thermometer,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useLiftPlanStore } from '@/store/liftPlanStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

// ==================== VALIDATION SCHEMA ====================

const projectInfoSchema = z.object({
  projectName: z.string().min(3, 'Project name must be at least 3 characters'),
  projectNumber: z.string().min(3, 'Project number is required'),
  location: z.string().min(3, 'Location is required'),
  liftDate: z.string().min(1, 'Lift date is required'),
  liftTime: z.string().min(1, 'Lift time is required'),
  preparedBy: z.string().min(2, 'Prepared by is required'),
  weatherForecast: z.string().optional(),
  windSpeed: z.number().min(0).max(50),
  temperature: z.number().min(-40).max(60),
});

type ProjectInfoForm = z.infer<typeof projectInfoSchema>;

// ==================== COMPONENT ====================

export function Step1ProjectInfo() {
  const { projectInfo, updateProjectInfo, updateStepStatus, siteConditions, updateSiteConditions } = useLiftPlanStore();
  const [weatherData, setWeatherData] = useState<any>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjectInfoForm>({
    resolver: zodResolver(projectInfoSchema),
    mode: 'onChange',
    defaultValues: {
      projectName: projectInfo.name,
      projectNumber: projectInfo.number,
      location: projectInfo.location,
      liftDate: projectInfo.liftDate,
      liftTime: projectInfo.liftTime,
      preparedBy: projectInfo.preparedBy,
      weatherForecast: projectInfo.weatherForecast,
      windSpeed: siteConditions.windSpeed,
      temperature: siteConditions.temperature,
    },
  });
  
  // Watch form values for live preview
  const formValues = watch();
  
  // Check if form is valid
  const isFormValid: boolean = 
    !!formValues.projectName && 
    formValues.projectName.length >= 3 &&
    !!formValues.projectNumber && 
    formValues.projectNumber.length >= 3 &&
    !!formValues.location && 
    formValues.location.length >= 3 &&
    !!formValues.liftDate && 
    !!formValues.liftTime && 
    !!formValues.preparedBy &&
    formValues.preparedBy.length >= 2;
  
  // Update store when form is valid
  useEffect(() => {
    updateStepStatus(1, isFormValid, isFormValid);
  }, [isFormValid, updateStepStatus]);
  
  const onSubmit = (data: ProjectInfoForm) => {
    updateProjectInfo({
      name: data.projectName,
      number: data.projectNumber,
      location: data.location,
      liftDate: data.liftDate,
      liftTime: data.liftTime,
      preparedBy: data.preparedBy,
      weatherForecast: data.weatherForecast || '',
    });
    
    updateSiteConditions({
      windSpeed: data.windSpeed,
      temperature: data.temperature,
    });
  };
  
  // Simulate weather API fetch
  const fetchWeatherData = async () => {
    setIsLoadingWeather(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock weather data for Jubail Industrial City
    const mockWeather = {
      location: 'Jubail Industrial City',
      temperature: 35,
      windSpeed: 8,
      condition: 'Clear',
      humidity: 65,
      forecast: 'Clear skies, light winds from NW',
    };
    
    setWeatherData(mockWeather);
    setValue('weatherForecast', mockWeather.forecast);
    setValue('windSpeed', mockWeather.windSpeed);
    setValue('temperature', mockWeather.temperature);
    setIsLoadingWeather(false);
  };
  
  // Check wind speed against API RP 2D limit
  const windSpeed = watch('windSpeed') || 0;
  const isWindAcceptable = windSpeed <= 10;
  
  return (
    <div className="space-y-6" dir="ltr">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Step 1: Project Information</h2>
          <p className="text-slate-500">Enter project details and site conditions</p>
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
          {/* Project Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">
                  Project Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="projectName"
                  {...register('projectName')}
                  placeholder="e.g., Refinery Unit 3 Turnaround"
                  className={errors.projectName ? 'border-red-500' : ''}
                />
                {errors.projectName && (
                  <p className="text-sm text-red-500">{errors.projectName.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="projectNumber">
                  Project Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="projectNumber"
                  {...register('projectNumber')}
                  placeholder="e.g., PRJ-2024-001"
                  className={errors.projectNumber ? 'border-red-500' : ''}
                />
                {errors.projectNumber && (
                  <p className="text-sm text-red-500">{errors.projectNumber.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">
                  Site Location <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="location"
                    {...register('location')}
                    placeholder="e.g., Jubail Industrial City"
                    className={`pl-10 ${errors.location ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.location && (
                  <p className="text-sm text-red-500">{errors.location.message}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="liftDate">
                    Lift Date <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="liftDate"
                      type="date"
                      {...register('liftDate')}
                      className={`pl-10 ${errors.liftDate ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.liftDate && (
                    <p className="text-sm text-red-500">{errors.liftDate.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="liftTime">
                    Lift Time <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="liftTime"
                      type="time"
                      {...register('liftTime')}
                      className={`pl-10 ${errors.liftTime ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.liftTime && (
                    <p className="text-sm text-red-500">{errors.liftTime.message}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="preparedBy">
                  Prepared By <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="preparedBy"
                    {...register('preparedBy')}
                    placeholder="e.g., Alaa Mohammed"
                    className={`pl-10 ${errors.preparedBy ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.preparedBy && (
                  <p className="text-sm text-red-500">{errors.preparedBy.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Weather & Environment Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CloudSun className="w-5 h-5 text-amber-500" />
                Weather Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={fetchWeatherData}
                  disabled={isLoadingWeather}
                  className="flex-1"
                >
                  <CloudSun className="w-4 h-4 mr-2" />
                  {isLoadingWeather ? 'Fetching...' : 'Fetch Weather Data'}
                </Button>
              </div>
              
              {weatherData && (
                <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Location:</span>
                    <span className="font-medium">{weatherData.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Condition:</span>
                    <span className="font-medium">{weatherData.condition}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Humidity:</span>
                    <span className="font-medium">{weatherData.humidity}%</span>
                  </div>
                </div>
              )}
              
              <div className="border-t pt-4" />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="windSpeed">
                    <Wind className="w-4 h-4 inline mr-1" />
                    Wind Speed (m/s)
                  </Label>
                  <Input
                    id="windSpeed"
                    type="number"
                    step="0.1"
                    {...register('windSpeed', { valueAsNumber: true })}
                    className={!isWindAcceptable ? 'border-amber-500' : ''}
                  />
                  {!isWindAcceptable && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="w-4 h-4" />
                      <AlertDescription className="text-xs">
                        Exceeds API RP 2D limit (10 m/s)
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="temperature">
                    <Thermometer className="w-4 h-4 inline mr-1" />
                    Temperature (°C)
                  </Label>
                  <Input
                    id="temperature"
                    type="number"
                    {...register('temperature', { valueAsNumber: true })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="weatherForecast">Weather Forecast</Label>
                <Input
                  id="weatherForecast"
                  {...register('weatherForecast')}
                  placeholder="e.g., Clear skies, light winds"
                />
              </div>
              
              {/* Wind Speed Indicator */}
              <div className="bg-slate-100 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Wind Speed Status</span>
                  <Badge variant={isWindAcceptable ? 'default' : 'destructive'}>
                    {isWindAcceptable ? 'ACCEPTABLE' : 'EXCEEDS LIMIT'}
                  </Badge>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isWindAcceptable ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min((windSpeed / 15) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>0 m/s</span>
                  <span>API RP 2D Limit: 10 m/s</span>
                  <span>15 m/s</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Live Preview Panel */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              Live Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-3 rounded-lg border">
                <p className="text-xs text-slate-500 uppercase">Project</p>
                <p className="font-medium truncate">{formValues.projectName || '-'}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <p className="text-xs text-slate-500 uppercase">Number</p>
                <p className="font-medium">{formValues.projectNumber || '-'}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <p className="text-xs text-slate-500 uppercase">Lift Date/Time</p>
                <p className="font-medium">
                  {formValues.liftDate && formValues.liftTime 
                    ? `${formValues.liftDate} ${formValues.liftTime}` 
                    : '-'}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <p className="text-xs text-slate-500 uppercase">Wind Speed</p>
                <p className={`font-medium ${!isWindAcceptable ? 'text-red-600' : ''}`}>
                  {formValues.windSpeed !== undefined ? `${formValues.windSpeed} m/s` : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
