import type { CropInset } from './useKonvaCrop';

export type DragId = 'top' | 'bottom' | 'left' | 'right' | 'nw' | 'ne' | 'sw' | 'se' | 'box';

export const CROP_PRESETS = [
  { label: 'Sup. 50%', icon: '⬆️', crop: { top: 0, bottom: 50, left: 0, right: 0 } },
  { label: 'Inf. 50%', icon: '⬇️', crop: { top: 50, bottom: 0, left: 0, right: 0 } },
  { label: 'Izq. 50%', icon: '⬅️', crop: { top: 0, bottom: 0, left: 0, right: 50 } },
  { label: 'Der. 50%', icon: '➡️', crop: { top: 0, bottom: 0, left: 50, right: 0 } },
  { label: 'Bordes', icon: '🔲', crop: { top: 10, bottom: 10, left: 10, right: 10 } }
] as const;

export const EDGE_HANDLES = [
  { id: 'top' as DragId, classes: '-top-2 left-1/2 -translate-x-1/2 w-8 h-3.5 cursor-ns-resize', barClasses: 'w-3 h-0.5 bg-neutral-600 rounded-full' },
  { id: 'bottom' as DragId, classes: '-bottom-2 left-1/2 -translate-x-1/2 w-8 h-3.5 cursor-ns-resize', barClasses: 'w-3 h-0.5 bg-neutral-600 rounded-full' },
  { id: 'left' as DragId, classes: '-left-2 top-1/2 -translate-y-1/2 h-8 w-3.5 cursor-ew-resize', barClasses: 'h-3 w-0.5 bg-neutral-600 rounded-full' },
  { id: 'right' as DragId, classes: '-right-2 top-1/2 -translate-y-1/2 h-8 w-3.5 cursor-ew-resize', barClasses: 'h-3 w-0.5 bg-neutral-600 rounded-full' }
] as const;

export const CORNER_HANDLES = [
  { id: 'nw' as DragId, classes: '-top-2 -left-2 cursor-nwse-resize' },
  { id: 'ne' as DragId, classes: '-top-2 -right-2 cursor-nesw-resize' },
  { id: 'sw' as DragId, classes: '-bottom-2 -left-2 cursor-nesw-resize' },
  { id: 'se' as DragId, classes: '-bottom-2 -right-2 cursor-nwse-resize' }
] as const;

export function fitContainerDimensions(aspectRatio: number, maxW = 280, maxH = 280) {
  let r = aspectRatio || 1;
  if (r <= 0 || isNaN(r)) r = 1;

  let w = maxW;
  let h = Math.round(maxW / r);

  if (h > maxH) {
    h = maxH;
    w = Math.round(maxH * r);
  }

  return {
    width: Math.max(100, w),
    height: Math.max(100, h)
  };
}

export function updateCropFromPointer(target: DragId, pctX: number, pctY: number, crop: CropInset) {
  if (['top', 'nw', 'ne'].includes(target)) {
    crop.top = Math.max(0, Math.min(85 - crop.bottom, pctY));
  }
  if (['bottom', 'sw', 'se'].includes(target)) {
    crop.bottom = Math.max(0, Math.min(85 - crop.top, 100 - pctY));
  }
  if (['left', 'nw', 'sw'].includes(target)) {
    crop.left = Math.max(0, Math.min(85 - crop.right, pctX));
  }
  if (['right', 'ne', 'se'].includes(target)) {
    crop.right = Math.max(0, Math.min(85 - crop.left, 100 - pctX));
  }
}

export interface GlyphPixelBounds {
  x: number;      // offset from Konva's text origin (0)
  y: number;      // offset from Konva's text top (0)
  width: number;  // total ink width
  height: number; // total ink height
  aspect: number;
  url: string;    // trimmed image data URL
}

const boundsCache = new Map<string, GlyphPixelBounds>();

/**
 * Computes exact ink metrics for an emoji glyph rendered in canvas.
 * Accounts for negative side bearings and overflow so clipping matches 1:1.
 */
export function getEmojiGlyphMetrics(char: string, fontSize = 110): GlyphPixelBounds {
  const cacheKey = `${char || '✨'}_${fontSize}`;
  if (boundsCache.has(cacheKey)) {
    return boundsCache.get(cacheKey)!;
  }

  if (typeof document === 'undefined') {
    return { x: 0, y: 0, width: fontSize, height: fontSize, aspect: 1, url: '' };
  }

  const size = Math.ceil(fontSize * 3);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    return { x: 0, y: 0, width: fontSize, height: fontSize, aspect: 1, url: '' };
  }

  const fontFam = '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
  ctx.font = `${fontSize}px ${fontFam}`;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';

  const sample = ctx.measureText('M');
  const ascent = sample.fontBoundingBoxAscent || fontSize * 0.8;
  const descent = sample.fontBoundingBoxDescent || fontSize * 0.2;
  const translateY = (ascent - descent) / 2 + fontSize / 2;

  const bufferX = Math.ceil(fontSize * 0.8);
  const bufferY = Math.ceil(fontSize * 0.8);
  const drawX = bufferX;
  const drawY = bufferY + translateY;

  ctx.fillText(char || '✨', drawX, drawY);

  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  let minX = size;
  let maxX = 0;
  let minY = size;
  let maxY = 0;
  let found = false;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const alpha = data[(y * size + x) * 4 + 3];
      if (alpha > 8) {
        found = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (!found || minX > maxX || minY > maxY) {
    const fallback = { x: 0, y: 0, width: fontSize, height: fontSize, aspect: 1, url: canvas.toDataURL() };
    boundsCache.set(cacheKey, fallback);
    return fallback;
  }

  const inkWidth = maxX - minX + 1;
  const inkHeight = maxY - minY + 1;
  const relX = minX - drawX;
  const relY = minY - bufferY;

  const trimmed = document.createElement('canvas');
  trimmed.width = inkWidth;
  trimmed.height = inkHeight;
  const tCtx = trimmed.getContext('2d');
  if (tCtx) {
    tCtx.drawImage(canvas, minX, minY, inkWidth, inkHeight, 0, 0, inkWidth, inkHeight);
  }

  const result: GlyphPixelBounds = {
    x: relX,
    y: relY,
    width: inkWidth,
    height: inkHeight,
    aspect: inkWidth / inkHeight,
    url: trimmed.toDataURL()
  };

  if (boundsCache.size > 200) {
    const firstKey = boundsCache.keys().next().value;
    if (firstKey) boundsCache.delete(firstKey);
  }

  boundsCache.set(cacheKey, result);
  return result;
}
