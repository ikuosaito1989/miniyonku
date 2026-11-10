import { equipmentSlots, type Equipment, type EquipmentSlot } from '../data/machine';
import { parts } from '../data/parts';
import { dirtSurface, pavedSurface } from '../data/surfaces';
import { equipPart } from './equipment';
import { machinePerformance, surfacePerformance } from './driving';

export type QuickSetupProfile = 'speed' | 'offroad' | 'balanced';

const slots = Object.keys(equipmentSlots) as EquipmentSlot[];
const ownedParts = (inventory: Record<string, number>, slot: EquipmentSlot) =>
  parts.filter(part => part.category === equipmentSlots[slot].category && inventory[part.id] > 0);

function score(equipment: Equipment, profile: QuickSetupProfile) {
  const performance = machinePerformance(equipment);
  const paved = surfacePerformance(performance, pavedSurface);
  const dirt = surfacePerformance(performance, dirtSurface);
  const speed = performance.freeSpeed / 20 + performance.stallForce / 14 - performance.mass * 2.8
    - performance.treadDrag * 0.08 + performance.lateralLimit / 210
    + Math.min(1, performance.batteryEndurance / 180) * 0.045;
  const offroad = performance.roughGrip * 0.25 - performance.roughResistance * 0.3
    + dirt.traction * 0.48 - dirt.resistance * 9 + dirt.lateralLimit / 100
    + performance.damping * 0.22 + performance.stallForce / 24;
  const balanced = speed * 0.48 + offroad * 0.52 + paved.lateralLimit / 300;
  return profile === 'speed' ? speed : profile === 'offroad' ? offroad : balanced;
}

/** Pick the strongest owned setup for a broad driving style, without buying or consuming parts. */
export function buildQuickSetup(current: Equipment, inventory: Record<string, number>, profile: QuickSetupProfile): Equipment {
  let result = { ...current };
  // Repeated coordinate passes account for interactions such as motor/gearing and tire/chassis.
  for (let pass = 0; pass < 4; pass++) {
    let changed = false;
    for (const slot of slots) {
      let best = result;
      let bestScore = score(result, profile);
      for (const part of ownedParts(inventory, slot)) {
        const candidate = equipPart(result, inventory, part.id, slot);
        if (candidate === result) continue;
        const candidateScore = score(candidate, profile);
        if (candidateScore > bestScore + 1e-9) {
          best = candidate;
          bestScore = candidateScore;
        }
      }
      if (best !== result) {
        result = best;
        changed = true;
      }
    }
    if (!changed) break;
  }
  return result;
}
