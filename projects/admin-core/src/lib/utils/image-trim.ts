/**
 * Trims transparent outer padding around an image src using HTML Canvas.
 * Returns a Promise that resolves with the trimmed image data URL (or original src on error / SSR).
 */
export function trimImagePadding(src: string): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !src || src.startsWith('data:image/svg')) {
      resolve(src);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        if (!w || !h) {
          resolve(src);
          return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const { data } = ctx.getImageData(0, 0, w, h);

        let top = h;
        let left = w;
        let right = 0;
        let bottom = 0;

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const alpha = data[(y * w + x) * 4 + 3];
            if (alpha > 15) {
              if (x < left) left = x;
              if (x > right) right = x;
              if (y < top) top = y;
              if (y > bottom) bottom = y;
            }
          }
        }

        if (right < left || bottom < top) {
          resolve(src);
          return;
        }

        const cropW = right - left + 1;
        const cropH = bottom - top + 1;
        const out = document.createElement('canvas');
        out.width = cropW;
        out.height = cropH;
        const outCtx = out.getContext('2d');
        if (!outCtx) {
          resolve(src);
          return;
        }
        outCtx.drawImage(canvas, left, top, cropW, cropH, 0, 0, cropW, cropH);
        resolve(out.toDataURL('image/png'));
      } catch {
        resolve(src);
      }
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });
}
