import defaultKarakterFrames from '@/config/karakter';

type KarakterFrames = {
  basePath: string;
  pattern: string;
  start: number;
  end: number;
  zeroPad?: number;
};

export default function useKarakterFrames(folder?: string): KarakterFrames {
  if (folder && typeof folder === 'string' && folder.trim().length > 0) {
    return { ...defaultKarakterFrames, basePath: folder };
  }
  return { ...defaultKarakterFrames };
}

export { useKarakterFrames };
