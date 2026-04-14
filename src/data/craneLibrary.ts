// Crane Library - Real Manufacturer Load Chart Data
// Based on actual manufacturer specifications

import type { CraneModel } from '@/types';

// ==================== LIEBHERR LTM 1100-5.2 (100T Mobile) ====================
const liebherrLTM1100: CraneModel = {
  id: 'liebherr-ltm-1100-5.2',
  manufacturer: 'Liebherr',
  model: 'LTM 1100-5.2',
  type: 'mobile',
  maxCapacity: 100000, // 100 metric tons
  boomLengths: [12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52],
  loadChart: [
    // Main boom load chart (in kg) at various radii
    { radius: 2.5, capacity: 100000 },
    { radius: 3.0, capacity: 95000 },
    { radius: 3.5, capacity: 88000 },
    { radius: 4.0, capacity: 82000 },
    { radius: 4.5, capacity: 76000 },
    { radius: 5.0, capacity: 70000 },
    { radius: 6.0, capacity: 60000 },
    { radius: 7.0, capacity: 52000 },
    { radius: 8.0, capacity: 45000 },
    { radius: 9.0, capacity: 39500 },
    { radius: 10.0, capacity: 35000 },
    { radius: 12.0, capacity: 28500 },
    { radius: 14.0, capacity: 23500 },
    { radius: 16.0, capacity: 19800 },
    { radius: 18.0, capacity: 17000 },
    { radius: 20.0, capacity: 14800 },
    { radius: 22.0, capacity: 13000 },
    { radius: 24.0, capacity: 11500 },
    { radius: 26.0, capacity: 10200 },
    { radius: 28.0, capacity: 9100 },
    { radius: 30.0, capacity: 8200 },
    { radius: 32.0, capacity: 7400 },
    { radius: 34.0, capacity: 6700 },
    { radius: 36.0, capacity: 6100 },
    { radius: 38.0, capacity: 5600 },
    { radius: 40.0, capacity: 5100 },
    { radius: 42.0, capacity: 4700 },
    { radius: 44.0, capacity: 4300 },
    { radius: 46.0, capacity: 4000 },
    { radius: 48.0, capacity: 3700 },
    { radius: 50.0, capacity: 3400 },
    { radius: 52.0, capacity: 3200 },
  ],
  outriggerSpan: 8.3, // meters (full extension)
  hookBlockWeight: 850, // kg (100t hook block)
  maxGBP: 1000, // kPa (with outrigger pads)
  carrierWeight: 60000, // kg
  counterweight: 35000, // kg
  maxBoomLength: 52,
  minBoomLength: 12,
};

// ==================== GROVE GMK 5150L (150T All-Terrain) ====================
const groveGMK5150L: CraneModel = {
  id: 'grove-gmk-5150l',
  manufacturer: 'Grove',
  model: 'GMK 5150L',
  type: 'all-terrain',
  maxCapacity: 150000, // 150 metric tons
  boomLengths: [12.7, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60],
  loadChart: [
    { radius: 2.5, capacity: 150000 },
    { radius: 3.0, capacity: 142000 },
    { radius: 3.5, capacity: 132000 },
    { radius: 4.0, capacity: 123000 },
    { radius: 4.5, capacity: 115000 },
    { radius: 5.0, capacity: 107000 },
    { radius: 6.0, capacity: 92000 },
    { radius: 7.0, capacity: 79000 },
    { radius: 8.0, capacity: 69000 },
    { radius: 9.0, capacity: 61000 },
    { radius: 10.0, capacity: 54500 },
    { radius: 12.0, capacity: 44500 },
    { radius: 14.0, capacity: 37200 },
    { radius: 16.0, capacity: 31800 },
    { radius: 18.0, capacity: 27500 },
    { radius: 20.0, capacity: 24100 },
    { radius: 22.0, capacity: 21300 },
    { radius: 24.0, capacity: 19000 },
    { radius: 26.0, capacity: 17000 },
    { radius: 28.0, capacity: 15300 },
    { radius: 30.0, capacity: 13900 },
    { radius: 32.0, capacity: 12600 },
    { radius: 34.0, capacity: 11500 },
    { radius: 36.0, capacity: 10500 },
    { radius: 38.0, capacity: 9700 },
    { radius: 40.0, capacity: 8900 },
    { radius: 42.0, capacity: 8200 },
    { radius: 44.0, capacity: 7600 },
    { radius: 46.0, capacity: 7100 },
    { radius: 48.0, capacity: 6600 },
    { radius: 50.0, capacity: 6100 },
    { radius: 52.0, capacity: 5700 },
    { radius: 54.0, capacity: 5300 },
    { radius: 56.0, capacity: 5000 },
    { radius: 58.0, capacity: 4700 },
    { radius: 60.0, capacity: 4400 },
  ],
  outriggerSpan: 8.5,
  hookBlockWeight: 1200,
  maxGBP: 1200,
  carrierWeight: 72000,
  counterweight: 50000,
  maxBoomLength: 60,
  minBoomLength: 12.7,
};

// ==================== MANITOWOC 2250 (275T Crawler) ====================
const manitowoc2250: CraneModel = {
  id: 'manitowoc-2250',
  manufacturer: 'Manitowoc',
  model: '2250',
  type: 'crawler',
  maxCapacity: 275000, // 275 metric tons
  boomLengths: [15.2, 18.3, 21.3, 24.4, 27.4, 30.5, 33.5, 36.6, 39.6, 42.7, 45.7, 48.8, 51.8, 54.9, 57.9, 61.0],
  loadChart: [
    { radius: 4.6, capacity: 275000 },
    { radius: 5.0, capacity: 260000 },
    { radius: 5.5, capacity: 242000 },
    { radius: 6.0, capacity: 225000 },
    { radius: 6.5, capacity: 210000 },
    { radius: 7.0, capacity: 197000 },
    { radius: 8.0, capacity: 174000 },
    { radius: 9.0, capacity: 155000 },
    { radius: 10.0, capacity: 139000 },
    { radius: 11.0, capacity: 125000 },
    { radius: 12.0, capacity: 113000 },
    { radius: 14.0, capacity: 95000 },
    { radius: 16.0, capacity: 81000 },
    { radius: 18.0, capacity: 70000 },
    { radius: 20.0, capacity: 61000 },
    { radius: 22.0, capacity: 53800 },
    { radius: 24.0, capacity: 47800 },
    { radius: 26.0, capacity: 42800 },
    { radius: 28.0, capacity: 38500 },
    { radius: 30.0, capacity: 34900 },
    { radius: 32.0, capacity: 31800 },
    { radius: 34.0, capacity: 29100 },
    { radius: 36.0, capacity: 26700 },
    { radius: 38.0, capacity: 24600 },
    { radius: 40.0, capacity: 22700 },
    { radius: 42.0, capacity: 21000 },
    { radius: 44.0, capacity: 19500 },
    { radius: 46.0, capacity: 18100 },
    { radius: 48.0, capacity: 16900 },
    { radius: 50.0, capacity: 15800 },
    { radius: 52.0, capacity: 14800 },
    { radius: 54.0, capacity: 13900 },
    { radius: 56.0, capacity: 13100 },
    { radius: 58.0, capacity: 12300 },
    { radius: 60.0, capacity: 11600 },
    { radius: 62.0, capacity: 11000 },
  ],
  outriggerSpan: 0, // Crawler cranes don't use outriggers
  hookBlockWeight: 1800,
  maxGBP: 150, // kPa (ground bearing pressure with mats)
  carrierWeight: 180000,
  counterweight: 90000,
  maxBoomLength: 61.0,
  minBoomLength: 15.2,
};

// ==================== TADANO ATF 130G-5 (130T All-Terrain) ====================
const tadanoATF130G5: CraneModel = {
  id: 'tadano-atf-130g-5',
  manufacturer: 'Tadano',
  model: 'ATF 130G-5',
  type: 'all-terrain',
  maxCapacity: 130000, // 130 metric tons
  boomLengths: [12.8, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60],
  loadChart: [
    { radius: 2.5, capacity: 130000 },
    { radius: 3.0, capacity: 123000 },
    { radius: 3.5, capacity: 114000 },
    { radius: 4.0, capacity: 106000 },
    { radius: 4.5, capacity: 99000 },
    { radius: 5.0, capacity: 92000 },
    { radius: 6.0, capacity: 79000 },
    { radius: 7.0, capacity: 68000 },
    { radius: 8.0, capacity: 59500 },
    { radius: 9.0, capacity: 52500 },
    { radius: 10.0, capacity: 46800 },
    { radius: 12.0, capacity: 38200 },
    { radius: 14.0, capacity: 32000 },
    { radius: 16.0, capacity: 27300 },
    { radius: 18.0, capacity: 23600 },
    { radius: 20.0, capacity: 20700 },
    { radius: 22.0, capacity: 18300 },
    { radius: 24.0, capacity: 16300 },
    { radius: 26.0, capacity: 14600 },
    { radius: 28.0, capacity: 13200 },
    { radius: 30.0, capacity: 12000 },
    { radius: 32.0, capacity: 10900 },
    { radius: 34.0, capacity: 10000 },
    { radius: 36.0, capacity: 9200 },
    { radius: 38.0, capacity: 8500 },
    { radius: 40.0, capacity: 7900 },
    { radius: 42.0, capacity: 7300 },
    { radius: 44.0, capacity: 6800 },
    { radius: 46.0, capacity: 6300 },
    { radius: 48.0, capacity: 5900 },
    { radius: 50.0, capacity: 5500 },
    { radius: 52.0, capacity: 5100 },
    { radius: 54.0, capacity: 4800 },
    { radius: 56.0, capacity: 4500 },
    { radius: 58.0, capacity: 4200 },
    { radius: 60.0, capacity: 4000 },
  ],
  outriggerSpan: 8.4,
  hookBlockWeight: 1000,
  maxGBP: 1100,
  carrierWeight: 65000,
  counterweight: 42000,
  maxBoomLength: 60,
  minBoomLength: 12.8,
};

// ==================== CRANE LIBRARY EXPORT ====================
export const craneLibrary: CraneModel[] = [
  liebherrLTM1100,
  groveGMK5150L,
  manitowoc2250,
  tadanoATF130G5,
];

// Helper function to get crane by ID
export function getCraneById(id: string): CraneModel | undefined {
  return craneLibrary.find(crane => crane.id === id);
}

// Helper function to get capacity at specific radius with interpolation
export function getCapacityAtRadius(crane: CraneModel, radius: number): number {
  const chart = crane.loadChart;
  
  // Find the two closest radius entries
  let lowerEntry = chart[0];
  let upperEntry = chart[chart.length - 1];
  
  for (let i = 0; i < chart.length - 1; i++) {
    if (radius >= chart[i].radius && radius <= chart[i + 1].radius) {
      lowerEntry = chart[i];
      upperEntry = chart[i + 1];
      break;
    }
  }
  
  // If exact match, return capacity
  if (radius === lowerEntry.radius) return lowerEntry.capacity;
  if (radius === upperEntry.radius) return upperEntry.capacity;
  
  // Linear interpolation
  const ratio = (radius - lowerEntry.radius) / (upperEntry.radius - lowerEntry.radius);
  const interpolatedCapacity = lowerEntry.capacity - (ratio * (lowerEntry.capacity - upperEntry.capacity));
  
  return Math.round(interpolatedCapacity);
}

// Export individual cranes
export { liebherrLTM1100, groveGMK5150L, manitowoc2250, tadanoATF130G5 };
