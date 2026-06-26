import type { FrameSource } from '@/utils/frameLoader';

const animationFrameCounts: Record<string, number> = {
  karakter_idle: 40,
  karakter_menjelaskan: 121,
};

export const defaultKarakterFrames: FrameSource = {
  basePath: '/avatar/karakter_idle',
  pattern: 'karakter_idle{i}.png',
  start: 1,
  end: animationFrameCounts.karakter_idle,
  zeroPad: 4,
};

export function createKarakterFrames(
  animation?: string,
  options?: Partial<FrameSource>
): FrameSource {
  const rawName = animation ? String(animation).trim() : '';
  const normalized = rawName.replace(/\\/g, '/').replace(/\/+$/, '');
  const segments = normalized.split('/').filter(Boolean);
  const animationName = segments.length ? segments[segments.length - 1] : 'karakter_idle';
  const basePath = options?.basePath ?? (normalized.startsWith('/') ? normalized : `/avatar/${normalized || animationName}`);
  const pattern = options?.pattern ?? `${animationName}{i}.png`;
  const start = options?.start ?? 1;
  const end = options?.end ?? animationFrameCounts[animationName] ?? defaultKarakterFrames.end;
  const zeroPad = typeof options?.zeroPad === 'number' ? options.zeroPad : defaultKarakterFrames.zeroPad;

  return { basePath, pattern, start, end, zeroPad };
}

export default defaultKarakterFrames;
