import { ref, computed } from 'vue';
import type { useKonvaStage } from './useKonvaStage';
import { patchKonvaEmojiShadow } from './useKonvaEmojiFix';

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
  fontFamily?: string;
  fontSize?: number;
  textColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

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
  const nodeRevision = ref(0);

  const triggerNodeUpdate = () => {
    nodeRevision.value++;
  };

  const layersListReversed = computed(() => {
    return [...layersList.value].reverse();
  });

  const selectedNodeInfo = computed(() => {
    // Register dependency on nodeRevision so imperative Konva attribute changes trigger reactive updates
    nodeRevision.value;
    if (!selectedNode.value) return null;
    const item = layersList.value.find((l) => l.raw === selectedNode.value);
    const node = selectedNode.value;

    const explicitType = node.getAttr?.('nodeType');
    let type = 'Objeto';
    if (explicitType === 'emoji') {
      type = 'Emoji';
    } else if (explicitType === 'text') {
      type = 'Texto';
    } else if (explicitType === 'image' || node.className === 'Image') {
      type = 'Imagen';
    } else if (item?.type) {
      type = item.type;
    } else if (typeof node.text === 'function') {
      const txt = node.text();
      if ([...txt].length <= 2 && /\p{Extended_Pictographic}/u.test(txt)) {
        type = 'Emoji';
      } else {
        type = 'Texto';
      }
    }

    const isText = type === 'Texto';
    return {
      label: item?.label ?? (type === 'Emoji' ? `Emoji: ${node.text?.()}` : node.text?.() || 'Objeto'),
      type,
      isLocked: item?.isLocked ?? node.hasName('locked'),
      text: isText ? node.text() : (typeof node.text === 'function' ? node.text() : ''),
      fontFamily: typeof node.fontFamily === 'function' ? node.fontFamily() : 'Impact',
      fontSize: typeof node.fontSize === 'function' ? node.fontSize() : 44,
      fill: typeof node.fill === 'function' ? node.fill() : '#ffffff',
      stroke: typeof node.stroke === 'function' ? node.stroke() : undefined,
      strokeWidth: typeof node.strokeWidth === 'function' ? (node.strokeWidth() ?? 0) : 0,
      shadowColor: typeof node.shadowColor === 'function' ? (node.shadowColor() || '#000000') : '#000000',
      shadowBlur: typeof node.shadowBlur === 'function' ? (node.shadowBlur() ?? 0) : 0,
      shadowOffsetX: typeof node.shadowOffsetX === 'function' ? (node.shadowOffsetX() ?? 0) : 0,
      shadowOffsetY: typeof node.shadowOffsetY === 'function' ? (node.shadowOffsetY() ?? 0) : 0,
      shadowOpacity: typeof node.shadowOpacity === 'function' ? (node.shadowOpacity() ?? 1) : 1
    };
  });

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

    const offset = (Math.random() - 0.5) * 40;
    const emoji = new KonvaModule.value.Text({
      x: customOptions?.x ?? canvasWidth.value / 2 + offset,
      y: customOptions?.y ?? canvasHeight.value / 2 + offset,
      text: char,
      fontSize: customOptions?.fontSize ?? 110,
      fontFamily: '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif',
      draggable: true,
      name: 'selectable',
      nodeType: 'emoji',
      perfectDrawEnabled: true,
      ...customOptions
    });
    emoji.setAttr('nodeType', 'emoji');

    emoji.offsetX(emoji.width() / 2);
    emoji.offsetY(emoji.height() / 2);

    layerInstance.value.add(emoji);
    selectNode(emoji);
    refreshLayersList();
    return emoji;
  };

  const addText = (options: TextNodeOptions, customAttrs?: any) => {
    if (!layerInstance.value || !KonvaModule.value || !options.text.trim()) return;

    const offset = (Math.random() - 0.5) * 30;
    const memeText = new KonvaModule.value.Text({
      x: customAttrs?.x ?? canvasWidth.value / 2 + offset,
      y: customAttrs?.y ?? canvasHeight.value / 2 + offset,
      text: options.text,
      fontSize: options.fontSize ?? 44,
      fontFamily: options.fontFamily ?? 'Impact',
      fill: options.textColor ?? '#ffffff',
      stroke: (options.strokeWidth ?? 0) > 0 ? options.strokeColor : undefined,
      strokeWidth: options.strokeWidth ?? 3,
      align: 'center',
      draggable: true,
      name: 'selectable',
      nodeType: 'text',
      ...customAttrs
    });
    memeText.setAttr('nodeType', 'text');

    memeText.offsetX(memeText.width() / 2);
    memeText.offsetY(memeText.height() / 2);

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

  // Visual Effects
  const flipHorizontal = () => {
    if (!selectedNode.value || !layerInstance.value) return;
    const currentScale = selectedNode.value.scaleX() || 1;
    selectedNode.value.scaleX(currentScale * -1);
    layerInstance.value.draw();
    triggerNodeUpdate();
  };

  const flipVertical = () => {
    if (!selectedNode.value || !layerInstance.value) return;
    const currentScale = selectedNode.value.scaleY() || 1;
    selectedNode.value.scaleY(currentScale * -1);
    layerInstance.value.draw();
    triggerNodeUpdate();
  };

  const applyStickerEffect = () => {
    if (!selectedNode.value || !layerInstance.value) return;
    const node = selectedNode.value;

    node.stroke('#ffffff');
    node.strokeWidth(10);
    node.shadowColor('rgba(0, 0, 0, 0.4)');
    node.shadowBlur(14);
    node.shadowOffsetY(6);
    node.shadowOpacity(0.7);

    layerInstance.value.draw();
    refreshLayersList();
    triggerNodeUpdate();
  };

  const applyGlowEffect = (color = '#ff007f') => {
    if (!selectedNode.value || !layerInstance.value) return;
    const node = selectedNode.value;

    node.shadowColor(color);
    node.shadowBlur(22);
    node.shadowOffsetX(0);
    node.shadowOffsetY(0);
    node.shadowOpacity(0.9);

    layerInstance.value.draw();
    refreshLayersList();
    triggerNodeUpdate();
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
    triggerNodeUpdate();
  };

  const toggleLock = (node = selectedNode.value) => {
    if (!node || !layerInstance.value) return;

    const isCurrentlyLocked = node.hasName('locked');
    if (isCurrentlyLocked) {
      node.removeName('locked');
      node.addName('selectable');
      node.draggable(true);
    } else {
      node.removeName('selectable');
      node.addName('locked');
      node.draggable(false);
      transformerInstance.value?.nodes([]);
    }

    layerInstance.value.draw();
    refreshLayersList();
  };

  // Pattern fill with emojis
  const clearEmojiPattern = () => {
    if (!layerInstance.value) return;
    const items = layerInstance.value.getChildren((n: any) => n.hasName('patternItem'));
    items.forEach((n: any) => n.destroy());
    layerInstance.value.draw();
  };

  const fillEmojiPattern = (emojiChar: string) => {
    if (!layerInstance.value || !KonvaModule.value) return;

    // Remove existing pattern if any
    clearEmojiPattern();

    const step = 64;
    for (let x = 32; x < canvasWidth.value; x += step) {
      for (let y = 32; y < canvasHeight.value; y += step) {
        const patternItem = new KonvaModule.value.Text({
          x,
          y,
          text: emojiChar,
          fontSize: 26,
          opacity: 0.18,
          draggable: false,
          name: 'patternItem'
        });
        patternItem.offsetX(13);
        patternItem.offsetY(13);
        layerInstance.value.add(patternItem);
        patternItem.moveToBottom();
      }
    }
    if (bgRectNode.value) bgRectNode.value.moveToBottom();
    layerInstance.value.draw();
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

  const duplicateSelected = () => {
    if (!selectedNode.value || !layerInstance.value) return;
    const cloned = selectedNode.value.clone({
      x: selectedNode.value.x() + 20,
      y: selectedNode.value.y() + 20
    });
    layerInstance.value.add(cloned);
    selectNode(cloned);
    refreshLayersList();
  };

  const clearAll = () => {
    if (!layerInstance.value) return;
    const nodes = layerInstance.value.getChildren(
      (n: any) => n.hasName('selectable') || n.hasName('locked') || n.hasName('patternItem')
    );
    nodes.forEach((n: any) => n.destroy());
    selectNode(null);
    refreshLayersList();
  };

  const updateSelectedText = (options: Partial<TextNodeOptions>) => {
    if (!selectedNode.value || !layerInstance.value) return;
    const node = selectedNode.value;
    if (typeof node.text !== 'function') return;

    if (options.text !== undefined) node.text(options.text);
    if (options.fontFamily !== undefined) node.fontFamily(options.fontFamily);
    if (options.textColor !== undefined) node.fill(options.textColor);
    if (options.strokeColor !== undefined) node.stroke(options.strokeColor);
    if (options.strokeWidth !== undefined) {
      node.strokeWidth(options.strokeWidth);
      if (options.strokeWidth === 0) node.stroke(undefined);
    }
    if (options.fontSize !== undefined) node.fontSize(options.fontSize);

    node.offsetX(node.width() / 2);
    node.offsetY(node.height() / 2);

    layerInstance.value.draw();
    refreshLayersList();
    triggerNodeUpdate();
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
    triggerNodeUpdate();
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
    triggerNodeUpdate();
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
    triggerNodeUpdate();
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
    triggerNodeUpdate();
  };

  return {
    layersList,
    layersListReversed,
    selectedNodeInfo,
    refreshLayersList,
    triggerNodeUpdate,
    addEmoji,
    addText,
    updateSelectedText,
    applyTextPreset,
    updateSelectedShadow,
    updateSelectedStroke,
    addImage,
    flipHorizontal,
    flipVertical,
    applyStickerEffect,
    applyGlowEffect,
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
