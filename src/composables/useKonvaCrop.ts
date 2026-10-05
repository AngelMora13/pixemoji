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
function getNodeContentBounds(node: any): { x: number; y: number; width: number; height: number } {
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
 * Patch Konva.Text and Konva.Image to support non-destructive inset cropping.
 * 
 * When a node has the 'cropInset' attribute ({ top, right, bottom, left } in percentage 0..90),
 * the rendering context is clipped so that only the specified uncropped portion of the node
 * is drawn, while preserving filters, shadows, and hit detection.
 */
export function patchKonvaCrop(Konva: any) {
  if (!Konva || (Konva as any).__pixemojiCropPatched) return;

  const patchShape = (ShapeClass: any) => {
    if (!ShapeClass || !ShapeClass.prototype) return;

    const origSceneFunc = ShapeClass.prototype._sceneFunc;
    if (origSceneFunc && !ShapeClass.prototype.__cropScenePatched) {
      ShapeClass.prototype._sceneFunc = function (context: any) {
        const crop = this.getAttr?.('cropInset') as CropInset | undefined;
        if (crop && (crop.top > 0 || crop.bottom > 0 || crop.left > 0 || crop.right > 0)) {
          const rawCtx = context._context;
          rawCtx.save();

          const bounds = getNodeContentBounds(this);
          const l = bounds.width * ((crop.left || 0) / 100);
          const t = bounds.height * ((crop.top || 0) / 100);
          const r = bounds.width * ((crop.right || 0) / 100);
          const b = bounds.height * ((crop.bottom || 0) / 100);
          const clipX = bounds.x + l;
          const clipY = bounds.y + t;
          const clipW = Math.max(0, bounds.width - l - r);
          const clipH = Math.max(0, bounds.height - t - b);

          rawCtx.beginPath();
          rawCtx.rect(clipX, clipY, clipW, clipH);
          rawCtx.clip();

          origSceneFunc.call(this, context);

          rawCtx.restore();
        } else {
          origSceneFunc.call(this, context);
        }
      };
      ShapeClass.prototype.__cropScenePatched = true;
    }

    const origHitFunc = ShapeClass.prototype._hitFunc;
    if (!ShapeClass.prototype.__cropHitPatched) {
      ShapeClass.prototype._hitFunc = function (context: any) {
        const crop = this.getAttr?.('cropInset') as CropInset | undefined;
        if (crop && (crop.top > 0 || crop.bottom > 0 || crop.left > 0 || crop.right > 0)) {
          const rawCtx = context._context;
          rawCtx.save();

          const bounds = getNodeContentBounds(this);
          const l = bounds.width * ((crop.left || 0) / 100);
          const t = bounds.height * ((crop.top || 0) / 100);
          const r = bounds.width * ((crop.right || 0) / 100);
          const b = bounds.height * ((crop.bottom || 0) / 100);
          const clipX = bounds.x + l;
          const clipY = bounds.y + t;
          const clipW = Math.max(0, bounds.width - l - r);
          const clipH = Math.max(0, bounds.height - t - b);

          rawCtx.beginPath();
          rawCtx.rect(clipX, clipY, clipW, clipH);
          rawCtx.clip();

          if (origHitFunc) {
            origHitFunc.call(this, context);
          } else if (ShapeClass.prototype._sceneFunc) {
            ShapeClass.prototype._sceneFunc.call(this, context);
          }

          rawCtx.restore();
        } else if (origHitFunc) {
          origHitFunc.call(this, context);
        }
      };
      ShapeClass.prototype.__cropHitPatched = true;
    }
  };

  if (Konva.Text) patchShape(Konva.Text);
  if (Konva.Image) patchShape(Konva.Image);

  (Konva as any).__pixemojiCropPatched = true;
}
