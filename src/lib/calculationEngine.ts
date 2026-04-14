// Engineering Calculation Engine
// ASME B30.9, ASME B30.26, API RP 2D, EN 13155
// All calculations show: [Formula] → [Substituted values] → [Result + unit]

import type { CraneModel, LoadDefinition, RiggingDesign, SiteConditions, LiftCalculation, CalculationStep, CranePosition } from '@/types';
import { getCapacityAtRadius } from '@/data/craneLibrary';

// ==================== A) GROSS LOAD CALCULATION ====================
// Gross Load = Net Load + Rigging Weight + Hook Block Weight

export function calculateGrossLoad(
  netLoad: number, // kg
  riggingWeight: number, // kg
  hookBlockWeight: number // kg
): { value: number; steps: CalculationStep[] } {
  const steps: CalculationStep[] = [
    {
      formula: 'Gross Load = Net Load + Rigging Weight + Hook Block Weight',
      substitution: `Gross Load = ${netLoad.toLocaleString()} kg + ${riggingWeight.toLocaleString()} kg + ${hookBlockWeight.toLocaleString()} kg`,
      result: (netLoad + riggingWeight + hookBlockWeight).toLocaleString(),
      unit: 'kg',
    },
  ];
  
  return {
    value: netLoad + riggingWeight + hookBlockWeight,
    steps,
  };
}

// ==================== B) WORKING RADIUS CALCULATION ====================
// Working Radius = horizontal distance from slew center to load CoG

export function calculateWorkingRadius(
  cranePosition: CranePosition,
  loadPosition: { x: number; y: number }
): { value: number; steps: CalculationStep[] } {
  const deltaX = loadPosition.x - cranePosition.x;
  const deltaY = loadPosition.y - cranePosition.y;
  const radius = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  
  const steps: CalculationStep[] = [
    {
      formula: 'Working Radius = √[(X₂ - X₁)² + (Y₂ - Y₁)²]',
      substitution: `Working Radius = √[(${loadPosition.x} - ${cranePosition.x})² + (${loadPosition.y} - ${cranePosition.y})²]`,
      result: radius.toFixed(2),
      unit: 'm',
    },
    {
      formula: 'Working Radius = √[ΔX² + ΔY²]',
      substitution: `Working Radius = √[${deltaX.toFixed(2)}² + ${deltaY.toFixed(2)}²]`,
      result: radius.toFixed(2),
      unit: 'm',
    },
  ];
  
  return {
    value: radius,
    steps,
  };
}

// ==================== C) CHART CAPACITY CALCULATION ====================
// Chart Capacity = linear interpolation between two nearest radii in load chart

export function calculateChartCapacity(
  crane: CraneModel,
  radius: number
): { value: number; steps: CalculationStep[] } {
  const capacity = getCapacityAtRadius(crane, radius);
  const chart = crane.loadChart;
  
  // Find the two closest radius entries for detailed calculation
  let lowerEntry = chart[0];
  let upperEntry = chart[chart.length - 1];
  
  for (let i = 0; i < chart.length - 1; i++) {
    if (radius >= chart[i].radius && radius <= chart[i + 1].radius) {
      lowerEntry = chart[i];
      upperEntry = chart[i + 1];
      break;
    }
  }
  
  const ratio = (radius - lowerEntry.radius) / (upperEntry.radius - lowerEntry.radius);
  
  const steps: CalculationStep[] = [
    {
      formula: 'Chart Capacity = C₁ - [(R - R₁) / (R₂ - R₁)] × (C₁ - C₂)',
      substitution: `Chart Capacity = ${lowerEntry.capacity.toLocaleString()} - [(${radius.toFixed(2)} - ${lowerEntry.radius}) / (${upperEntry.radius} - ${lowerEntry.radius})] × (${lowerEntry.capacity.toLocaleString()} - ${upperEntry.capacity.toLocaleString()})`,
      result: capacity.toLocaleString(),
      unit: 'kg',
    },
    {
      formula: 'Interpolation Ratio = (R - R₁) / (R₂ - R₁)',
      substitution: `Interpolation Ratio = (${radius.toFixed(2)} - ${lowerEntry.radius}) / (${upperEntry.radius} - ${lowerEntry.radius})`,
      result: ratio.toFixed(4),
      unit: '',
    },
    {
      formula: 'Chart Capacity = C₁ - (Ratio × Capacity Difference)',
      substitution: `Chart Capacity = ${lowerEntry.capacity.toLocaleString()} - (${ratio.toFixed(4)} × ${(lowerEntry.capacity - upperEntry.capacity).toLocaleString()})`,
      result: capacity.toLocaleString(),
      unit: 'kg',
    },
  ];
  
  return {
    value: capacity,
    steps,
  };
}

// ==================== D) UTILIZATION PERCENTAGE ====================
// Utilization % = (Gross Load ÷ Chart Capacity) × 100 → BLOCK if > 100%

export function calculateUtilization(
  grossLoad: number,
  chartCapacity: number
): { value: number; steps: CalculationStep[]; status: 'safe' | 'warning' | 'danger' } {
  const utilization = (grossLoad / chartCapacity) * 100;
  
  let status: 'safe' | 'warning' | 'danger' = 'safe';
  if (utilization > 100) status = 'danger';
  else if (utilization > 85) status = 'warning';
  
  const steps: CalculationStep[] = [
    {
      formula: 'Utilization % = (Gross Load ÷ Chart Capacity) × 100',
      substitution: `Utilization % = (${grossLoad.toLocaleString()} kg ÷ ${chartCapacity.toLocaleString()} kg) × 100`,
      result: utilization.toFixed(2),
      unit: '%',
    },
  ];
  
  if (utilization > 100) {
    steps.push({
      formula: 'STATUS: BLOCKED - Utilization exceeds 100%',
      substitution: `Utilization ${utilization.toFixed(2)}% > 100%`,
      result: 'LIFT NOT PERMITTED',
      unit: '',
    });
  } else if (utilization > 85) {
    steps.push({
      formula: 'STATUS: WARNING - Utilization above 85%',
      substitution: `Utilization ${utilization.toFixed(2)}% > 85%`,
      result: 'CRITICAL LIFT CLASSIFICATION',
      unit: '',
    });
  }
  
  return {
    value: utilization,
    steps,
    status,
  };
}

// ==================== E) SLING TENSION ====================
// Sling Tension = W ÷ (n × cos θ) — ASME B30.9 Eq. 3.1

export function calculateSlingTension(
  loadWeight: number, // kg
  slingAngle: number, // degrees from horizontal
  numberOfLegs: number
): { value: number; steps: CalculationStep[] } {
  const angleRad = (slingAngle * Math.PI) / 180;
  const cosTheta = Math.cos(angleRad);
  const tension = loadWeight / (numberOfLegs * cosTheta);
  
  const steps: CalculationStep[] = [
    {
      formula: 'Sling Tension = W ÷ (n × cos θ) — ASME B30.9 Eq. 3.1',
      substitution: `Sling Tension = ${loadWeight.toLocaleString()} kg ÷ (${numberOfLegs} × cos(${slingAngle}°))`,
      result: tension.toFixed(2),
      unit: 'kg',
    },
    {
      formula: 'cos θ = cos(sling angle)',
      substitution: `cos(${slingAngle}°) = ${cosTheta.toFixed(4)}`,
      result: cosTheta.toFixed(4),
      unit: '',
    },
    {
      formula: 'Sling Tension = W ÷ (n × cos θ)',
      substitution: `Sling Tension = ${loadWeight.toLocaleString()} ÷ (${numberOfLegs} × ${cosTheta.toFixed(4)})`,
      result: tension.toFixed(2),
      unit: 'kg per leg',
    },
  ];
  
  return {
    value: tension,
    steps,
  };
}

// ==================== F) ANGLE DE-RATING ====================
// if θ > 45°, apply factor = cos θ ÷ cos 45°

export function calculateAngleDerating(
  slingAngle: number // degrees from horizontal
): { factor: number; steps: CalculationStep[] } {
  const angleRad = (slingAngle * Math.PI) / 180;
  const cosTheta = Math.cos(angleRad);
  const cos45 = Math.cos((45 * Math.PI) / 180);
  const factor = cosTheta / cos45;
  
  const steps: CalculationStep[] = [];
  
  if (slingAngle > 45) {
    steps.push({
      formula: 'Angle De-rating Factor = cos θ ÷ cos 45° (applied when θ > 45°)',
      substitution: `De-rating Factor = cos(${slingAngle}°) ÷ cos(45°)`,
      result: factor.toFixed(4),
      unit: '',
    });
    steps.push({
      formula: 'cos θ ÷ cos 45°',
      substitution: `${cosTheta.toFixed(4)} ÷ ${cos45.toFixed(4)}`,
      result: factor.toFixed(4),
      unit: '',
    });
  } else {
    steps.push({
      formula: 'No de-rating required (θ ≤ 45°)',
      substitution: `Sling angle ${slingAngle}° ≤ 45°`,
      result: '1.0000 (no reduction)',
      unit: '',
    });
  }
  
  return {
    factor: slingAngle > 45 ? factor : 1,
    steps,
  };
}

// ==================== G) GROUND BEARING PRESSURE (GBP) ====================
// GBP (kPa) = (Crane Weight + Gross Load) ÷ (4 × Pad Area m²) → ALERT if > site limit

export function calculateGBP(
  craneWeight: number, // kg
  grossLoad: number, // kg
  padArea: number, // m² per pad (typically 1.5m x 1.5m = 2.25m²)
  numberOfPads: number = 4
): { value: number; steps: CalculationStep[]; status: 'safe' | 'warning' | 'danger' } {
  const totalWeight = craneWeight + grossLoad;
  const totalPadArea = numberOfPads * padArea;
  const gbp = (totalWeight * 9.81) / (totalPadArea * 1000); // Convert to kPa
  
  const steps: CalculationStep[] = [
    {
      formula: 'GBP (kPa) = [(Crane Weight + Gross Load) × g] ÷ (n × Pad Area)',
      substitution: `GBP = [(${craneWeight.toLocaleString()} kg + ${grossLoad.toLocaleString()} kg) × 9.81 m/s²] ÷ (${numberOfPads} × ${padArea} m²)`,
      result: gbp.toFixed(2),
      unit: 'kPa',
    },
    {
      formula: 'Total Weight = Crane Weight + Gross Load',
      substitution: `Total Weight = ${craneWeight.toLocaleString()} kg + ${grossLoad.toLocaleString()} kg = ${totalWeight.toLocaleString()} kg`,
      result: totalWeight.toLocaleString(),
      unit: 'kg',
    },
    {
      formula: 'Total Pad Area = n × Pad Area',
      substitution: `Total Pad Area = ${numberOfPads} × ${padArea} m² = ${totalPadArea} m²`,
      result: totalPadArea.toFixed(2),
      unit: 'm²',
    },
    {
      formula: 'GBP = (Total Weight × g) ÷ Total Pad Area',
      substitution: `GBP = (${totalWeight.toLocaleString()} × 9.81) ÷ ${totalPadArea.toFixed(2)}`,
      result: gbp.toFixed(2),
      unit: 'kPa',
    },
  ];
  
  return {
    value: gbp,
    steps,
    status: 'safe',
  };
}

// ==================== H) WIND FORCE ====================
// Wind force = Cd × A × 0.613 × V² (Newtons) per API RP 2D

export function calculateWindForce(
  dragCoefficient: number, // Cd (typically 1.2 for rectangular loads)
  projectedArea: number, // A in m²
  windSpeed: number // V in m/s
): { value: number; steps: CalculationStep[] } {
  const windForce = dragCoefficient * projectedArea * 0.613 * Math.pow(windSpeed, 2);
  
  const steps: CalculationStep[] = [
    {
      formula: 'Wind Force = Cd × A × 0.613 × V² — API RP 2D',
      substitution: `Wind Force = ${dragCoefficient} × ${projectedArea} m² × 0.613 × (${windSpeed} m/s)²`,
      result: windForce.toFixed(2),
      unit: 'N',
    },
    {
      formula: 'V² = Wind Speed squared',
      substitution: `V² = ${windSpeed}² = ${Math.pow(windSpeed, 2).toFixed(2)}`,
      result: Math.pow(windSpeed, 2).toFixed(2),
      unit: 'm²/s²',
    },
    {
      formula: 'Wind Force = Cd × A × 0.613 × V²',
      substitution: `Wind Force = ${dragCoefficient} × ${projectedArea} × 0.613 × ${Math.pow(windSpeed, 2).toFixed(2)}`,
      result: windForce.toFixed(2),
      unit: 'N',
    },
  ];
  
  // API RP 2D operational limit check
  const operationalLimit = 10; // m/s (typical limit for lifting operations)
  if (windSpeed > operationalLimit) {
    steps.push({
      formula: 'WARNING: Wind speed exceeds API RP 2D operational limit',
      substitution: `Wind Speed ${windSpeed} m/s > ${operationalLimit} m/s limit`,
      result: 'LIFT NOT RECOMMENDED',
      unit: '',
    });
  }
  
  return {
    value: windForce,
    steps,
  };
}

// ==================== COMPLETE LIFT CALCULATION ====================

export function performCompleteCalculation(
  crane: CraneModel,
  load: LoadDefinition,
  rigging: RiggingDesign,
  cranePosition: CranePosition,
  loadPosition: { x: number; y: number },
  siteConditions: SiteConditions,
  slingAngle: number,
  padArea: number = 2.25 // 1.5m x 1.5m default
): LiftCalculation {
  // A) Gross Load
  const riggingWeight = rigging.totalRiggingWeight;
  const hookBlockWeight = crane.hookBlockWeight;
  const grossLoad = calculateGrossLoad(load.weight, riggingWeight, hookBlockWeight);
  
  // B) Working Radius
  const workingRadius = calculateWorkingRadius(cranePosition, loadPosition);
  
  // C) Chart Capacity
  const chartCapacity = calculateChartCapacity(crane, workingRadius.value);
  
  // D) Utilization
  const utilization = calculateUtilization(grossLoad.value, chartCapacity.value);
  
  // E) Sling Tension
  const slingTension = calculateSlingTension(grossLoad.value, slingAngle, 4);
  
  // F) Angle De-rating
  const angleDerating = calculateAngleDerating(slingAngle);
  
  // G) GBP
  const craneWeight = crane.carrierWeight + crane.counterweight;
  const gbp = calculateGBP(craneWeight, grossLoad.value, padArea);
  
  // H) Wind Force
  const projectedArea = load.dimensions.length * load.dimensions.height; // Side profile
  const windForce = calculateWindForce(1.2, projectedArea, siteConditions.windSpeed);
  
  return {
    grossLoad,
    workingRadius,
    chartCapacity,
    utilization,
    slingTension,
    angleDerating,
    gbp,
    windForce,
  };
}

// ==================== LIFT CLASSIFICATION ====================

export function classifyLift(
  utilization: number,
  isOverLiveProcess: boolean,
  isNearPowerLines: boolean,
  windSpeed: number,
  loadWeight: number
): { classification: 'routine' | 'standard' | 'critical'; reasons: string[] } {
  const reasons: string[] = [];
  
  // Critical lift criteria
  if (utilization > 85) {
    reasons.push(`High utilization: ${utilization.toFixed(1)}% > 85%`);
  }
  if (isOverLiveProcess) {
    reasons.push('Lift over live process line');
  }
  if (isNearPowerLines) {
    reasons.push('Lift near overhead power lines');
  }
  if (windSpeed > 10) {
    reasons.push(`High wind speed: ${windSpeed} m/s > 10 m/s`);
  }
  if (loadWeight > 50000) {
    reasons.push(`Heavy load: ${(loadWeight / 1000).toFixed(1)} tonnes > 50 tonnes`);
  }
  
  if (reasons.length >= 2 || utilization > 90 || isOverLiveProcess) {
    return { classification: 'critical', reasons };
  } else if (reasons.length === 1 || utilization > 75) {
    return { classification: 'standard', reasons };
  } else {
    return { classification: 'routine', reasons };
  }
}

// ==================== VALIDATION RULES ====================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateLiftPlan(
  utilization: number,
  slingAngle: number,
  gbp: number,
  siteBearingCapacity: number,
  windSpeed: number
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Block if utilization > 100%
  if (utilization > 100) {
    errors.push(`Utilization ${utilization.toFixed(1)}% exceeds 100% - LIFT NOT PERMITTED`);
  }
  
  // Block if sling angle > 120°
  if (slingAngle > 120) {
    errors.push(`Sling angle ${slingAngle}° exceeds 120° maximum - LIFT NOT PERMITTED`);
  }
  
  // Block if GBP > site bearing capacity
  if (gbp > siteBearingCapacity) {
    errors.push(`Ground bearing pressure ${gbp.toFixed(1)} kPa exceeds site capacity ${siteBearingCapacity} kPa - LIFT NOT PERMITTED`);
  }
  
  // Block if wind speed > API RP 2D limit
  if (windSpeed > 10) {
    errors.push(`Wind speed ${windSpeed} m/s exceeds API RP 2D operational limit of 10 m/s - LIFT NOT PERMITTED`);
  }
  
  // Warnings
  if (utilization > 85 && utilization <= 100) {
    warnings.push(`High utilization: ${utilization.toFixed(1)}% - Consider larger crane`);
  }
  if (slingAngle > 60 && slingAngle <= 120) {
    warnings.push(`Steep sling angle: ${slingAngle}° - High tension in slings`);
  }
  if (gbp > siteBearingCapacity * 0.8 && gbp <= siteBearingCapacity) {
    warnings.push(`GBP ${gbp.toFixed(1)} kPa approaching site limit ${siteBearingCapacity} kPa`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
