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
