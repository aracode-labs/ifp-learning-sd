export type FrameSource = {
  basePath: string; // e.g. /content/char
  pattern: string; // use {i} as placeholder, e.g. "frame_{i}.png"
  start: number;
  end: number;
  zeroPad?: number; // optional leading zeros
};

const cache = new Map<string, HTMLImageElement>();

function pad(num: number, size = 0) {
  let s = String(num);
  while (s.length < size) s = '0' + s;
  return s;
}

export async function preloadFrames(framesOrSource: string[] | FrameSource, onProgress?: (loaded: number, total: number) => void): Promise<HTMLImageElement[]> {
  const urls: string[] = [];
  if (Array.isArray(framesOrSource)) {
    urls.push(...framesOrSource);
  } else {
    const { basePath, pattern, start, end, zeroPad = 0 } = framesOrSource;
    for (let i = start; i <= end; i++) {
      const index = zeroPad ? pad(i, zeroPad) : String(i);
      const name = pattern.replace(/\{i\}/g, index);
      const url = `${basePath.replace(/\/$/, '')}/${name}`;
      urls.push(url);
    }
  }

  const total = urls.length;
  const results: HTMLImageElement[] = new Array(total);
  let loaded = 0;

  const promises = urls.map((url, idx) => new Promise<void>((resolve) => {
    if (cache.has(url)) {
      results[idx] = cache.get(url)!;
      loaded += 1;
      onProgress && onProgress(loaded, total);
      resolve();
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      cache.set(url, img);
      results[idx] = img;
      loaded += 1;
      onProgress && onProgress(loaded, total);
      resolve();
    };
    img.onerror = () => {
      // on error, create a tiny transparent placeholder so indices remain consistent
      const placeholder = document.createElement('canvas');
      placeholder.width = 1; placeholder.height = 1;
      const pImg = new Image();
      pImg.src = placeholder.toDataURL('image/png');
      cache.set(url, pImg);
      results[idx] = pImg;
      loaded += 1;
      onProgress && onProgress(loaded, total);
      resolve();
    };
    img.src = url;
  }));

  await Promise.all(promises);
  return results;
}
