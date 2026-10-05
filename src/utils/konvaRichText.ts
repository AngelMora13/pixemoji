import { layout, drawLayout } from 'render-tag';

export function wrapWithBaseStyles(rawHtml: string, options: {
  fontFamily?: string; fontSize?: number; color?: string;
  fontStyle?: string; strokeColor?: string; strokeWidth?: number;
}) {
  const { fontFamily = 'Plus Jakarta Sans', fontSize = 44, color = '#1e293b', fontStyle = 'normal', strokeColor, strokeWidth = 0 } = options;
  const strokeCss = (strokeWidth > 0 && strokeColor) ? `-webkit-text-stroke: ${strokeWidth}px ${strokeColor}; paint-order: stroke fill;` : '';
  const content = rawHtml && rawHtml.trim() ? rawHtml : '&nbsp;';
  return `<div style="font-family: '${fontFamily}', sans-serif; font-size: ${fontSize}px; color: ${color}; font-style: ${fontStyle}; line-height: 1.25; word-wrap: break-word; overflow-wrap: break-word; ${strokeCss}">${content}</div>`;
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
      const tr = shapeNode.getStage()?.findOne('Transformer');
      if (tr && tr.nodes().includes(shapeNode) && !tr.getActiveAnchor()) {
        tr.forceUpdate();
      }
    }
  } catch (err) {
    console.warn('RichText updateLayout error:', err);
  }
}

const OPPOSITE_ANCHORS: Record<string, (w: number, h: number) => { x: number; y: number }> = {
  'top-left': (w, h) => ({ x: w, y: h }),
  'top-center': (w, h) => ({ x: w / 2, y: h }),
  'top-right': (_w, h) => ({ x: 0, y: h }),
  'middle-right': (_w, h) => ({ x: 0, y: h / 2 }),
  'bottom-right': () => ({ x: 0, y: 0 }),
  'bottom-center': (w) => ({ x: w / 2, y: 0 }),
  'bottom-left': (w) => ({ x: w, y: 0 }),
  'middle-left': (w, h) => ({ x: w, y: h / 2 }),
};
function getOppositeAnchorPoint(node: any, anchor: string) {
  const fn = OPPOSITE_ANCHORS[anchor];
  return fn ? fn(node.width(), node.height()) : { x: node.width() / 2, y: node.height() / 2 };
}

export function createRichTextShape(KonvaModule: any, options: {
  x: number; y: number; width?: number; text: string; html?: string;
  fontSize?: number; fontFamily?: string; fill?: string; textColor?: string;
  fontStyle?: string; strokeColor?: string; strokeWidth?: number;
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

  shape.setAttrs({
    nodeType: 'text',
    text: options.text,
    html: initialHtml,
    fontFamily: options.fontFamily || 'Plus Jakarta Sans',
    fontSize: options.fontSize || 44,
    fill: options.textColor || options.fill || '#1e293b',
    fontStyle: options.fontStyle || 'normal',
    filterBlur: customAttrs?.filterBlur ?? 0,
    filterContrast: customAttrs?.filterContrast ?? 100,
    is3D: Boolean(customAttrs?.is3D),
    depth3D: customAttrs?.depth3D ?? 8,
    color3DMode: customAttrs?.color3DMode || 'auto',
    shading3D: customAttrs?.shading3D ?? 35,
    color3D: customAttrs?.color3D || '#333333',
    dirX3D: customAttrs?.dirX3D ?? 1,
    dirY3D: customAttrs?.dirY3D ?? 1,
  });

  let rawFontSize = options.fontSize || 44;

  const bindProp = (name: string, fallback: any) => {
    (shape as any)[name] = function (val?: any) {
      if (val !== undefined) {
        this.setAttr(name, val);
        if (name === 'fontSize') rawFontSize = Number(val) || 44;
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

  (['stroke', 'strokeWidth'] as const).forEach((name) => {
    const orig = (shape as any)[name].bind(shape);
    (shape as any)[name] = function (val?: any) {
      if (val !== undefined) {
        const res = orig(val);
        updateRichTextLayout(this);
        this.getLayer()?.batchDraw();
        return res;
      }
      return orig();
    };
  });

  let lastAnchor = '';
  shape.on('transformstart transform', function () {
    const tr = shape.getStage()?.findOne('Transformer');
    if (tr) lastAnchor = tr.getActiveAnchor() || lastAnchor;
  });

  shape.on('transformend', function () {
    const tr = shape.getStage()?.findOne('Transformer');
    const anchor = lastAnchor || tr?.getActiveAnchor() || '';
    lastAnchor = '';

    const sx = Math.abs(shape.scaleX());
    const sy = Math.abs(shape.scaleY());
    if (Math.abs(sx - 1) < 0.001 && Math.abs(sy - 1) < 0.001) return;

    const fixed = shape.getTransform().point(getOppositeAnchorPoint(shape, anchor));

    if (anchor === 'middle-left' || anchor === 'middle-right') {
      shape.width(Math.max(Math.round(shape.width() * sx), 40));
    } else {
      const isVertical = anchor === 'top-center' || anchor === 'bottom-center';
      const scale = isVertical ? sy : Math.max(sx, sy);
      const curFont = shape.getAttr('fontSize') || 44;
      const newFontSize = Math.max(Math.round(curFont * scale), 10);
      shape.setAttr('fontSize', newFontSize);
      rawFontSize = newFontSize;
      if (!isVertical) {
        shape.width(Math.max(Math.round(shape.width() * sx), 40));
      }
    }

    shape.scaleX(1);
    shape.scaleY(1);
    updateRichTextLayout(shape);

    const cur = shape.getTransform().point(getOppositeAnchorPoint(shape, anchor));
    shape.x(shape.x() + (fixed.x - cur.x));
    shape.y(shape.y() + (fixed.y - cur.y));

    tr?.forceUpdate();
    shape.getLayer()?.batchDraw();
  });

  updateRichTextLayout(shape);

  return shape;
}
