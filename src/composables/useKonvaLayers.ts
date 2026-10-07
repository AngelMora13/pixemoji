import { ref, shallowRef, computed, watch } from 'vue';
import type { useKonvaStage } from './useKonvaStage';
import { patchKonvaEmojiShadow, patchKonvaEmojiBounds, syncEmojiMetrics } from './useKonvaEmojiFix';
import { patchKonvaCrop, type CropInset, DEFAULT_CROP } from './useKonvaCrop';
import { createRichTextShape } from '../utils/konvaRichText';
import { renderEmojiPattern, type EmojiPatternOptions, type PatternLayoutMode } from './useEmojiPattern';

export type { CropInset, EmojiPatternOptions, PatternLayoutMode };
export { DEFAULT_CROP };

export interface LayerItem {
  id: string;
  type: string;
  label: string;
  icon: string;
  isLocked: boolean;
  raw: any;
}

export interface TextNodeOptions {
  text: string;
  html?: string;
  fontFamily?: string;
  fontSize?: number;
  textColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  fontStyle?: string;
}

export interface StickerOptions {
  strokeColor?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetY?: number;
}

export interface CustomShadowOptions {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
  opacity: number;
}

export interface ActiveElementState {
  id: string;
  type: 'Texto' | 'Emoji' | 'Imagen' | 'Objeto';
  label: string;
  isLocked: boolean;
  text: string;
  html?: string;
  fontFamily: string;
  fontSize: number;
  fill: string;
  stroke: string | undefined;
  strokeWidth: number;
  hasStroke: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowOpacity: number;
  hasShadow: boolean;
  scaleX: number;
  scaleY: number;
  rotation: number;
  fontStyle: string;
  filterBlur: number;
  filterContrast: number;
  cropInset?: CropInset;
  is3D?: boolean;
  depth3D?: number;
  color3DMode?: 'auto' | 'custom';
  shading3D?: number;
  color3D?: string;
  dirX3D?: number;
  dirY3D?: number;
  raw: any;
}

export const attachNodeFilters = (node: any) => {
  if (!node || node._filtersAttached || typeof node.getSceneFunc !== 'function') return;
  node._filtersAttached = true;

  const originalSceneFunc = node.getSceneFunc();
  node.sceneFunc(function(this: any, context: any, shapeNode: any) {
    const rawBlur = shapeNode.getAttr('filterBlur');
    const blur = (rawBlur !== undefined && !isNaN(Number(rawBlur))) ? Number(rawBlur) : 0;
    const rawContrast = shapeNode.getAttr('filterContrast');
    const contrast = (rawContrast !== undefined && !isNaN(Number(rawContrast))) ? Number(rawContrast) : 100;
    const hasFilter = blur > 0 || contrast !== 100;

    if (hasFilter) {
      const ctx = context._context;
      ctx.save();
      let f = '';
      if (blur > 0) f += `blur(${blur}px) `;
      if (contrast !== 100) f += `contrast(${contrast}%) `;
      ctx.filter = f.trim();
      originalSceneFunc.call(this, context, shapeNode);
      ctx.restore();
    } else {
      originalSceneFunc.call(this, context, shapeNode);
    }
  });
};

export function useKonvaLayers(stageContext: ReturnType<typeof useKonvaStage>) {
  const {
    layerInstance,
    transformerInstance,
    bgRectNode,
    KonvaModule,
    canvasWidth,
    canvasHeight,
    selectedNode,
    selectNode
  } = stageContext;

  const layersList = ref<LayerItem[]>([]);
  const activeElement = shallowRef<ActiveElementState | null>(null);

  const layersListReversed = computed(() => {
    return [...layersList.value].reverse();
  });

  const syncActiveElement = () => {
    const node = selectedNode.value;
    if (!node) {
      activeElement.value = null;
      return;
    }

    const explicitType = node.getAttr?.('nodeType');
    const item = layersList.value.find((l) => l.raw === node);

    let type: 'Texto' | 'Emoji' | 'Imagen' | 'Objeto' = 'Objeto';
    if (explicitType === 'emoji') {
      type = 'Emoji';
    } else if (explicitType === 'text') {
      type = 'Texto';
    } else if (explicitType === 'image' || node.className === 'Image') {
      type = 'Imagen';
    } else if (item?.type) {
      type = item.type as any;
    } else if (typeof node.text === 'function') {
      const txt = node.text();
      if ([...txt].length <= 2 && /\p{Extended_Pictographic}/u.test(txt)) {
        type = 'Emoji';
      } else {
        type = 'Texto';
      }
    }

    const isText = type === 'Texto';
    const nodeText = typeof node.text === 'function' ? node.text() : '';
    const currentStroke = typeof node.stroke === 'function' ? node.stroke() : undefined;
    const currentStrokeWidth = typeof node.strokeWidth === 'function' ? (node.strokeWidth() ?? 0) : 0;
    const currentShadowColor = typeof node.shadowColor === 'function' ? (node.shadowColor() || '#000000') : '#000000';
    const currentShadowBlur = typeof node.shadowBlur === 'function' ? (node.shadowBlur() ?? 0) : 0;
    const currentShadowOffsetX = typeof node.shadowOffsetX === 'function' ? (node.shadowOffsetX() ?? 0) : 0;
    const currentShadowOffsetY = typeof node.shadowOffsetY === 'function' ? (node.shadowOffsetY() ?? 0) : 0;
    const currentShadowOpacity = typeof node.shadowOpacity === 'function' ? (node.shadowOpacity() ?? 1) : 1;
    const hasShadowActive = typeof node.hasShadow === 'function'
      ? node.hasShadow()
      : (currentShadowBlur > 0 || currentShadowOffsetX !== 0 || currentShadowOffsetY !== 0);

    const nodeHtml = typeof (node as any).html === 'function'
      ? (node as any).html()
      : (node.getAttr?.('html') || '');

    const rawBlur = node.getAttr?.('filterBlur');
    const filterBlur = (rawBlur !== undefined && !isNaN(Number(rawBlur))) ? Number(rawBlur) : 0;
    const rawContrast = node.getAttr?.('filterContrast');
    const filterContrast = (rawContrast !== undefined && !isNaN(Number(rawContrast))) ? Number(rawContrast) : 100;
    const is3D = Boolean(node.getAttr?.('is3D'));
    const rawDepth = node.getAttr?.('depth3D');
    const depth3D = (rawDepth !== undefined && !isNaN(Number(rawDepth))) ? Number(rawDepth) : 8;
    const color3DMode = (node.getAttr?.('color3DMode') as 'auto' | 'custom') || 'auto';
    const rawShading = node.getAttr?.('shading3D');
    const shading3D = (rawShading !== undefined && !isNaN(Number(rawShading))) ? Number(rawShading) : 35;
    const color3D = node.getAttr?.('color3D') || '#333333';
    const rawDirX = node.getAttr?.('dirX3D');
    const dirX3D = (rawDirX !== undefined && !isNaN(Number(rawDirX))) ? Number(rawDirX) : 1;
    const rawDirY = node.getAttr?.('dirY3D');
    const dirY3D = (rawDirY !== undefined && !isNaN(Number(rawDirY))) ? Number(rawDirY) : 1;

    activeElement.value = {
      id: node._id ? String(node._id) : (item?.id || ''),
      type,
      label: item?.label ?? (type === 'Emoji' ? `Emoji: ${nodeText}` : nodeText || 'Objeto'),
      isLocked: item?.isLocked ?? node.hasName('locked'),
      text: isText ? nodeText : (typeof node.text === 'function' ? nodeText : ''),
      html: isText ? (nodeHtml || `<p>${nodeText}</p>`) : undefined,
      fontFamily: typeof node.fontFamily === 'function' ? node.fontFamily() : 'Impact',
      fontSize: typeof node.fontSize === 'function' ? node.fontSize() : 44,
      fill: typeof node.fill === 'function' ? node.fill() : '#ffffff',
      stroke: currentStroke,
      strokeWidth: currentStrokeWidth,
      hasStroke: Boolean(currentStroke && currentStrokeWidth > 0),
      shadowColor: currentShadowColor,
      shadowBlur: currentShadowBlur,
      shadowOffsetX: currentShadowOffsetX,
      shadowOffsetY: currentShadowOffsetY,
      shadowOpacity: currentShadowOpacity,
      hasShadow: hasShadowActive,
      scaleX: typeof node.scaleX === 'function' ? node.scaleX() : 1,
      scaleY: typeof node.scaleY === 'function' ? node.scaleY() : 1,
      rotation: typeof node.rotation === 'function' ? node.rotation() : 0,
      fontStyle: typeof node.fontStyle === 'function' ? (node.fontStyle() || 'normal') : 'normal',
      filterBlur,
      filterContrast,
      cropInset: (node.getAttr?.('cropInset') as CropInset) ? { ...node.getAttr('cropInset') } : { ...DEFAULT_CROP },
      is3D,
      depth3D,
      color3DMode,
      shading3D,
      color3D,
      dirX3D,
      dirY3D,
      raw: node
    };
  };

  watch(
    () => selectedNode.value,
    (node) => {
      syncActiveElement();
      if (node && typeof node.on === 'function') {
        node.off('.activeSync');
        node.on('dragend.activeSync transformend.activeSync', () => {
          syncActiveElement();
        });
      }
    },
    { immediate: true }
  );

  const selectedNodeInfo = computed(() => activeElement.value);

  const refreshLayersList = () => {
    if (!layerInstance.value) return;
    const children = layerInstance.value.getChildren((node: any) => {
      return node.hasName('selectable') || node.hasName('locked');
    });

    layersList.value = children.map((node: any, idx: number) => {
      let type = 'Objeto';
      let icon = '📦';
      let label = `Capa ${idx + 1}`;

      const explicitType = node.getAttr?.('nodeType');
      const text = node.text && typeof node.text === 'function' ? node.text() : node.attrs?.text;

      if (explicitType === 'emoji') {
        type = 'Emoji';
        icon = '✨';
        label = `Emoji: ${text || '✨'}`;
      } else if (explicitType === 'text') {
        type = 'Texto';
        icon = '🔤';
        label = `Texto: "${(text || '').slice(0, 16)}${(text || '').length > 16 ? '...' : ''}"`;
      } else if (text !== undefined) {
        if ([...text].length <= 2 && /\p{Extended_Pictographic}/u.test(text)) {
          type = 'Emoji';
          icon = '✨';
          label = `Emoji: ${text}`;
        } else {
          type = 'Texto';
          icon = '🔤';
          label = `Texto: "${text.slice(0, 16)}${text.length > 16 ? '...' : ''}"`;
        }
      } else if (node.className === 'Image' || node.attrs?.image || explicitType === 'image') {
        type = 'Imagen';
        icon = '🖼️';
        label = `Imagen ${idx + 1}`;
      }

      return {
        id: node._id ? String(node._id) : 'layer_' + idx,
        type,
        label,
        icon,
        isLocked: node.hasName('locked'),
        raw: node
      };
    });
  };

  const addEmoji = (char: string, customOptions?: any) => {
    if (!layerInstance.value || !KonvaModule.value) return;

    patchKonvaEmojiShadow(KonvaModule.value);
    patchKonvaEmojiBounds(KonvaModule.value);

    const offset = (Math.random() - 0.5) * 40;
    const initialFontSize = customOptions?.fontSize ?? 110;
    const emoji = new KonvaModule.value.Text({
      x: customOptions?.x ?? canvasWidth.value / 2 + offset,
      y: customOptions?.y ?? canvasHeight.value / 2 + offset,
      text: char,
      fontSize: initialFontSize,
      fontFamily: '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif',
      draggable: true,
      name: 'selectable',
      nodeType: 'emoji',
      perfectDrawEnabled: true,
      ...customOptions
    });
    emoji.setAttr('nodeType', 'emoji');
    emoji.setAttr('filterBlur', 0);
    emoji.setAttr('filterContrast', 100);
    syncEmojiMetrics(emoji, char, initialFontSize);
    attachNodeFilters(emoji);

    layerInstance.value.add(emoji);
    selectNode(emoji);
    refreshLayersList();
    return emoji;
  };

  const addText = (options: TextNodeOptions, customAttrs?: any) => {
    if (!layerInstance.value || !KonvaModule.value || !options.text?.trim()) return;

    const offset = (Math.random() - 0.5) * 30;
    const memeText = createRichTextShape(KonvaModule.value, {
      x: customAttrs?.x ?? canvasWidth.value / 2 + offset,
      y: customAttrs?.y ?? canvasHeight.value / 2 + offset,
      text: options.text,
      html: options.html,
      fontSize: options.fontSize ?? 44,
      fontFamily: options.fontFamily ?? 'Plus Jakarta Sans',
      fill: options.textColor ?? '#1e293b',
      textColor: options.textColor ?? '#1e293b',
      strokeColor: options.strokeColor,
      strokeWidth: options.strokeWidth ?? 0,
      fontStyle: options.fontStyle ?? 'normal',
      ...customAttrs
    });

    layerInstance.value.add(memeText);
    selectNode(memeText);
    refreshLayersList();
    return memeText;
  };

  const addImage = (url: string) => {
    if (!layerInstance.value || !KonvaModule.value) return;

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const kImg = new KonvaModule.value.Image({
        x: canvasWidth.value / 2,
        y: canvasHeight.value / 2,
        image: img,
        draggable: true,
        name: 'selectable',
        nodeType: 'image'
      });
      kImg.setAttr('nodeType', 'image');
      kImg.setAttr('filterBlur', 0);
      kImg.setAttr('filterContrast', 100);
      attachNodeFilters(kImg);

      const maxW = canvasWidth.value * 0.75;
      const maxH = canvasHeight.value * 0.75;
      if (kImg.width() > maxW || kImg.height() > maxH) {
        const scale = Math.min(maxW / kImg.width(), maxH / kImg.height());
        kImg.scale({ x: scale, y: scale });
      }

      kImg.offsetX(kImg.width() / 2);
      kImg.offsetY(kImg.height() / 2);

      layerInstance.value.add(kImg);
      selectNode(kImg);
      refreshLayersList();
    };
    img.onerror = () => {
      alert('No se pudo cargar la imagen. Verifica que el enlace sea válido y público.');
    };
    img.src = url;
  };

  const replaceSelectedImage = (url: string) => {
    if (!selectedNode.value || !layerInstance.value) return;
    const node = selectedNode.value;
    const explicitType = node.getAttr?.('nodeType');
    if (node.className !== 'Image' && explicitType !== 'image') return;

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      node.image(img);
      const maxW = canvasWidth.value * 0.75;
      const maxH = canvasHeight.value * 0.75;
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;
      if (width > maxW || height > maxH) {
        const scale = Math.min(maxW / width, maxH / height);
        width = width * scale;
        height = height * scale;
      }
      node.width(width);
      node.height(height);
      node.scale({ x: 1, y: 1 });
      node.offsetX(width / 2);
      node.offsetY(height / 2);
      layerInstance.value?.draw();
      refreshLayersList();
      syncActiveElement();
    };
    img.onerror = () => {
      alert('No se pudo cargar la imagen. Verifica que el enlace o archivo sea válido.');
    };
    img.src = url;
  };

  // Visual Effects & Node Transformations
  const flipHorizontal = () => {
    if (!selectedNode.value || !layerInstance.value) return;
    const currentScale = selectedNode.value.scaleX() || 1;
    selectedNode.value.scaleX(currentScale * -1);
    layerInstance.value.draw();
    syncActiveElement();
  };

  const flipVertical = () => {
    if (!selectedNode.value || !layerInstance.value) return;
    const currentScale = selectedNode.value.scaleY() || 1;
    selectedNode.value.scaleY(currentScale * -1);
    layerInstance.value.draw();
    syncActiveElement();
  };

  const rotateCW = (degrees = 90) => {
    if (!selectedNode.value || !layerInstance.value) return;
    const currentRotation = selectedNode.value.rotation() || 0;
    selectedNode.value.rotation((currentRotation + degrees) % 360);
    layerInstance.value.draw();
    syncActiveElement();
  };

  const centerNode = () => {
    if (!selectedNode.value || !layerInstance.value) return;
    selectedNode.value.x(canvasWidth.value / 2);
    selectedNode.value.y(canvasHeight.value / 2);
    layerInstance.value.draw();
    syncActiveElement();
  };

  const applyStickerEffect = (options?: StickerOptions) => {
    if (!selectedNode.value || !layerInstance.value) return;
    const node = selectedNode.value;

    const strokeColor = options?.strokeColor ?? '#ffffff';
    const strokeWidth = options?.strokeWidth ?? 12;
    const shadowColor = options?.shadowColor ?? 'rgba(0, 0, 0, 0.4)';
    const shadowBlur = options?.shadowBlur ?? 14;
    const shadowOffsetY = options?.shadowOffsetY ?? 6;

    node.stroke(strokeColor);
    node.strokeWidth(strokeWidth);
    node.shadowColor(shadowColor);
    node.shadowBlur(shadowBlur);
    node.shadowOffsetX(0);
    node.shadowOffsetY(shadowOffsetY);
    node.shadowOpacity(0.75);

    layerInstance.value.draw();
    refreshLayersList();
    syncActiveElement();
  };

  const applyGlowEffect = (color = '#ff007f', blur = 24, opacity = 0.9) => {
    if (!selectedNode.value || !layerInstance.value) return;
    const node = selectedNode.value;

    node.shadowColor(color);
    node.shadowBlur(blur);
    node.shadowOffsetX(0);
    node.shadowOffsetY(0);
    node.shadowOpacity(opacity);

    layerInstance.value.draw();
    refreshLayersList();
    syncActiveElement();
  };

  const setCustomShadow = (options: CustomShadowOptions) => {
    if (!selectedNode.value || !layerInstance.value) return;
    const node = selectedNode.value;

    node.shadowColor(options.color);
    node.shadowBlur(options.blur);
    node.shadowOffsetX(options.offsetX);
    node.shadowOffsetY(options.offsetY);
    node.shadowOpacity(options.opacity);

    layerInstance.value.draw();
    syncActiveElement();
  };

  const removeEffects = () => {
    if (!selectedNode.value || !layerInstance.value) return;
    const node = selectedNode.value;

    node.stroke(undefined);
    node.strokeWidth(0);
    node.shadowColor(undefined);
    node.shadowBlur(0);
    node.shadowOffsetX(0);
    node.shadowOffsetY(0);
    node.shadowOpacity(0);

    layerInstance.value.draw();
    refreshLayersList();
    syncActiveElement();
  };

  const applyImagePreset = (preset: 'sticker' | 'neon' | 'soft-shadow' | 'clean', customColor?: string) => {
    if (!selectedNode.value || !layerInstance.value) return;

    switch (preset) {
      case 'sticker':
        applyStickerEffect({
          strokeColor: '#ffffff',
          strokeWidth: 12,
          shadowColor: 'rgba(0, 0, 0, 0.35)',
          shadowBlur: 14,
          shadowOffsetY: 6
        });
        break;
      case 'neon':
        applyGlowEffect(customColor || '#00f0ff', 24, 0.9);
        break;
      case 'soft-shadow':
        setCustomShadow({
          color: 'rgba(0, 0, 0, 0.45)',
          blur: 18,
          offsetX: 0,
          offsetY: 8,
          opacity: 0.7
        });
        break;
      case 'clean':
        removeEffects();
        break;
    }
  };

  const toggleLock = (node = selectedNode.value) => {
    if (!node || !layerInstance.value) return;

    const isCurrentlyLocked = node.hasName('locked');
    if (isCurrentlyLocked) {
      node.removeName('locked');
      node.addName('selectable');
      node.draggable(true);
      if (selectedNode.value === node) {
        transformerInstance.value?.nodes([node]);
        transformerInstance.value?.moveToTop();
      }
    } else {
      node.removeName('selectable');
      node.addName('locked');
      node.draggable(false);
      transformerInstance.value?.nodes([]);
    }

    layerInstance.value.draw();
    refreshLayersList();
    syncActiveElement();
  };

  // Pattern fill with emojis
  const clearEmojiPattern = () => {
    if (!layerInstance.value) return;
    const items = layerInstance.value.getChildren((n: any) => n.hasName('patternItem'));
    items.forEach((n: any) => n.destroy());
    layerInstance.value.draw();
  };

  const fillEmojiPattern = (emojiChar: string, options?: EmojiPatternOptions) => {
    if (!layerInstance.value || !KonvaModule.value) return;

    // Remove existing pattern if any
    clearEmojiPattern();

    renderEmojiPattern({
      Konva: KonvaModule.value,
      layer: layerInstance.value,
      bgRect: bgRectNode.value,
      width: canvasWidth.value,
      height: canvasHeight.value,
      emoji: emojiChar,
      options
    });
  };

  // Layer hierarchy operations
  const bringToFront = () => {
    if (!selectedNode.value || !layerInstance.value) return;
    selectedNode.value.moveToTop();
    transformerInstance.value?.moveToTop();
    layerInstance.value.draw();
    refreshLayersList();
  };

  const bringForward = () => {
    if (!selectedNode.value || !layerInstance.value) return;
    selectedNode.value.moveUp();
    transformerInstance.value?.moveToTop();
    layerInstance.value.draw();
    refreshLayersList();
  };

  const sendBackward = () => {
    if (!selectedNode.value || !layerInstance.value) return;
    selectedNode.value.moveDown();
    if (bgRectNode.value) bgRectNode.value.moveToBottom();
    layerInstance.value.draw();
    refreshLayersList();
  };

  const sendToBack = () => {
    if (!selectedNode.value || !layerInstance.value) return;
    selectedNode.value.moveToBottom();
    if (bgRectNode.value) bgRectNode.value.moveToBottom();
    layerInstance.value.draw();
    refreshLayersList();
  };

  const moveLayerUp = (node: any) => {
    if (!node || !layerInstance.value) return;
    node.moveUp();
    transformerInstance.value?.moveToTop();
    layerInstance.value.draw();
    refreshLayersList();
  };

  const moveLayerDown = (node: any) => {
    if (!node || !layerInstance.value) return;
    node.moveDown();
    if (bgRectNode.value) bgRectNode.value.moveToBottom();
    layerInstance.value.draw();
    refreshLayersList();
  };

  const removeLayer = (node: any) => {
    if (!node || !layerInstance.value) return;
    if (selectedNode.value === node) {
      selectNode(null);
    }
    node.destroy();
    layerInstance.value.draw();
    refreshLayersList();
  };

  const deleteSelected = () => {
    if (!selectedNode.value) return;
    removeLayer(selectedNode.value);
  };

  const updateSelectedFilters = (options: { blur?: number; contrast?: number }) => {
    if (!selectedNode.value || !layerInstance.value) return;
    const node = selectedNode.value;

    if (options.blur !== undefined && !isNaN(Number(options.blur))) {
      node.setAttr('filterBlur', Number(options.blur));
    }
    if (options.contrast !== undefined && !isNaN(Number(options.contrast))) {
      node.setAttr('filterContrast', Number(options.contrast));
    }

    if (node.getAttr('nodeType') !== 'text') {
      attachNodeFilters(node);
    }
    node.getLayer()?.batchDraw();
    layerInstance.value.batchDraw();
    syncActiveElement();
  };

  const updateSelectedCrop = (crop: Partial<CropInset>) => {
    if (!selectedNode.value || !layerInstance.value) return;
    const node = selectedNode.value;
    const existing = (node.getAttr?.('cropInset') as CropInset) || { ...DEFAULT_CROP };
    const next: CropInset = {
      top: Math.max(0, Math.min(90, crop.top ?? existing.top ?? 0)),
      right: Math.max(0, Math.min(90, crop.right ?? existing.right ?? 0)),
      bottom: Math.max(0, Math.min(90, crop.bottom ?? existing.bottom ?? 0)),
      left: Math.max(0, Math.min(90, crop.left ?? existing.left ?? 0))
    };

    if (next.top + next.bottom >= 95) {
      next.bottom = Math.max(0, 95 - next.top);
    }
    if (next.left + next.right >= 95) {
      next.right = Math.max(0, 95 - next.left);
    }

    node.setAttr('cropInset', next);

    node.getLayer()?.batchDraw();
    layerInstance.value.batchDraw();
    syncActiveElement();
  };

  const updateSelectedText3D = (options: {
    is3D?: boolean;
    depth?: number;
    color?: string;
    colorMode?: 'auto' | 'custom';
    shading?: number;
    dirX?: number;
    dirY?: number;
  }) => {
    if (!selectedNode.value || !layerInstance.value) return;
    const node = selectedNode.value;
    const isText = node.getAttr?.('nodeType') === 'text' || typeof (node as any).html === 'function' || typeof node.text === 'function';
    if (!isText) return;

    if (options.is3D !== undefined) node.setAttr('is3D', Boolean(options.is3D));
    if (options.depth !== undefined && !isNaN(Number(options.depth))) node.setAttr('depth3D', Number(options.depth));
    if (options.colorMode !== undefined) node.setAttr('color3DMode', options.colorMode);
    if (options.shading !== undefined && !isNaN(Number(options.shading))) node.setAttr('shading3D', Number(options.shading));
    if (options.color !== undefined && options.color) node.setAttr('color3D', options.color);
    if (options.dirX !== undefined && !isNaN(Number(options.dirX))) node.setAttr('dirX3D', Number(options.dirX));
    if (options.dirY !== undefined && !isNaN(Number(options.dirY))) node.setAttr('dirY3D', Number(options.dirY));

    if (typeof (node as any).clearCache === 'function' && (node as any).isCached?.()) {
      (node as any).clearCache();
    }
    node.getLayer()?.batchDraw();
    layerInstance.value.batchDraw();
    syncActiveElement();
  };

  const duplicateSelected = () => {
    if (!selectedNode.value || !layerInstance.value || !KonvaModule.value) return;
    const node = selectedNode.value;
    const explicitType = node.getAttr?.('nodeType');

    let cloned: any = null;
    if (explicitType === 'text') {
      const currentHtml = (typeof (node as any).html === 'function' ? (node as any).html() : node.getAttr('html')) || `<p>${node.getAttr('text') || ''}</p>`;
      const currentText = (typeof node.text === 'function' ? node.text() : node.getAttr('text')) || 'Texto';

      cloned = createRichTextShape(KonvaModule.value, {
        x: node.x() + 20,
        y: node.y() + 20,
        width: node.width(),
        text: currentText,
        html: currentHtml,
        fontSize: typeof node.fontSize === 'function' ? node.fontSize() : (node.getAttr('fontSize') || 44),
        fontFamily: typeof node.fontFamily === 'function' ? node.fontFamily() : (node.getAttr('fontFamily') || 'Plus Jakarta Sans'),
        fill: typeof node.fill === 'function' ? node.fill() : (node.getAttr('fill') || '#1e293b'),
        textColor: typeof node.fill === 'function' ? node.fill() : (node.getAttr('fill') || '#1e293b'),
        strokeColor: typeof node.stroke === 'function' ? node.stroke() : undefined,
        strokeWidth: typeof node.strokeWidth === 'function' ? node.strokeWidth() : 0,
        fontStyle: typeof node.fontStyle === 'function' ? node.fontStyle() : 'normal'
      }, {
        rotation: typeof node.rotation === 'function' ? node.rotation() : 0,
        scaleX: typeof node.scaleX === 'function' ? node.scaleX() : 1,
        scaleY: typeof node.scaleY === 'function' ? node.scaleY() : 1,
        shadowColor: typeof node.shadowColor === 'function' ? node.shadowColor() : undefined,
        shadowBlur: typeof node.shadowBlur === 'function' ? node.shadowBlur() : 0,
        shadowOffsetX: typeof node.shadowOffsetX === 'function' ? node.shadowOffsetX() : 0,
        shadowOffsetY: typeof node.shadowOffsetY === 'function' ? node.shadowOffsetY() : 0,
        shadowOpacity: typeof node.shadowOpacity === 'function' ? node.shadowOpacity() : 1
      });

      if (node.getAttr('is3D')) {
        cloned.setAttr('is3D', true);
        const d = node.getAttr('depth3D');
        cloned.setAttr('depth3D', (d !== undefined && !isNaN(Number(d))) ? Number(d) : 8);
        cloned.setAttr('color3DMode', node.getAttr('color3DMode') || 'auto');
        const s = node.getAttr('shading3D');
        cloned.setAttr('shading3D', (s !== undefined && !isNaN(Number(s))) ? Number(s) : 35);
        cloned.setAttr('color3D', node.getAttr('color3D') || '#333333');
        const x = node.getAttr('dirX3D');
        cloned.setAttr('dirX3D', (x !== undefined && !isNaN(Number(x))) ? Number(x) : 1);
        const y = node.getAttr('dirY3D');
        cloned.setAttr('dirY3D', (y !== undefined && !isNaN(Number(y))) ? Number(y) : 1);
      }
      const b = node.getAttr('filterBlur');
      cloned.setAttr('filterBlur', (b !== undefined && !isNaN(Number(b))) ? Number(b) : 0);
      const c = node.getAttr('filterContrast');
      cloned.setAttr('filterContrast', (c !== undefined && !isNaN(Number(c))) ? Number(c) : 100);
    } else {
      cloned = node.clone({
        x: node.x() + 20,
        y: node.y() + 20
      });
      attachNodeFilters(cloned);
    }

    cloned.removeName('locked');
    cloned.addName('selectable');
    cloned.draggable(true);
    cloned.listening(true);

    layerInstance.value.add(cloned);
    layerInstance.value.batchDraw();
    selectNode(cloned);
    refreshLayersList();
    syncActiveElement();
  };

  const clearAll = () => {
    if (!layerInstance.value) return;
    const nodes = layerInstance.value.getChildren(
      (n: any) => n.hasName('selectable') || n.hasName('locked') || n.hasName('patternItem')
    );
    nodes.forEach((n: any) => n.destroy());
    selectNode(null);
    refreshLayersList();
    syncActiveElement();
  };

  const updateSelectedText = (options: Partial<TextNodeOptions>) => {
    if (!selectedNode.value || !layerInstance.value) return;
    const node = selectedNode.value;
    if (typeof node.text !== 'function') return;

    if (options.text !== undefined) node.text(options.text);
    if (options.html !== undefined) {
      if (typeof (node as any).html === 'function') {
        (node as any).html(options.html);
      } else {
        node.setAttr('html', options.html);
      }
    }
    if (options.fontFamily !== undefined) node.fontFamily(options.fontFamily);
    if (options.textColor !== undefined) node.fill(options.textColor);
    if (options.fontStyle !== undefined) node.fontStyle(options.fontStyle);
    if (options.strokeColor !== undefined) node.stroke(options.strokeColor);
    if (options.strokeWidth !== undefined) {
      node.strokeWidth(options.strokeWidth);
      if (options.strokeWidth === 0) node.stroke(undefined);
    }
    if (options.fontSize !== undefined) node.fontSize(options.fontSize);

    if (node.getAttr('nodeType') === 'emoji') {
      syncEmojiMetrics(node);
    } else {
      node.offsetX(node.width() / 2);
      node.offsetY(node.height() / 2);
    }

    transformerInstance.value?.forceUpdate();
    layerInstance.value.batchDraw();
    refreshLayersList();
    syncActiveElement();
  };

  const applyTextPreset = (preset: 'meme' | 'sticker' | 'neon' | 'soft-shadow' | 'clean') => {
    if (!selectedNode.value || !layerInstance.value) return;
    const node = selectedNode.value;
    if (typeof node.text !== 'function') return;

    switch (preset) {
      case 'meme':
        node.fontFamily('Impact');
        node.fill('#ffffff');
        node.stroke('#000000');
        node.strokeWidth(3);
        node.shadowColor('rgba(0, 0, 0, 0.6)');
        node.shadowBlur(4);
        node.shadowOffsetX(2);
        node.shadowOffsetY(2);
        node.shadowOpacity(0.85);
        break;
      case 'sticker':
        node.stroke('#ffffff');
        node.strokeWidth(3.5);
        node.shadowColor('rgba(0, 0, 0, 0.4)');
        node.shadowBlur(10);
        node.shadowOffsetX(0);
        node.shadowOffsetY(5);
        node.shadowOpacity(0.75);
        break;
      case 'neon':
        node.fill('#ffffff');
        node.stroke('#00f0ff');
        node.strokeWidth(1.5);
        node.shadowColor('#00f0ff');
        node.shadowBlur(18);
        node.shadowOffsetX(0);
        node.shadowOffsetY(0);
        node.shadowOpacity(0.95);
        break;
      case 'soft-shadow':
        node.stroke(undefined);
        node.strokeWidth(0);
        node.shadowColor('rgba(0, 0, 0, 0.45)');
        node.shadowBlur(14);
        node.shadowOffsetX(0);
        node.shadowOffsetY(6);
        node.shadowOpacity(0.7);
        break;
      case 'clean':
        node.stroke(undefined);
        node.strokeWidth(0);
        node.shadowColor(undefined);
        node.shadowBlur(0);
        node.shadowOffsetX(0);
        node.shadowOffsetY(0);
        node.shadowOpacity(0);
        break;
    }

    node.offsetX(node.width() / 2);
    node.offsetY(node.height() / 2);
    layerInstance.value.draw();
    refreshLayersList();
    syncActiveElement();
  };

  const reorderLayerByIndex = (fromReversedIndex: number, toReversedIndex: number) => {
    if (!layerInstance.value) return;
    const list = layersListReversed.value;
    if (fromReversedIndex < 0 || fromReversedIndex >= list.length) return;
    if (toReversedIndex < 0 || toReversedIndex >= list.length) return;
    if (fromReversedIndex === toReversedIndex) return;

    const sourceItem = list[fromReversedIndex];
    const targetItem = list[toReversedIndex];
    if (!sourceItem?.raw || !targetItem?.raw) return;

    const sourceNode = sourceItem.raw;
    const targetNode = targetItem.raw;

    const targetZ = targetNode.getZIndex();
    sourceNode.setZIndex(targetZ);

    if (bgRectNode.value) bgRectNode.value.moveToBottom();
    transformerInstance.value?.moveToTop();
    layerInstance.value.draw();
    refreshLayersList();
    syncActiveElement();
  };

  const updateSelectedShadow = (opts: { enabled?: boolean; offsetX?: number; offsetY?: number; blur?: number; color?: string; opacity?: number }) => {
    if (!selectedNode.value || !layerInstance.value) return;
    const node = selectedNode.value;

    if (opts.enabled === false) {
      node.shadowColor(undefined);
      node.shadowBlur(0);
      node.shadowOffsetX(0);
      node.shadowOffsetY(0);
      node.shadowOpacity(0);
    } else {
      if (opts.offsetX !== undefined) node.shadowOffsetX(opts.offsetX);
      if (opts.offsetY !== undefined) node.shadowOffsetY(opts.offsetY);
      if (opts.blur !== undefined) node.shadowBlur(opts.blur);
      if (opts.color !== undefined) node.shadowColor(opts.color);
      if (opts.opacity !== undefined) node.shadowOpacity(opts.opacity);
      if (!node.shadowColor()) node.shadowColor('rgba(0,0,0,0.5)');
      if (node.shadowBlur() === 0 && opts.blur === undefined) node.shadowBlur(10);
    }

    layerInstance.value.draw();
    syncActiveElement();
  };

  const updateSelectedStroke = (opts: { hasStroke?: boolean; color?: string; width?: number }) => {
    if (!selectedNode.value || !layerInstance.value) return;
    const node = selectedNode.value;

    if (opts.hasStroke === false) {
      node.stroke(undefined);
      node.strokeWidth(0);
    } else {
      if (opts.color !== undefined) node.stroke(opts.color);
      if (opts.width !== undefined) node.strokeWidth(opts.width);
      if (!node.stroke()) node.stroke('#000000');
      if (!node.strokeWidth() || node.strokeWidth() === 0) node.strokeWidth(3);
    }

    layerInstance.value.draw();
    syncActiveElement();
  };

  return {
    layersList,
    layersListReversed,
    activeElement,
    selectedNode,
    selectNode,
    selectedNodeInfo,
    syncActiveElement,
    triggerNodeUpdate: syncActiveElement,
    refreshLayersList,
    addEmoji,
    addText,
    addImage,
    replaceSelectedImage,
    updateSelectedText,
    applyTextPreset,
    applyImagePreset,
    updateSelectedFilters,
    updateSelectedCrop,
    updateSelectedText3D,
    updateSelectedShadow,
    updateSelectedStroke,
    flipHorizontal,
    flipVertical,
    rotateCW,
    centerNode,
    applyStickerEffect,
    applyGlowEffect,
    setCustomShadow,
    removeEffects,
    toggleLock,
    fillEmojiPattern,
    clearEmojiPattern,
    bringToFront,
    bringForward,
    sendBackward,
    sendToBack,
    moveLayerUp,
    moveLayerDown,
    reorderLayerByIndex,
    removeLayer,
    deleteSelected,
    duplicateSelected,
    clearAll
  };
}
