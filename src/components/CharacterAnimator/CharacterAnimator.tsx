import { useCallback, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import styles from './CharacterAnimator.module.css';
import { preloadFrames, FrameSource } from '@/utils/frameLoader';

type AnimatorHandle = {
  play: () => void;
  pause: () => void;
  seek: (frame: number) => void;
  isPlaying: () => boolean;
};

type Props = {
  frames: string[] | FrameSource;
  fps?: number;
  loop?: boolean;
  autoplay?: boolean;
  width?: number | string; // number = px, string supports '40vh' or CSS values
  height?: number | string; // number = px, string supports '40vh' or CSS values
  scale?: number | string;
  onReady?: () => void;
  onProgress?: (loaded: number, total: number) => void;
  autoSize?: boolean; // when true, set canvas size to image natural size * scale
  align?: 'left' | 'center' | 'right';
  alignOffset?: number; // px offset to apply after alignment (positive shifts right)
};

const CharacterAnimator = forwardRef<AnimatorHandle, Props>((props, ref) => {
  const {
    frames,
    fps = 30,
    loop = true,
    autoplay = true,
    width,
    height,
    scale = 1,
    align = 'center',
    alignOffset = 0,
    onReady,
    onProgress,
  } = props;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const playingRef = useRef<boolean>(false);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const elapsedRef = useRef<number>(0); // accumulated elapsed ms since start (preserves across pauses)
  const currentFrameRef = useRef<number>(0);

  useImperativeHandle(ref, () => ({
    play: () => { playingRef.current = true; startLoop(); },
    pause: () => { playingRef.current = false; stopLoop(); },
    seek: (frame: number) => { currentFrameRef.current = Math.max(0, Math.min(frame, imagesRef.current.length - 1)); renderFrame(); },
    isPlaying: () => playingRef.current,
  }));

  const stopLoop = () => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    // don't zero elapsedRef here so pause/resume preserves playback position
    startTimeRef.current = null;
    lastTimeRef.current = null;
  };

  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const imgs = imagesRef.current;
    if (!canvas || !imgs.length) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = imgs[currentFrameRef.current];
    // get CSS pixel size of canvas (correct for DPR and autoSize modes)
    const rect = canvas.getBoundingClientRect();
    const cssW = rect.width || 0;
    const cssH = rect.height || 0;
    // clear using CSS-pixel coordinates; context transform set in updateCanvasSize
    ctx.clearRect(0, 0, cssW, cssH);
    // compute draw size: prefer provided `scale`, but shrink to fit container if needed
    const naturalW = img.naturalWidth;
    const naturalH = img.naturalHeight;
    const fitScale = Math.min(cssW / naturalW, cssH / naturalH);
    let drawScaleNum: number;
    if (typeof scale === 'string' && scale.trim().endsWith('%')) {
      const pct = (parseFloat(scale) || 100) / 100;
      if (props.autoSize) {
        // canvas was sized to natural * pct, so draw at pct scale
        drawScaleNum = pct;
      } else {
        // otherwise, percent scales relative to the fitScale
        drawScaleNum = fitScale * pct;
      }
    } else {
      const numeric = typeof scale === 'number' ? scale : parseFloat(String(scale)) || 1;
      drawScaleNum = numeric;
      if (props.autoSize) {
        // when autoSize and numeric scale provided, draw at numeric scale
        // (canvas was set to natural * numeric already)
        // drawScaleNum is already numeric
      } else if (naturalW * drawScaleNum > cssW || naturalH * drawScaleNum > cssH) {
        // otherwise clamp to fit
        drawScaleNum = Math.min(drawScaleNum, fitScale);
      }
    }
    const iw = naturalW * drawScaleNum;
    const ih = naturalH * drawScaleNum;
    let x: number;
    if (align === 'left') x = 0 + (alignOffset || 0);
    else if (align === 'right') x = cssW - iw + (alignOffset || 0);
    else x = (cssW - iw) / 2 + (alignOffset || 0);
    const y = (cssH - ih) / 2;
    ctx.drawImage(img, x, y, iw, ih);
  }, [scale, props.autoSize]);

  const loopStep = useCallback((time: number) => {
    const imgs = imagesRef.current;
    if (!imgs.length) return;
    const frameDuration = 1000 / fps;

    // initialize lastTimeRef on first frame to avoid huge delta
    if (lastTimeRef.current == null) {
      lastTimeRef.current = time;
      // ensure elapsedRef aligns with currentFrame if starting fresh
      elapsedRef.current = currentFrameRef.current * frameDuration;
      // render and schedule next tick
      renderFrame();
      if (playingRef.current) rafRef.current = requestAnimationFrame(loopStep);
      return;
    }

    const delta = time - lastTimeRef.current;
    lastTimeRef.current = time;
    elapsedRef.current += delta;

    const totalDuration = frameDuration * imgs.length;
    if (!loop && elapsedRef.current >= totalDuration) {
      // stop at last frame
      currentFrameRef.current = imgs.length - 1;
      renderFrame();
      playingRef.current = false;
      stopLoop();
      return;
    }

    // compute frame index from accumulated elapsed time
    const idx = Math.floor((elapsedRef.current % totalDuration) / frameDuration);
    currentFrameRef.current = idx;
    renderFrame();
    if (playingRef.current) rafRef.current = requestAnimationFrame(loopStep);
  }, [fps, loop, renderFrame]);

  const startLoop = useCallback(() => {
    if (rafRef.current != null) return;
    playingRef.current = true;
    startTimeRef.current = null;
    lastTimeRef.current = null;
    // keep elapsedRef as-is so resume continues from current position
    rafRef.current = requestAnimationFrame(loopStep);
  }, [loopStep]);

  // resolve width/height which may be CSS strings like '40vh'
  const resolveSize = (val: number | string | undefined, axis: 'width' | 'height') => {
    const canvas = canvasRef.current;
    if (val == null) return 0;
    if (typeof val === 'number') return val;
    const s = String(val).trim();
    if (s.endsWith('vh')) {
      const pct = parseFloat(s.slice(0, -2)) || 0;
      return (window.innerHeight * pct) / 100;
    }
    if (s.endsWith('vw')) {
      const pct = parseFloat(s.slice(0, -2)) || 0;
      return (window.innerWidth * pct) / 100;
    }
    if (s.endsWith('px')) return parseFloat(s.slice(0, -2)) || 0;
    // fallback: try parse as number
    const n = parseFloat(s);
    if (!Number.isNaN(n)) return n;
    // as last resort, use container size
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      return axis === 'width' ? rect.width : rect.height;
    }
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      return axis === 'width' ? rect.width : rect.height;
    }
    return 0;
  };

  const updateCanvasSize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    let cssW = resolveSize(width, 'width') || 0;
    let cssH = resolveSize(height, 'height') || 0;
    // if we have at least one image, compute its aspect and prefer aspect-preserving sizing
    if (imagesRef.current && imagesRef.current.length) {
      const first = imagesRef.current[0];
      if (first && first.naturalWidth && first.naturalHeight) {
        const naturalW = first.naturalWidth;
        const naturalH = first.naturalHeight;
        const aspect = naturalW / naturalH;
        // autoSize means match natural size * scale
        if (props.autoSize) {
          if (typeof scale === 'string' && scale.trim().endsWith('%')) {
            const pct = (parseFloat(scale) || 100) / 100;
            cssW = naturalW * pct;
            cssH = naturalH * pct;
          } else {
            const numeric = typeof scale === 'number' ? scale : parseFloat(String(scale)) || 1;
            cssW = naturalW * numeric;
            cssH = naturalH * numeric;
          }
        } else {
          // preserve aspect ratio based on provided width/height or container
          const resolvedW = resolveSize(width, 'width') || 0;
          const resolvedH = resolveSize(height, 'height') || 0;
          const containerRect = containerRef.current?.getBoundingClientRect();
          // If only width specified, compute height from aspect
          if (resolvedW && !resolvedH) {
            cssW = resolvedW;
            cssH = cssW / aspect;
          } else if (resolvedH && !resolvedW) {
            cssH = resolvedH;
            cssW = cssH * aspect;
          } else if (resolvedW && resolvedH) {
            // both specified: fit image into the box while preserving aspect
            const fitScale = Math.min(resolvedW / naturalW, resolvedH / naturalH);
            cssW = naturalW * fitScale;
            cssH = naturalH * fitScale;
          } else if (containerRect && containerRect.width > 0) {
            // fallback: fit to container width
            cssW = Math.min(containerRect.width, naturalW);
            cssH = cssW / aspect;
          } else {
            // last resort: use natural size
            cssW = naturalW;
            cssH = naturalH;
          }
        }
      }
    }
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    if (props.autoSize) {
      // When autoSize is requested, keep canvas DOM attributes equal to CSS pixels
      // so element width/height match the image natural size directly.
      canvas.width = Math.max(1, Math.round(cssW));
      canvas.height = Math.max(1, Math.round(cssH));
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.setTransform(1, 0, 0, 1, 0, 0);
      // ensure stylesheet max-width doesn't clip the canvas when auto-sized
      canvas.style.maxWidth = 'none';
      canvas.style.maxHeight = 'none';
      canvas.style.overflow = 'visible';
    } else {
      // Use DPR-scaled buffer for crisper rendering on high-DPI displays
      canvas.width = Math.max(1, Math.round(cssW * dpr));
      canvas.height = Math.max(1, Math.round(cssH * dpr));
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // restore canvas style constraints when not autoSize
      canvas.style.maxWidth = '';
      canvas.style.maxHeight = '';
      canvas.style.overflow = '';
    }
    // update container size so layout reflects canvas (useful for autoSize)
    if (containerRef.current) {
      containerRef.current.style.width = `${cssW}px`;
      containerRef.current.style.height = `${cssH}px`;
      // when autoSize is enabled, ensure parent CSS max-width doesn't constrain the element
      if (props.autoSize) {
        containerRef.current.style.maxWidth = 'none';
        containerRef.current.style.maxHeight = 'none';
        containerRef.current.style.overflow = 'visible';
        // prevent flex parent from shrinking this container when auto-sized
        containerRef.current.style.flex = '0 0 auto';
        containerRef.current.style.minWidth = `${Math.round(cssW)}px`;
        containerRef.current.style.minHeight = `${Math.round(cssH)}px`;
        containerRef.current.style.alignSelf = 'flex-start';
      } else {
        containerRef.current.style.maxWidth = '';
        containerRef.current.style.maxHeight = '';
        containerRef.current.style.overflow = '';
        containerRef.current.style.flex = '';
        containerRef.current.style.minWidth = '';
        containerRef.current.style.minHeight = '';
        containerRef.current.style.alignSelf = '';
      }
    }
    // re-render current frame to fit new size
    renderFrame();
  };

  useEffect(() => {
    let mounted = true;
    preloadFrames(frames, (loaded: number, total: number) => onProgress && onProgress(loaded, total))
      .then((imgs: HTMLImageElement[]) => {
        if (!mounted) return;
        imagesRef.current = imgs;
        updateCanvasSize();
        onReady && onReady();
        if (autoplay) startLoop();
      })
      .catch(() => {
        // ignore for now
      });

    // handle resize: ResizeObserver preferred, fallback to window resize
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      ro = new ResizeObserver(() => updateCanvasSize());
      ro.observe(containerRef.current);
    }
    let rafId: number | null = null;
    const onResize = () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        updateCanvasSize();
        rafId = null;
      });
    };
    window.addEventListener('resize', onResize);

    return () => { mounted = false; stopLoop(); window.removeEventListener('resize', onResize); if (ro && containerRef.current) ro.unobserve(containerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frames, fps, autoplay, width, height, onReady, renderFrame]);

  useEffect(() => {
    if (playingRef.current) {
      stopLoop();
      startLoop();
    }
  }, [fps, startLoop]);

  return (
    <div ref={containerRef} className={styles.container} style={{ width: typeof width === 'number' ? `${width}px` : width, height: typeof height === 'number' ? `${height}px` : height }}>
      <canvas ref={canvasRef} />
    </div>
  );
});

export default CharacterAnimator;
