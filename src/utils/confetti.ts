import confetti from 'canvas-confetti';

export function triggerConfetti(): void {
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 },
    colors: ['#00D4AA', '#7C5CFC', '#FF6B6B', '#FFB84D', '#E8E8F0'],
  });
}

export function triggerBadgeConfetti(): void {
  confetti({
    particleCount: 60,
    spread: 55,
    origin: { y: 0.7 },
    shapes: ['star'],
    colors: ['#7C5CFC', '#FFB84D', '#00D4AA'],
  });
}
