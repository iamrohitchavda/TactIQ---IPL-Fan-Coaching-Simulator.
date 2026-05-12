export function getPhase(overNumber: number): 'powerplay' | 'middle' | 'death' {
  if (overNumber <= 6) return 'powerplay';
  if (overNumber <= 15) return 'middle';
  return 'death';
}

export const phaseAccents: Record<string, { border: string; glow: string; bg: string; text: string; label: string }> = {
  powerplay: {
    border: 'border-accent-green/40',
    glow: 'shadow-[0_0_15px_rgba(0,255,135,0.15)]',
    bg: 'bg-accent-green/10',
    text: 'text-accent-green',
    label: 'POWERPLAY',
  },
  middle: {
    border: 'border-accent-blue/40',
    glow: 'shadow-[0_0_15px_rgba(0,180,255,0.15)]',
    bg: 'bg-accent-blue/10',
    text: 'text-accent-blue',
    label: 'MIDDLE',
  },
  death: {
    border: 'border-accent-orange/40',
    glow: 'shadow-[0_0_15px_rgba(255,107,0,0.15)]',
    bg: 'bg-accent-orange/10',
    text: 'text-accent-orange',
    label: 'DEATH',
  },
};

export function getPhaseAccent(overNumber: number) {
  return phaseAccents[getPhase(overNumber)];
}
