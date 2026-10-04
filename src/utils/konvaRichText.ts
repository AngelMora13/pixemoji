import { layout, drawLayout } from 'render-tag';

export function wrapWithBaseStyles(rawHtml: string, options: {
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  fontStyle?: string;
  strokeColor?: string;
  strokeWidth?: number;
}) {
  const baseFont = options.fontFamily || 'Plus Jakarta Sans';
  const baseSize = options.fontSize || 44;
  const baseColor = options.color || '#1e293b';
  const baseStyle = options.fontStyle || 'normal';
  const sColor = options.strokeColor;
  const sWidth = options.strokeWidth || 0;

  const strokeCss = (sWidth > 0 && sColor)
    ? `-webkit-text-stroke: ${sWidth}px ${sColor}; paint-order: stroke fill;`
    : '';

  const content = rawHtml && rawHtml.trim() ? rawHtml : '&nbsp;';

  return `<div style="font-family: '${baseFont}', sans-serif; font-size: ${baseSize}px; color: ${baseColor}; font-style: ${baseStyle}; line-height: 1.25; word-wrap: break-word; overflow-wrap: break-word; ${strokeCss}">${content}</div>`;
}

export function updateRichTextLayout(shapeNode: any) {
  if (typeof window === 'undefined') return;
  const rawHtml = shapeNode.getAttr('html') || `<p>${shapeNode.getAttr('text') || ''}</p>`;
  const styledHtml = wrapWithBaseStyles(rawHtml, {
    fontFamily: shapeNode.fontFamily ? shapeNode.fontFamily() : 'Plus Jakarta Sans',
    fontSize: shapeNode.fontSize ? shapeNode.fontSize() : 44,
    color: shapeNode.fill ? shapeNode.fill() : '#1e293b',
    fontStyle: shapeNode.fontStyle ? shapeNode.fontStyle() : 'normal',
    strokeColor: shapeNode.stroke ? shapeNode.stroke() : undefined,
    strokeWidth: shapeNode.strokeWidth ? shapeNode.strokeWidth() : 0,
  });

  const width = Math.max(shapeNode.width() || 340, 40);
  try {
    const layoutObj = layout({
      html: styledHtml,
      width
    });
    shapeNode._layoutResult = layoutObj;
    if (layoutObj && layoutObj.height) {
      shapeNode.height(layoutObj.height);
      shapeNode.offsetX(width / 2);
      shapeNode.offsetY(layoutObj.height / 2);
    }
  } catch (err) {
    console.warn('RichText updateLayout error:', err);
  }
}

export function createRichTextShape(KonvaModule: any, options: {
  x: number;
  y: number;
  width?: number;
  text: string;
  html?: string;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  textColor?: string;
  fontStyle?: string;
  strokeColor?: string;
  strokeWidth?: number;
}, customAttrs?: any) {
  const initialWidth = options.width || 340;
  const initialHtml = options.html || `<p>${options.text || 'Escribe tu texto...'}</p>`;

  const shape = new KonvaModule.Shape({
    x: options.x,
    y: options.y,
    width: initialWidth,
    height: 60,
    draggable: true,
    name: 'selectable',
    nodeType: 'text',
    stroke: (options.strokeWidth ?? 0) > 0 ? options.strokeColor : undefined,
    strokeWidth: options.strokeWidth ?? 0,
    sceneFunc: function (context: any, shapeNode: any) {
      if (!shapeNode._layoutResult) {
        updateRichTextLayout(shapeNode);
      }
      if (!shapeNode._layoutResult) return;
      const width = Math.max(shapeNode.width() || initialWidth, 40);
      const ctx = context._context || context;
      const getNum = (key: string, def: number) => {
        const v = shapeNode.getAttr(key);
        return (v !== undefined && !isNaN(Number(v))) ? Number(v) : def;
      };
      const is3D = Boolean(shapeNode.getAttr('is3D'));
      const depth = getNum('depth3D', 8);
      const colorMode = shapeNode.getAttr('color3DMode') || 'auto';
      const color3D = shapeNode.getAttr('color3D') || '#333333';
      const shading3D = getNum('shading3D', 35);
      const dirX = getNum('dirX3D', 1);
      const dirY = getNum('dirY3D', 1);
      const filterBlur = getNum('filterBlur', 0);
      const filterContrast = getNum('filterContrast', 100);

      ctx.save();

      // Aplicar filtros de desenfoque y contraste si están configurados
      if (filterBlur > 0 || filterContrast !== 100) {
        let f = '';
        if (filterBlur > 0) f += `blur(${filterBlur}px) `;
        if (filterContrast !== 100) f += `contrast(${filterContrast}%) `;
        ctx.filter = f.trim();
      }

      try {
        if (is3D && depth > 0) {
          const h = Math.ceil(shapeNode.height() || 60);
          const w = Math.ceil(width);

          if (!shapeNode._stampCanvas) {
            shapeNode._stampCanvas = document.createElement('canvas');
          }
          const stamp = shapeNode._stampCanvas;
          if (stamp.width !== w || stamp.height !== h) {
            stamp.width = w;
            stamp.height = h;
          }
          const sCtx = stamp.getContext('2d');
          if (sCtx) {
            sCtx.save();
            sCtx.globalCompositeOperation = 'source-over';
            sCtx.clearRect(0, 0, w, h);
            drawLayout({
              layout: shapeNode._layoutResult,
              width: w,
              ctx: sCtx,
              pixelRatio: 1
            });
            if (colorMode === 'custom' && color3D && color3D !== 'auto') {
              sCtx.globalCompositeOperation = 'source-in';
              sCtx.fillStyle = color3D;
              sCtx.fillRect(0, 0, w, h);
            } else {
              // Modo 'auto': toma los mismos colores del texto con sombreado de relieve 3D
              const darkRatio = Math.max(0, Math.min(100, shading3D)) / 100;
              if (darkRatio > 0) {
                sCtx.globalCompositeOperation = 'source-atop';
                sCtx.fillStyle = `rgba(0, 0, 0, ${darkRatio})`;
                sCtx.fillRect(0, 0, w, h);
              }
            }
            sCtx.restore();
          }

          // Dibujar capas extruidas 3D de atrás hacia adelante
          for (let i = depth; i > 0; i--) {
            ctx.drawImage(stamp, i * dirX, i * dirY);
          }
        }

        // Dibujar texto original enriquecido al frente
        drawLayout({
          layout: shapeNode._layoutResult,
          width,
          ctx,
          pixelRatio: 1
        });
      } catch (err) {
        console.warn('Rich text render error:', err);
      }

      ctx.restore();
    },
    hitFunc: function (context: any, shapeNode: any) {
      const width = shapeNode.width() || initialWidth;
      const height = shapeNode.height() || (shapeNode._layoutResult ? shapeNode._layoutResult.height : 40);
      const is3D = Boolean(shapeNode.getAttr('is3D'));
      const getNum = (key: string, def: number) => {
        const v = shapeNode.getAttr(key);
        return (v !== undefined && !isNaN(Number(v))) ? Number(v) : def;
      };
      const depth = is3D ? getNum('depth3D', 8) : 0;
      const dirX = getNum('dirX3D', 1);
      const dirY = getNum('dirY3D', 1);
      const minX = dirX < 0 ? -depth : 0;
      const minY = dirY < 0 ? -depth : 0;
      const maxX = dirX > 0 ? width + depth : width;
      const maxY = dirY > 0 ? height + depth : height;

      context.beginPath();
      context.rect(minX, minY, maxX - minX, maxY - minY);
      context.closePath();
      context.fillStrokeShape(shapeNode);
    },
    ...customAttrs
  });

  shape.setAttr('nodeType', 'text');
  shape.setAttr('text', options.text);
  shape.setAttr('html', initialHtml);
  shape.setAttr('fontFamily', options.fontFamily || 'Plus Jakarta Sans');
  shape.setAttr('fontSize', options.fontSize || 44);
  shape.setAttr('fill', options.textColor || options.fill || '#1e293b');
  shape.setAttr('fontStyle', options.fontStyle || 'normal');
  shape.setAttr('filterBlur', 0);
  shape.setAttr('filterContrast', 100);
  shape.setAttr('is3D', Boolean(customAttrs?.is3D));
  shape.setAttr('depth3D', customAttrs?.depth3D ?? 8);
  shape.setAttr('color3DMode', customAttrs?.color3DMode || 'auto');
  shape.setAttr('shading3D', customAttrs?.shading3D ?? 35);
  shape.setAttr('color3D', customAttrs?.color3D || '#333333');
  shape.setAttr('dirX3D', customAttrs?.dirX3D ?? 1);
  shape.setAttr('dirY3D', customAttrs?.dirY3D ?? 1);

  const bindProp = (name: string, fallback: any) => {
    (shape as any)[name] = function (val?: any) {
      if (val !== undefined) {
        this.setAttr(name, val);
        updateRichTextLayout(this);
        this.getLayer()?.batchDraw();
        return this;
      }
      return this.getAttr(name) || fallback;
    };
  };
  bindProp('text', '');
  bindProp('html', '');
  bindProp('fontFamily', 'Plus Jakarta Sans');
  bindProp('fontSize', 44);
  bindProp('fill', '#1e293b');
  bindProp('fontStyle', 'normal');

  const origStroke = shape.stroke.bind(shape);
  shape.stroke = function (val?: any) {
    if (val !== undefined) {
      const res = origStroke(val);
      updateRichTextLayout(this);
      this.getLayer()?.batchDraw();
      return res;
    }
    return origStroke();
  };

  const origStrokeWidth = shape.strokeWidth.bind(shape);
  shape.strokeWidth = function (val?: any) {
    if (val !== undefined) {
      const res = origStrokeWidth(val);
      updateRichTextLayout(this);
      this.getLayer()?.batchDraw();
      return res;
    }
    return origStrokeWidth();
  };

  shape.on('transform', function () {
    const sx = shape.scaleX();
    const newWidth = Math.max(shape.width() * sx, 40);
    shape.width(newWidth);
    shape.scaleX(1);
    shape.scaleY(1);
    updateRichTextLayout(shape);
  });

  updateRichTextLayout(shape);

  return shape;
}
