import defaultKarakterFrames, { createKarakterFrames } from '@/config/karakter';
import type { FrameSource } from '@/utils/frameLoader';

export default function useKarakterFrames(folder?: string): FrameSource {
  if (folder && typeof folder === 'string' && folder.trim().length > 0) {
    return createKarakterFrames(folder);
  }
  return { ...defaultKarakterFrames };
}

export { useKarakterFrames };
