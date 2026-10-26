import { Choice, GameChoices } from '../types';

export const BASE_START_MINUTES = 8 * 60; // 08:00 = 480 minutes

export function formatTime(totalMinutesFromMidnight: number): string {
  const hours = Math.floor(totalMinutesFromMidnight / 60);
  const minutes = totalMinutesFromMidnight % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export function getDecisionMinutes(decisionId: 'k1' | 'k2' | 'k3', choice: Choice, k1Choice?: Choice): number {
  if (decisionId === 'k1') {
    return choice === 'A' ? 15 : 20;
  }
  if (decisionId === 'k2') {
    if (choice === 'A') {
      return 10;
    }
    // Option B
    return k1Choice === 'A' ? 30 : 40;
  }
  if (decisionId === 'k3') {
    return 0;
  }
  return 0;
}

export function calculateTotalElapsedMinutes(choices: GameChoices): number {
  let elapsed = 0;
  if (choices.k1) {
    elapsed += getDecisionMinutes('k1', choices.k1);
  }
  if (choices.k2) {
    elapsed += getDecisionMinutes('k2', choices.k2, choices.k1);
  }
  if (choices.k3) {
    elapsed += getDecisionMinutes('k3', choices.k3, choices.k1);
  }
  return elapsed;
}

export function calculateClock(choices: GameChoices): string {
  const elapsed = calculateTotalElapsedMinutes(choices);
  return formatTime(BASE_START_MINUTES + elapsed);
}
