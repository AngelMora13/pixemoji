import { ref, shallowRef, computed } from 'vue';

export interface CanvasFrameState {
  active: boolean;
  borderRadius: number;
  margin: number;
  borderEnabled: boolean;
  borderWidth: number;
  borderStyle: 'solid' | 'dashed';
  borderColor: string;
}

export function drawRoundRectPath(
  ctx: any,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  const r = Math.max(0, Math.min(radius, w / 2, h / 2));
  if (r <= 0) {
    ctx.rect(x, y, w, h);
    return;
  }
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
}

export function useCanvasFrame() {
  const active = ref<boolean>(false);
  const borderRadius = ref<number>(16);
  // Margen de recorte (mínimo 0px)
  const margin = ref<number>(10);
  const borderEnabled = ref<boolean>(true);
  const borderWidth = ref<number>(2);
  const borderStyle = ref<'solid' | 'dashed'>('dashed');
  const borderColor = ref<string>('#94a3b8');

  // Rastreo del desplazamiento acumulado en el stage para centrar los elementos
  const currentOffset = ref<number>(0);
  const frameNode = shallowRef<any>(null);

  const setActive = (val: boolean) => {
    active.value = val;
  };

  const setBorderRadius = (val: number) => {
    borderRadius.value = Math.max(0, Math.min(80, Math.round(val)));
  };

  const setMargin = (val: number) => {
    margin.value = Math.max(0, Math.min(50, Math.round(val)));
  };

  const toggleBorder = (enabled?: boolean) => {
    borderEnabled.value = enabled !== undefined ? enabled : !borderEnabled.value;
  };

  const setBorderWidth = (val: number) => {
    borderWidth.value = Math.max(1, Math.min(10, Math.round(val)));
  };

  const setBorderStyle = (style: 'solid' | 'dashed') => {
    borderStyle.value = style;
  };

  const setBorderColor = (color: string) => {
    borderColor.value = color;
  };

  const resetFrame = () => {
    active.value = false;
    borderRadius.value = 16;
    margin.value = 10;
    borderEnabled.value = true;
    borderWidth.value = 2;
    borderStyle.value = 'dashed';
    borderColor.value = '#94a3b8';
  };

  const hasCustomFrame = computed(() => {
    return active.value || borderRadius.value !== 16 || margin.value !== 10;
  });

  /**
   * Crea o registra el nodo Konva del marco blanco con borde punteado
   */
  const initFrameNode = (Konva: any, stage: any, layer: any) => {
    if (!Konva || !stage || !layer) return;

    if (frameNode.value) {
      frameNode.value.destroy();
      frameNode.value = null;
    }

    const shape = new Konva.Shape({
      x: 0,
      y: 0,
      width: stage.width(),
      height: stage.height(),
      name: 'sticker-cut-frame',
      listening: false, // No intercepta clics para permitir transformar elementos debajo
      visible: active.value,
      sceneFunc: (context: any, currentShape: any) => {
        if (!active.value) return;

        const w = currentShape.width();
        const h = currentShape.height();
        const m = margin.value;
        const rInner = borderRadius.value; // Radio del diseño interno
        // Radio exterior concéntrico: rInner + m (o 0 si rInner es 0)
        const rOuter = rInner > 0 ? rInner + m : 0;

        // 1. Cuadro blanco solo en los bordes de tamaño del margen con esquinas redondeadas internas
        if (m > 0) {
          context.beginPath();
          drawRoundRectPath(context, 0, 0, w, h, rOuter);
          drawRoundRectPath(context, m, m, w - m * 2, h - m * 2, rInner);
          context.fillStyle = '#ffffff';
          context.fill('evenodd');
        }

        // 2. Línea punteada/sólida en el borde exterior de este marco
        if (borderEnabled.value && borderWidth.value > 0) {
          context.beginPath();
          const bw = borderWidth.value;
          const halfBw = bw / 2;
          const strokeR = m > 0 ? Math.max(0, rOuter - halfBw) : Math.max(0, rInner - halfBw);
          drawRoundRectPath(
            context,
            halfBw,
            halfBw,
            w - bw,
            h - bw,
            strokeR
          );
          context.strokeStyle = borderColor.value;
          context.lineWidth = bw;
          if (borderStyle.value === 'dashed') {
            context.setLineDash([7, 5]);
          } else {
            context.setLineDash([]);
          }
          context.stroke();
        }
      }
    });

    layer.add(shape);
    shape.moveToTop();
    frameNode.value = shape;
  };

  /**
   * Sincroniza el tamaño del canvas, el centrado de elementos y el frame overlay
   */
  const syncFrame = (
    stage: any,
    layer: any,
    baseWidth: number,
    baseHeight: number,
    transformer?: any,
    bgRectNode?: any
  ) => {
    if (!stage || !layer) return;

    const effectiveM = active.value ? margin.value : 0;
    const delta = effectiveM - currentOffset.value;

    // Desplazar elementos si cambió el margen
    if (delta !== 0) {
      const children = layer.getChildren ? layer.getChildren() : [];
      children.forEach((child: any) => {
        if (child === frameNode.value || child === transformer) return;
        if (child.hasName && (child.hasName('selectable') || child.hasName('locked'))) {
          child.x(child.x() + delta);
          child.y(child.y() + delta);
        }
      });

      if (bgRectNode) {
        bgRectNode.x(bgRectNode.x() + delta);
        bgRectNode.y(bgRectNode.y() + delta);
      }

      currentOffset.value = effectiveM;
    }

    // Redimensionar Stage
    const newWidth = baseWidth + effectiveM * 2;
    const newHeight = baseHeight + effectiveM * 2;
    stage.size({ width: newWidth, height: newHeight });

    // Actualizar frame node
    if (frameNode.value) {
      frameNode.value.size({ width: newWidth, height: newHeight });
      frameNode.value.visible(active.value);
      frameNode.value.moveToTop();
    }

    if (transformer) {
      transformer.moveToTop();
      transformer.forceUpdate();
    }

    layer.batchDraw();
  };

  const syncFrameToTop = (layer: any, transformer?: any) => {
    if (frameNode.value && layer) {
      frameNode.value.moveToTop();
      if (transformer) {
        transformer.moveToTop();
      }
      layer.batchDraw();
    }
  };

  return {
    active,
    borderRadius,
    margin,
    borderEnabled,
    borderWidth,
    borderStyle,
    borderColor,
    frameNode,
    currentOffset,
    hasCustomFrame,
    setActive,
    setBorderRadius,
    setMargin,
    toggleBorder,
    setBorderWidth,
    setBorderStyle,
    setBorderColor,
    resetFrame,
    initFrameNode,
    syncFrame,
    syncFrameToTop
  };
}

/**
 * Post-procesa la exportación para garantizar transparencia en esquinas redondeadas
 */
export async function applyFrameToExport(
  rawPngDataUrl: string,
  totalWidth: number,
  totalHeight: number,
  pixelRatio: number,
  borderRadius: number,
  isFrameActive: boolean = false,
  margin: number = 0
): Promise<string> {
  const rBase = borderRadius;
  const effectiveR = (isFrameActive && margin > 0 && rBase > 0) ? (rBase + margin) : rBase;
  if (effectiveR <= 0) return rawPngDataUrl;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const offscreen = document.createElement('canvas');
        offscreen.width = totalWidth * pixelRatio;
        offscreen.height = totalHeight * pixelRatio;
        const ctx = offscreen.getContext('2d');
        if (!ctx) {
          resolve(rawPngDataUrl);
          return;
        }

        const r = effectiveR * pixelRatio;
        ctx.beginPath();
        drawRoundRectPath(ctx, 0, 0, offscreen.width, offscreen.height, r);
        ctx.clip();
        ctx.drawImage(img, 0, 0, offscreen.width, offscreen.height);
        resolve(offscreen.toDataURL('image/png'));
      } catch {
        resolve(rawPngDataUrl);
      }
    };
    img.onerror = () => resolve(rawPngDataUrl);
    img.src = rawPngDataUrl;
  });
}
