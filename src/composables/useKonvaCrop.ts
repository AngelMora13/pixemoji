import { getEmojiGlyphMetrics } from './useCropInteraction';

export interface CropInset {
  top: number;    // percentage 0 to 90
  right: number;  // percentage 0 to 90
  bottom: number; // percentage 0 to 90
  left: number;   // percentage 0 to 90
}

export const DEFAULT_CROP: CropInset = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0
};

/**
 * Calculates the exact content bounding box.
 * For Images, it is (0, 0, width, height).
 * For Emojis, it uses true ink metrics to include glyph overflows so
 * that canvas clipping matches the cropper modal down to the exact pixel.
 */
export function getNodeContentBounds(node: any): { x: number; y: number; width: number; height: number } {
  const w = node.width();
  const h = node.height();
  const nodeType = node.getAttr?.('nodeType');

  if (nodeType === 'emoji' && typeof node.text === 'function') {
    const text = node.text();
    const fontSize = node.fontSize?.() || 110;
    const padding = typeof node.padding === 'function' ? node.padding() : 0;
    const metrics = getEmojiGlyphMetrics(text, fontSize);

    return {
      x: padding + metrics.x,
      y: padding + metrics.y,
      width: metrics.width,
      height: metrics.height
    };
  }

  return { x: 0, y: 0, width: w, height: h };
}

/**
 * Calculates the bounding box of the cropped piece if active,
 * or returns the full content bounds if not cropped.
 */
export function getCroppedBounds(node: any): { x: number; y: number; width: number; height: number; isCropped: boolean } {
  const bounds = getNodeContentBounds(node);
  const crop = node.getAttr?.('cropInset') as CropInset | undefined;
  if (!crop || (crop.top <= 0 && crop.bottom <= 0 && crop.left <= 0 && crop.right <= 0)) {
    return { ...bounds, isCropped: false };
  }

  const l = bounds.width * ((crop.left || 0) / 100);
  const t = bounds.height * ((crop.top || 0) / 100);
  const r = bounds.width * ((crop.right || 0) / 100);
  const b = bounds.height * ((crop.bottom || 0) / 100);

  return {
    x: bounds.x + l,
    y: bounds.y + t,
    width: Math.max(0, bounds.width - l - r),
    height: Math.max(0, bounds.height - t - b),
    isCropped: true
  };
}

/**
 * Patch Konva.Text and Konva.Image to support non-destructive inset cropping.
 * 
 * When a node has the 'cropInset' attribute ({ top, right, bottom, left } in percentage 0..90):
 * 1. The scene context is clipped so that only the cropped portion is drawn.
 * 2. Hit testing (_hitFunc) matches only the visible cropped region.
 * 3. getSelfRect() returns the exact cropped rectangle, so that Konva.Transformer
 *    and client rect bounds match the cropped element's true size and position without empty padding.
 */
export function patchKonvaCrop(Konva: any) {
  if (!Konva || (Konva as any).__pixemojiCropPatched) return;

  const patchShape = (ShapeClass: any) => {
    if (!ShapeClass || !ShapeClass.prototype) return;

    // 1. Patch scene drawing with clip
    const origSceneFunc = ShapeClass.prototype._sceneFunc;
    if (origSceneFunc && !ShapeClass.prototype.__cropScenePatched) {
      ShapeClass.prototype._sceneFunc = function (context: any) {
        const cropRes = getCroppedBounds(this);
        if (cropRes.isCropped) {
          const rawCtx = context._context;
          rawCtx.save();

          rawCtx.beginPath();
          rawCtx.rect(cropRes.x, cropRes.y, cropRes.width, cropRes.height);
          rawCtx.clip();

          origSceneFunc.call(this, context);

          rawCtx.restore();
        } else {
          origSceneFunc.call(this, context);
        }
      };
      ShapeClass.prototype.__cropScenePatched = true;
    }

    // 2. Patch hit detection so only the visible cropped area is interactive
    const origHitFunc = ShapeClass.prototype._hitFunc;
    if (!ShapeClass.prototype.__cropHitPatched) {
      ShapeClass.prototype._hitFunc = function (context: any) {
        const cropRes = getCroppedBounds(this);
        if (cropRes.isCropped) {
          context.beginPath();
          context.rect(cropRes.x, cropRes.y, cropRes.width, cropRes.height);
          context.closePath();
          context.fillStrokeShape(this);
          return;
        }
        if (origHitFunc) {
          origHitFunc.call(this, context);
        } else if (ShapeClass.prototype._sceneFunc) {
          ShapeClass.prototype._sceneFunc.call(this, context);
        }
      };
      ShapeClass.prototype.__cropHitPatched = true;
    }

    // 3. Patch getSelfRect so Transformer bounding box matches the cropped piece exactly
    const origGetSelfRect = ShapeClass.prototype.getSelfRect;
    if (origGetSelfRect && !ShapeClass.prototype.__cropSelfRectPatched) {
      ShapeClass.prototype.getSelfRect = function () {
        const cropRes = getCroppedBounds(this);
        if (cropRes.isCropped) {
          return {
            x: cropRes.x,
            y: cropRes.y,
            width: cropRes.width,
            height: cropRes.height
          };
        }
        return origGetSelfRect.call(this);
      };
      ShapeClass.prototype.__cropSelfRectPatched = true;
    }
  };

  if (Konva.Text) patchShape(Konva.Text);
  if (Konva.Image) patchShape(Konva.Image);

  (Konva as any).__pixemojiCropPatched = true;
}
