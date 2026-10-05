import { getEmojiGlyphMetrics } from './useCropInteraction';

/**
 * Utilidad para corregir el bug de renderizado de sombras en fuentes de color (emojis) en Canvas 2D.
 *
 * CAUSA TÉCNICA:
 * En motores gráficos basados en Chromium / Skia (Chrome, Edge, Opera, Brave), al dibujar texto con glifos
 * de fuentes de color compuestas (como "Segoe UI Emoji" o "Apple Color Emoji") usando ctx.fillText() directamente
 * con ctx.shadowBlur > ~20px, Skia supera el tamaño máximo permitido para la máscara de glifo (glyph mask filter).
 * Al desbordar ese límite, Skia descarta el filtro de desenfoque y cae en el fallback de dibujar la sombra como
 * una silueta completamente sólida y dura, perdiendo el blur. Este umbral varía por emoji según las dimensiones del glifo.
 *
 * SOLUCIÓN:
 * Forzar el uso de bufferCanvas en Konva cuando el nodo es un emoji (o texto con emojis) y tiene sombra activa.
 * Al usar bufferCanvas, el emoji se dibuja limpio sin sombra en un canvas auxiliar, y la sombra se aplica
 * en el canvas principal mediante ctx.drawImage(). Los filtros de imagen de Skia manejan el Gaussian blur de bitmaps
 * sin restricción de tamaño de glifo, manteniendo el desenfoque suave y continuo a cualquier radio (>20px, 30px, 40px+).
 */

export function patchKonvaEmojiShadow(Konva: any) {
  if (!Konva || !Konva.Text || (Konva.Text.prototype as any).__emojiShadowPatched) {
    return;
  }

  const origUseBufferCanvas = Konva.Text.prototype._useBufferCanvas;

  Konva.Text.prototype._useBufferCanvas = function (forceFill?: boolean) {
    // Si perfectDrawEnabled se apaga manualmente, respetarlo
    if (this.attrs.perfectDrawEnabled === false) {
      return false;
    }

    if (this.hasShadow() && Boolean(this.getStage?.())) {
      const explicitType = this.getAttr?.('nodeType');
      if (explicitType === 'emoji') {
        return true;
      }

      const txt = typeof this.text === 'function' ? this.text() : this.attrs?.text;
      if (txt && /\p{Extended_Pictographic}/u.test(txt)) {
        return true;
      }
    }

    return origUseBufferCanvas.call(this, forceFill);
  };

  (Konva.Text.prototype as any).__emojiShadowPatched = true;
}

/**
 * Corrige el cálculo de caja delimitadora (bounding box) y áreas de interacción en emojis.
 *
 * CAUSA TÉCNICA:
 * Konva.Text calcula height = fontSize (e.g. 110px) y centra con offsetX(width/2), offsetY(height/2).
 * Sin embargo, emojis con desbordes verticales y descendentes (como 🚀 cohete o 🧁 cupcake)
 * tienen un trazo de tinta que se extiende significativamente más abajo de la línea base.
 * Al usar los cálculos por defecto de texto latino, la parte inferior del emoji sobresale
 * de los controles cuadrados del Transformer y distorsiona el recorte proporcional.
 *
 * SOLUCIÓN:
 * 1. Parchear getSelfRect() en Konva.Text para que los nodos 'emoji' devuelvan el rectángulo
 *    de tinta real { x, y, width, height } calculado mediante getEmojiGlyphMetrics().
 * 2. Parchear _hitFunc() para registrar clics en toda la silueta real del emoji.
 * 3. Proporcionar syncEmojiMetrics() para alinear el offsetX/offsetY en el centro visual exacto.
 */
export function patchKonvaEmojiBounds(Konva: any) {
  if (!Konva || !Konva.Text || (Konva.Text.prototype as any).__emojiBoundsPatched) {
    return;
  }

  const origGetSelfRect = Konva.Text.prototype.getSelfRect;
  Konva.Text.prototype.getSelfRect = function () {
    const explicitType = this.getAttr?.('nodeType');
    if (explicitType === 'emoji') {
      const text = typeof this.text === 'function' ? this.text() : this.attrs.text;
      const fontSize = typeof this.fontSize === 'function' ? this.fontSize() : (this.attrs.fontSize || 110);
      const metrics = getEmojiGlyphMetrics(text || '✨', fontSize);
      return {
        x: metrics.x,
        y: metrics.y,
        width: metrics.width,
        height: metrics.height
      };
    }
    return origGetSelfRect.call(this);
  };

  const origHitFunc = Konva.Text.prototype._hitFunc;
  Konva.Text.prototype._hitFunc = function (context: any) {
    const explicitType = this.getAttr?.('nodeType');
    if (explicitType === 'emoji') {
      const rect = this.getSelfRect();
      context.beginPath();
      context.rect(rect.x, rect.y, rect.width, rect.height);
      context.closePath();
      context.fillStrokeShape(this);
      return;
    }
    origHitFunc.call(this, context);
  };

  (Konva.Text.prototype as any).__emojiBoundsPatched = true;
}

/**
 * Alinea los offsets del nodo emoji a su centro visual real exacto.
 */
export function syncEmojiMetrics(emoji: any, char?: string, fontSize?: number) {
  if (!emoji) return;
  const isEmoji = emoji.getAttr?.('nodeType') === 'emoji' || emoji.attrs?.nodeType === 'emoji';
  if (!isEmoji) return;

  const c = char ?? (typeof emoji.text === 'function' ? emoji.text() : emoji.getAttr('text')) ?? '✨';
  const fs = fontSize ?? (typeof emoji.fontSize === 'function' ? emoji.fontSize() : emoji.getAttr('fontSize')) ?? 110;
  const metrics = getEmojiGlyphMetrics(c, fs);

  emoji.offsetX(metrics.x + metrics.width / 2);
  emoji.offsetY(metrics.y + metrics.height / 2);
}

